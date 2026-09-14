#!/usr/bin/env node
/**
 * Pull candidate source scripts for the weekly content plan.
 *
 * Uses Apify's clockworks/tiktok-scraper, which does discovery and transcription
 * in one run. Reading TikTok directly from a server does not work (captcha wall,
 * see content-plans/README.md); Apify runs on its own residential proxies, so it
 * does.
 *
 * Setup: set APIFY_TOKEN as an environment variable on the Claude Code
 * environment so scheduled runs pick it up. Never commit it.
 *
 * Usage:
 *   NODE_USE_ENV_PROXY=1 node scripts/find-source-scripts.mjs
 *   NODE_USE_ENV_PROXY=1 node scripts/find-source-scripts.mjs --dry-run
 *   NODE_USE_ENV_PROXY=1 node scripts/find-source-scripts.mjs --topic=energy
 *
 * NODE_USE_ENV_PROXY=1 is needed because Node's built-in fetch ignores
 * HTTPS_PROXY without it, and this container has no direct egress.
 */

const ACTOR = 'clockworks~tiktok-scraper';
const TOKEN = process.env.APIFY_TOKEN;

// What to hunt for, per topic. Keep these tight: the point is to find scripts
// aimed at the same buyer, not the biggest videos on TikTok.
const TOPICS = {
  eczema: {
    searchQueries: [
      'baby eczema',
      'child eczema cream',
      'eczema flare up winter',
      'dry skin toddler',
    ],
    hashtags: ['eczemauk', 'eczemababy', 'eczemainkids', 'sensitiveskin'],
  },
  energy: {
    searchQueries: [
      'radiator foil',
      'energy saving hack uk',
      'heating hack save money',
    ],
    hashtags: ['energysaving', 'heatinghack', 'ukhomes', 'moneysavingtips'],
  },
  parenting: {
    searchQueries: ['toddler tantrum help', 'gentle parenting book'],
    hashtags: ['parentingtips', 'toddlertantrums', 'gentleparenting'],
  },
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const topicArg = (args.find((a) => a.startsWith('--topic=')) || '').split('=')[1];
const topics = topicArg ? [topicArg] : Object.keys(TOPICS);

function buildInput(topic) {
  const t = TOPICS[topic];
  if (!t) throw new Error(`Unknown topic "${topic}". Known: ${Object.keys(TOPICS).join(', ')}`);
  return {
    searchQueries: t.searchQueries,
    hashtags: t.hashtags,
    resultsPerPage: 15,
    searchSection: '/video',
    videoSearchSorting: 'MOST_LIKED',
    videoSearchDateFilter: 'PAST_MONTH',
    // The reason this whole thing works: Apify scrapes as if in the UK.
    proxyCountryCode: 'GB',
    // Transcripts are the deliverable. TikTok supplies subtitles for some
    // videos; this transcribes the rest with speech-to-text.
    downloadSubtitlesOptions: 'DOWNLOAD_AND_TRANSCRIBE_VIDEOS_WITHOUT_SUBTITLES',
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadAvatars: false,
    scrapeRelatedVideos: false,
  };
}

function textOf(item) {
  // The actor has used a few shapes for subtitles across versions, so check all
  // of them rather than assuming one.
  const direct = item.transcript || item.subtitles || item.videoTranscript;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (Array.isArray(direct)) {
    const joined = direct
      .map((s) => (typeof s === 'string' ? s : s?.text || s?.content || ''))
      .join(' ')
      .trim();
    if (joined) return joined;
  }
  for (const key of ['subtitleLinks', 'videoMeta']) {
    const v = item[key];
    if (v && typeof v === 'object') {
      const t = v.transcript || v.subtitles;
      if (typeof t === 'string' && t.trim()) return t.trim();
    }
  }
  return '';
}

function normalise(item) {
  const plays = item.playCount ?? item.views ?? 0;
  const likes = item.diggCount ?? item.likes ?? 0;
  const transcript = textOf(item);
  return {
    url: item.webVideoUrl || item.url || '',
    handle: item.authorMeta?.name || item.authorMeta?.nickName || item.author || '',
    caption: (item.text || item.desc || '').slice(0, 200),
    plays,
    likes,
    comments: item.commentCount ?? 0,
    shares: item.shareCount ?? 0,
    posted: item.createTimeISO || item.createTime || '',
    // Engagement rate beats raw plays for judging whether a hook actually
    // landed, since a big view count can just be a big push.
    engagementPct: plays > 0 ? Number((((likes + (item.commentCount ?? 0)) / plays) * 100).toFixed(2)) : 0,
    words: transcript ? transcript.split(/\s+/).length : 0,
    transcript,
  };
}

async function runTopic(topic) {
  const input = buildInput(topic);

  if (dryRun) {
    console.log(`\n--- ${topic} (dry run, nothing called) ---`);
    console.log(JSON.stringify(input, null, 2));
    return [];
  }

  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${TOKEN}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${topic}: Apify returned ${res.status}. ${body.slice(0, 300)}`);
  }

  const items = await res.json();
  return items.map(normalise);
}

function digest(topic, rows) {
  // Only rows with a real transcript are usable as source scripts. A link
  // without words in it is a suggestion, not a source.
  const usable = rows
    .filter((r) => r.words >= 40)
    .sort((a, b) => b.engagementPct - a.engagementPct)
    .slice(0, 8);

  const lines = [`## ${topic}`, ''];
  if (!usable.length) {
    lines.push(`No usable transcripts. ${rows.length} videos returned, none with 40+ words.`, '');
    return lines.join('\n');
  }

  lines.push(`${usable.length} usable of ${rows.length} returned, ranked by engagement rate.`, '');
  for (const r of usable) {
    lines.push(`### @${r.handle} — ${r.plays.toLocaleString()} plays, ${r.engagementPct}% engagement`);
    lines.push(`${r.url}`);
    lines.push(`*${r.caption}*`);
    lines.push('');
    lines.push('> ' + r.transcript.replace(/\n+/g, '\n> '));
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  if (!TOKEN && !dryRun) {
    console.error('APIFY_TOKEN is not set. Set it on the environment, then re-run.');
    console.error('To see the request without calling Apify: --dry-run');
    process.exit(1);
  }

  const sections = [];
  let total = 0;

  for (const topic of topics) {
    try {
      const rows = await runTopic(topic);
      total += rows.length;
      if (!dryRun) sections.push(digest(topic, rows));
    } catch (err) {
      console.error(`! ${err.message}`);
      sections.push(`## ${topic}\n\nFailed: ${err.message}\n`);
    }
  }

  if (dryRun) return;

  const stamp = new Date().toISOString().slice(0, 10);
  const out = [`# Source script candidates — ${stamp}`, '', ...sections].join('\n');
  const path = new URL(`../content-plans/sources/${stamp}.md`, import.meta.url).pathname;
  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir(new URL('../content-plans/sources/', import.meta.url).pathname, { recursive: true });
  await writeFile(path, out, 'utf8');
  console.log(`${total} videos scanned. Digest written to ${path}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
