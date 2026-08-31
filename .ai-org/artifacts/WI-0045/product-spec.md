# Product specification — WI-0045

## Problem

WI-0044's first candidate made Now concise by excluding stale-evidence signals. This violated the accepted priority rule because firing recovery conditions disappeared behind release bookkeeping.

## Required behavior

- Collect conditions whose `lifecycle` is `firing`, whose `status` is `true`, and whose `type` is `stale-evidence`.
- Represent that collection as one Now attention item with a `count` equal to the number of underlying conditions.
- Place the grouped item in the actionable sequence before release decisions.
- The hero must describe the underlying operational-condition count, not merely the number of grouped cards.
- The attention card must link to System, where individual conditions remain inspectable.
- Non-stale firing conditions continue to appear as individual actionable entries.

## Acceptance

With 10 firing stale-evidence conditions and 9 release decisions, Now leads with a 10-condition recovery message, shows one grouped stale-evidence card, and offers a System navigation action. It does not render 10 duplicate cards.
