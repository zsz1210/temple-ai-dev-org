# WI-0106 historical evidence correction

Doctor detected that failed evidence `EVID-20260902T113004Z-15216395` recorded two artifact digests from a later working tree while its scope revision was `d3ea908d6157da31b659eb53dc5d16014a354fe2`.

The evidence outcome, scope revision, timestamps, report, and event were not changed. Only the two digests were corrected to the SHA-256 values of the files at the recorded revision:

- `.ai-org/artifacts/WI-0106/resource-preflight.json`: `1a1e2747ddebea4f1ba42c22fcf7b336dd93fac4d7f9819a6ff66791f03cc058`
- `.ai-org/artifacts/WI-0106/technical-design.md`: `9a9e2f2abc6260b397c4f04d38e8573dbfce927566e4604837824971b60008ac`

This preserves the original NO-GO while restoring revision-bound evidence integrity. No lifecycle gate, external action, or model run is authorized by this correction.
