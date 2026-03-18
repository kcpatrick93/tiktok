import { createClient, Client, ResultSet } from '@libsql/client';

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getDbClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./data/dashboard.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function initializeSchema(db: Client): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT,
      post_date TEXT,
      thumbnail_url TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      avg_watch_seconds REAL,
      full_watch_rate REAL,
      traffic_foryou_pct REAL,
      traffic_search_pct REAL,
      traffic_profile_pct REAL,
      product_tag TEXT,
      format_tag TEXT,
      sales INTEGER,
      commission REAL,
      gmv REAL,
      gpm REAL,
      last_synced TEXT,
      sales_updated_at TEXT,
      transcript TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS video_monthly_stats (
      video_id TEXT NOT NULL,
      year_month TEXT NOT NULL,
      sales INTEGER,
      gmv REAL,
      commission REAL,
      PRIMARY KEY (video_id, year_month)
    );
    CREATE TABLE IF NOT EXISTS video_product_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT NOT NULL,
      product_tag TEXT NOT NULL,
      sales INTEGER,
      gmv REAL,
      commission REAL
    );
  `);

  // Migrate existing local databases — add columns that may not exist yet
  for (const sql of [
    'ALTER TABLE videos ADD COLUMN sales_updated_at TEXT',
    'ALTER TABLE videos ADD COLUMN gmv REAL',
    'ALTER TABLE videos ADD COLUMN transcript TEXT',
  ]) {
    try {
      await db.execute(sql);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  // Seed products if empty
  const countResult = await db.execute('SELECT COUNT(*) as count FROM products');
  if (Number(countResult.rows[0].count) === 0) {
    await db.batch([
      { sql: 'INSERT INTO products (name, active) VALUES (?, 1)', args: ['Exeskin Balm'] },
      { sql: 'INSERT INTO products (name, active) VALUES (?, 1)', args: ['Tissue Oil'] },
      { sql: 'INSERT INTO products (name, active) VALUES (?, 1)', args: ['Tiny Humans Book'] },
      { sql: 'INSERT INTO products (name, active) VALUES (?, 1)', args: ['Carpet Washer'] },
    ]);
  }
}

export async function getDb(): Promise<Client> {
  const db = getDbClient();
  if (!initPromise) {
    initPromise = initializeSchema(db);
  }
  await initPromise;
  return db;
}

/** Convert a libsql ResultSet into an array of plain objects */
export function toRows<T>(result: ResultSet): T[] {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((col) => [col, row[col]]))
  ) as T[];
}

/** Get first row as a plain object, or undefined */
export function toRow<T>(result: ResultSet): T | undefined {
  if (!result.rows[0]) return undefined;
  return Object.fromEntries(result.columns.map((col) => [col, result.rows[0][col]])) as T;
}

export default getDb;
