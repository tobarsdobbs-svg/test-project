// ==========================================
// THE EIGHT INSTRUCTIONS — App
// ==========================================

// ==========================================
// CHAPTER DATA
// ==========================================

const CHAPTERS = [
  {
    id: 1,
    title: "Decide What You Want",
    sentence: "Decide what you want.",
    summary: [
      "Most people have never actually done this. They carry a vague cloud of dissatisfaction and a handful of borrowed aspirations — things they think they should want because of upbringing, social circles, or cultural programming.",
      "A real decision has three qualities: Specificity (your brain cannot act on abstraction), Honesty (the goal must be yours, not inherited), and Exclusion (choosing one thing means accepting you won't have others).",
      "The emptiness after achievement is the clearest signal that the goal was never yours."
    ],
    instruction: "Sit down with a blank page. Write at the top: \"If I could not fail and no one would judge me, what would I build with my life?\" Write without filtering. Then look at what you wrote and ask: \"Which of these do I want badly enough to endure the discomfort of pursuing?\" That's your answer. Make it specific. Write it down as a clear statement with a timeline. You now have a decision.",
    workbook: {
      type: "vision",
      prompts: [
        { id: "freewrite", label: "If I could not fail and no one would judge me, I would...", type: "textarea" },
        { id: "filter", label: "Which of these do I want badly enough to endure discomfort for?", type: "textarea" },
        { id: "decision", label: "My specific decision with a timeline:", type: "textarea" }
      ],
      checklist: [
        "My goal is specific enough that I would know if I achieved it",
        "This goal is genuinely mine, not inherited from someone else",
        "I have accepted what I am giving up by choosing this",
        "I have written it down as a clear statement with a date"
      ]
    },
    journalPrompts: [
      "What would I build if failure was impossible?",
      "Whose definition of success have I been living by?",
      "What am I afraid to want?",
      "What have I been avoiding deciding?"
    ]
  },
  {
    id: 2,
    title: "Notice What Stops You",
    sentence: "Notice what stops you.",
    summary: [
      "Between where you are and what you want, there are obstacles. Some are external. But the obstacles that actually stop most people are internal and largely invisible — they operate below conscious awareness, disguised as \"reality\" or \"just how I am.\"",
      "Internal obstacles fall into three categories: Beliefs about yourself (\"I'm not disciplined\"), Emotional patterns (fear, shame, guilt that stop action), and Habitual behaviors (micro-actions that keep you locked in place).",
      "Noticing is not analysis. It is real-time self-observation during your actual life. When you feel resistance, pause and describe what is happening with precision."
    ],
    instruction: "For two weeks, carry a notebook or use a notes app. Every time you feel resistance — avoidance, procrastination, anxiety, sudden distraction — stop and write three things: (1) What was I about to do? (2) What did I do instead? (3) What thought or feeling appeared in the gap between the two? After two weeks, read your notes. You will see patterns. Those patterns are the answer to \"what stops you.\"",
    workbook: {
      type: "resistance-log",
      prompts: [
        { id: "about-to-do", label: "What was I about to do?", type: "input" },
        { id: "did-instead", label: "What did I do instead?", type: "input" },
        { id: "thought-feeling", label: "What thought or feeling appeared in the gap?", type: "textarea" }
      ],
      logEntries: true,
      reflectionPrompts: [
        { id: "belief-patterns", label: "What beliefs about myself keep appearing?", type: "textarea" },
        { id: "emotional-patterns", label: "What emotions show up most when I resist?", type: "textarea" },
        { id: "behavior-patterns", label: "What habitual behaviors do I default to?", type: "textarea" }
      ]
    },
    journalPrompts: [
      "What did I avoid today, and what was the feeling right before?",
      "What story do I tell myself about why I can't change?",
      "When did I last self-sabotage, and what was I protecting myself from?",
      "What would I do differently if I had no fear of judgment?"
    ]
  },
  {
    id: 3,
    title: "Act Anyway",
    sentence: "Act anyway.",
    summary: [
      "Your brain updates its model of reality through experience, not through thinking. You can journal about fear for years without reducing it. Do the feared thing once and your brain receives more updating data than a thousand journal entries.",
      "You will never feel ready. The feeling of readiness is not a prerequisite — it is a result. It comes after repeated action, not before.",
      "The distinction between discomfort and danger is critical. Fear of judgment is discomfort. Fear of financial ruin when you have dependents is a signal to plan carefully. Learn to tell the difference."
    ],
    instruction: "Identify one action you have been avoiding that you know would move you toward what you decided in Chapter 1. Do it within 24 hours. Not perfectly. Not with full confidence. Just do it. Then notice what happens internally afterward. In nearly every case, you will find that the anticipation was worse than the act itself.",
    workbook: {
      type: "action",
      prompts: [
        { id: "avoided-action", label: "One action I have been avoiding:", type: "textarea" },
        { id: "discomfort-or-danger", label: "Is this discomfort or genuine danger? Be honest.", type: "textarea" },
        { id: "commit-when", label: "I will do this by (date/time):", type: "input" },
        { id: "aftermath", label: "After doing it — what actually happened vs. what I feared?", type: "textarea" }
      ],
      checklist: [
        "I have identified a specific avoided action",
        "I have confirmed this is discomfort, not genuine danger",
        "I have committed to a deadline within 24 hours",
        "I did it",
        "I reflected on how the anticipation compared to reality"
      ]
    },
    journalPrompts: [
      "What am I avoiding right now that I know I should do?",
      "When was the last time I acted despite fear? What happened?",
      "What is the worst realistic outcome if I do the thing I'm avoiding?",
      "Where am I waiting to feel ready instead of just starting?"
    ]
  },
  {
    id: 4,
    title: "Repeat Until the New Pattern Is Stronger",
    sentence: "Repeat until the new pattern is stronger than the old one.",
    summary: [
      "A single act of courage is not transformation. It is an event. Transformation happens when that event becomes a pattern, and the pattern becomes automatic.",
      "People overvalue breakthrough moments and undervalue boring consistency. One retreat doesn't rewire your brain. Ten minutes every day for a year does. The brain responds to frequency of signal, not intensity.",
      "You will know the new pattern is stronger when it starts to feel like the path of least resistance. The old behavior starts to feel foreign. Someone comments that you've changed, and you realize they're right."
    ],
    instruction: "Choose the smallest viable version of your new behavior. Make it so small that it would be embarrassing to fail at it. Then do it every single day for 90 days without evaluating whether it's \"working.\" Evaluation before 90 days is your old pattern looking for an excuse to quit. After 90 days, assess.",
    workbook: {
      type: "ninety-day",
      prompts: [
        { id: "smallest-behavior", label: "My smallest viable daily behavior:", type: "textarea" },
        { id: "when-daily", label: "When will I do it each day? (anchor to existing habit)", type: "input" },
        { id: "start-date", label: "Start date:", type: "input" },
        { id: "day-90-date", label: "Day 90 date:", type: "input" }
      ],
      checklist: [
        "My chosen behavior is small enough to be embarrassing to skip",
        "I have anchored it to a specific time or existing habit",
        "I have committed to zero evaluation before Day 90",
        "I have set up my tracker for this behavior"
      ]
    },
    journalPrompts: [
      "Did I do my daily behavior today? What resistance came up?",
      "Am I trying to evaluate too early? What story is my mind telling?",
      "Where do I notice the new pattern feeling more natural?",
      "What evidence do I have that repetition is working, even slightly?"
    ]
  },
  {
    id: 5,
    title: "Design Your Environment",
    sentence: "Design your environment to support this.",
    summary: [
      "You are embedded in a physical, social, and informational environment that constantly shapes your behavior, mostly without your awareness. Willpower is a depletable resource. If your environment works against your goals, you will exhaust yourself fighting it.",
      "Physical environment: arrange your space so the desired behavior is the easiest behavior. Social environment: your reference group shapes your ambitions and beliefs below conscious awareness. Informational environment: what you consume daily shapes your internal state.",
      "You can love someone and simultaneously recognize that spending time with them pulls you toward a version of yourself you're trying to outgrow. The adjustment is proportional, not dramatic."
    ],
    instruction: "Audit all three environments this week. Write down: (1) What in my physical space makes my desired behavior harder or easier? (2) Who in my social world reinforces the person I'm becoming vs. the person I'm leaving behind? (3) What am I consuming daily, and how does it make me feel afterward? Then make one concrete change in each category.",
    workbook: {
      type: "audit",
      sections: [
        {
          title: "Physical Environment",
          prompts: [
            { id: "physical-helps", label: "What makes my desired behavior easier?", type: "textarea" },
            { id: "physical-hinders", label: "What makes my desired behavior harder?", type: "textarea" },
            { id: "physical-change", label: "One concrete change I will make:", type: "textarea" }
          ]
        },
        {
          title: "Social Environment",
          prompts: [
            { id: "social-supports", label: "Who reinforces the person I'm becoming?", type: "textarea" },
            { id: "social-hinders", label: "Who reinforces the person I'm leaving behind?", type: "textarea" },
            { id: "social-change", label: "One concrete change I will make:", type: "textarea" }
          ]
        },
        {
          title: "Informational Environment",
          prompts: [
            { id: "info-consuming", label: "What am I consuming daily?", type: "textarea" },
            { id: "info-feeling", label: "How does it make me feel afterward?", type: "textarea" },
            { id: "info-change", label: "One concrete change I will make:", type: "textarea" }
          ]
        }
      ],
      checklist: [
        "I have audited my physical environment",
        "I have audited my social environment",
        "I have audited my informational environment",
        "I have made one change in my physical space",
        "I have adjusted my social time allocation",
        "I have replaced one draining information source"
      ]
    },
    journalPrompts: [
      "What in my environment pulled me backward today?",
      "What in my environment supported my growth today?",
      "Who did I spend time with today, and how did I feel after?",
      "What did I consume (media, content) and how did it affect my state?"
    ]
  },
  {
    id: 6,
    title: "Don't Stop When It Gets Hard",
    sentence: "Don't stop when it gets hard.",
    summary: [
      "Difficulty does not arrive as a single dramatic crisis. It arrives as a slow accumulation of friction. The excitement fades. Results haven't appeared. The work feels monotonous. Your old life starts to look comfortable.",
      "People quit because they interpret difficulty as information about the viability of their goal, when it is actually information about the depth of the change. The discomfort is proportional to the significance of the transformation.",
      "People also quit because they compare their middle to someone else's finish. You see the result and project a linear path backward. The actual path was almost certainly messy and full of moments where quitting seemed rational."
    ],
    instruction: "Before the hard part arrives — and it will — write a letter to yourself. Describe why you started. Describe what your life looks like if nothing changes. Describe what you're willing to endure. Then add this line: \"If you are reading this, you are in the hard part. This is expected. It does not mean you chose wrong. Keep going.\" When the hard part comes, read the letter.",
    workbook: {
      type: "letter",
      prompts: [
        { id: "why-started", label: "Why I started this:", type: "textarea" },
        { id: "if-nothing-changes", label: "What my life looks like if nothing changes:", type: "textarea" },
        { id: "willing-to-endure", label: "What I am willing to endure to get there:", type: "textarea" },
        { id: "letter", label: "My letter to my future self:", type: "letter" }
      ]
    },
    journalPrompts: [
      "What feels hard right now? Is this the 'messy middle'?",
      "Am I comparing my middle to someone else's finish?",
      "What would I tell a friend going through exactly what I'm going through?",
      "Why did I start this? Is that reason still true?"
    ]
  },
  {
    id: 7,
    title: "Don't Stop When You Regress",
    sentence: "Don't stop when you regress.",
    summary: [
      "Old patterns are not deleted when you build new ones. They are overridden. Under stress, fatigue, or emotional disturbance, your brain reverts to the most deeply encoded pattern. That will be the old one.",
      "The danger is not the regression itself. It is the interpretation. \"I haven't really changed. The old me is the real me. All that work was pointless.\" This feels true in the moment but is factually wrong.",
      "The measure that matters: Frequency (how often you regress), Duration (how long it lasts), and Depth (how far you fall). Over time, all three should decrease. That trend — not the absence of regression — is the true measure of change."
    ],
    instruction: "When you regress, do three things. First, notice the story your mind tells you about what the regression means, and refuse to accept it as final truth. Second, do the smallest possible version of your new behavior within 24 hours — not a grand recovery, just one small action. Third, look at your overall trend, not the single data point. Zoom out.",
    workbook: {
      type: "regression",
      prompts: [
        { id: "what-happened", label: "What happened? (Describe the regression)", type: "textarea" },
        { id: "story-told", label: "What story did my mind tell me about what this means?", type: "textarea" },
        { id: "story-reframe", label: "What is actually true when I look at the full picture?", type: "textarea" },
        { id: "small-action", label: "Smallest action I will take within 24 hours:", type: "input" },
        { id: "trend-check", label: "Compared to 3 months ago, am I better? (Frequency, Duration, Depth)", type: "textarea" }
      ],
      checklist: [
        "I noticed the catastrophic story without accepting it",
        "I did one small action within 24 hours",
        "I zoomed out and assessed the overall trend",
        "I have not accepted 'back to zero' as truth"
      ]
    },
    journalPrompts: [
      "Did I regress today? What triggered it?",
      "What story did my mind tell me about this setback?",
      "If I zoom out to the last 3 months, what does the real trend look like?",
      "What is the smallest thing I can do right now to get back on track?"
    ]
  },
  {
    id: 8,
    title: "Keep Going",
    sentence: "Keep going.",
    summary: [
      "You continue after the excitement is gone. After the hard part. After the regression. When no one is watching. When results are invisible. When you're not sure it's working.",
      "There will be days where none of your reasons feel compelling, none of your strategies feel effective, and the whole enterprise seems pointless. On those days, the only thing that keeps you going is the decision itself — the one from Chapter 1.",
      "Small, consistent actions compound in ways that are invisible in the short term and staggering in the long term. You cannot see the compound effect while it's happening. You must trust the process during the long middle when nothing seems to be changing."
    ],
    instruction: "There is no technique here. No hack. No framework. There is only the decision, renewed daily, to continue. Some days you will leap forward. Some days you will crawl. Some days you will lie on the ground and do nothing. The instruction is the same for all of them: Get up tomorrow and do it again.",
    workbook: {
      type: "renewal",
      prompts: [
        { id: "today-renew", label: "Today, I renew my decision to:", type: "textarea" },
        { id: "gratitude", label: "One thing I did this week that moved me forward:", type: "textarea" },
        { id: "compound", label: "Evidence of compounding I can see (even small):", type: "textarea" }
      ],
      checklist: [
        "I renewed my commitment today",
        "I acknowledged at least one small step forward",
        "I reminded myself that invisible progress is still progress"
      ]
    },
    journalPrompts: [
      "Am I still going? That's enough for today.",
      "What small evidence of compounding can I find?",
      "If I keep going at this pace for another year, where will I be?",
      "What would quitting cost me that continuing won't?"
    ]
  }
];

