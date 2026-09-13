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

### Outside viral videos (blocked from here)

Tested 13 Sep 2026. Reading TikTok from this environment does not work, by any route tried:

| Route | Result |
|---|---|
| Plain page fetching | Returns the JavaScript shell only. No videos, handles or URLs. |
| TikTok Creative Center | Same. Renders client-side, comes back empty. |
| Web search for specific videos | Returns TikTok *topic* pages, never `@user/video/<id>` links. |
| curl with a real browser UA | Reaches tiktok.com, 200, 358KB. But the rehydration blob holds only app config: zero video IDs, zero handles, and 25 references to captcha. Content is withheld from this IP. |
| Headless Chromium (Playwright 1.56) | Cannot open a tunnel through the egress proxy at all. Fails on example.com too, so it is not a TikTok block, it is no browser networking. |

Two further notes. The blob reports `region: US`, so the IP geolocates to the States and
even a working scrape would default to US content rather than UK. And anything behind a
login, social1 included, needs a human driving a real browser regardless.

Do not spend time retrying these.

### The route that works

**A Google Sheet Sandy fills in.** Drive is readable from here (verified 13 Sep). She
browses in her own browser, on whatever tool she likes, and drops rows in:

| Date | Video link | Handle | Product | Views | Why it caught her eye | Script |
|---|---|---|---|---|---|---|

The **Script** column is the one that matters. A link alone cannot be read from here,
so a row without pasted script text is a suggestion, not a source.

### On paying for a tool

Worth knowing before spending: the affordable tiers of the TikTok Shop data tools are
web UIs, not APIs, so they do not remove the human step above.

- **Kalodata** Starter about $49.99/mo, Professional about $109.99/mo
  ([pricing roundup](https://creatify.ai/blog/kalodata-pricing-plans-and-what-you-ll-actually-pay-in-2026)).
- **FastMoss** Basic about $47 to $59/mo, Pro about $125 to $179/mo. API access is
  quoted separately at roughly $500 to $5,000/year and is aimed at enterprise
  ([pricing roundup](https://simptok.com/how-much-is-fastmoss/)).
- **EchoTik** comparable tiers.

So a subscription buys Sandy a better hunting ground, not a pipe into this process.
The Sheet is still the handover either way. Verify current pricing before buying, these
move.

## Also unresolved

- **"social1"** is a third-party trend tool. It needs a logged-in browser, which this
  environment does not have, so Sandy drives it and hands over via the Sheet.
- **Sandy's email address** is needed before the Sunday send can go to both of them.
- **Umbrella** is not in the dashboard, so price, commission rate and stock are unknown.
- **Dashboard sync** last ran 24 Aug 2026. The scoreboard section stays thin until it
  runs again.

## Timezone note

The schedule is set in UTC. British Summer Time ends **25 October 2026**, so the cron
needs shifting from `17:00 UTC` to `18:00 UTC` on that date to stay at 18:00 UK, and
back again when BST resumes in March.
