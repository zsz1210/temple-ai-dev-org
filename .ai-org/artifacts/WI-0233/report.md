# WI-0233: a bounded named-permission route works

## Result

The exact candidate `3697a4f578cfc26bcb83f08b286670b740dc28b7` passed the
synthetic command controls with Codex CLI 0.153.1 and the explicitly selected
bundled Node.js 24.19.0 on macOS. The previous legacy workspace-write route remains
unqualified; this is a different route, not a reinterpretation of WI-0232.

| Control | Observation |
| --- | --- |
| Own marker read | Allowed |
| Own file write | Allowed; file independently observed |
| Sibling marker read | Explicit permission denial |
| Sibling file write | Explicit permission denial; no file created |
| Symlink in actor pointing to sibling marker | Explicit permission denial |
| Synthetic Git init/add/commit | Succeeded; returned a full 40-hex revision |
| Owned loopback listener from coordinator | Reachable |
| Same listener from sandboxed command | Explicit permission denial |
| Owned App Server exit / listener close / scratch removal | Confirmed |

No model thread, turn, account inspection, global configuration change, runtime
installation, npm publication or model comparison ran. This does not measure the
coordinator's Tokens, account billing, model quality or Temple efficiency.

## Why this route differs

Installed experimental schemas declare `ThreadStartParams.permissions`,
`TurnStartParams.permissions` and `CommandExecParams.permissionProfile`. The stable
schemas do not. Initialization therefore explicitly opts into the experimental API.
The probe uses `permissionProfile` without the mutually exclusive `sandboxPolicy`.

The owned process receives a named configuration with minimal platform reads,
its synthetic actor root writable, and that root's `.git` explicitly writable.
Two read-only executable directories serve the self-contained Node and selected
Xcode Git. Temporary files stay inside the actor; command network is disabled.
OpenSSL configuration is explicitly empty for these synthetic local commands.
There is no broad home-directory or package-manager read grant, and no host config
file is edited. The `.git` permission applies only to the probe's new repository.

Documentation: [official permissions](https://learn.chatgpt.com/docs/permissions)
describes named profiles, minimal runtime paths, protected workspace paths and the
separate controls needed for connectors, MCP, browser and other tool surfaces.
The local installed schemas and actual controls, not documentation alone, support
the result here.

## Development findings retained

There were fourteen development probe invocations before the exact-candidate
confirmation: seven with Homebrew Node 24.20.0, seven with bundled Node 24.19.0.
Six were diagnostic wrappers around the real transport; their programmatic label
was conservatively `simulated` because a factory was injected. They are not final
qualification evidence. All invoked only initialization and synthetic commands,
and recorded owned-server/listener/scratch cleanup. They are environment-debugging
attempts, not fourteen model samples or a reliability estimate.

- Homebrew Node could not pass the runtime positive control under the attempted
  narrow library grants. Broader access was not adopted. The final resolver rejects
  externally linked Node runtimes instead of retrying or silently choosing one.
- The bundled runtime required explicit empty OpenSSL configuration. Without it,
  startup tried to read a platform configuration outside the minimal policy.
- The system Git shim attempted its external cache; direct, discovered Xcode Git
  avoids that shim, and command temporary storage stays inside the actor.
- Git's protected `.git` path needed the explicit synthetic-root grant. Once
  supplied, Git committed while the sibling and loopback controls stayed denied.

The exact-candidate confirmation is the fifteenth invocation overall, using the
real default transport and bundled runtime. Earlier failures remain separate from
that passing observation; no running model protocol was patched.

## Verification

Focused deterministic tests: 7/7 passed. They use a labelled simulated transport
and injected runtime resolver, never installed Codex or model calls. Coverage
includes schema-declaration limits, explicit policy shape, positive controls,
symlink escape, first failure, malformed responses, privacy reduction, late
generation uncertainty and uncertain-shutdown scratch retention.

Full exact-candidate `npm run verify`: 739/739 passed, zero failed, cancelled or
skipped, 189458.460917 ms reported test duration. The full suite ran on the normal
Node 24.20.0 environment; the actual named-profile probe explicitly ran on bundled
Node 24.19.0. Repository/document checks passed; package boundary unchanged at
415 files, 895603 packed bytes and 3510029 unpacked bytes. Doctor: 36 pass,
1 pre-existing stale parallel-plan warning, 0 fail. This sequential item never
dispatches from that plan. Later evidence-only revisions preserve source equivalence.

## What this does not qualify

The result is `bounded-controls-passed`, while `live_ready` remains false. It proves
only the listed commands against owned synthetic files, not every possible path,
tool, process descendant or external network destination. Git success is a returned
command observation, not independent acceptance of a product candidate.

Before comparison, the actual thread/turn route must preserve the same profile,
runtime, environment and tool restrictions. Native instruction loading, fresh
thread isolation, actual fixture identities, candidate/handoff checks, usage
collection, first-stop and descendant cleanup still need qualification. A command
profile does not automatically sandbox MCP, browser or native tool surfaces.

The separate launch protocol still lacks a configured numeric budget and approved
value tradeoff. The latest user request authorizes continuing repairs and an
experiment, but does not fill in those deliberately unset decisions in WI-0230.
Historical caps are not current authority. No live request is sent by this module.

## Resource decision proposed to the maintainer, not approved

Retain WI-0230's eight fresh Build takeovers: two states, two paired orders per
state, fixed Terra medium. Suggested stop envelope: 100000 Operational Tokens
and eight minutes per subject, 800000 Operational Tokens and sixty minutes in
aggregate. Aggregate limits win. Use Pro-included capacity only, no Credits,
reset, retry, fallback, extra generation probe or replacement subject. This is
a proposed resource ceiling, not a predicted requirement or a monetary guarantee.

The local evidence basis is six completed Terra medium Build observations:
WI-0203 ordinary/Temple used 39262/65500 Operational Tokens; WI-0220's four Builds
used 56701, 65994, 56878 and 68286. Their observed stage times ranged from about
148 to 178 seconds. These different tasks/contexts are planning references, not
a pooled distribution, calibrated percentile or assurance that the new ceiling
will suffice. The extra headroom is a maintainer decision, not a measured optimum.
Current capacity and all remaining runtime gates must pass before launch even if
that envelope is approved. Useful-effect and permitted tradeoff decisions remain
those required by the separate launch protocol; approval of a cap cannot supply them.

Rollback withdraws only this repository-only instrument and preserves these
findings. Organizational acceptance does not authorize merge, release, runtime
upgrade, policy changes or a model launch.
