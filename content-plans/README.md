# Weekly content plans

One file per week, named `YYYY-MM-DD-week.md` by the Monday the week starts.

The process that builds them lives in `.claude/skills/weekly-content-plan/SKILL.md`.
Schedule: Sundays 18:00 UK, emailed to Kevin and Sandy.

## Open item: where source scripts come from

The method is clone-and-vary: take a script with evidence behind it, shoot it word for
word, then vary only the hook. So a brief needs the **transcript**, not just a link to
watch. That raises the bar on sourcing rather than lowering it.

Two sources, one of them free and mostly untapped.

### Their own back catalogue (free, currently 1% used)

**7 of 719 videos have a transcript saved.** All seven are eczema or sleep videos from
a two-week window in March 2026, and they include the two biggest videos the account
has ever posted. Backfilling the top 30 by commission costs an afternoon and removes
the external dependency below for most weeks. Do this first.

### Outside viral videos (blocked)

Tested on 13 Sep 2026, all negative:

Tested on 13 Sep 2026, all negative:

| Route | Result |
|---|---|
| Fetching `tiktok.com/discover/...` pages | Returns the JavaScript shell only. No videos, no handles, no URLs. |
| Fetching TikTok Creative Center Top Ads | Same. Renders client-side, comes back empty. |
| Web search for specific videos | Returns TikTok *topic* pages, never `tiktok.com/@user/video/<id>` links. |
| TikTok's official Display API (this repo's OAuth) | Scopes are `user.info.basic`, `user.info.stats`, `video.list`. Own account only. No trend or competitor data by design. |

So outside scripts have to come from somewhere else. Three options:

**A. A TikTok Shop data tool with an API.** Kalodata, EchoTik or FastMoss. All three
carry UK and US trending video feeds with direct links, and some surface top-performing
video scripts per product, which is exactly what clone-and-vary needs. They also give
GMV and sales velocity, which would sharpen the "consider ordering" section. Paid,
roughly £50 to £150/month. The only option that makes the weekly plan fully
self-serving.

**B. Sandy feeds them.** She saves 10 to 15 videos a week and drops the links plus the
spoken script into a shared Google Sheet or Drive doc. Free, about fifteen minutes a
week, and it has a real upside: her judgement on what will work is better than any
API's. The catch is that the transcript has to come from her, since a link alone
cannot be read from here.

**C. Own catalogue only.** Clone and re-aim their own past winners, which is what the
first week's plan does. Free, immediate, no dependency, and viable indefinitely for
the eczema products. Weakest for anything outside the niche they already have data on.

Until one is chosen, an unsourced slot is written as:

```
NO SOURCE: search "<term>"
```

Never a fabricated URL, never a script presented as sourced when it was written here.

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
