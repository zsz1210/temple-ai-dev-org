# Official sources and format references

- Codex Skills: <https://developers.openai.com/codex/skills>
- Codex `AGENTS.md`: <https://developers.openai.com/codex/guides/agents-md>
- Codex custom agents and subagents: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- Codex SDK: <https://developers.openai.com/codex/sdk/>
- Codex App Server: <https://learn.chatgpt.com/docs/app-server>
- Archify repository: <https://github.com/tt-a1i/archify>
- Matt Pocock Skills (design inspiration and capability review): <https://github.com/mattpocock/skills>
- GitHub pull-request management and standardization: <https://docs.github.com/en/pull-requests/reference/managing-and-standardizing-pull-requests>
- GitHub repository rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>
- GitHub merge queue: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue>
- GitHub pull-request REST API: <https://docs.github.com/en/rest/pulls/pulls>
- GitHub Checks REST API: <https://docs.github.com/en/rest/checks/runs>
- GitHub REST API best practices: <https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api>
- CloudEvents specification: <https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md>
- W3C Trace Context: <https://www.w3.org/TR/trace-context/>
- OpenTelemetry Logs data model: <https://opentelemetry.io/docs/specs/otel/logs/data-model/>
- OpenTelemetry generative-AI attributes: <https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/>
- WHATWG Server-Sent Events: <https://html.spec.whatwg.org/dev/server-sent-events.html>
- Prometheus alerting rules and practices: <https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/>
- Kubernetes condition fields: <https://kubernetes.io/docs/reference/kubernetes-api/apiextensions/custom-resource-definition-v1/>
- Git common directory: <https://git-scm.com/docs/git-rev-parse>

Under the current official Codex conventions, Phase 1 places repository Skills in `.agents/skills`, repository instructions in the root `AGENTS.md`, and project custom agents in `.codex/agents/*.toml`. These external formats may evolve, so verify them against the official documentation before every central framework upgrade.
