# WI-0168 Rollback Plan

If the Release-triggered npm publisher behaves incorrectly:

1. stop publishing new GitHub Releases while the incident is investigated;
2. disable or remove `.github/workflows/publish-npm.yml` through a reviewed repository change;
3. revoke the package's GitHub Trusted Publisher relationship in npm after an explicit owner decision;
4. preserve the failed workflow run, Release tag, package archive digest, and npm registry observation as incident evidence; and
5. correct the workflow and repeat local validation before any later Release is published.

This plan does not delete a GitHub Release, unpublish an npm version, or change a dist-tag automatically. Those are separate external decisions because they can affect existing consumers.

