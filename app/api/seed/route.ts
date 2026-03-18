import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

// Only available in development
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const db = await getDb();

  const sampleVideos = [
    { id: 'demo_001', title: 'Exeskin Balm — Stop Scratching For Good', daysAgo: 1, views: 6412, likes: 312, comments: 45, shares: 89, avg_watch_seconds: 18.4, full_watch_rate: 0.74, product_tag: 'Exeskin Balm', format_tag: 'Shouty Hook', sales: 4, commission: 21.96 },
    { id: 'demo_002', title: 'Tissue Oil — My GP Actually Recommended This', daysAgo: 2, views: 2104, likes: 98, comments: 23, shares: 31, avg_watch_seconds: 22.1, full_watch_rate: 0.61, product_tag: 'Tissue Oil', format_tag: 'Storytelling', sales: 2, commission: 10.24 },
    { id: 'demo_003', title: 'Exeskin BOFU — Everything You Need To Know', daysAgo: 3, views: 890, likes: 42, comments: 8, shares: 12, avg_watch_seconds: 29.3, full_watch_rate: 0.42, product_tag: 'Exeskin Balm', format_tag: 'BOFU Text-Led', sales: 0, commission: 0 },
    { id: 'demo_004', title: 'My Wife Tries Tissue Oil — Unfiltered Reaction', daysAgo: 5, views: 4230, likes: 445, comments: 87, shares: 156, avg_watch_seconds: 21.8, full_watch_rate: 0.69, product_tag: 'Tissue Oil', format_tag: 'Wife Skit', sales: 5, commission: 25.60 },
    { id: 'demo_005', title: "Carpet Washer — You Won't Believe What Came Out", daysAgo: 7, views: 8901, likes: 1023, comments: 234, shares: 445, avg_watch_seconds: 16.2, full_watch_rate: 0.82, product_tag: 'Carpet Washer', format_tag: 'Shouty Hook', sales: 8, commission: 48.00 },
    { id: 'demo_006', title: "Tiny Humans Book — My Kid Can't Stop Reading", daysAgo: 10, views: 3341, likes: 289, comments: 56, shares: 78, avg_watch_seconds: 24.7, full_watch_rate: 0.58, product_tag: 'Tiny Humans Book', format_tag: 'Storytelling', sales: 6, commission: 22.80 },
    { id: 'demo_007', title: 'Exeskin — 3 Week Update (Honest Review)', daysAgo: 14, views: 5621, likes: 512, comments: 98, shares: 201, avg_watch_seconds: 19.9, full_watch_rate: 0.71, product_tag: 'Exeskin Balm', format_tag: 'Storytelling', sales: 7, commission: 38.43 },
    { id: 'demo_008', title: 'POV: Your carpet is actually disgusting', daysAgo: 18, views: 12400, likes: 1890, comments: 412, shares: 889, avg_watch_seconds: 14.1, full_watch_rate: 0.88, product_tag: 'Carpet Washer', format_tag: 'Skit', sales: 12, commission: 72.00 },
    { id: 'demo_009', title: 'Why every parent needs this book', daysAgo: 22, views: 1890, likes: 134, comments: 29, shares: 41, avg_watch_seconds: 27.8, full_watch_rate: 0.38, product_tag: 'Tiny Humans Book', format_tag: 'BOFU Text-Led', sales: 1, commission: 3.80 },
    { id: 'demo_010', title: 'Tissue Oil morning routine (no filter)', daysAgo: 25, views: 3102, likes: 267, comments: 44, shares: 67, avg_watch_seconds: 20.5, full_watch_rate: 0.65, product_tag: 'Tissue Oil', format_tag: 'Shouty Hook', sales: 3, commission: 15.36 },
    { id: 'demo_011', title: 'New Exeskin Hook — Testing Something Different', daysAgo: 0, views: 823, likes: 67, comments: 12, shares: 18, avg_watch_seconds: 15.3, full_watch_rate: 0.79, product_tag: null, format_tag: null, sales: null, commission: null },
    { id: 'demo_012', title: 'Carpet Washer Before and After (Day 2)', daysAgo: 1, views: 2341, likes: 198, comments: 34, shares: 56, avg_watch_seconds: 17.8, full_watch_rate: 0.75, product_tag: null, format_tag: null, sales: null, commission: null },
  ];

  const batchItems = sampleVideos.map((v) => {
    const postDate = new Date(Date.now() - v.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const gpm = v.commission != null && v.commission > 0 && v.views > 0 ? (v.commission / v.views) * 1000 : null;
    return {
      sql: `INSERT INTO videos (id, title, post_date, thumbnail_url, views, likes, comments, shares,
        avg_watch_seconds, full_watch_rate, traffic_foryou_pct, traffic_search_pct, traffic_profile_pct,
        product_tag, format_tag, sales, commission, gpm, last_synced)
      VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title, views=excluded.views, likes=excluded.likes,
        sales=excluded.sales, commission=excluded.commission, gpm=excluded.gpm`,
      args: [v.id, v.title, postDate, v.views, v.likes, v.comments, v.shares,
        v.avg_watch_seconds, v.full_watch_rate, 0.72, 0.18, 0.10,
        v.product_tag, v.format_tag, v.sales, v.commission, gpm, new Date().toISOString()],
    };
  });

  await db.batch(batchItems, 'write');

  return NextResponse.json({ seeded: sampleVideos.length, message: 'Demo data loaded' });
}
