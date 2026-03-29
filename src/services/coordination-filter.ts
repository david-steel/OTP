/**
 * Coordination Intelligence Content Filter
 *
 * OTP's identity is "Where Agents Learn to Work as a Team."
 * Only claims about how agents, systems, and humans coordinate belong.
 * Generic AI/ML definitions (activation functions, batch normalization) do not.
 *
 * Benchmark: 24 canonical coordination claims from the Sneeze It agent army.
 */

// Keywords that signal coordination intelligence
const PASS_SIGNALS: string[] = [
  'agent',
  'coordinate',
  'delegate',
  'escalate',
  'handoff',
  'hand-off',
  'override',
  'authority',
  'boundary',
  'ownership',
  'shared state',
  'message bus',
  'conflict',
  'approval',
  'human-in-the-loop',
  'orchestrat',       // matches orchestrate, orchestration, orchestrator
  'pipeline',
  'workflow',
  'multi-agent',
  'team',
  'role',
  'permission',
  'scope',
  'accountability',
  'separation',
  'isolation',
  'blast radius',
  'fallback',
  'retry',
  'timeout',
  'queue',
  'priority',
  'staleness',
  'stale',
  'cache',
  'pre-compute',
  'background',
  'scheduled',
  'nightly',
  'autonomous',
  'oversight',
  'governance',
  'audit trail',
  'compliance',
];

// Keywords that signal generic AI/ML content unrelated to coordination
const FAIL_SIGNALS: string[] = [
  'activation function',
  'neural network',
  'gradient',
  'backpropagation',
  'embedding',
  'vector',
  'tensor',
  'epoch',
  'batch size',
  'learning rate',
  'regularization',
  'dropout',
  'convolution',
  'pooling',
  'attention mechanism',
  'transformer architecture',
  'tokenizer',
  'perplexity',
  'bleu score',
  'f1 score',
  'precision',
  'recall',
  'roc curve',
  'hyperparameter',
];

export interface CoordinationFilterResult {
  passes: boolean;
  score: number;
  reason: string;
}

/**
 * Checks whether a best practice term + definition is about coordination intelligence.
 *
 * Score = (pass_signal_count * 2 - fail_signal_count) / max(1, total_signals)
 * Passes if score > 0.3 AND at least 1 pass signal is present.
 */
export function isCoordinationIntelligence(
  term: string,
  definition: string
): CoordinationFilterResult {
  const combined = `${term} ${definition}`.toLowerCase();

  let passCount = 0;
  const matchedPass: string[] = [];
  for (const signal of PASS_SIGNALS) {
    if (combined.includes(signal)) {
      passCount++;
      matchedPass.push(signal);
    }
  }

  let failCount = 0;
  const matchedFail: string[] = [];
  for (const signal of FAIL_SIGNALS) {
    if (combined.includes(signal)) {
      failCount++;
      matchedFail.push(signal);
    }
  }

  const totalSignals = passCount + failCount;
  const score = (passCount * 2 - failCount) / Math.max(1, totalSignals);

  const passes = score > 0.3 && passCount >= 1;

  let reason: string;
  if (passes) {
    reason = `Coordination signals detected: ${matchedPass.join(', ')}`;
    if (failCount > 0) {
      reason += ` (also found generic AI terms: ${matchedFail.join(', ')}, but coordination signals dominate)`;
    }
  } else if (passCount === 0 && failCount === 0) {
    reason = 'No coordination or AI/ML signals detected. Content does not appear to be about how agents, systems, or humans coordinate.';
  } else if (passCount === 0) {
    reason = `Only generic AI/ML terms found: ${matchedFail.join(', ')}. No coordination signals detected.`;
  } else {
    reason = `Coordination signals (${matchedPass.join(', ')}) were outweighed by generic AI/ML terms (${matchedFail.join(', ')}). Score ${score.toFixed(2)} did not exceed 0.3 threshold.`;
  }

  return {
    passes,
    score: Math.round(score * 1000) / 1000,
    reason,
  };
}
