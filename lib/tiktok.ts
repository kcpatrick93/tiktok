import getDb, { toRow } from './db';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com';
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI!;

export async function getTikTokAuthUrl(): Promise<string> {
  const scopes = ['user.info.basic', 'user.info.stats', 'video.list'].join(',');
  const csrfState = Math.random().toString(36).substring(7);

  const db = await getDb();
  await db.execute({
    sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    args: ['csrf_state', csrfState],
  });

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    response_type: 'code',
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state: csrfState,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<boolean> {
  try {
    const response = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const db = await getDb();
      await db.batch([
        { sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: ['access_token', data.access_token] },
        { sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: ['refresh_token', data.refresh_token || ''] },
        {
          sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          args: ['token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000)],
        },
      ]);
      return true;
    }
    console.error('TikTok token exchange failed:', data);
    return false;
  } catch (err) {
    console.error('Token exchange error:', err);
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const db = await getDb();
  const row = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['refresh_token'] })
  );
  const refreshToken = row?.value;

  if (!refreshToken) return false;

  try {
    const response = await fetch(`${TIKTOK_API_BASE}/v2/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      await db.batch([
        { sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', args: ['access_token', data.access_token] },
        {
          sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          args: ['token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000)],
        },
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Token refresh error:', err);
    return false;
  }
}

export async function getValidToken(): Promise<string | null> {
  const db = await getDb();
  const tokenRow = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['access_token'] })
  );
  const expiresRow = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['token_expires_at'] })
  );

  if (!tokenRow?.value) return null;

  // Refresh if expiring in < 5 minutes
  if (expiresRow?.value && Date.now() > Number(expiresRow.value) - 300000) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
    const newRow = toRow<{ value: string }>(
      await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['access_token'] })
    );
    return newRow?.value || null;
  }

  return tokenRow.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const db = await getDb();
  const row = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['access_token'] })
  );
  return !!row?.value;
}

export async function shouldAutoSync(): Promise<boolean> {
  const db = await getDb();
  const row = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['last_sync'] })
  );
  if (!row?.value) return true;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  return Date.now() - new Date(row.value).getTime() > SIX_HOURS;
}

export async function syncVideos(): Promise<{ synced: number; error?: string }> {
  const token = await getValidToken();
  if (!token) return { synced: 0, error: 'Not authenticated' };

  const db = await getDb();
  let synced = 0;

  try {
    const fields = 'id,title,create_time,cover_image_url,view_count,like_count,comment_count,share_count';

    const allVideos: Array<Record<string, unknown>> = [];
    let cursor: number | undefined = undefined;
    let hasMore = true;
    let pageCount = 0;

    while (hasMore && pageCount < 20) {
      const body: Record<string, unknown> = { max_count: 20 };
      if (cursor !== undefined) body.cursor = cursor;

      const listResponse = await fetch(`${TIKTOK_API_BASE}/v2/video/list/?fields=${fields}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const listData = await listResponse.json();

      if (!listData.data?.videos) {
        if (allVideos.length === 0) {
          return { synced: 0, error: listData.error?.message || 'Failed to fetch video list' };
        }
        break;
      }

      const pageVideos = listData.data.videos as Array<Record<string, unknown>>;
      allVideos.push(...pageVideos);
      hasMore = listData.data.has_more === true;
      cursor = listData.data.cursor;
      pageCount++;

      if (hasMore) await new Promise((r) => setTimeout(r, 300));
    }

    const videos = allVideos;
    if (videos.length === 0) return { synced: 0 };

    // Batch upsert all videos
    const batchItems = videos.map((video) => {
      const sources = (video.video_views_by_source_type as Record<string, number>) || {};
      return {
        sql: `INSERT INTO videos (
          id, title, post_date, thumbnail_url,
          views, likes, comments, shares,
          avg_watch_seconds, full_watch_rate,
          traffic_foryou_pct, traffic_search_pct, traffic_profile_pct,
          last_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          post_date = excluded.post_date,
          thumbnail_url = excluded.thumbnail_url,
          views = excluded.views,
          likes = excluded.likes,
          comments = excluded.comments,
          shares = excluded.shares,
          avg_watch_seconds = excluded.avg_watch_seconds,
          full_watch_rate = excluded.full_watch_rate,
          traffic_foryou_pct = excluded.traffic_foryou_pct,
          traffic_search_pct = excluded.traffic_search_pct,
          traffic_profile_pct = excluded.traffic_profile_pct,
          last_synced = excluded.last_synced`,
        args: [
          video.id as string,
          (video.title as string) || 'Untitled',
          new Date((video.create_time as number) * 1000).toISOString(),
          (video.cover_image_url as string) || '',
          (video.view_count as number) || 0,
          (video.like_count as number) || 0,
          (video.comment_count as number) || 0,
          (video.share_count as number) || 0,
          (video.average_time_watched as number) || null,
          (video.full_video_watched_rate as number) || null,
          sources.FOR_YOU || null,
          sources.SEARCH || null,
          sources.PROFILE || null,
          new Date().toISOString(),
        ],
      };
    });

    // libsql batch has a limit; process in chunks of 100
    for (let i = 0; i < batchItems.length; i += 100) {
      await db.batch(batchItems.slice(i, i + 100), 'write');
    }
    synced = videos.length;

    await db.execute({
      sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      args: ['last_sync', new Date().toISOString()],
    });

    return { synced };
  } catch (err) {
    console.error('Sync error:', err);
    return { synced, error: String(err) };
  }
}
