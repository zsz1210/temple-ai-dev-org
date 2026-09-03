# Risk review — WI-0125

Risk is low. The change removes an environment-specific fallback and fails earlier; it does not broaden file access, shell execution, network access, Provider contact, model generation, or external mutation. Rollback is a Git revert of the bounded implementation commit.
