# UI brief — WI-0036

## Delivery mode

`code-first`

## User and job

An authenticated project owner opens a tablet while away from the Mac and wants to understand current work, provider health, alerts, token observations, and recent progress without controlling an Agent.

## Required states

- Connected to the private live refresh stream.
- Reconnecting while the last redacted snapshot remains visible.
- Snapshot unavailable with a clear non-authoritative error.
- No work, provider, alert, or timeline data.
- Narrow tablet width of 420 CSS pixels.
- Explicit `Private network · read only` identity in the page header and footer.

## Interaction contract

- There are no form controls, approval actions, command previews, Agent Command buttons, or Inbox queues.
- Work Item expansion and page scrolling are local presentation interactions only.
- Refresh signals fetch a new redacted snapshot; they do not expose raw event payloads.
- The viewer never claims that an Agent instruction, lifecycle mutation, or release action can be performed remotely.

## Evidence

Automated HTML assertions, request-boundary tests, a 420-pixel browser inspection, and a live private-URL smoke test are required before this Work Item can leave Test.
