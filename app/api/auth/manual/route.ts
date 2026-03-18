import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/tiktok';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const success = await exchangeCodeForToken(code);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Token exchange failed — the code may have expired. Please try again.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Manual auth error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
