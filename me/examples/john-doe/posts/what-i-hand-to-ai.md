---
title: What I hand to AI, and what I never do
date: 2026-06-14
summary: A year of coding agents on a payments platform, and the line I draw.
tags: [ai, payments]
---

A year ago the platform group started using coding agents for real work. Here is where the line ended up.

## What I hand over

- **Mechanical rewrites.** Moving 1,400 tests to a new framework took three weeks instead of four months.
- **Scaffolding.** New services start from an agent's draft, then a person deletes half of it.
- **First reviews.** An AI pre-review catches missing tests and risky queries before a person looks.

## What I never hand over

- The plan for a migration.
- Anything that moves money or touches card data.
- The decision to merge.

## How we check

Every batch an agent produces runs through the same script:

```sh
./coverage-diff main..agent-batch-12   # names and coverage must match
```

If the numbers move the wrong way, the batch goes back. Trust comes from the check, not from the tool.
