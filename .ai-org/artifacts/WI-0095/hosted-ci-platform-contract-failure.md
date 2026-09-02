# Hosted CI Platform-Contract Failure — WI-0095

- Run: [GitHub Actions 33581136546](https://github.com/zsz1210/temple-ai-dev-org/actions/runs/33581136546)
- Head revision: `eade0aea9c9cb2e25bf260909fb8419546f8399a`
- Node.js 22 job: `100095479450`
- Node.js 24 job: `100095479651`
- Result: failed; not waived

## Observed result

Both Node.js lanes completed 275 of 276 tests and failed only `test/local-observer-service.test.mjs` at the CLI lifecycle case. The Linux runner received the intentional product response:

- status: `unsupported-platform`
- supported: `false`
- platform: `linux`
- CLI exit code: `1`

The test incorrectly asserted exit code 0 before considering the host platform. The Node.js 24 Management Console browser gate passed; repository checks, schema validation, and Doctor passed in both jobs.

## Correction boundary

The replacement test must explicitly verify structured rejection and no service-state writes on unsupported hosts. It must retain the complete service lifecycle on macOS. No product code or platform-support claim changes.

The failed run remains release evidence. A fresh exact-revision hosted run must pass both supported Node.js lanes and the Node.js 24 browser gate before the parent release candidate can advance.
