---
title: Strangling a payments monolith without a big-bang release
date: 2024-03-02
summary: Shadow traffic, 1% of merchants at a time, and a switch back that we never needed.
tags: [architecture, payments]
---

Card authorization was the busiest and scariest path in our monolith. We moved it out over four months and nobody outside the team noticed. That was the goal.

## Shadow first

For six weeks the new Go service received a copy of every request and answered into the void. A comparison job flagged every response that differed from the monolith's. We fixed 41 differences before a single real payment went through the new path.

## Then 1% at a time

Merchants moved in cohorts, smallest first, with a flag that could send them back in seconds. We never used it, but having it is what let us move fast.

## Then delete

The old code path was removed four months after we started. Deleting it was the real finish line.
