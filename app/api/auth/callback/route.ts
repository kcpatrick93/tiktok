import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/tiktok';
import getDb, { toRow } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=no_code', request.url));
  }

  const db = await getDb();
  const storedState = toRow<{ value: string }>(
    await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['csrf_state'] })
  )?.value;

  if (state && storedState && state !== storedState) {
    return NextResponse.redirect(new URL('/?auth_error=invalid_state', request.url));
  }

  const success = await exchangeCodeForToken(code);

  if (success) {
    return NextResponse.redirect(new URL('/?auth_success=1', request.url));
  } else {
    return NextResponse.redirect(new URL('/?auth_error=token_exchange_failed', request.url));
  }
}
