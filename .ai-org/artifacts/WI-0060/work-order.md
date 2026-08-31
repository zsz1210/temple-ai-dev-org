# WI-0060 work order

## Outcome

Make the Team view answer a human question directly: which model is each AI teammate actively using, or which model was most recently observed for that teammate?

## Boundaries

- Model is execution evidence, not a permanent Agent Identity attribute.
- Active observed execution takes precedence over history.
- A correlated historical observation may be shown as `Last observed`.
- A canonical requested model with no effective observation may be shown only as `Requested`.
- Missing evidence is displayed as `No model observation`; it is never inferred as zero, inactive, or a default model.
- No prompt content, credentials, provider secrets, remote commands, model routing, or automatic switching are added.
- The loopback console and private LAN viewer retain their existing authority and read-only boundaries.

## Delivery

Use the existing dark, human-facing Team cards. This is a low-risk, code-first extension with runtime visual review at wide desktop, tablet, and mobile widths.

## Authorization

The user explicitly asked to show model information on the page, suggested Team as the placement, and authorized continuing with the next implementation step on 2026-08-31.
