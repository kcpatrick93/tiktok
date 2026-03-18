import { NextRequest, NextResponse } from 'next/server';
import getDb, { toRow } from '@/lib/db';

export async function GET() {
  const db = await getDb();
  const row = toRow<{ value: string }>(
    await db.execute({ sql: "SELECT value FROM settings WHERE key = 'tiktok_username'", args: [] })
  );
  return NextResponse.json({ tiktok_username: row?.value || null });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { tiktok_username } = body;
  const db = await getDb();

  if (tiktok_username !== undefined) {
    const cleaned = String(tiktok_username).replace(/^@/, '').trim();
    await db.execute({
      sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      args: ['tiktok_username', cleaned],
    });
  }

  const saved = toRow<{ value: string }>(
    await db.execute({ sql: "SELECT value FROM settings WHERE key = 'tiktok_username'", args: [] })
  );
  return NextResponse.json({ tiktok_username: saved?.value || null });
}
