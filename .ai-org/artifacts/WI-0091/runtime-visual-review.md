# WI-0091 runtime visual review

## Environment

- Browser: installed Google Chrome 152.0.7977.65 through pinned `playwright-core` 1.62.1
- Theme: dark
- Data source: real repository state plus retained local Provider telemetry
- Access mode: loopback local operator

## Reviewed states

The Usage view rendered the real `historical-only` state with the last capture time, completed-Work-Item coverage, eligible live-task count, Token totals, qualification progress, composition, and per-Work-Item driver groups.

At 1440x1000, the page showed 23,433 historical Tokens, one detailed observation, one of 81 completed Work Items captured, and zero eligible live tasks before the bounded proof. At 390x844 the same content stacked without horizontal overflow; the document and viewport widths were both 390 CSS pixels.

Automated Chrome coverage also passed Overview, Work, Team, Usage, System, and History at 390x844, 768x1024, 1440x1000, and 3440x1440. Reduced-motion behavior passed. No JavaScript console errors, clipped primary text, named layout overlaps, sidebar overlap, or document overflow were observed.

## Human readability decision

`pass`

The view now distinguishes a retained historical total from active capture before presenting totals. Intentional opt-out is amber rather than red when no live task is being missed. Missing cost and missing usage remain explicit rather than appearing as zero.
