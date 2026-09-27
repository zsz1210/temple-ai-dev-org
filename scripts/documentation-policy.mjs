// Shared by repository verification and explicit delivery evidence preflight.
// Exact accepted paths remain exceptions; suffixes do not grant localization.
const localizedDocumentation = new Set([
  '.ai-org/views/status.md',
  '.ai-org/artifacts/WK-observer-followup/audit.md',
  '.ai-org/artifacts/WK-learning-reuse/approval.md',
  '.ai-org/artifacts/WK-learning-records/approval.md',
  '.ai-org/artifacts/WK-usage-comparison/approval.md',
  'README.md',
  'README.ja.md',
  'README.zh-TW.md',
  'docs/planning/roadmap.md',
  'docs/planning/roadmap.ja.md',
  'docs/planning/roadmap.zh-TW.md'
]);

export function documentationLanguageIssue(relativePath, content) {
  if (!relativePath.endsWith('.md') || localizedDocumentation.has(relativePath)) return null;
  // Preserve exact UI labels and filenames quoted in English prose.
  const prose = content.replace(/`[^`\r\n]+`/g, '');
  return /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(prose)
    ? `${relativePath} contains CJK text; non-localized documentation must use English`
    : null;
}
