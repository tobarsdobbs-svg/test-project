import fs from 'fs/promises';
import path from 'path';

const HISTORY_PATH = './output/history.json';

/**
 * Tracks which topics have been generated to avoid duplicates
 * and maintain a production log.
 */
export class History {
  constructor() {
    this.entries = [];
  }

  async load() {
    try {
      const data = await fs.readFile(HISTORY_PATH, 'utf-8');
      this.entries = JSON.parse(data);
    } catch {
      this.entries = [];
    }
    return this;
  }

  async save() {
    await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
    await fs.writeFile(HISTORY_PATH, JSON.stringify(this.entries, null, 2));
  }

  addEntry(entry) {
    this.entries.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  getUsedTopicIds() {
    return this.entries.map((e) => e.topicId);
  }

  getLastN(n) {
    return this.entries.slice(-n);
  }
}

export default History;
