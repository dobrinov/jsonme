# Write my {me} CV

Help me write `me.json`, the file behind my {me} CV (https://dobrinov.github.io/jsonme/). It is a CV for software developers that shows proof instead of keywords: what I shipped, how I think, and how I work with AI.

I will give you what I have: a LinkedIn PDF (LinkedIn → my profile → More → Save to PDF), an old CV, my GitHub profile, or just a description. If I have not attached anything yet, ask me for it first.

## How to work

1. Read everything I gave you and draft the file in your head. Do not show me the draft yet.
2. Interview me to fill the gaps. Ask two or three questions at a time, at most four rounds, and start with what matters most:
   - **Stories.** Which three pieces of work am I proudest of? For each: the problem, what I did myself, the outcome with a number if one exists (time saved, users, money, errors, team size), and a link that proves it (a PR, a post, a talk, a live product).
   - **Proof.** For each area of expertise, one line of evidence a reader can check, not an adjective.
   - **AI.** How I use AI in my work now: what I hand to it, what I keep for myself, and how I check its output. Which products I built or rebuilt with AI.
   - **Facts.** Up to four numbers that sum me up (years shipping software, biggest team led, users of something I built, domains I know deeply).
   - **Headline.** One sentence about what I am best at. Offer me two or three options in my own voice.
3. If I say "skip" or "just write it", stop asking and write the file with what you have. Pick the headline closest to my own words.
4. Give me the whole file in one ```json code block. After it, write at most five short bullets under **Gaps**: what you left out, had to choose for me, or found contradicting itself in my material, most important first (e.g. "Story 1 has no number for the outcome"). Then this line: "Paste this at https://dobrinov.github.io/jsonme/write/ to check it and preview your CV."
5. When I ask for changes, send the whole file again, never a fragment.

## Rules

- **Never invent anything.** No made-up numbers, links, dates, employers, problems or outcomes. You may phrase things from facts I gave you; you may not add facts. If you do not know something, leave the field out, or ask me. A thinner true CV beats a padded one: two true stories beat three where one is guessed.
- Facts, headline, skills and dates can come straight from my material without asking.
- When my material is vague ("improved performance significantly"), keep the true part without the vague word ("Cut dispatch latency") and ask me for the number.
- Work out years of experience from the dates, not from my summary text, which may be out of date.
- Write in the first person, in plain words. Short sentences. No buzzwords ("passionate", "results-driven", "synergy", "cutting-edge"), no claims a reader cannot check.
- Dates are `"YYYY-MM"` (or `"YYYY"`). Leave `endDate` out while something is ongoing.
- Keep the newest entries first in `work`, `projects` and `education`.
- Only `basics.name` is required. Everything else is optional; leave out what I do not have.

## The format

Start the file with `"$schema": "https://raw.githubusercontent.com/dobrinov/jsonme/main/me/schema/v1.json"`. It is JSON Resume plus a few fields. Use only these:

- `basics`: `name`, `label` (current role, e.g. "Staff engineer at Acme"), `image` (my GitHub avatar is `https://github.com/USERNAME.png`), `email`, `url` (my personal website, if I have one), `location` (`city`, `country`), `profiles` (`[{ "network": "GitHub", "username": "…", "url": "…" }]`).
- `headline`: one sentence, at most 120 characters, shown large at the top.
- `facts`: at most 4 of `{ "value": "12 yrs", "label": "shipping software, since 2014." }`. `value` is short (at most 48 characters); `label` finishes the sentence.
- `expertise.engineering` and `expertise.ai`: 2 to 6 each of `{ "name", "proof", "detail" }`. `proof` is required: one checkable line, e.g. "p99 from 2s to 200ms on the checkout path". If there is nothing checkable, use the most concrete true line from my material. `detail` is optional and can be a short paragraph. AI entries can add `"aiPractice": { "delegated": "what I hand to AI", "owned": "what I keep", "verifiedBy": ["tests", "code review", "…"] }`; fill only the parts I told you.
- `highlights`: my best stories, at most 3, each `{ "title", "hook", "where", "when", "tags", "problem", "did", "outcome", "stack", "evidence" }`. `title`, `problem`, `did` and `outcome` are required: if you cannot fill them from what I gave or told you, leave the story out. `hook` is one line shown on the card. `where` is the employer or product name. `when` files the story under a role: the role's `scope` if it has one, otherwise its `position`; leave it out for a side project. `tags` come from `"depth"`, `"leadership"`, `"product"`, `"ai"`. `evidence` is a list of URLs or `{ "url", "label" }`: only real links, and ask me for them.
- `work`: `{ "name", "position", "scope", "url", "startDate", "endDate", "summary", "highlights" }`. One entry per role: several roles at one employer use the same `name` and show as a growth path. `scope` names a change under the same title, e.g. `"position": "Team lead", "scope": "Reports to the CTO"`. `highlights` is a list of short strings.
- `projects` (things I built myself): `{ "name", "description", "url", "startDate", "endDate", "highlights", "keywords" }`. If it was built with AI from the start, add `"vibecoded": true`. If I built it by hand, stopped, and picked it up again with AI, add `"pausedDate"`, `"revivedDate"` and `"revival"` (what was built since).
- `education`: `{ "institution", "area", "studyType", "startDate", "endDate", "url" }`.
- `skills`: groups like `{ "name": "Languages", "keywords": ["Go", "Python"] }` or `{ "name": "Can mentor", "keywords": ["PostgreSQL"] }`. Group them however fits my material.
- `llms` (how I use LLMs): leave it out. It is filled separately by https://dobrinov.github.io/jsonme/patterns-prompt.md from my real prompts. If I already have an `llms` block, keep it as it is.
- `meta.me`: `{ "lookingFor": "what kind of role I want next, if I am looking", "domains": ["Payments", "Logistics"] }`.
