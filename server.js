require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());
app.use(express.static('.'));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── REDDIT ────────────────────────────────────────────────────────────────────

let redditToken = null;
let tokenExpiry = 0;

async function getRedditToken() {
  if (redditToken && Date.now() < tokenExpiry) return redditToken;

  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret || id.startsWith('your_')) return null;

  const credentials = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'PainPointDiscovery/1.0',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) return null;
  const data = await res.json();
  redditToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000;
  return redditToken;
}

async function searchReddit(keyword) {
  const token = await getRedditToken();
  if (!token) return [];

  const queries = [
    `${keyword} problem OR frustrating OR "wish there was" OR "no good way" OR "manually"`,
    `${keyword} "how do I" OR "best way to" OR "does anyone" OR "looking for a tool"`,
  ];

  const results = [];
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/search?q=${encodeURIComponent(q)}&sort=top&t=year&limit=12&type=link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'PainPointDiscovery/1.0',
          },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.data?.children) continue;

      for (const child of data.data.children) {
        const p = child.data;
        results.push({
          source: 'Reddit',
          title: p.title,
          text: (p.selftext || '').substring(0, 600),
          subreddit: `r/${p.subreddit}`,
          votes: p.score,
          comments: p.num_comments,
          url: `https://reddit.com${p.permalink}`,
        });
      }
    } catch (_) {
      // individual query failure — continue with others
    }
  }

  // deduplicate by title
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });
}

// ── HACKER NEWS (free, no auth) ───────────────────────────────────────────────

async function searchHN(keyword) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword + ' problem tool')}&tags=(ask_hn,show_hn)&hitsPerPage=15`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map(h => ({
      source: 'Hacker News',
      title: h.title,
      text: (h.story_text || '').substring(0, 600),
      subreddit: 'Hacker News',
      votes: h.points,
      comments: h.num_comments,
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
    }));
  } catch (_) {
    return [];
  }
}

// ── CLAUDE ANALYSIS ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert at identifying genuine business pain points from online discussions.
Your job is to read posts from Reddit and Hacker News and extract real, actionable problems that someone could build a software product to solve.

Focus on:
- Problems people are actively frustrated about
- Things people are doing manually that could be automated
- Gaps in existing tools people mention
- Recurring complaints about workflows

Ignore:
- General life complaints not related to business/work
- One-off edge cases with tiny audiences
- Posts that are not about a real pain

Always return valid JSON — no markdown, no explanation outside the JSON.`;

async function analyzeWithClaude(keyword, posts) {
  const postsText = posts
    .slice(0, 25)
    .map(
      (p, i) =>
        `[${i + 1}] Source: ${p.source} ${p.subreddit ? '(' + p.subreddit + ')' : ''}
Title: ${p.title}
Content: ${p.text || '(no body)'}
Engagement: ${p.votes} votes, ${p.comments} comments`
    )
    .join('\n\n---\n\n');

  const userMessage = `Industry/keyword: "${keyword}"

Here are ${posts.length} posts found across Reddit and Hacker News:

${postsText}

Identify the top 5 most promising and distinct pain points from these posts.
For each pain point, score it on 5 criteria using 1 (No/Unlikely), 2 (Partial/Maybe), 3 (Yes/Definitely):
  - businessBuyer: Is the person suffering a business or professional, not just a casual consumer?
  - frequency: Is this a daily or weekly pain, not just occasional?
  - existingSpend: Are people already paying money (tools, consultants, employees) to solve this?
  - badSolution: Are existing solutions clearly bad, missing, or deeply inadequate?
  - reachable: Can you reach these buyers through communities, events, or outreach?

Return ONLY this JSON structure:
{
  "painPoints": [
    {
      "title": "Short descriptive title (max 8 words)",
      "description": "One clear sentence describing the pain and who has it",
      "evidence": "Direct quote or close paraphrase from the posts showing this pain is real",
      "sourcePost": "Reddit or Hacker News",
      "scores": {
        "businessBuyer": 1,
        "frequency": 2,
        "existingSpend": 3,
        "badSolution": 3,
        "reachable": 2
      },
      "totalScore": 11,
      "priority": "Medium",
      "whyItMatters": "One sentence on why this is a real market opportunity"
    }
  ]
}

Priority must be exactly: "High" (totalScore 12-15), "Medium" (8-11), or "Low" (5-7).
totalScore must equal the sum of all 5 scores.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = response.content[0].text.trim();
  // strip markdown code fences if Claude wraps the JSON
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}

// ── API ROUTE ─────────────────────────────────────────────────────────────────

app.post('/api/research', async (req, res) => {
  const { keyword } = req.body;
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'keyword is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('your_')) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured in your .env file.' });
  }

  try {
    const [redditPosts, hnPosts] = await Promise.all([
      searchReddit(keyword.trim()),
      searchHN(keyword.trim()),
    ]);

    const allPosts = [...redditPosts, ...hnPosts];

    if (allPosts.length === 0) {
      return res.json({
        painPoints: [],
        meta: { total: 0, reddit: 0, hackerNews: 0 },
        message: 'No posts found. Try a broader keyword (e.g. "auto recycling" instead of a very niche term).',
      });
    }

    const analysis = await analyzeWithClaude(keyword.trim(), allPosts);

    res.json({
      ...analysis,
      meta: {
        total: allPosts.length,
        reddit: redditPosts.length,
        hackerNews: hnPosts.length,
      },
    });
  } catch (err) {
    console.error('Research error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong — check the server console.' });
  }
});

app.get('/api/status', (_req, res) => {
  res.json({
    anthropic: !!(process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('your_')),
    reddit: !!(process.env.REDDIT_CLIENT_ID && !process.env.REDDIT_CLIENT_ID.startsWith('your_')),
  });
});

// ── START ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n Pain Point Discovery Tool running at http://localhost:${PORT}`);
  console.log(` Anthropic key: ${process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('your_') ? '✓ configured' : '✗ MISSING — add to .env'}`);
  console.log(` Reddit key:    ${process.env.REDDIT_CLIENT_ID && !process.env.REDDIT_CLIENT_ID.startsWith('your_') ? '✓ configured' : '○ not set (Hacker News will still work)'}\n`);
});
