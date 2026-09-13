# Weekly content plans

One file per week, named `YYYY-MM-DD-week.md` by the Monday the week starts.

The process that builds them lives in `.claude/skills/weekly-content-plan/SKILL.md`.
Schedule: Sundays 18:00 UK, emailed to Kevin and Sandy.

## Open item: where reference video links come from

Every brief is meant to carry a TikTok link Sandy can watch before filming. That part
is not solved yet, and it is worth understanding why before picking a fix.

Tested on 13 Sep 2026, all negative:

| Route | Result |
|---|---|
| Fetching `tiktok.com/discover/...` pages | Returns the JavaScript shell only. No videos, no handles, no URLs. |
| Fetching TikTok Creative Center Top Ads | Same. Renders client-side, comes back empty. |
| Web search for specific videos | Returns TikTok *topic* pages, never `tiktok.com/@user/video/<id>` links. |
| TikTok's official Display API (this repo's OAuth) | Scopes are `user.info.basic`, `user.info.stats`, `video.list`. Own account only. No trend or competitor data by design. |

So links have to come from somewhere else. Three options:

**A. A TikTok Shop data tool with an API.** Kalodata, EchoTik or FastMoss. All three
carry UK and US trending video feeds with direct links, plus GMV and sales velocity per
product, which would also sharpen the "consider ordering" section. Paid, roughly
£50 to £150/month depending on tier. This is the option that makes the plan fully
self-serving.

**B. Sandy feeds the links.** She saves 10 to 15 videos a week to a TikTok collection
or drops URLs in a shared Google Sheet or Drive doc. The Sunday job reads that and
builds briefs around what she has already flagged. Free, costs her about ten minutes a
week, and has a real upside: her taste on what will work is better than any API's.

**C. No links.** Briefs carry a search term and hashtag instead, as the sample week
does. Free, immediate, and noticeably weaker than the other two.

Until one is chosen, unfilled slots are written as:

```
Reference: `NO LINK: search "<term>"`
```

Never a fabricated URL.

## Also unresolved

- **"social1"** was mentioned as an account to check trending UK and US videos from. It
  does not match any connected connector, and no TikTok account is connected through
  Higgsfield either. Needs identifying before it can be wired in.
- **Sandy's email address** is needed before the Sunday send can go to both of them.
- **Umbrella** is not in the dashboard, so price, commission rate and stock are unknown.
- **Dashboard sync** last ran 24 Aug 2026. The scoreboard section stays thin until it
  runs again.

## Timezone note

The schedule is set in UTC. British Summer Time ends **25 October 2026**, so the cron
needs shifting from `17:00 UTC` to `18:00 UTC` on that date to stay at 18:00 UK, and
back again when BST resumes in March.