// ==========================================
// STORAGE
// ==========================================

const Store = {
  _prefix: 'ei-',

  get(key) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(this._prefix + key, JSON.stringify(value));
  },

  // Workbook data
  getWorkbook(chapterId) {
    return this.get(`workbook-${chapterId}`) || {};
  },
  setWorkbook(chapterId, data) {
    this.set(`workbook-${chapterId}`, data);
  },

  // Resistance log entries (Chapter 2 special)
  getResistanceLog() {
    return this.get('resistance-log') || [];
  },
  addResistanceEntry(entry) {
    const log = this.getResistanceLog();
    log.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
    this.set('resistance-log', log);
  },
  deleteResistanceEntry(id) {
    const log = this.getResistanceLog().filter(e => e.id !== id);
    this.set('resistance-log', log);
  },

  // Journal entries
  getJournalEntries() {
    return this.get('journal') || [];
  },
  addJournalEntry(entry) {
    const entries = this.getJournalEntries();
    entries.unshift({ ...entry, id: Date.now(), createdAt: new Date().toISOString() });
    this.set('journal', entries);
  },
  updateJournalEntry(id, content) {
    const entries = this.getJournalEntries();
    const entry = entries.find(e => e.id === id);
    if (entry) {
      entry.content = content;
      entry.updatedAt = new Date().toISOString();
      this.set('journal', entries);
    }
  },
  deleteJournalEntry(id) {
    const entries = this.getJournalEntries().filter(e => e.id !== id);
    this.set('journal', entries);
  },

  // Habits
  getHabits() {
    return this.get('habits') || [];
  },
  addHabit(habit) {
    const habits = this.getHabits();
    habits.push({ ...habit, id: Date.now(), createdAt: new Date().toISOString() });
    this.set('habits', habits);
  },
  deleteHabit(id) {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.set('habits', habits);
    // Clean up logs
    const log = this.getHabitLog();
    for (const date in log) {
      log[date] = log[date].filter(hid => hid !== id);
    }
    this.set('habit-log', log);
  },

  // Habit log: { "2026-02-16": [habitId1, habitId2] }
  getHabitLog() {
    return this.get('habit-log') || {};
  },
  toggleHabitDay(habitId, date) {
    const log = this.getHabitLog();
    if (!log[date]) log[date] = [];
    const idx = log[date].indexOf(habitId);
    if (idx >= 0) {
      log[date].splice(idx, 1);
    } else {
      log[date].push(habitId);
    }
    this.set('habit-log', log);
  },
  isHabitDone(habitId, date) {
    const log = this.getHabitLog();
    return (log[date] || []).includes(habitId);
  },

  // Chapter read status
  getChapterProgress() {
    return this.get('chapter-progress') || {};
  },
  markChapterRead(chapterId) {
    const progress = this.getChapterProgress();
    progress[chapterId] = true;
    this.set('chapter-progress', progress);
  },

  // Checklist state per chapter
  getChecklist(chapterId) {
    return this.get(`checklist-${chapterId}`) || {};
  },
  toggleCheckItem(chapterId, index) {
    const checklist = this.getChecklist(chapterId);
    checklist[index] = !checklist[index];
    this.set(`checklist-${chapterId}`, checklist);
  }
};

