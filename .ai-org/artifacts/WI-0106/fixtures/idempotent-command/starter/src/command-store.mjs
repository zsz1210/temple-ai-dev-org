function requireCommand(command) {
  if (!command || typeof command.id !== "string" || command.id.length === 0) {
    throw new TypeError("command.id is required");
  }
  if (!Number.isInteger(command.amount) || command.amount <= 0) {
    throw new TypeError("command.amount must be a positive integer");
  }
}

export function applyCommand(state, command) {
  requireCommand(command);
  const next = {
    balance: state.balance + command.amount,
    processedCommandIds: [...state.processedCommandIds, command.id]
  };
  return {
    state: next,
    events: [{ type: "BalanceAdjusted", commandId: command.id, amount: command.amount }]
  };
}
