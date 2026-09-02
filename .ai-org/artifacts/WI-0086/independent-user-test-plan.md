# WI-0086 Independent Public-Instructions Test Plan

## Purpose

This test checks whether a new user can understand and initialize Temple from the public documentation without relying on maintainer knowledge. It is a Human usability gate, not another automated installation test.

## Eligible tester

- Has not developed Temple and has not read its internal Work Item history.
- May be a software engineer or an AI-assisted developer; Temple expertise is not required.
- Is not coached step by step by the maintainer during the attempt.

## Materials

Give the tester either read access to the private candidate repository or a source archive of the exact candidate. Ask them to begin at the localized README they would naturally choose. Do not provide internal `.ai-org` artifacts, chat history, or additional setup instructions unless the public README links to them.

## Task

1. Explain in their own words what Temple is and what it does not replace.
2. Decide whether they are starting a new project or adding Temple to an existing disposable repository.
3. Follow only the public README and linked public documentation to prepare the initialization configuration.
4. Run the documented dry run and initialization.
5. Run the project launcher, `status`, and `doctor`.
6. Identify any unfamiliar Temple-specific term, unclear instruction, unexpected file change, or point where they needed maintainer help.

## Pass boundary

The result passes only when:

- the tester can state Temple's purpose and non-goals without a material misunderstanding;
- initialization changes only the disposable target repository;
- the installed launcher reports `0.1.0-alpha.29`;
- Doctor finishes with zero failures;
- any warning is understood and consistent with the documented state;
- no undocumented maintainer intervention was required.

If the tester becomes blocked, retain the exact step, visible message, chosen language, operating system, Node.js version, and whether the documentation or runtime caused the stop. A failure is useful release evidence and must not be rewritten as a pass.

## Result record

Record the candidate revision or archive digest, date, tester relationship to Temple, chosen language, operating system, Node.js version, path taken, Doctor summary, points of confusion, intervention provided, and pass or fail decision. Do not store the tester's private email, tokens, credentials, or unrelated machine data.

This plan does not authorize repository visibility, GitHub settings, a tag, a GitHub Release, an announcement, or npm publication.