// ==========================================
// UTILITIES
// ==========================================

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStreak(habitId) {
  const log = Store.getHabitLog();
  let streak = 0;
  const d = new Date();
  // Check today first
  const todayStr = getToday();
  if (!(log[todayStr] || []).includes(habitId)) {
    // Check if yesterday was done (streak still alive, just not checked today)
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if ((log[dateStr] || []).includes(habitId)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLast90Days() {
  const days = [];
  const d = new Date();
  for (let i = 89; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(day.getDate() - i);
    days.push(day.toISOString().split('T')[0]);
  }
  return days;
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const arrowSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const backSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

// ==========================================
// TOAST
// ==========================================

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

// ==========================================
// ROUTER
// ==========================================

const Router = {
  current: 'dashboard',
  params: null,

  init() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  navigate(view, params) {
    if (params !== undefined) {
      window.location.hash = `${view}/${params}`;
    } else {
      window.location.hash = view;
    }
  },

  route() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const parts = hash.split('/');
    this.current = parts[0];
    this.params = parts[1] || null;
    this.render();
    this.updateNav();
    // Scroll to top
    document.getElementById('main').scrollTop = 0;
    window.scrollTo(0, 0);
  },

  render() {
    const main = document.getElementById('main');
    const view = Views[this.current];
    if (view) {
      main.innerHTML = view(this.params);
      // Bind events after render
      if (Bindings[this.current]) {
        Bindings[this.current](this.params);
      }
    }
  },

  updateNav() {
    const baseView = this.current.split('-')[0];
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const v = btn.dataset.view;
      btn.classList.toggle('active', v === baseView ||
        (v === 'guide' && (baseView === 'chapter' || baseView === 'workbook')) ||
        (v === 'journal' && baseView === 'journalentry'));
    });
  }
};

// ==========================================
// VIEWS
// ==========================================

const Views = {
  dashboard() {
    const progress = Store.getChapterProgress();
    const chaptersRead = Object.keys(progress).length;
    const pct = Math.round((chaptersRead / 8) * 100);
    const habits = Store.getHabits();
    const today = getToday();
    const habitsToday = habits.filter(h => Store.isHabitDone(h.id, today)).length;
    const journalEntries = Store.getJournalEntries();
    const totalStreak = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id)), 0) : 0;

    // SVG ring
    const r = 58;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;

    return `
      <div class="fade-in">
        <div class="dash-greeting">${getGreeting()}</div>
        <div class="dash-date">${formatDateLong(new Date().toISOString())}</div>
      </div>

      <div class="card glow fade-in fade-in-delay-1">
        <div class="progress-ring-container">
          <div class="progress-ring-wrapper">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--border-light)" stroke-width="6"/>
              <circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--accent)" stroke-width="6"
                stroke-dasharray="${c}" stroke-dashoffset="${offset}"
                stroke-linecap="round" transform="rotate(-90 70 70)"
                style="transition: stroke-dashoffset 0.8s ease"/>
            </svg>
            <div class="progress-ring-text">
              <div class="progress-ring-number">${chaptersRead}</div>
              <div class="progress-ring-label">of 8</div>
            </div>
          </div>
        </div>
        <div style="text-align:center; color:var(--text-secondary); font-size:14px;">Chapters Explored</div>
      </div>

      <div class="stat-row fade-in fade-in-delay-2">
        <div class="stat-card">
          <div class="stat-value">${totalStreak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${journalEntries.length}</div>
          <div class="stat-label">Journal Entries</div>
        </div>
      </div>

      ${habits.length > 0 ? `
        <div class="section-title fade-in fade-in-delay-3">Today's Habits</div>
        <div class="card fade-in fade-in-delay-4">
          <div class="today-habits">
            ${habits.map(h => {
              const done = Store.isHabitDone(h.id, today);
              const chapter = CHAPTERS.find(c => c.id === h.chapterId);
              return `
                <div class="today-habit">
                  <div class="today-habit-info">
                    <div class="check-box ${done ? 'checked' : ''}" data-habit-id="${h.id}">
                      ${checkSvg}
                    </div>
                    <div>
                      <div class="today-habit-name" style="${done ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${escapeHtml(h.name)}</div>
                      ${chapter ? `<div class="today-habit-chapter">Ch. ${chapter.id}</div>` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : `
        <div class="section-title fade-in fade-in-delay-3">Get Started</div>
        <div class="card clickable fade-in fade-in-delay-4" onclick="Router.navigate('guide')">
          <div class="chapter-card">
            <div class="chapter-num" style="font-size:24px">1</div>
            <div class="chapter-info">
              <div class="chapter-title">Begin with the Guide</div>
              <div class="chapter-sentence">Read the eight instructions and start your workbook</div>
            </div>
            <div class="chapter-arrow">${arrowSvg}</div>
          </div>
        </div>
      `}

      <div class="section-title fade-in fade-in-delay-5">Quick Actions</div>
      <div class="card clickable fade-in fade-in-delay-6" onclick="Router.navigate('journal', 'new')">
        <div class="chapter-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width:24px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <div class="chapter-info">
            <div class="chapter-title">New Journal Entry</div>
            <div class="chapter-sentence">Reflect on where you are today</div>
          </div>
          <div class="chapter-arrow">${arrowSvg}</div>
        </div>
      </div>
    `;
  },

  guide() {
    const progress = Store.getChapterProgress();
    return `
      <div class="page-title fade-in">The Eight Instructions</div>
      <div class="page-subtitle fade-in">A practical guide for restructuring your life</div>
      ${CHAPTERS.map((ch, i) => {
        const read = progress[ch.id];
        return `
          <div class="card clickable fade-in fade-in-delay-${i + 1}" onclick="Router.navigate('chapter', ${ch.id})">
            <div class="chapter-card">
              <div class="chapter-num">${ch.id}</div>
              <div class="chapter-info">
                <div class="chapter-title">${ch.title}</div>
                <div class="chapter-sentence">${ch.sentence}</div>
              </div>
              ${read
                ? `<div class="chapter-check"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`
                : `<div class="chapter-arrow">${arrowSvg}</div>`
              }
            </div>
          </div>
        `;
      }).join('')}
    `;
  },

  chapter(id) {
    const ch = CHAPTERS.find(c => c.id === parseInt(id));
    if (!ch) return '<p>Chapter not found.</p>';

    Store.markChapterRead(ch.id);

    return `
      <button class="back-btn" onclick="Router.navigate('guide')">${backSvg} All Chapters</button>
      <div class="chapter-header fade-in">
        <div class="chapter-num">${ch.id}</div>
        <div class="chapter-title">${ch.title}</div>
        <div class="chapter-sentence">"${ch.sentence}"</div>
      </div>

      <div class="chapter-tab-row fade-in fade-in-delay-1">
        <button class="chapter-tab-btn active" data-tab="read">Read</button>
        <button class="chapter-tab-btn" data-tab="workbook">Workbook</button>
      </div>

      <div id="tab-read" class="fade-in fade-in-delay-2">
        <div class="chapter-body">
          ${ch.summary.map(p => `<p>${p}</p>`).join('')}

          <div class="highlight">
            <p class="instruction-label" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);margin-bottom:10px;">The Practical Instruction</p>
            <p>${ch.instruction}</p>
          </div>
        </div>
      </div>

      <div id="tab-workbook" style="display:none">
        ${renderWorkbook(ch)}
      </div>
    `;
  },

  journal(param) {
    if (param === 'new') return Views.journalNew();
    if (param) return Views.journalEntry(param);

    const entries = Store.getJournalEntries();

    return `
      <div class="page-title fade-in">Journal</div>
      <div class="page-subtitle fade-in">Your reflections and observations</div>

      <button class="btn btn-primary fade-in fade-in-delay-1" onclick="Router.navigate('journal', 'new')" style="margin-bottom:24px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Entry
      </button>

      ${entries.length === 0 ? `
        <div class="empty-state fade-in fade-in-delay-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <p>Your journal is empty. Start writing to capture your reflections.</p>
        </div>
      ` : entries.map((entry, i) => {
        const chapter = CHAPTERS.find(c => c.id === entry.chapterId);
        return `
          <div class="card clickable journal-entry-card fade-in fade-in-delay-${Math.min(i + 2, 8)}" onclick="Router.navigate('journal', ${entry.id})">
            <div class="journal-date">${formatDate(entry.createdAt)}</div>
            ${chapter ? `<span class="journal-chapter-tag">Ch. ${chapter.id}: ${chapter.title}</span>` : ''}
            <div class="journal-preview">${escapeHtml(entry.content)}</div>
          </div>
        `;
      }).join('')}
    `;
  },

  journalNew() {
    const randomChapter = CHAPTERS[Math.floor(Math.random() * CHAPTERS.length)];
    const randomPrompt = randomChapter.journalPrompts[Math.floor(Math.random() * randomChapter.journalPrompts.length)];

    return `
      <button class="back-btn" onclick="Router.navigate('journal')">${backSvg} Journal</button>
      <div class="page-title fade-in">New Entry</div>
      <div class="page-subtitle fade-in">${formatDateLong(new Date().toISOString())}</div>

      <div class="journal-prompt fade-in fade-in-delay-1">
        "${randomPrompt}" <span style="font-style:normal;font-size:12px;color:var(--text-muted)">— Ch. ${randomChapter.id}</span>
      </div>

      <div class="form-group fade-in fade-in-delay-2">
        <label class="form-label">Chapter (optional)</label>
        <select class="select-input" id="journal-chapter">
          <option value="">General</option>
          ${CHAPTERS.map(ch => `<option value="${ch.id}">Ch. ${ch.id}: ${ch.title}</option>`).join('')}
        </select>
      </div>

      <div class="form-group fade-in fade-in-delay-3">
        <label class="form-label">Your reflection</label>
        <textarea class="form-textarea large" id="journal-content" placeholder="Write freely..."></textarea>
      </div>

      <div class="fade-in fade-in-delay-4">
        <button class="btn btn-primary" id="save-journal-btn">Save Entry</button>
      </div>

      <div class="section-title fade-in fade-in-delay-5" style="margin-top:32px">More prompts</div>
      <div id="more-prompts" class="fade-in fade-in-delay-6">
        ${CHAPTERS.map(ch => `
          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Chapter ${ch.id}</div>
            ${ch.journalPrompts.map(p => `
              <div class="card clickable" style="padding:12px 16px;margin-bottom:6px" onclick="document.getElementById('journal-content').value += '\\n${p.replace(/'/g, "\\'")}\\n'; this.style.opacity='0.4'">
                <span style="font-size:14px;color:var(--text-secondary)">${p}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  },

  journalEntry(id) {
    const entries = Store.getJournalEntries();
    const entry = entries.find(e => e.id === parseInt(id));
    if (!entry) return '<p>Entry not found.</p>';
    const chapter = CHAPTERS.find(c => c.id === entry.chapterId);

    return `
      <button class="back-btn" onclick="Router.navigate('journal')">${backSvg} Journal</button>
      <div class="journal-date fade-in" style="font-size:16px;margin-bottom:4px">${formatDateLong(entry.createdAt)}</div>
      ${chapter ? `<span class="journal-chapter-tag fade-in">Ch. ${chapter.id}: ${chapter.title}</span>` : ''}

      <div class="form-group fade-in fade-in-delay-1" style="margin-top:20px">
        <textarea class="form-textarea large" id="journal-edit-content">${escapeHtml(entry.content)}</textarea>
        <div class="save-indicator" id="save-indicator">Saved</div>
      </div>

      <div class="fade-in fade-in-delay-2" style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-small" id="update-journal-btn">Save Changes</button>
        <button class="btn btn-danger btn-small" id="delete-journal-btn">Delete</button>
      </div>
    `;
  },

  tracker() {
    const habits = Store.getHabits();
    const today = getToday();

    return `
      <div class="page-title fade-in">Habit Tracker</div>
      <div class="page-subtitle fade-in">Build new patterns through daily repetition</div>

      <button class="btn btn-secondary fade-in fade-in-delay-1" id="toggle-add-habit" style="margin-bottom:16px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Habit
      </button>

      <div class="add-habit-form" id="add-habit-form">
        <div class="card">
          <div class="form-group">
            <label class="form-label">Habit name</label>
            <input class="form-input" id="new-habit-name" placeholder="e.g., Write for 15 minutes">
          </div>
          <div class="form-group">
            <label class="form-label">Linked chapter (optional)</label>
            <select class="select-input" id="new-habit-chapter">
              <option value="">None</option>
              ${CHAPTERS.map(ch => `<option value="${ch.id}">Ch. ${ch.id}: ${ch.title}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary btn-small" id="save-habit-btn">Create Habit</button>
        </div>
      </div>

      ${habits.length === 0 ? `
        <div class="empty-state fade-in fade-in-delay-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <p>No habits yet. Add your first habit to start tracking your daily practice.</p>
        </div>
      ` : habits.map((h, i) => {
        const streak = getStreak(h.id);
        const done = Store.isHabitDone(h.id, today);
        const chapter = CHAPTERS.find(c => c.id === h.chapterId);
        const days = getLast90Days();
        const log = Store.getHabitLog();
        const completedDays = days.filter(d => (log[d] || []).includes(h.id)).length;

        return `
          <div class="card fade-in fade-in-delay-${Math.min(i + 2, 8)}" style="margin-top:12px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
              <div>
                <div style="font-size:16px;font-weight:600">${escapeHtml(h.name)}</div>
                ${chapter ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">Ch. ${chapter.id}: ${chapter.title}</div>` : ''}
              </div>
              <div class="check-box ${done ? 'checked' : ''}" data-habit-id="${h.id}" style="margin-left:12px">
                ${checkSvg}
              </div>
            </div>

            ${streak > 0 ? `<div class="streak-badge" style="margin-bottom:12px"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> ${streak} day streak</div>` : ''}

            <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Last 90 days (${completedDays}/90)</div>
            <div class="habit-grid">
              ${days.map(d => {
                const isDone = (log[d] || []).includes(h.id);
                const isToday = d === today;
                return `<div class="habit-day ${isDone ? 'completed' : ''} ${isToday ? 'today' : ''}" title="${d}"></div>`;
              }).join('')}
            </div>

            <div class="habit-actions">
              <button class="btn btn-danger btn-small" onclick="if(confirm('Delete this habit?')){Store.deleteHabit(${h.id});Router.route();}">Delete</button>
            </div>
          </div>
        `;
      }).join('')}
    `;
  }
};

// ==========================================
// WORKBOOK RENDERER
// ==========================================

function renderWorkbook(ch) {
  const data = Store.getWorkbook(ch.id);
  const checklist = Store.getChecklist(ch.id);

  let html = `
    <div class="instruction-box">
      <div class="instruction-label">The Practical Instruction</div>
      <p>${ch.instruction}</p>
    </div>
  `;

  // Special handling for Chapter 2 resistance log
  if (ch.workbook.logEntries) {
    const log = Store.getResistanceLog();
    html += `
      <div class="section-title">Log a Resistance Moment</div>
      ${ch.workbook.prompts.map(p => `
        <div class="form-group">
          <label class="form-label">${p.label}</label>
          ${p.type === 'textarea'
            ? `<textarea class="form-textarea" id="wb-log-${p.id}" placeholder="..."></textarea>`
            : `<input class="form-input" id="wb-log-${p.id}" placeholder="...">`
          }
        </div>
      `).join('')}
      <button class="btn btn-primary btn-small" id="add-resistance-entry" style="margin-bottom:24px">Log This Moment</button>

      ${log.length > 0 ? `
        <div class="section-title">Your Resistance Log (${log.length} entries)</div>
        ${log.slice(0, 20).map(entry => `
          <div class="card" style="margin-bottom:8px">
            <div class="journal-date">${formatDate(entry.date)}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px"><strong>About to do:</strong> ${escapeHtml(entry['about-to-do'] || '')}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px"><strong>Did instead:</strong> ${escapeHtml(entry['did-instead'] || '')}</div>
            <div style="font-size:13px;color:var(--text-secondary)"><strong>Thought/feeling:</strong> ${escapeHtml(entry['thought-feeling'] || '')}</div>
          </div>
        `).join('')}
      ` : ''}

      <div class="section-title">Reflect on Patterns</div>
      ${ch.workbook.reflectionPrompts.map(p => `
        <div class="form-group">
          <label class="form-label">${p.label}</label>
          <textarea class="form-textarea wb-field" data-chapter="${ch.id}" data-field="${p.id}">${escapeHtml(data[p.id] || '')}</textarea>
        </div>
      `).join('')}
    `;
  }
  // Special handling for Chapter 5 sections
  else if (ch.workbook.sections) {
    ch.workbook.sections.forEach(section => {
      html += `<div class="section-title">${section.title}</div>`;
      section.prompts.forEach(p => {
        html += `
          <div class="form-group">
            <label class="form-label">${p.label}</label>
            <textarea class="form-textarea wb-field" data-chapter="${ch.id}" data-field="${p.id}">${escapeHtml(data[p.id] || '')}</textarea>
          </div>
        `;
      });
    });
  }
  // Standard prompts
  else if (ch.workbook.prompts) {
    html += `<div class="section-title">Your Work</div>`;
    ch.workbook.prompts.forEach(p => {
      if (p.type === 'letter') {
        html += `
          <div class="form-group">
            <label class="form-label">${p.label}</label>
            <div class="letter-paper">
              <textarea class="wb-field" data-chapter="${ch.id}" data-field="${p.id}" placeholder="Dear future me,&#10;&#10;If you are reading this, you are in the hard part...">${escapeHtml(data[p.id] || '')}</textarea>
            </div>
          </div>
        `;
      } else if (p.type === 'textarea') {
        html += `
          <div class="form-group">
            <label class="form-label">${p.label}</label>
            <textarea class="form-textarea wb-field" data-chapter="${ch.id}" data-field="${p.id}" placeholder="...">${escapeHtml(data[p.id] || '')}</textarea>
          </div>
        `;
      } else {
        html += `
          <div class="form-group">
            <label class="form-label">${p.label}</label>
            <input class="form-input wb-field" data-chapter="${ch.id}" data-field="${p.id}" value="${escapeHtml(data[p.id] || '')}" placeholder="...">
          </div>
        `;
      }
    });
  }

  // Checklist
  if (ch.workbook.checklist) {
    html += `<div class="section-title">Checklist</div>`;
    ch.workbook.checklist.forEach((item, idx) => {
      const checked = checklist[idx];
      html += `
        <div class="checklist-item">
          <div class="check-box ${checked ? 'checked' : ''}" data-chapter="${ch.id}" data-check-idx="${idx}">
            ${checkSvg}
          </div>
          <span class="check-text ${checked ? 'checked' : ''}">${item}</span>
        </div>
      `;
    });
  }

  html += `<div class="save-indicator" id="wb-save-indicator">Saved</div>`;

  return html;
}

// ==========================================
// EVENT BINDINGS
// ==========================================

const Bindings = {
  dashboard() {
    // Habit toggle on dashboard
    document.querySelectorAll('.today-habit .check-box').forEach(box => {
      box.addEventListener('click', () => {
        const habitId = parseInt(box.dataset.habitId);
        Store.toggleHabitDay(habitId, getToday());
        Router.route();
        showToast('Habit updated');
      });
    });
  },

  guide() {},

  chapter(id) {
    // Tab switching
    document.querySelectorAll('.chapter-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chapter-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('tab-read').style.display = tab === 'read' ? 'block' : 'none';
        document.getElementById('tab-workbook').style.display = tab === 'workbook' ? 'block' : 'none';

        // Bind workbook events when switching to workbook tab
        if (tab === 'workbook') {
          bindWorkbookEvents(parseInt(id));
        }
      });
    });
  },

  journal(param) {
    if (param === 'new') {
      const btn = document.getElementById('save-journal-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const content = document.getElementById('journal-content').value.trim();
          if (!content) {
            showToast('Write something first');
            return;
          }
          const chapterVal = document.getElementById('journal-chapter').value;
          Store.addJournalEntry({
            content,
            chapterId: chapterVal ? parseInt(chapterVal) : null
          });
          showToast('Entry saved');
          Router.navigate('journal');
        });
      }
    } else if (param && param !== 'new') {
      // Edit existing entry
      const updateBtn = document.getElementById('update-journal-btn');
      const deleteBtn = document.getElementById('delete-journal-btn');

      if (updateBtn) {
        updateBtn.addEventListener('click', () => {
          const content = document.getElementById('journal-edit-content').value.trim();
          Store.updateJournalEntry(parseInt(param), content);
          showToast('Entry updated');
          const indicator = document.getElementById('save-indicator');
          if (indicator) {
            indicator.classList.add('visible');
            setTimeout(() => indicator.classList.remove('visible'), 1500);
          }
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (confirm('Delete this journal entry?')) {
            Store.deleteJournalEntry(parseInt(param));
            showToast('Entry deleted');
            Router.navigate('journal');
          }
        });
      }
    }
  },

  journalentry(param) {
    Bindings.journal(param);
  },

  tracker() {
    // Toggle add habit form
    const toggleBtn = document.getElementById('toggle-add-habit');
    const form = document.getElementById('add-habit-form');
    if (toggleBtn && form) {
      toggleBtn.addEventListener('click', () => {
        form.classList.toggle('visible');
      });
    }

    // Save new habit
    const saveBtn = document.getElementById('save-habit-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = document.getElementById('new-habit-name').value.trim();
        if (!name) {
          showToast('Enter a habit name');
          return;
        }
        const chapterVal = document.getElementById('new-habit-chapter').value;
        Store.addHabit({
          name,
          chapterId: chapterVal ? parseInt(chapterVal) : null
        });
        showToast('Habit created');
        Router.route();
      });
    }

    // Habit checkboxes
    document.querySelectorAll('.card .check-box[data-habit-id]').forEach(box => {
      box.addEventListener('click', () => {
        const habitId = parseInt(box.dataset.habitId);
        Store.toggleHabitDay(habitId, getToday());
        Router.route();
        showToast('Habit updated');
      });
    });
  }
};

