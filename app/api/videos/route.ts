import { NextRequest, NextResponse } from 'next/server';
import getDb, { toRows } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days');
  const product = searchParams.get('product');
  const format = searchParams.get('format');
  const pendingOnly = searchParams.get('pendingOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'gpm';

  const db = await getDb();
  let sql = 'SELECT * FROM videos WHERE 1=1';
  const args: (string | number)[] = [];

  if (pendingOnly) {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    sql += ' AND post_date >= ?';
    args.push(yearAgo);
  } else {
    if (days && days !== 'all') {
      const cutoff = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString();
      sql += ' AND post_date >= ?';
      args.push(cutoff);
    }
    if (product && product !== 'all') {
      sql += ' AND product_tag = ?';
      args.push(product);
    }
    if (format && format !== 'all') {
      sql += ' AND format_tag = ?';
      args.push(format);
    }
  }

  if (pendingOnly) {
    sql += ' ORDER BY CASE WHEN sales IS NULL THEN 0 ELSE 1 END, post_date DESC';
  } else {
    const validSortFields: Record<string, string> = {
      gpm: 'CASE WHEN gpm IS NULL THEN 1 ELSE 0 END, gpm DESC',
      views: 'views DESC',
      sales: 'CASE WHEN sales IS NULL THEN 1 ELSE 0 END, sales DESC',
      post_date: 'post_date DESC',
    };
    sql += ` ORDER BY ${validSortFields[sortBy] || validSortFields.gpm}`;
  }

  const result = await db.execute({ sql, args });
  return NextResponse.json(toRows(result));
}
