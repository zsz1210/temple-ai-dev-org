# WI-0166 Technical Design and Risk Review

## Pre-publication gate

Enumerate every available workflow run through the GitHub API, download its log archive, extract it without filename loss, and scan every decoded text log. Retain only rule counts and a digest of the audited boundary; never retain matched values. Images, media, and Actions artifact contents are outside scope.

The scan fails closed on a private-key marker, supported provider-token shape, binary log, or unreadable log. Candidate-looking matches require value-redacted classification before publication.

## External action

Use GitHub's repository API to change only `visibility` to `public`. Do not alter collaborators, branch protection, Issues, tags, Releases, package metadata, or npm.

## Post-change verification

- Query the repository without authentication and confirm `PUBLIC` visibility.
- Fetch the public README and MIT License without authentication.
- Confirm Issues remain enabled.
- Re-read `main` protection and the required `Verify (Node.js 24)` check.
- Confirm the package remains `private: true`, no new tag or Release exists, and npm still returns not found.

## Risk and rollback

Changing visibility can be reversed, but copies made while public cannot be recalled. The owner explicitly accepted the reviewed Git history. If a post-change blocker appears, immediately restore private visibility, preserve the observation, and stop all later publication surfaces.
