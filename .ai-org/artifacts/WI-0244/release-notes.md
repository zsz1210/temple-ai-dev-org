# Temple Alpha.33

Alpha.33 incorporates field feedback about contributor onboarding, role attribution
and repeated verification, together with recent validation-performance fixes.

- Contributor readiness explains missing conditions and the responsible next step.
  Fresh ordinary work supports attributed responsibility without a Temple-specific
  login; existing project-owned policy remains unchanged during upgrade.
- Stable Agent IDs distinguish members with duplicate display names. Developer
  and independent-reviewer provenance remain separate.
- Compatible measurements can be reused conservatively. Immutable attempts, exact
  evidence archives and interruption-aware reconciliation retain work history.
- Continuity validation batches Git reads; eligible Doctor schema compiler setup
  is reused within a call. Test setup duplication and two reproduced test races
  were corrected while preserving semantic and cleanup assertions.

Validation: Node.js 24, 1248/1248 complete tests, distinct Independent QA,
exact-package clean installation and Alpha.32 upgrade fixtures, including 31
unchanged project-owned files and independent conflict/ownership controls.
Current evidence copies were reviewed and normalized without changing the package.

Package: 444 files, 998942 bytes. SHA-256:
`d1d91dfb054ed68837661bf6c2fe243eba7a5ea6d7b6cb6dec8dfdb602808ace`.

Packaging correction: the first workflow stopped before npm upload because local
Homebrew and official Node builds used different zlib versions. The corrected
archive uses official Node; its entire uncompressed tar stream is byte-identical
to the originally qualified payload. The original 997361-byte archive is retained
as the homebrew-zlib-1.2.12 reference attachment (SHA-256
`03c725189ace782c362b7deee65854980d4072a22600983ed290ec1c652138d2`).
The source tag is unchanged, and the release workflow still requires an exact
byte match before npm upload.

Use the exact `0.1.0-alpha.33` version or npm `next`; `latest` remains the historical
Alpha.30 alias. Rehearse an upgrade on a copy before a shared project. Upgrading
preserves existing actor policy: ordinary attribution in a legacy project requires
a separate explicit preview/apply decision.

This remains an Alpha trial, not production or mature multi-machine qualification.
Bounded measurements do not establish universal cost, Token or speed savings.
No real downstream repository was automatically upgraded by this release.
Packaged readiness documents describe the preparation snapshot; this Release and
the subsequent registry verification provide the publication state.
