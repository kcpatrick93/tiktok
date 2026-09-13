---
name: weekly-content-plan
description: Build the Sunday TikTok Shop content plan for the week ahead and email it to Kevin and Sandy. Use when the scheduled Sunday job fires, or when either of them asks for "this week's plan", "the content plan", "what are we filming this week".
---

# Weekly TikTok Shop Content Plan

Runs every Sunday 18:00 UK time. Produces one email: what to film, why, and the
source script to copy.

Sandy leads on filming and is the on-camera face. Kevin appears in two-hander skits.
Write the plan so Sandy can pick it up cold on Monday morning and shoot without
asking follow-up questions.

## The method: clone, then vary

The plan is **not** a set of original scripts. It is a proven script copied word for
word, plus angle variants of it. Original writing is the fallback, not the default.

Their own numbers make the case better than any argument:

On 13 and 14 March 2026 they posted five videos for the same eczema product, off the
same core script, with five different hooks.

| Posted | Angle | Views | Sales | Commission | GPM |
|---|---|---|---|---|---|
| 13 Mar 17:21 | "I felt so guilty every time I said it" | 494,290 | 210 | £522.06 | 1.26 |
| 13 Mar 18:26 | "Nobody told me this and I wish they had" | 732,503 | 273 | £679.43 | 1.14 |
| 14 Mar 08:31 | "Same appointment. Same answer." | 20,763 | 5 | £14.10 | 0.69 |
| 14 Mar 12:29 | "Thank me later" (before/after) | 125,828 | 82 | £361.31 | 2.98 |
| 14 Mar 17:56 | "Wish I found this sooner" | 24,060 | 11 | £30.12 | 1.40 |
| **Total** | | **1,397,444** | **581** | **£1,607.02** | |

That is **36.6% of everything the account has ever earned, from five videos in
24 hours.** Two of the five carried 75% of it. Three did almost nothing.

The hit rate is the whole point. Nobody, including whoever writes this plan, can pick
which angle lands. Firing five is what produced the result, not picking well.

### The structural rule this cluster proves

Read the two big winners side by side and the pattern is exact:

- **The front half changes.** Hook and emotional frame are different in every variant.
- **The back half does not.** Every one converges on the same beats in the same order:
  *most creams sit on top of the skin* → ingredient list → *no steroids, no parabens,
  nothing synthetic* → *made in the UK* → price said plainly → orange basket.

So: **the hook decides reach, the back half decides conversion.** Vary the front,
leave the back alone. A variant that rewrites the back half is not a variant, it is a
new video, and it throws away the only part already proven to sell.

### Running it each week

1. **Source.** Pick one script with evidence behind it. Either an outside viral video
   in the niche, or one of their own past winners. Get the transcript verbatim.
2. **Clone.** Shoot it word for word. Swap only the product name and any factual
   detail that would otherwise be false. This is the control.
3. **Vary.** Three to five variants. New hook and new emotional frame each time. Back
   half untouched.
4. **Cluster the posts.** Their winners went out 64 minutes apart, not spread across a
   week. Post the set inside 24 to 36 hours so they compete and TikTok picks fast.
5. **Read GPM, not views.** The 732k-view video ran at 1.14 GPM. The 125k-view
   before/after ran at 2.98. Views tell you the hook worked. GPM tells you the video
   earned.
6. **Scale the winner.** Next week's source script is this week's best variant, cloned
   again against a new product or a new season angle.

### The angle bank

Pulled from their own top-performing hooks. Rotate through these when writing variants.

1. **Guilt** — "I felt so guilty every time I said it"
2. **Mechanism nobody explains** — "There's a reason this keeps coming back and nobody explains it"
3. **Authority failed us** — "We kept going back to the GP. Same prescription, same result."
4. **Diagnostic address** — "Does your X look like this?"
5. **Volume proof** — "Over 18,000 of these have sold and I'm about to tell you why"
6. **Late discovery** — "Wish I'd found this sooner"
7. **Negative command** — "Stop buying £5 umbrellas"
8. **Silent result** — before/after cold open, no voice until after the cut

Angles 1 and 2 produced the two biggest videos in the account's history. Angle 8
produced the highest GPM. Lead with those three.

## Who this account actually is

Do not treat this as a general TikTok Shop account. The numbers say otherwise.

| Product | Commission | Share of all-time |
|---|---|---|
| Tissue Oil | £1,780 | 41% |
| Exeskin Balm (honey & propolis) | £792 | 18% |
| Tiny Humans, Big Emotions (book) | £633 | 14% |
| Reflective Radiator Foil | £431 | 10% |

The top three sell to one person: **a UK parent whose child has eczema, sensitive or
dry skin.** That is 73% of every pound earned. Radiator foil is the same household in
winter.

Every product pick gets filtered through one question: *would a stressed UK parent of
a 4-year-old stop scrolling for this?* If no, it does not go in the plan, however well
it is trending elsewhere.

## Read the numbers before writing anything

From the TTSAnalytics MCP server:

