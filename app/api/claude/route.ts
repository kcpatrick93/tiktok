import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import getDb, { toRows } from '@/lib/db';

export async function POST() {
  const db = await getDb();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const videos = toRows<{
    title: string;
    post_date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    avg_watch_seconds: number | null;
    full_watch_rate: number | null;
    product_tag: string | null;
    format_tag: string | null;
    sales: number | null;
    commission: number | null;
    gpm: number | null;
    transcript: string | null;
  }>(
    await db.execute({
      sql: `SELECT title, post_date, views, likes, comments, shares,
        avg_watch_seconds, full_watch_rate,
        product_tag, format_tag, sales, commission, gpm, transcript
      FROM videos WHERE post_date >= ? ORDER BY post_date DESC`,
      args: [thirtyDaysAgo],
    })
  );

  if (videos.length === 0) {
    return NextResponse.json({
      report: 'No video data found for the last 30 days. Sync your TikTok data and enter some sales figures first.',
      generatedAt: new Date().toISOString(),
    });
  }

  const dataText = videos
    .map((v) => {
      const daysAgo = Math.round((Date.now() - new Date(v.post_date).getTime()) / (1000 * 60 * 60 * 24));
      return [
        `Video: "${v.title}"`,
        `Posted: ${daysAgo} days ago`,
        `Views: ${Number(v.views).toLocaleString()}`,
        `Likes: ${v.likes}, Comments: ${v.comments}, Shares: ${v.shares}`,
        `Avg watch time: ${v.avg_watch_seconds ? `${Number(v.avg_watch_seconds).toFixed(1)}s` : 'N/A'}`,
        `Full watch rate: ${v.full_watch_rate ? `${(Number(v.full_watch_rate) * 100).toFixed(1)}%` : 'N/A'}`,
        `Product: ${v.product_tag || 'Not tagged'}`,
        `Format: ${v.format_tag || 'Not tagged'}`,
        `Sales: ${v.sales ?? 'No data'}`,
        `Commission: ${v.commission != null ? `£${Number(v.commission).toFixed(2)}` : 'No data'}`,
        `GPM: ${v.gpm != null ? `£${Number(v.gpm).toFixed(2)}` : 'No data'}`,
        v.transcript ? `Script (first 500 chars): "${String(v.transcript).substring(0, 500)}"` : 'Script: None',
      ].join(', ');
    })
    .join('\n');

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a TikTok Shop affiliate performance analyst. Analyse the video data provided and produce a concise plain-English report covering:
1. Top 3 performing formats by average GPM
2. Top 3 performing products by total commission
3. Watch time patterns — flag anything over 26 seconds performing poorly
4. Script analysis — where transcripts are provided, identify what hooks, CTAs, or storytelling patterns appear in the highest-GPM videos vs the lowest. Note any patterns worth repeating or avoiding.
5. Exactly what to film next (be specific — product, format, script angle, why)
6. What to stop or pause based on recent performance

Keep it direct and actionable. No jargon. Grade 5 English. Maximum 400 words.`,
      messages: [
        {
          role: 'user',
          content: `Here is my TikTok video performance data for the last 30 days:\n\n${dataText}\n\nPlease analyse this and give me your report.`,
        },
      ],
    });

    const reportText = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate report';
    return NextResponse.json({ report: reportText, generatedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to generate report: ${msg}` }, { status: 500 });
  }
}
