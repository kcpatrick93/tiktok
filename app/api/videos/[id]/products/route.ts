import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@libsql/client';
import getDb, { toRow, toRows } from '@/lib/db';

interface ProductEntry {
  id: number;
  video_id: string;
  product_tag: string;
  sales: number | null;
  gmv: number | null;
  commission: number | null;
}

async function recalcVideoTotals(db: Client, videoId: string) {
  const totalsResult = await db.execute({
    sql: `SELECT SUM(sales) as total_sales, SUM(gmv) as total_gmv, SUM(commission) as total_commission
       FROM video_product_entries WHERE video_id = ?`,
    args: [videoId],
  });
  const totals = toRow<{ total_sales: number | null; total_gmv: number | null; total_commission: number | null }>(totalsResult);

  let gpm: number | null = null;
  if (totals?.total_commission != null) {
    const video = toRow<{ views: number }>(
      await db.execute({ sql: 'SELECT views FROM videos WHERE id = ?', args: [videoId] })
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
      videoId,
    ],
  });
}

async function getEntries(db: Client, videoId: string): Promise<ProductEntry[]> {
  const result = await db.execute({
    sql: 'SELECT id, video_id, product_tag, sales, gmv, commission FROM video_product_entries WHERE video_id = ? ORDER BY id ASC',
    args: [videoId],
  });
  return toRows<ProductEntry>(result);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  return NextResponse.json(await getEntries(db, params.id));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { product_tag, sales, gmv, commission } = body;
  if (!product_tag) return NextResponse.json({ error: 'product_tag is required' }, { status: 400 });

  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO video_product_entries (video_id, product_tag, sales, gmv, commission) VALUES (?, ?, ?, ?, ?)',
    args: [
      params.id,
      product_tag,
      sales != null && sales !== '' ? Number(sales) : null,
      gmv != null && gmv !== '' ? Number(gmv) : null,
      commission != null && commission !== '' ? Number(commission) : null,
    ],
  });

  await recalcVideoTotals(db, params.id);
  return NextResponse.json(await getEntries(db, params.id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { id, product_tag, sales, gmv, commission } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const db = await getDb();
  await db.execute({
    sql: `UPDATE video_product_entries SET product_tag = ?, sales = ?, gmv = ?, commission = ?
     WHERE id = ? AND video_id = ?`,
    args: [
      product_tag,
      sales != null && sales !== '' ? Number(sales) : null,
      gmv != null && gmv !== '' ? Number(gmv) : null,
      commission != null && commission !== '' ? Number(commission) : null,
      id,
      params.id,
    ],
  });

  await recalcVideoTotals(db, params.id);
  return NextResponse.json(await getEntries(db, params.id));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const db = await getDb();
  await db.execute({
    sql: 'DELETE FROM video_product_entries WHERE id = ? AND video_id = ?',
    args: [id, params.id],
  });

  await recalcVideoTotals(db, params.id);
  return NextResponse.json(await getEntries(db, params.id));
}
