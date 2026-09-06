# Corrected instrument verification

Candidate eb6315c (full Git revision resolvable locally); source digest sha256:c4c7e1192717dd0780d6a1bb0d070532e4e3718403f71558376ce93e757f3ff2. Full npm run verify passed all 632 tests, zero failures/skips, 153.775 seconds. Retained log: /tmp/wi0203-full-v2.log. The earlier failed candidate and its report remain preserved.

Installed Codex CLI sandbox readiness v2 passed four synthetic actor stages and two denied boundary writes with zero model thread/turn requests. The sandbox source and process digests match this candidate. Focused command and measurement contracts passed 18/18. Both arm orders now explicitly test tampering rejection; an early finish rejection must include the uncommitted-product guard and cannot count as product acceptance. No blanket provider-protocol exemption was introduced.

Core src, project-overlay, packs and bin behavior remains the accepted B/C base. No new model measurements are established by these tests. Independent readiness review and frozen new matrix/approval are required before live generation. The live plan is the disclosed eight-stage screen, not repeated trials.
