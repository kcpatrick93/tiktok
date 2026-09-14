---
name: browser-research
description: Run TikTok and social1 research through Kevin's own logged-in browser on his Mac. Use when running locally on his laptop and he asks to check the TikTok account, pull recent video stats, look up affiliate commission, research trending videos on social1, or backfill the dashboard without the phone-to-CSV chore.
---

# Browser research, local sessions only

This only works in a Claude Code session running on Kevin's Mac. A cloud session has
no path to his browser, so if you are not local, stop and say so rather than trying.

Purpose: his TikTok account, TikTok Studio, the TikTok Shop affiliate centre and
social1 are all behind a login in a browser he already has open. Everything in them is
useful and none of it is reachable any other way.

## Guardrails, read these first

This drives a real, logged-in business account. Treat it as read-only.

- **Never post, schedule, delete or edit a video.**
- **Never reply to comments or open DMs.**
- **Never change account settings, and never touch anything payment or payout related.**
- Do not click into anything that would accept terms, join a programme, or request a
  sample on his behalf. If requesting affiliate samples would help, produce the list and
  let him click.
- If a page asks for a password, a verification code, or 2FA, stop and hand back to him.
  Never enter credentials.
- Screenshots and page text you pull are his business data. Keep them in the repo or the
  scratchpad, never anywhere external.

If something looks like it would change state rather than read it, ask first.

## Getting browser access

Standard route is Playwright MCP attached to his real Chrome over the DevTools protocol,
so his existing logins are used and nothing needs logging into again.

Chrome has to be started with a debugging port. If it is already running without one,
the port is not there, so it needs a full quit and relaunch. His profile and cookies
persist, so he stays logged in.

```bash
# Quit Chrome completely first (Cmd-Q, not just closing the window), then:
open -a "Google Chrome" --args --remote-debugging-port=9222

# Confirm it took:
curl -s http://127.0.0.1:9222/json/version
```

Then add the MCP server:

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest --cdp-endpoint http://127.0.0.1:9222
```

Verify with `/mcp` that it connected, then navigate to a known page and read the title
before doing anything real.

This is the standard setup, not gospel. If it does not connect, check what is actually
installed and adapt rather than pushing on. Do not fall back to scraping TikTok without
a browser: that has been tried from a server and TikTok serves a captcha wall instead of
content (see `content-plans/README.md`).

## What to collect

### 1. Recent posts, from TikTok Studio

The highest-value item, because the dashboard's own sync is usually weeks behind.

For every video posted since the dashboard's `last_synced` date, get: video ID or URL,
caption, post date, views, likes, comments, shares, and watch-through if shown. Work
back until you reach videos already in the dashboard.

Tag each one against the cluster it came from if it matches a plan in `content-plans/`,
so the scoreboard can say which angle won.

### 2. Commission, from the TikTok Shop affiliate centre

Per-video commission is what GPM needs. If the affiliate centre exposes commission per
video or per content piece, pull it. If it only shows order-level or period totals,
record what is actually there and say plainly that per-video attribution was not
available, rather than dividing a total and presenting it as real.

Do not go near payout or bank settings.

### 3. Trending research, on social1

This is what social1 is for and the only place it can be reached.

Hunt in their niche, not in general: UK parents of children with eczema or dry skin, and
the autumn energy-saving angle. For each video worth cloning, capture the URL, handle,
view count, and **the spoken script**, because clone-and-vary needs the words, not the
link. Check `content-plans/sources/` first so you are not re-collecting the same videos.

While in there, check two things against anything you are about to recommend: whether
they already have the product in their affiliate showcase, and what the commission rate
is. Both change whether a recommendation is worth making.

## Where to put what you find

### The dashboard, which kills the phone-to-CSV chore

The dashboard runs locally. Start it with `npm run dev` in the repo if it is not up.

It is password-protected by middleware, so authenticate first:

```bash
curl -s -c /tmp/tt-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"password\":\"$DASHBOARD_PASSWORD\"}"
```

Then write each video with a PATCH. The same call takes the sales figures **and** the
transcript, so do both in one pass:

```bash
curl -s -b /tmp/tt-cookies.txt -X PATCH http://localhost:3000/api/videos/<video_id> \
  -H 'Content-Type: application/json' \
  -d '{"product_tag":"Tissue Oil","format_tag":"Storytelling","sales":12,"commission":31.40,"gmv":210.00,"transcript":"..."}'
```

GPM is computed server-side as `commission / views * 1000`, so a video needs its views
synced as well as its sales entered before it ranks properly. Run the dashboard's own
sync first if views are stale.

Read the password from the repo's `.env`. **Never print it, never paste it into a
commit, never put it in a file that gets pushed.**

### The repo

- Source scripts found on social1 go to `content-plans/sources/<date>.md`, same shape as
  what `scripts/find-source-scripts.mjs` writes: URL, handle, plays, engagement, script.
- Product checks (already in showcase? commission rate?) go in the same file next to the
  product they relate to.
- Commit and push to `claude/tiktok-shop-content-plan-4w8er7`.

## What to hand back

Short, in the terminal. What is newly in the dashboard, what the recent posts are doing,
which source scripts are worth cloning next, and anything that contradicts the current
plan in `content-plans/`. Do not paste raw page dumps.
