# WI-0090 Risk Review

| Risk | Control |
| --- | --- |
| Historical candidate evidence is presented as current | Name the old runs as historical and bind new claims to one exact candidate revision. |
| A private push is mistaken for public release approval | Keep visibility, settings, tag, Release, announcement, and npm actions explicitly out of scope. |
| Browser automation silently downloads or packages a browser | Use the installed Chrome channel through pinned `playwright-core`; keep browser execution in the Node.js 24 full CI lane only. |
| Playwright output or repository self-host state enters the package | Preserve user output as untracked and enforce the package allowlist with manifest inspection. |
| Node.js support is claimed from one environment | Repeat full local and hosted checks for Node.js 22 and 24, plus exact-tarball consumer smoke. |
| Outcome-first titles are treated as authority | State that title suggestions are navigation labels; Work Item and thread IDs remain canonical. |
| Developer validates their own release gate | Assign Developer to Rikku and Independent QA to Lulu, with exact-revision evidence. |
| Evidence commits change the technical artifact after testing | Keep package-relevant technical candidate distinct from later governance-only evidence and rerun hosted CI after each push. |
| Parent release gates are accidentally cleared | Leave WI-0086 blocked and preserve its independent-user, moderation, protection, and Human approval requirements. |