function bindWorkbookEvents(chapterId) {
  // Auto-save workbook fields
  const saveIndicator = document.getElementById('wb-save-indicator');
  const debouncedSave = debounce((chId, field, value) => {
    const data = Store.getWorkbook(chId);
    data[field] = value;
    Store.setWorkbook(chId, data);
    if (saveIndicator) {
      saveIndicator.classList.add('visible');
      setTimeout(() => saveIndicator.classList.remove('visible'), 1500);
    }
  }, 500);

  document.querySelectorAll('.wb-field').forEach(el => {
    const chId = parseInt(el.dataset.chapter);
    const field = el.dataset.field;
    el.addEventListener('input', () => {
      debouncedSave(chId, field, el.value);
    });
  });

  // Checklist toggles
  document.querySelectorAll('.check-box[data-check-idx]').forEach(box => {
    box.addEventListener('click', () => {
      const chId = parseInt(box.dataset.chapter);
      const idx = parseInt(box.dataset.checkIdx);
      Store.toggleCheckItem(chId, idx);
      box.classList.toggle('checked');
      const text = box.nextElementSibling;
      if (text) text.classList.toggle('checked');
    });
  });

  // Resistance log entry (Chapter 2)
  const addResistanceBtn = document.getElementById('add-resistance-entry');
  if (addResistanceBtn) {
    addResistanceBtn.addEventListener('click', () => {
      const entry = {};
      const ch = CHAPTERS.find(c => c.id === chapterId);
      let hasContent = false;
      ch.workbook.prompts.forEach(p => {
        const el = document.getElementById(`wb-log-${p.id}`);
        if (el) {
          entry[p.id] = el.value.trim();
          if (el.value.trim()) hasContent = true;
          el.value = '';
        }
      });
      if (!hasContent) {
        showToast('Write something first');
        return;
      }
      Store.addResistanceEntry(entry);
      showToast('Moment logged');
      // Re-render workbook tab
      const workbookDiv = document.getElementById('tab-workbook');
      if (workbookDiv) {
        workbookDiv.innerHTML = renderWorkbook(ch);
        bindWorkbookEvents(chapterId);
      }
    });
  }
}

// ==========================================
// NAVIGATION
// ==========================================

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    Router.navigate(btn.dataset.view);
  });
});

// ==========================================
// SERVICE WORKER
// ==========================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ==========================================
// INIT
// ==========================================

Router.init();
