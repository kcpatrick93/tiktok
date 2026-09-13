---
name: weekly-content-plan
description: Build the Sunday TikTok Shop content plan for the week ahead and email it to Kevin and Sandy. Use when the scheduled Sunday job fires, or when either of them asks for "this week's plan", "the content plan", "what are we filming this week".
---

# Weekly TikTok Shop Content Plan

Runs every Sunday 18:00 UK time. Produces one email: what to film, why, and what to
look at before filming.

Sandy leads on filming and is the on-camera face. Kevin appears in two-hander skits.
Write the plan so Sandy can pick it up cold on Monday morning and shoot without
asking follow-up questions.

## Who this account actually is

Do not treat this as a general TikTok Shop account. The numbers say otherwise.

| Product | Commission | Share of all-time |
|---|---|---|
| Tissue Oil | £1,780 | 41% |
| Exeskin Balm (honey & propolis) | £792 | 18% |
| Tiny Humans, Big Emotions (book) | £633 | 14% |
| Reflective Radiator Foil | £431 | 10% |

The top three are all one audience: **UK parents of a child with eczema, sensitive
or dry skin.** That is 73% of every pound earned. Radiator foil is the same
household in winter.

Every product recommendation gets filtered through one question: *would a stressed
UK parent of a 4-year-old stop scrolling for this?* If no, it does not go in the
plan, however well it is trending elsewhere.

## Step 1: Read the numbers before writing anything

Pull from the TTSAnalytics MCP server:

- `get_summary` for the sync date. **If `last_synced` is more than 10 days old, say
  so at the top of the email.** Do not present stale attribution as this week's result.
- `get_monthly_trend` for direction of travel.
- `get_top_videos` with `days: 30` for what is live and working now.
- `get_product_breakdown` with `days: 30` for which products still convert.
- `get_format_breakdown` for the format mix.

Attribution lags. A video posted in the last 7 to 14 days with £0 against it is
usually unattributed, not failed. Say "too early to call" rather than "flopped".

## Step 2: Pick the week's angle

One headline bet per week, backed by a reason with a date attached. Rank reasons:

1. **A dated event.** Ofgem cap change, half term, Halloween, Bonfire Night, Black
   Friday, payday Friday, first frost, clocks change.
2. **Their own seasonal repeat.** Check what sold this week last year. Radiator foil
   peaked 3 Jan (199k views, 177 sales, £398). It was dead by February (700 to 1,500
   views a video). Season windows are narrow, so hit them early.
3. **A verified outside trend.** Cite the source and the date. Never write "this is
   trending" without a link.

## Step 3: Choose formats against their real GPM

| Format | Avg GPM | Avg views | Use it for |
|---|---|---|---|
| BOFU Text-Led | 5.22 | 34k | Conversion. Cheap, faceless, best £ per view. |
| Skit | 2.99 | 10k | Kevin + Sandy two-hander. |
| Before/After hook | 1.55 | 110k | Skin results. The balanced workhorse. |
| Storytelling | 1.01 | 75k | Eczema parent narrative. Their signature. |
| Shouty Hook | 1.00 | 232k | Reach. Widest net, weakest per-view return. |

A week needs both engines. Reach formats (Shouty Hook, Before/After) feed the
account. BOFU Text-Led converts the people reach brought in. A week of only one
kind underperforms.

Map to the three production styles they will actually shoot:

- **Talking head** (Sandy on camera): Storytelling, Shouty Hook, Skit.
- **Faceless** (hands, product, close-ups, text): BOFU Text-Led, Before/After.
- **AI hybrid** (AI voice or B-roll over real product footage): BOFU Text-Led only.
  Keep AI away from the eczema story content. The parent testimony carries because
  it is plainly a real parent, and a synthetic voice on a medical-adjacent claim
  reads as fake and risks the trust the whole niche runs on.

## Step 4: Write the briefs

Per video, all of these, no placeholders:

- **Product** and the exact price to say out loud
- **Format** from the table above, and production style
- **Day to film, day to post**
- **Hook**, written as the words spoken in the first 2 seconds
- **Script beats**, 4 to 6 lines in their house voice (below)
- **Shot list**, 3 to 5 shots
- **On-screen text**
- **Hashtags**, 4 to 6, mixing broad and niche
- **Reference video link** and one line on what to copy from it

## The house voice

Taken from their highest-earning transcripts. Keep it.

- Problem first, product second. Never open on the product.
- Parent guilt and relief are the emotional register: "I felt so guilty every time
  I said it", "watching a child's skin look like that, it breaks you".
- The failed-attempts beat is mandatory: "We kept going back. Nothing lasted."
- Ingredients as proof: "100% natural. Rosehip, propolis, calendula. No steroids,
  no parabens." Then "Made in the UK".
- Price said plainly: "under 17 quid", "just over £16".
- Social proof by number: "over 18,000 of these have sold".
- Close on "Click the orange basket below" and a stock or sale reason to move now.

Never write a claim the product cannot support. No cure language, no medical
promises. "Suitable for skin prone to eczema" is the line, and it stays that side of it.

## Step 5: Reference videos

Every brief gets a link Sandy can watch before filming.

**Known constraint:** tiktok.com pages return a JavaScript shell to web fetching, so
video links cannot be pulled from the open web. Source them from whichever route is
agreed (see `content-plans/README.md` for current status). If no link source is
live, do not invent URLs. Give the exact search term and hashtag to look under, and
mark the slot `NO LINK: search "<term>"`.

## Step 6: New products to consider

Three per week, maximum. Each needs:

- Why it fits the parent audience specifically
- The seasonal or dated reason it is right now
- Rough commission per sale and what volume would be needed to beat their current
  £61 per video average on Tissue Oil
- Evidence it is moving, with a source link

Do not pad this section. One good suggestion beats three weak ones.

## Step 7: Send

Email to Kevin and Sandy. Subject: `Content plan: w/c <Mon date>`.

Order the email so the first screen on a phone carries the week's angle and Monday's
shoot. Detail below that. Scoreboard last.

Keep it under roughly 1,200 words. A plan they skim and use beats a plan they save
for later and never open.
