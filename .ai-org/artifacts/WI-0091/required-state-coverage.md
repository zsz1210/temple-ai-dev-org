# Required State Coverage — WI-0091

| Provider | Live eligible task | Retained detailed usage | Expected state | Required explanation |
| --- | ---: | ---: | --- | --- |
| Ready, Token supported | Yes | Any | Capturing active tasks | Totals change only when a detailed Provider notification arrives. |
| Ready, Token supported | No | Any | Ready for the next registered task | No eligible active registered task is available. |
| Disabled, offline, unobserved, or Token unsupported | No | Yes | Historical data only | The last capture time and incomplete completed-work coverage are explicit. |
| Disabled, offline, unobserved, or Token unsupported | No | No | Token capture is off | Missing data is unknown, not zero. |
| Unavailable Provider | Yes | Any | Token capture is unavailable | The active task is not currently observable; no usage is inferred. |

Additional required cases:

- A partial archive retains valid observations while clearly identifying excluded history.
- Account-wide availability never changes project coverage.
- A captured Work Item with a stale revision remains visible as evidence but does not count as qualified.
- A private viewer sees the same safe aggregate state without raw events, local paths, prompts, credentials, Inbox state, or Agent Commands.
- Long Work Item titles, large completed counts, and a missing last-capture timestamp wrap without horizontal overflow.
