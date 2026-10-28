# Find how I use LLMs

Below are prompts I wrote to an AI coding assistant (one JSON object per line: `when`, `project`, `prompt`). Find the patterns in how I work with LLMs, for the "How I use LLMs" section of my {me} CV (https://dobrinov.github.io/jsonme/).

## What to find

A pattern is something I do again and again to get a result: how I start a task, how I hand work over, how I check it, how I correct the model, when I stop it. Look for habits, not topics. "Works on Rails apps" is a topic; "asks for a plan and waits before any code" is a pattern.

1. Read every prompt, not a sample, before you decide anything. Patterns hide in the long tail.
2. Look at the form of a prompt as well as its intent. For example:
   - **Form:** pseudocode, code or SQL written as the instruction, numbered specs, examples of input and output, rules and constraints, a role for the model, screenshots, links or file paths as context, questions, one-word go-aheads.
   - **Intent:** how I start a task, hand work over, set limits, correct the model, check its work, decide when to stop.

   Write your own list of candidates from what you see. These are only examples.
3. Count, don't guess: for each candidate, count the prompts that show it.
4. Keep every pattern that is deliberate and shows how I think, frequent or rare: a rare technique (writing pseudocode, for example) says as much as a frequent one. Drop accidents and one-offs. Merge patterns that are the same habit.
5. For each pattern give:
   - `name`: 2 to 4 words, in my voice ("Plan before code").
   - `goal`: one of `planning`, `building`, `debugging`, `reviewing`, `designing`, `research`, `writing`, `operating`.
   - `how`: one sentence, in the first person, on what I do and when I use it.
   - `achieves`: one short sentence on what it gets me.
   - `example` (optional): one of my real prompts, quoted exactly but shortened to at most 160 characters with "…". Pick one a stranger understands without context.
   - `share` (optional): the percentage of all prompts that show it, rounded to a whole number.
   - `limit` (optional): one honest sentence on when it falls short, based on what follows in the prompts (repeats, corrections, frustration). If you cannot tell, leave it out.
6. Add one `gap`: something I rarely do that would have saved me turns, with evidence.
7. Add `stats`: number of prompts, date range, median prompt length in characters, and the share of prompts that are one-word go-aheads ("go", "yes", "continue").

## Rules

- Never invent a pattern, a number or a quote. Every quote must appear in the prompts.
- Quotes will be published. Skip any prompt that names an employer's customers, colleagues, internal systems, URLs, secrets or unreleased plans. If the best example for a pattern is such a prompt, pick another or leave `example` out.
- Ignore pasted logs, code and error output; judge only what I wrote.
- Write plainly. No praise, no buzzwords.

## Output

First a short Markdown review for me: every candidate you counted, with its count and two or three quotes, and which ones you merged or dropped and why. Then the result as one ```json block:

```json
{
  "llms": {
    "source": "412 of my prompts to Claude Code, Aug–Oct 2026",
    "patterns": [
      { "name": "…", "goal": "planning", "how": "…", "achieves": "…", "example": "…", "share": 31, "limit": "…" }
    ],
    "gap": "…"
  }
}
```
