import { NextResponse } from 'next/server';
import { syncVideos, isAuthenticated } from '@/lib/tiktok';

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const result = await syncVideos();
  return NextResponse.json(result);
}
