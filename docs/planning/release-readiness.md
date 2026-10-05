# Beta release readiness

Last refreshed: 2026-10-06 (Japan time; publication occurred on 2026-10-05 UTC).

**Workkeel Beta.1 (`@zsz1210/workkeel@0.1.0-beta.1`) is published on GitHub and
npm's `next` channel.** It is an experimental prerelease for internal and early
adopter evaluation, not a production-readiness claim.

## Current release surfaces

| Surface | Observed state |
| --- | --- |
| GitHub prerelease | [v0.1.0-beta.1](https://github.com/zsz1210/workkeel/releases/tag/v0.1.0-beta.1), published at `2026-10-05T15:07:50Z` |
| Immutable source | `9d843708928bb60da154e16be6b1bd0d431b984b`; its tree matches independently reviewed candidate `706509c1b3c49e6ca163e577338c593b2273bb7c` |
| npm package | `@zsz1210/workkeel@0.1.0-beta.1`, with `next=0.1.0-beta.1`; experimental prerelease |
| Retained archive | `zsz1210-workkeel-0.1.0-beta.1.tgz`, 1,297,689 bytes |
| Archive SHA-256 | `76178b34fcca44a259fcf2dfc77f106a56e2d3f76ca049dd2478867530d37cae` |
| Trusted Publisher | GitHub repository `zsz1210/workkeel`, workflow `publish-npm.yml`, no Environment; owner-authorized and read back after setup |
| Publication workflow | [Exact-source and registry verification](https://github.com/zsz1210/workkeel/actions/runs/37330280974); workflow status is separate from registry availability |
| Source after publication | Documentation follow-ups do not replace the immutable tag or archive |
| Existing projects | Not modified by publication; upgrades and profile migrations remain explicit |

These service observations are dated, not live guarantees. Check an exact version
and the mutable dist-tags separately. The package's embedded README records the
candidate state at packaging time; current source and release notes record the
subsequent publication without altering those archived bytes.

## Qualification and publication evidence

The retained qualification reported complete verification of 169 test files with
1,626 passing markers and zero failures, distinct native review, required CI and
the product candidate's eight-group real-Chrome observer gate. The publication
guard follow-up changed no product or package bytes. See
[PR #153](https://github.com/zsz1210/workkeel/pull/153) and the release notes for
the exact candidate relationship and retained checks.

Publication preparation additionally passed 18 release tests and native Doctor.
A fresh package from official Node 24.20.0, npm 11.19.0 and zlib
1.3.2.1-motley-42c2f19 was byte-identical to the retained GitHub attachment.

The first upload used owner authentication to create the previously absent npm
package. Registry identity, SHA-512 integrity, SHA-1, downloaded archive bytes and
the `next` channel matched the retained asset. A clean installation from npm's
`next` channel reported `0.1.0-beta.1`. Trusted Publishing was then configured
with separate owner authorization before the GitHub draft was published.

This bootstrap upload does **not** establish OIDC upload provenance. The release
workflow can recognize that exact pre-existing archive and skip a duplicate
immutable-version upload after its full verification. A future new version must
provide the first successful OIDC-upload evidence; do not rerun this already
published version to manufacture it. Follow [npm release operations](../operations/npm-release.md).

## Scope and limits

Beta.1 includes native task coordination, scoped approval, exact-candidate handoff,
distinct-Agent review, Learning, usage attribution and the read-only observer,
including retained-document recovery and Beta version compatibility. See the
[changelog](../../CHANGELOG.md#010-beta1) and [roadmap](roadmap.md).

Internal Agent simulations, controlled fixtures and real Chrome checks establish
only their recorded conditions. Complete interruption/rejected-delivery recovery,
fresh-machine registry setup, real-human comprehension and provider usage
attribution remain incompletely qualified. A clean install on the publication
host is not a fresh-machine trial. Unknown tokens and active time remain unknown.
No universal cost or speed benefit, production readiness or complete
multi-human/multi-machine qualification is claimed.

## Upgrade and history

Evaluate in a disposable copy first, retain the old lock and project-owned state,
and make any migration an explicit decision. The
[historical Alpha.33 qualification guide](../validation/alpha-33-package-qualification.md)
supplies earlier compatibility context, not a fresh Beta.1 upgrade qualification.

Historical Alpha.33 was published as `@zsz1210/temple-ai-dev-org` on 2026-09-16,
at source `2e269d67bd764d3c47df665bc9043263cf8082e8`. Its package, tag and evidence
remain unchanged. Alpha.34 was an unpublished development candidate whose changes
are included in Beta.1. Earlier failed publication attempts and their corrections
remain in the changelog and original records.

No downstream upgrade, stable-channel promotion, hosted service or deployment
follows automatically from this publication.