- `get_summary` for the sync date. **If `last_synced` is more than 10 days old, say so
  at the top of the email.** Do not present stale attribution as this week's result.
- `get_videos_with_transcripts` for the script library.
- `get_top_videos` with `days: 30` for what is live now.
- `get_product_breakdown` and `get_format_breakdown` for what converts.
- `get_monthly_trend` for direction of travel.

Attribution lags. A video posted in the last 7 to 14 days with £0 against it is
usually unattributed, not failed. Say "too early to call" rather than "flopped".

## Format and production style

Formats, by their measured numbers:

| Format | Avg GPM | Avg views | Role |
|---|---|---|---|
| BOFU Text-Led | 5.22 | 34k | Conversion. Cheap, faceless, best £ per view. |
| Skit | 2.99 | 10k | Kevin + Sandy two-hander. |
| Before/After hook | 1.55 | 110k | The balanced workhorse. |
| Storytelling | 1.01 | 75k | Their signature. Biggest reach. |
| Shouty Hook | 1.00 | 232k | Widest net, weakest per-view return. |

A variant set should span both engines. Reach formats feed the account, text-led
converts the people reach brought in.

Production styles:

- **Talking head** (Sandy): Storytelling, Shouty Hook, Skit.
- **Faceless** (hands, product, close-ups, text): BOFU Text-Led, Before/After.
- **AI hybrid** (AI voice over real product footage): BOFU Text-Led only. Keep AI off
  the eczema story content. That testimony carries because it is plainly a real
  parent, and a synthetic voice on a medical-adjacent claim reads as fake and risks
  the trust the whole niche runs on.

## The house voice

Taken from the highest-earning transcripts. Any cloned script gets bent into this.

- Problem first, product second. Never open on the product.
- Parent guilt and relief are the register.
- The failed-attempts beat is mandatory: "We kept going back. Nothing lasted."
- Ingredients as proof, then "made in the UK".
- Price said plainly: "under 17 quid".
- Social proof by number: "over 18,000 of these have sold".
- Close on "click the orange basket below" plus a stock or sale reason to move now.

One hard limit on cloning: copy structure, pacing and phrasing freely, but never copy
a **claim** the product cannot support. If a source script says a product cured
something, that line does not survive the clone. "Suitable for skin prone to eczema"
is where the line sits and it stays there.

## What each brief needs

- Source script, verbatim, with where it came from
- Which variant this is and which angle from the bank
- Product and the exact price to say out loud
- Format and production style
- Film day and post time, with the cluster window stated
- Hook, written as the words spoken in the first 2 seconds
- The back half, unchanged, spelled out so it is not improvised
- Shot list, 3 to 5 shots
- On-screen text, hashtags, CTA

## Volume: 21 a week, three a day

Four clusters, filmed in two sessions:

| Days | Cluster | Videos |
|---|---|---|
| Mon, Tue | A, hero product | 6 |
| Wed, Thu | B, second product | 6 |
| Fri, Sat | C, seasonal or dated play | 5 |
| Sat, Sun | D, lighter or skit | 4 |

Session 1 covers A and B, session 2 covers C and D. Filming the shared back half once
per cluster is what makes 21 possible in two sessions rather than seven.

Three a day is above the rate at which every video gets its own idea, and that is the
point: the clusters are supposed to repeat themselves. Do not pad to 21 with 21
different products. Four products, four back halves, 21 hooks.

## Sourcing the scripts

A clone needs the transcript, not just a link. Two routes, one of them tested and dead.

**Reading TikTok from here does not work.** Tested 13 Sep 2026: plain fetching returns
a JavaScript shell; curl reaches tiktok.com and pulls 358KB, but the rehydration blob
contains only app config, zero video IDs, zero handles, and 25 references to captcha,
so content is withheld from this IP. The session's headless Chromium cannot open a
tunnel through the egress proxy at all (it fails on example.com too), and the IP
geolocates to US, so even a working scrape would return US content by default rather
than UK. Do not spend time retrying this. Anything requiring a logged-in browser
session, social1 included, has to be driven by a person.

**The route that works: a Google Sheet Sandy fills in.** Drive is readable from here.
She browses in her own browser, and drops rows in:

| Date | Video link | Handle | Product | Views | Why it caught her eye | Script |
|---|---|---|---|---|---|---|

The Script column is the one that matters. A link alone cannot be read from here, so a
row without pasted script text is a suggestion, not a source.

**Their own library is the free fallback.** 7 of 719 videos have a transcript saved,
about 1%, all from one two-week window in March, and they include the two biggest
videos the account has ever posted. Backfilling the top 30 by commission gives a
source bank with no subscription and no dependency on anything above.

If no source script is available for a slot, do not invent a URL or present a script
as sourced when it was written here. Write `NO SOURCE: search "<term>"` and fall back
to cloning one of their own.

## Send

Email to Kevin and Sandy. Subject: `Content plan: w/c <Mon date>`.

First screen on a phone carries the week's angle, the source script, and Monday's
shoot. Detail below. Scoreboard last. Under roughly 1,200 words. A plan they skim and
use beats a plan they save for later and never open.
