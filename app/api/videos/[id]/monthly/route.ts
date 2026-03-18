import { NextRequest, NextResponse } from 'next/server';
import getDb, { toRow, toRows } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT year_month, sales, gmv, commission FROM video_monthly_stats WHERE video_id = ? ORDER BY year_month ASC',
    args: [params.id],
  });
  return NextResponse.json(toRows(result));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { year_month, sales, gmv, commission } = body;

  if (!year_month) {
    return NextResponse.json({ error: 'year_month is required' }, { status: 400 });
  }

  const db = await getDb();

  await db.execute({
    sql: `INSERT INTO video_monthly_stats (video_id, year_month, sales, gmv, commission)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (video_id, year_month) DO UPDATE SET
        sales = excluded.sales, gmv = excluded.gmv, commission = excluded.commission`,
    args: [
      params.id,
      year_month,
      sales != null && sales !== '' ? Number(sales) : null,
      gmv != null && gmv !== '' ? Number(gmv) : null,
      commission != null && commission !== '' ? Number(commission) : null,
    ],
  });

  const totalsResult = await db.execute({
    sql: `SELECT SUM(sales) as total_sales, SUM(gmv) as total_gmv, SUM(commission) as total_commission
      FROM video_monthly_stats WHERE video_id = ?`,
    args: [params.id],
  });
  const totals = toRow<{ total_sales: number | null; total_gmv: number | null; total_commission: number | null }>(totalsResult);

  let gpm: number | null = null;
  if (totals?.total_commission != null) {
    const video = toRow<{ views: number }>(
      await db.execute({ sql: 'SELECT views FROM videos WHERE id = ?', args: [params.id] })
    );
    if (video && Number(video.views) > 0) {
      gpm = (Number(totals.total_commission) / Number(video.views)) * 1000;
    }
  }

  const hasSalesData = totals?.total_sales != null || totals?.total_commission != null;

  await db.execute({
    sql: `UPDATE videos SET sales = ?, gmv = ?, commission = ?, gpm = ?,
      sales_updated_at = CASE WHEN ? THEN datetime('now') ELSE sales_updated_at END
    WHERE id = ?`,
    args: [
      totals?.total_sales ?? null,
      totals?.total_gmv ?? null,
      totals?.total_commission ?? null,
      gpm,
      hasSalesData ? 1 : 0,
      params.id,
    ],
  });

  const rows = await db.execute({
    sql: 'SELECT year_month, sales, gmv, commission FROM video_monthly_stats WHERE video_id = ? ORDER BY year_month ASC',
    args: [params.id],
  });
  return NextResponse.json(toRows(rows));
}
