import { NextRequest, NextResponse } from 'next/server';
import getDb, { toRow } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { product_tag, format_tag, sales, commission, gmv, transcript } = body;
  const db = await getDb();

  let gpm: number | null = null;
  if (commission != null && commission !== '') {
    const video = toRow<{ views: number }>(
      await db.execute({ sql: 'SELECT views FROM videos WHERE id = ?', args: [params.id] })
    );
    if (video && video.views > 0) {
      gpm = (Number(commission) / Number(video.views)) * 1000;
    }
  }

  const hasSalesData = (sales != null && sales !== '') || (commission != null && commission !== '');

  await db.execute({
    sql: `UPDATE videos SET
      product_tag = COALESCE(?, product_tag),
      format_tag = COALESCE(?, format_tag),
      sales = ?,
      commission = ?,
      gmv = ?,
      gpm = ?,
      transcript = COALESCE(?, transcript),
      sales_updated_at = CASE WHEN ? THEN datetime('now') ELSE sales_updated_at END
    WHERE id = ?`,
    args: [
      product_tag || null,
      format_tag || null,
      sales != null && sales !== '' ? Number(sales) : null,
      commission != null && commission !== '' ? Number(commission) : null,
      gmv != null && gmv !== '' ? Number(gmv) : null,
      gpm,
      transcript !== undefined ? (transcript || null) : null,
      hasSalesData ? 1 : 0,
      params.id,
    ],
  });

  const updated = toRow(await db.execute({ sql: 'SELECT * FROM videos WHERE id = ?', args: [params.id] }));
  return NextResponse.json(updated);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  const video = toRow(await db.execute({ sql: 'SELECT * FROM videos WHERE id = ?', args: [params.id] }));
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(video);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  await db.execute({ sql: 'DELETE FROM videos WHERE id = ?', args: [params.id] });
  return NextResponse.json({ success: true });
}
