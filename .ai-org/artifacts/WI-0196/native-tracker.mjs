import { classifyItem } from './event-policy.mjs';
import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(String(value)).digest('hex');
const demand = (value, message) => { if (!value) throw Error(message); };
const valid = value => typeof value === 'string' && value.length > 0 && value.length <= 256;

export function usageValue(params) {
  const usage = params?.tokenUsage?.total;
  demand(usage, 'usage-missing');
  for (const key of ['inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens']) {
    demand(Number.isSafeInteger(usage[key]) && usage[key] >= 0, 'usage-invalid');
  }
  demand(usage.cachedInputTokens <= usage.inputTokens, 'usage-inconsistent');
  demand(usage.reasoningOutputTokens <= usage.outputTokens, 'usage-inconsistent');
  demand(usage.totalTokens === usage.inputTokens + usage.outputTokens, 'usage-inconsistent');
  return { ...usage, operationalTokens: usage.inputTokens - usage.cachedInputTokens + usage.outputTokens };
}

export class NativeTracker {
  constructor({ parent, turn, model, effort, maxChildren = 0, maxEvents = 4000 }) {
    demand(valid(parent) && valid(turn), 'parent-identity');
    this.parent = parent;
    this.model = model;
    this.effort = effort;
    this.maxChildren = maxChildren;
    this.maxEvents = maxEvents;
    this.actors = new Map([[parent, {
      turn,
      terminal: null,
      usage: null,
      items: new Map(),
      calls: 0,
      bytes: 0,
      acquisitionBasis: 'parent'
    }]]);
    this.pending = [];
    this.count = 0;
    this.children = new Set();
    this.stop = null;
    this.activityHints = new Set();
    this.spawnConfirmedChildren = new Set();
  }

  event(event) {
    try {
      return this.accept(event);
    } catch (error) {
      this.stop ??= error.message;
      throw error;
    }
  }

  hasActor(threadId) {
    return this.actors.has(threadId);
  }

  _bindChild(child, acquisitionBasis) {
    demand(valid(child), 'child-identity');
    if (this.actors.has(child)) {
      demand(this.children.has(child), 'child-identity-collision');
      return false;
    }
    demand(this.children.size < this.maxChildren, 'child-limit-or-duplicate');
    this.children.add(child);
    this.actors.set(child, {
      turn: null,
      terminal: null,
      usage: null,
      items: new Map(),
      calls: 0,
      bytes: 0,
      acquisitionBasis
    });
    const replay = this.pending.filter(event => event.params.threadId === child);
    this.pending = this.pending.filter(event => event.params.threadId !== child);
    for (const event of replay) this.accept(event);
    return true;
  }

  confirmActivityChild(child) {
    demand(valid(child) && this.activityHints.has(child), 'activity-candidate-missing');
    if (this.children.has(child)) return false;
    return this._bindChild(child, 'activity-resume');
  }

