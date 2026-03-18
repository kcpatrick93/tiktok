import { NextResponse } from 'next/server';
import { getTikTokAuthUrl } from '@/lib/tiktok';

export async function GET() {
  const authUrl = await getTikTokAuthUrl();
  return NextResponse.redirect(authUrl);
}
