import { NextResponse } from 'next/server';
import { isAuthenticated, shouldAutoSync, syncVideos } from '@/lib/tiktok';
import getDb, { toRow } from '@/lib/db';

export async function GET() {
  const authenticated = await isAuthenticated();
  const db = await getDb();
  const lastSyncRow = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['last_sync'] })
  );

  let autoSynced = false;
  if (authenticated && (await shouldAutoSync())) {
    await syncVideos();
    autoSynced = true;
  }

  const usernameRow = toRow<{ value: string }>(
    await db.execute({ sql: "SELECT value FROM settings WHERE key = 'tiktok_username'", args: [] })
  );

  return NextResponse.json({
    authenticated,
    lastSync: autoSynced ? new Date().toISOString() : lastSyncRow?.value || null,
    autoSynced,
    tiktok_username: usernameRow?.value || null,
  });
}
