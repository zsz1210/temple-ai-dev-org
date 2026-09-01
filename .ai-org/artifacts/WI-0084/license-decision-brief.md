# Temple license decision brief

- Current license: MIT
- Current decision authority: Human Principal
- Repository state: private; npm package unpublished and `private: true`
- Recommendation: keep MIT for the first public Alpha
- License changed by WI-0084: no

## Facts

Both MIT and Apache-2.0 are permissive, OSI-approved licenses that allow commercial use, modification, and redistribution. They differ mainly in the explicit patent and redistribution contract.

| Question | MIT | Apache-2.0 |
| --- | --- | --- |
| Adoption friction | Very low; retain the copyright and permission notice | Low, but longer and more procedural |
| Patent grant | No detailed express patent-license section | Express contributor patent grant with patent-litigation termination |
| Modified files | No explicit change-marking rule | Distributed modified files must carry prominent change notices |
| NOTICE | No Apache-style NOTICE mechanism | Existing NOTICE attribution must be preserved when the work includes one |
| Contributions | License text does not define an Apache-style default contribution term | Intentional contributions default to Apache-2.0 unless stated otherwise |
| Trademark | Not a trademark policy | Explicitly does not grant trademark rights beyond customary attribution |

## Why MIT fits Temple now

- Temple installs and copies framework-owned instructions, templates, and configuration into other repositories. MIT keeps the downstream obligation easy to understand for those project owners.
- The project currently has no demonstrated patent-sensitive algorithm or corporate contributor requirement that makes an express patent grant necessary.
- Existing ADRs, package metadata, README badges, third-party review, and release guidance already use MIT. Changing them during the same release that fixes packaging and runtime support would increase the chance of a licensing inconsistency.
- Broad adoption and experimentation are the immediate goal of the first Alpha. MIT is the smaller explanation burden for individual developers and small teams.

## When Apache-2.0 becomes the better choice

Reopen the decision before public contributions are merged if any of these becomes true:

- a company requires an express contributor patent grant before adopting or contributing;
- Temple begins to include patent-sensitive coordination, evaluation, or distributed-runtime techniques;
- the project adopts a contributor agreement and governance model designed around Apache-2.0 obligations;
- enterprise legal review identifies the absence of an express patent clause as a material adoption blocker.

Changing later becomes harder once multiple copyright holders have contributed. If the Human Principal already expects patent-bearing corporate contributions, the safer choice is to switch to Apache-2.0 before making the repository public, then update `LICENSE`, package metadata, notices, ADR-0008, documentation, tests, and all redistributed framework surfaces in one reviewed migration.

## Decision frontier

- **Recommended now:** retain MIT for the first public Alpha.
- **Needs Human Principal confirmation:** whether expected corporate contribution and patent exposure justify switching before public visibility.
- **Deferred trigger:** first patent-policy request, first corporate contribution agreement, or the pre-`1.0` governance review, whichever occurs first.
- **Not recommended:** dual licensing for the initial Alpha; it adds contributor and downstream-choice complexity without current evidence that Temple needs it.

## Authoritative sources

- [MIT License — Open Source Initiative](https://opensource.org/license/mit)
- [Apache License 2.0 — Apache Software Foundation](https://www.apache.org/licenses/LICENSE-2.0)
- [Apache licensing and distribution FAQ](https://www.apache.org/foundation/license-faq.html)
