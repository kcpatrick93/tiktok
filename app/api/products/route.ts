import { NextRequest, NextResponse } from 'next/server';
import getDb, { toRows } from '@/lib/db';

export async function GET() {
  const db = await getDb();
  const result = await db.execute({ sql: 'SELECT * FROM products WHERE active = 1 ORDER BY name', args: [] });
  return NextResponse.json(toRows(result));
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.execute({
    sql: 'INSERT INTO products (name, active) VALUES (?, 1)',
    args: [name.trim()],
  });
  return NextResponse.json({ id: Number(result.lastInsertRowid), name: name.trim(), active: 1 });
}