  accept({ method, params } = {}) {
    demand(typeof method === 'string' && params && typeof params === 'object', 'event-shape');
    demand(!/rerout|requestApproval|requestUserInput/i.test(method), 'route-or-authority-change');
    const relevant = ['turn/started', 'turn/completed', 'item/started', 'item/completed', 'thread/tokenUsage/updated'].includes(method);
    if (!relevant) return;
    demand(++this.count <= this.maxEvents, 'event-cap');
    demand(valid(params.threadId), 'event-thread');
    if (!this.actors.has(params.threadId)) {
      demand(this.pending.length < 64, 'unbound-event-cap');
      this.pending.push({ method, params });
      return;
    }

    const actor = this.actors.get(params.threadId);
    const turnId = method.startsWith('turn/') ? params.turn?.id : params.turnId;
    demand(valid(turnId), 'event-turn');
    if (actor.turn === null) {
      demand(method === 'turn/started', 'child-turn-unbound');
      actor.turn = turnId;
    }
    demand(actor.turn === turnId, 'wrong-turn');

    if (method === 'thread/tokenUsage/updated') {
      const usage = usageValue(params);
      if (actor.usage) {
        for (const key of ['inputTokens', 'cachedInputTokens', 'outputTokens', 'reasoningOutputTokens', 'totalTokens']) {
          demand(usage[key] >= actor.usage[key], 'usage-regressed');
        }
      }
      actor.usage = usage;
      return;
    }
    if (method === 'turn/started') {
      demand(!actor.terminal, 'turn-after-terminal');
      return;
    }
    if (method === 'turn/completed') {
      demand(!actor.terminal, 'duplicate-terminal');
      demand(['completed', 'interrupted', 'failed'].includes(params.turn.status), 'terminal-status');
      demand([...actor.items.values()].every(item => item.done), 'unfinished-item');
      actor.terminal = params.turn.status;
      return;
    }

    const item = params.item;
    demand(item && valid(item.id), 'item-id');
    const policy = classifyItem(item.type);
    demand(policy !== 'unknown', 'unknown-item');
    demand(policy !== 'forbidden', 'forbidden-item');
    if (policy === 'activity') {
      demand(params.threadId === this.parent && valid(item.agentThreadId), 'invalid-child-activity');
      demand(this.maxChildren > 0, 'unexpected-child-activity');
      demand(['started', 'interacted', 'interrupted', 'completed'].includes(item.kind), 'invalid-child-activity');
      this.activityHints.add(item.agentThreadId);
      demand(this.activityHints.size <= this.maxChildren, 'child-activity-limit');
      return;
    }
    if (policy !== 'tracked') return;
    demand(!actor.terminal, 'tool-after-terminal');

    if (method === 'item/started') {
      demand(!actor.items.has(item.id), 'duplicate-start');
      actor.items.set(item.id, {
        type: item.type,
        done: false,
        fingerprint: item.type === 'commandExecution' ? hash(JSON.stringify([item.command, item.cwd])) : null
      });
      actor.calls++;
      return;
    }

    const start = actor.items.get(item.id);
    demand(start && !start.done && start.type === item.type, 'unmatched-completion');
    if (item.type === 'commandExecution') {
      demand(start.fingerprint === hash(JSON.stringify([item.command, item.cwd])), 'command-drift');
      demand(Number.isInteger(item.exitCode), 'command-outcome');
      actor.bytes += Buffer.byteLength(item.aggregatedOutput ?? '');
    }
    if (item.type === 'collabAgentToolCall') {
      demand(params.threadId === this.parent && item.senderThreadId === this.parent, 'nested-or-foreign-spawn');
      if (item.tool === 'spawnAgent') {
        if (['failed', 'interrupted'].includes(item.status)) {
          start.done = true;
          this.stop ??= item.status === 'failed' ? 'native-spawn-failed' : 'native-spawn-interrupted';
          return;
        }
        demand(item.status === 'completed' && Array.isArray(item.receiverThreadIds) && item.receiverThreadIds.length === 1, 'spawn-outcome');
        demand(item.model === this.model && item.reasoningEffort === this.effort, 'child-route-unconfirmed');
        const child = item.receiverThreadIds[0];
        demand(valid(child) && !this.spawnConfirmedChildren.has(child), 'child-limit-or-duplicate');
        if (this.children.has(child)) {
          demand(this.actors.get(child)?.acquisitionBasis === 'activity-resume', 'child-limit-or-duplicate');
        } else {
          this._bindChild(child, 'spawn-completion');
        }
        this.spawnConfirmedChildren.add(child);
      } else {
        demand(['wait', 'listAgents', 'closeAgent'].includes(item.tool), 'extra-child-turn');
      }
    }
    start.done = true;
  }

  active() {
    return [...this.actors]
      .filter(([, actor]) => actor.turn && !actor.terminal)
      .map(([threadId, actor]) => ({ threadId, turnId: actor.turn }));
  }

  report() {
    const actors = [...this.actors].map(([id, actor]) => ({
      id_sha256: hash(id),
      role: id === this.parent ? 'parent' : 'helper',
      acquisition_basis: actor.acquisitionBasis,
      terminal: actor.terminal,
      usage: actor.usage,
      tool_calls: actor.calls,
      output_bytes: actor.bytes
    }));
    const unbound = [...this.activityHints].filter(id => !this.children.has(id));
    return {
      actors,
      unknown_event_count: this.pending.length,
      unbound_activity_ids: unbound.map(hash),
      expected_children: this.maxChildren,
      observed_children: this.children.size,
      status: this.stop
        ? 'stopped'
        : unbound.length || this.pending.length || this.children.size !== this.maxChildren || actors.some(actor => actor.terminal !== 'completed' || !actor.usage)
          ? 'incomplete'
          : 'observed-complete',
      stop_reason: this.stop,
      usage_scope: 'per-thread-last-observed-not-account-final',
      aggregate_operational_tokens: this.children.size ? null : actors[0].usage?.operationalTokens ?? null,
      aggregate_reason: this.children.size ? 'parent-child-nonduplication-not-established' : null
    };
  }
}
