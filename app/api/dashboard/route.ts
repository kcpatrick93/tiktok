import { NextResponse } from 'next/server';
import getDb, { toRow, toRows } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const thisMonth = toRow<{ total_commission: number; total_sales: number; total_gmv: number; avg_watch_seconds: number }>(
    await db.execute({
      sql: `SELECT COALESCE(SUM(commission), 0) as total_commission,
        COALESCE(SUM(sales), 0) as total_sales,
        COALESCE(SUM(gmv), 0) as total_gmv,
        COALESCE(AVG(avg_watch_seconds), 0) as avg_watch_seconds
      FROM videos WHERE post_date >= ? AND commission IS NOT NULL`,
      args: [startOfMonth],
    })
  );

  const lastMonth = toRow<{ avg_watch_seconds: number }>(
    await db.execute({
      sql: `SELECT COALESCE(AVG(avg_watch_seconds), 0) as avg_watch_seconds
      FROM videos WHERE post_date >= ? AND post_date <= ? AND avg_watch_seconds IS NOT NULL`,
      args: [startOfLastMonth, endOfLastMonth],
    })
  );

  const bestGpm = toRow<{ title: string; gpm: number }>(
    await db.execute({
      sql: `SELECT title, gpm FROM videos WHERE post_date >= ? AND gpm IS NOT NULL ORDER BY gpm DESC LIMIT 1`,
      args: [startOfMonth],
    })
  );

  const products = toRows<{ product: string; total_commission: number; total_sales: number; total_gmv: number; avg_gpm: number; video_count: number }>(
    await db.execute({
      sql: `SELECT product_tag as product,
        COALESCE(SUM(commission), 0) as total_commission,
        COALESCE(SUM(sales), 0) as total_sales,
        COALESCE(SUM(gmv), 0) as total_gmv,
        COALESCE(AVG(gpm), 0) as avg_gpm,
        COUNT(*) as video_count
      FROM videos WHERE product_tag IS NOT NULL AND commission IS NOT NULL
      GROUP BY product_tag ORDER BY total_commission DESC`,
      args: [],
    })
  );

  const formats = toRows<{ format: string; avg_gpm: number; avg_views: number; total_commission: number; total_gmv: number; video_count: number }>(
    await db.execute({
      sql: `SELECT format_tag as format,
        COALESCE(AVG(gpm), 0) as avg_gpm,
        COALESCE(AVG(views), 0) as avg_views,
        COALESCE(SUM(commission), 0) as total_commission,
        COALESCE(SUM(gmv), 0) as total_gmv,
        COUNT(*) as video_count
      FROM videos WHERE format_tag IS NOT NULL AND gpm IS NOT NULL
      GROUP BY format_tag ORDER BY avg_gpm DESC`,
      args: [],
    })
  );

  const gpmOverTime = toRows<{ date: string; avg_gpm: number; video_count: number }>(
    await db.execute({
      sql: `SELECT DATE(post_date) as date, AVG(gpm) as avg_gpm, COUNT(*) as video_count
      FROM videos WHERE post_date >= ? AND gpm IS NOT NULL
      GROUP BY DATE(post_date) ORDER BY date ASC`,
      args: [thirtyDaysAgo],
    })
  );

  return NextResponse.json({
    thisMonth,
    lastMonth,
    bestGpm: bestGpm || null,
    products,
    formats,
    gpmOverTime,
  });
}
