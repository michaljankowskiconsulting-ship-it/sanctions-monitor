import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export interface SanctionEntry {
  _id: string;
  [key: string]: string;
}

export interface ChangelogModification {
  _id: string;
  changes: Record<string, { old: string; new: string }>;
}

export interface ChangelogEntry {
  timestamp: string;
  added_count: number;
  removed_count: number;
  modified_count: number;
  added: SanctionEntry[];
  removed: SanctionEntry[];
  modified: ChangelogModification[];
}

export interface Meta {
  last_hash: string;
  last_checked: string;
  last_changed: string;
  xlsx_url: string;
  entry_count: number;
}

function readJsonFile<T>(filename: string, fallback: T): T {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch (e) {
    console.warn(`Could not read ${filename}:`, e);
  }
  return fallback;
}

export function getSanctionsList(): SanctionEntry[] {
  return readJsonFile<SanctionEntry[]>("current.json", []);
}

export function getChangelog(): ChangelogEntry[] {
  return readJsonFile<ChangelogEntry[]>("changelog.json", []);
}

export function getMeta(): Meta | null {
  return readJsonFile<Meta | null>("meta.json", null);
}
