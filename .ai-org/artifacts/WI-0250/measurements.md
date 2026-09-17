# Bounded two-host measurement observations

Candidate: `41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261`.

Both hosts ran one three-case Node test command in independent temporary fixtures.
Each then reused the same immutable result and generated three scoped Markdown
reports. Each store still contained exactly one attempt. Reports did not execute
the test command and granted no acceptance. This establishes mechanical behavior,
not a provider cost saving or a comparison with manual agent orchestration.

Local report range: 66.17–72.30 ms. Remote report range: 125.05–127.19 ms.
Different Node 24 patch versions and host conditions make these diagnostic samples,
not a controlled host-performance comparison. Original raw TAP is retained below.
Token usage and cost remain null; no usage-limit query was made.

## Local observation

```json
{
  "schema_version": "temple.wi0250-bounded-data/v1",
  "captured_at": "2026-09-17T16:48:01.671Z",
  "source_revision": "41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261",
  "node": "v24.20.0",
  "platform": "darwin",
  "arch": "arm64",
  "fixture": "/var/folders/wy/bkc6__f557nb9z8_jy9m9brc0000gp/T/temple-wi0250-data-SQGYK5",
  "candidate_revision": "ca6f3d5e2f605c1ecfbd76c24c9ccaf7b1a66721",
  "first": {
    "elapsed_ms": 217.202167,
    "successful": true,
    "execution_started": true,
    "original_elapsed_ms": 199.084417,
    "result_ref": ".ai-org/artifacts/measurements/attempt-1789663681256-3332eb27-a54b-42e9-ab42-a9718fc86958/result.json",
    "stdout": "TAP version 13\n# Subtest: 0+0\nok 1 - 0+0\n  ---\n  duration_ms: 0.377084\n  type: 'test'\n  ...\n# Subtest: 2+3\nok 2 - 2+3\n  ---\n  duration_ms: 0.04675\n  type: 'test'\n  ...\n# Subtest: -2+1\nok 3 - -2+1\n  ---\n  duration_ms: 0.038041\n  type: 'test'\n  ...\n1..3\n# tests 3\n# suites 0\n# pass 3\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n# duration_ms 63.995041\n"
  },
  "reuse": {
    "elapsed_ms": 7.112707999999998,
    "cache_status": "hit",
    "execution_started": false,
    "same_result": true
  },
  "reports": [
    {
      "elapsed_ms": 72.30258300000003,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-0.md",
      "report_elapsed_ms": 71.81925000000001
    },
    {
      "elapsed_ms": 69.05341699999997,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-1.md",
      "report_elapsed_ms": 69.04575
    },
    {
      "elapsed_ms": 66.17170900000008,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-2.md",
      "report_elapsed_ms": 66.16274999999996
    }
  ],
  "attempt_count": 1,
  "token_usage": null,
  "cost": null,
  "interpretation": "Diagnostic timing only; small fixture, three report samples, no manual-agent baseline or token/cost comparison."
}
```

## Remote observation over SSH

```json
{
  "schema_version": "temple.wi0250-bounded-data/v1",
  "captured_at": "2026-09-17T16:48:24.067Z",
  "source_revision": "41a1a4f7367fc09bdc80f4ef2a5ad6b0e5914261",
  "node": "v24.7.0",
  "platform": "darwin",
  "arch": "arm64",
  "fixture": "/var/folders/xs/l6j01gy57xddczq_xyb044ww0000gn/T/temple-wi0250-data-rszrc9",
  "candidate_revision": "2a523186e9d61e9d78b9af67ab9949e5c9beffbd",
  "first": {
    "elapsed_ms": 239.827542,
    "successful": true,
    "execution_started": true,
    "original_elapsed_ms": 183.09016700000004,
    "result_ref": ".ai-org/artifacts/measurements/attempt-1789663703462-610c69cd-a939-4b19-9d20-cb5d33dc8cd1/result.json",
    "stdout": "TAP version 13\n# Subtest: 0+0\nok 1 - 0+0\n  ---\n  duration_ms: 0.301167\n  type: 'test'\n  ...\n# Subtest: 2+3\nok 2 - 2+3\n  ---\n  duration_ms: 0.04475\n  type: 'test'\n  ...\n# Subtest: -2+1\nok 3 - -2+1\n  ---\n  duration_ms: 0.039792\n  type: 'test'\n  ...\n1..3\n# tests 3\n# suites 0\n# pass 3\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n# duration_ms 50.642833\n"
  },
  "reuse": {
    "elapsed_ms": 43.09770800000001,
    "cache_status": "hit",
    "execution_started": false,
    "same_result": true
  },
  "reports": [
    {
      "elapsed_ms": 127.18754200000001,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-0.md",
      "report_elapsed_ms": 127.05262499999998
    },
    {
      "elapsed_ms": 125.04766599999994,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-1.md",
      "report_elapsed_ms": 125.043542
    },
    {
      "elapsed_ms": 125.50475000000006,
      "applicable": true,
      "execution_started": false,
      "evidence_ref": ".ai-org/artifacts/WI-0001/measurement-2.md",
      "report_elapsed_ms": 125.50091700000007
    }
  ],
  "attempt_count": 1,
  "token_usage": null,
  "cost": null,
  "interpretation": "Diagnostic timing only; small fixture, three report samples, no manual-agent baseline or token/cost comparison."
}
```

