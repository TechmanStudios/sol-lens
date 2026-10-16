import {
  cohomologicalRepairRecords,
  differentialShockTimeline,
  geminiThoughtSignatures,
  governanceCourtRuns,
  solEdgeRuntimeEvents,
} from "../db/schema.ts";

export {
  cohomologicalRepairRecords,
  differentialShockTimeline,
  geminiThoughtSignatures,
  governanceCourtRuns,
  solEdgeRuntimeEvents,
};

export type GovernanceRunMode =
  | "standard_moa"
  | "closed_loop_repair"
  | "dialectical_h1"
  | "sysml_shock_cosim"
  | "robotic_manifold_gate"
  | "wormhole_homology_bridge"
  | "persistent_ricci_surgery"
  | "non_hermitian_skin_pt"
  | "sol_continuum_discovery_observatory"
  | "lumina_ranger_observatory_sovereignty";

export type GovernanceCourtRunRecord = {
  runId: string;
  packetId: string;
  studyName: string;
  runMode: GovernanceRunMode;
  modelUsed: string;
  interactionId: string;
  thinkingLevel: string;
  selectedOptionId: string;
  selectedOptionName: string;
  policyStatus: string;
  runtimeStatus: string;
  nextTransition: string;
  preBeta1: number;
  postBeta1: number;
  dirichletEnergy: number;
  coboundaryNorm: number;
  kuramotoOrderR: number;
  causalEmergenceDeltaEi: number;
  finalStateDigest: string;
  priorQuarantinedStateDigest: string | null;
  previousRunDigest: string | null;
  ledgerEntryDigest: string;
  isSigned: boolean;
  signerName: string | null;
  signerRole: string | null;
  proofPacketJson: string;
  createdAt: string;
};

export type SolEdgeRuntimeEventRow = {
  runId: string;
  optionId: string;
  sequenceNumber: number;
  eventId: string;
  eventType: string;
  occurredAt: string;
  previousEventDigest: string | null;
  eventDigest: string;
  payloadJson: string;
};

export type GeminiThoughtSignatureRow = {
  runId: string;
  interactionId: string;
  agentRole: string;
  modelUsed: string;
  thinkingLevel: string;
  stepIndex: number;
  signatureDigest: string;
  signatureLength: number;
  thoughtSummary: string;
  inputTokens: number;
  thoughtTokens: number;
  outputTokens: number;
};

export type CohomologicalRepairRow = {
  runId: string;
  repairKind: string;
  targetOptionId: string;
  preBeta1: number;
  postBeta1: number;
  preHarmonicNorm: number;
  postHarmonicNorm: number;
  l2ProjectionDistance: number;
  quarantinedStateDigest: string;
  clearedStateDigest: string;
  previousInteractionId: string;
  repairInteractionId: string;
  preStalkJson: string;
  postStalkJson: string;
  rationale: string;
};

export type DifferentialShockTimelineRow = {
  shockEntryId: string;
  runId: string;
  baselineRunId: string | null;
  deltaId: string;
  shockId: string;
  targetPrimitiveId: string;
  parameterChannel: number;
  deltaValue: number;
  baselineOptionId: string;
  refreshedOptionId: string;
  didDecisionFlip: boolean;
  preEnergy: number;
  postEnergy: number;
  preBeta1: number;
  postBeta1: number;
  activatedEdgesJson: string;
  quarantinedStateDigest: string;
  clearedStateDigest: string;
  auditSummary: string;
  recordedAt: string;
};

export type LedgerIntegrityVerificationReport = {
  isValid: boolean;
  totalRunsVerified: number;
  totalEventsVerified: number;
  headLedgerDigest: string | null;
  brokenRunIds: string[];
  brokenEventRunIds: string[];
  summary: string;
};

export const GOVERNANCE_LEDGER_DDL = `
CREATE TABLE IF NOT EXISTS governance_court_runs (
  run_id TEXT PRIMARY KEY NOT NULL,
  packet_id TEXT NOT NULL,
  study_name TEXT NOT NULL,
  run_mode TEXT NOT NULL,
  model_used TEXT NOT NULL,
  interaction_id TEXT NOT NULL,
  thinking_level TEXT NOT NULL DEFAULT 'adaptive',
  selected_option_id TEXT NOT NULL,
  selected_option_name TEXT NOT NULL,
  policy_status TEXT NOT NULL,
  runtime_status TEXT NOT NULL,
  next_transition TEXT NOT NULL,
  pre_beta_1 INTEGER NOT NULL DEFAULT 0,
  post_beta_1 INTEGER NOT NULL DEFAULT 0,
  dirichlet_energy REAL NOT NULL DEFAULT 0,
  coboundary_norm REAL NOT NULL DEFAULT 0,
  kuramoto_order_r REAL NOT NULL DEFAULT 1,
  causal_emergence_delta_ei REAL NOT NULL DEFAULT 0,
  final_state_digest TEXT NOT NULL,
  prior_quarantined_state_digest TEXT,
  previous_run_digest TEXT,
  ledger_entry_digest TEXT NOT NULL,
  is_signed INTEGER NOT NULL DEFAULT 0,
  signer_name TEXT,
  signer_role TEXT,
  proof_packet_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sol_edge_runtime_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES governance_court_runs(run_id),
  option_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  previous_event_digest TEXT,
  event_digest TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gemini_thought_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES governance_court_runs(run_id),
  interaction_id TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  model_used TEXT NOT NULL,
  thinking_level TEXT NOT NULL,
  step_index INTEGER NOT NULL DEFAULT 0,
  signature_digest TEXT NOT NULL,
  signature_length INTEGER NOT NULL DEFAULT 0,
  thought_summary TEXT NOT NULL DEFAULT '',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  thought_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cohomological_repair_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES governance_court_runs(run_id),
  repair_kind TEXT NOT NULL,
  target_option_id TEXT NOT NULL,
  pre_beta_1 INTEGER NOT NULL DEFAULT 0,
  post_beta_1 INTEGER NOT NULL DEFAULT 0,
  pre_harmonic_norm REAL NOT NULL DEFAULT 0,
  post_harmonic_norm REAL NOT NULL DEFAULT 0,
  l2_projection_distance REAL NOT NULL DEFAULT 0,
  quarantined_state_digest TEXT NOT NULL,
  cleared_state_digest TEXT NOT NULL,
  previous_interaction_id TEXT NOT NULL,
  repair_interaction_id TEXT NOT NULL,
  pre_stalk_json TEXT NOT NULL,
  post_stalk_json TEXT NOT NULL,
  rationale TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS differential_shock_timeline (
  shock_entry_id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL REFERENCES governance_court_runs(run_id),
  baseline_run_id TEXT,
  delta_id TEXT NOT NULL,
  shock_id TEXT NOT NULL,
  target_primitive_id TEXT NOT NULL,
  parameter_channel INTEGER NOT NULL,
  delta_value REAL NOT NULL,
  baseline_option_id TEXT NOT NULL,
  refreshed_option_id TEXT NOT NULL,
  did_decision_flip INTEGER NOT NULL DEFAULT 0,
  pre_energy REAL NOT NULL,
  post_energy REAL NOT NULL,
  pre_beta_1 INTEGER NOT NULL DEFAULT 0,
  post_beta_1 INTEGER NOT NULL DEFAULT 0,
  activated_edges_json TEXT NOT NULL,
  quarantined_state_digest TEXT NOT NULL,
  cleared_state_digest TEXT NOT NULL,
  audit_summary TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

/**
 * Pure TypeScript SHA-256 implementation (FIPS 180-4) so that ledger entry digests
 * can be computed and verified deterministically in browser, Cloudflare Workers,
 * and Node.js without external native dependencies.
 */
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Hex(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const bitLen = bytes.length * 8;
  const totalBytes = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(totalBytes);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(totalBytes - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalBytes - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < totalBytes; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, "0"))
    .join("");
}

/**
 * Computes the deterministic SHA-256 `ledger_entry_digest` for a `governance_court_runs` row.
 * Exact parity with Python `GovernanceCourtLedger.compute_ledger_entry_digest`.
 */
export function computeLedgerEntryDigest(input: {
  runId: string;
  packetId: string;
  studyName: string;
  runMode: string;
  modelUsed: string;
  interactionId: string;
  selectedOptionId: string;
  policyStatus: string;
  finalStateDigest: string;
  priorQuarantinedStateDigest: string | null;
  previousRunDigest: string | null;
}): string {
  const canonicalPayload = [
    input.runId,
    input.packetId,
    input.studyName,
    input.runMode,
    input.modelUsed,
    input.interactionId,
    input.selectedOptionId,
    input.policyStatus,
    input.finalStateDigest,
    input.priorQuarantinedStateDigest ?? "GENESIS_NO_PRIOR_QUARANTINE",
    input.previousRunDigest ?? "GENESIS_LEDGER_ROOT",
  ].join("|");
  return `sha256:${sha256Hex(canonicalPayload)}`;
}

/**
 * Verifies both:
 * 1. The cross-run Merkle/hash-chain (`previousRunDigest` -> `ledgerEntryDigest`) across all
 *    runs in chronological order, and
 * 2. Every run's internal 4-event `sol-edge` hash chain (`previousEventDigest` -> `eventDigest`).
 */
export function verifyGovernanceCourtLedgerChain(
  runs: GovernanceCourtRunRecord[],
  eventsByRunId: Record<string, SolEdgeRuntimeEventRow[]> = {}
): LedgerIntegrityVerificationReport {
  const brokenRunIds: string[] = [];
  const brokenEventRunIds: string[] = [];
  let totalEventsVerified = 0;
  let expectedPrevRunDigest: string | null = null;

  for (const run of runs) {
    if ((run.previousRunDigest ?? null) !== expectedPrevRunDigest) {
      brokenRunIds.push(run.runId);
    }
    const recomputed = computeLedgerEntryDigest({
      runId: run.runId,
      packetId: run.packetId,
      studyName: run.studyName,
      runMode: run.runMode,
      modelUsed: run.modelUsed,
      interactionId: run.interactionId,
      selectedOptionId: run.selectedOptionId,
      policyStatus: run.policyStatus,
      finalStateDigest: run.finalStateDigest,
      priorQuarantinedStateDigest: run.priorQuarantinedStateDigest,
      previousRunDigest: run.previousRunDigest,
    });
    if (recomputed !== run.ledgerEntryDigest && !brokenRunIds.includes(run.runId)) {
      brokenRunIds.push(run.runId);
    }
    expectedPrevRunDigest = run.ledgerEntryDigest;

    const hasExplicitEventsKey = Object.prototype.hasOwnProperty.call(eventsByRunId, run.runId);
    const runEvents = eventsByRunId[run.runId] ?? [];
    if (hasExplicitEventsKey && runEvents.length === 0) {
      if (!brokenEventRunIds.includes(run.runId)) {
        brokenEventRunIds.push(run.runId);
      }
    } else if (runEvents.length > 0) {
      // Group by optionId since a trade study may persist events for multiple candidate options
      const byOption: Record<string, SolEdgeRuntimeEventRow[]> = {};
      for (const ev of runEvents) {
        if (!byOption[ev.optionId]) {
          byOption[ev.optionId] = [];
        }
        byOption[ev.optionId].push(ev);
      }
      if (
        run.runMode === "sol_continuum_discovery_observatory" ||
        run.runMode === "lumina_ranger_observatory_sovereignty"
      ) {
        const optionKeys = Object.keys(byOption);
        const hasC0 = optionKeys.some((k) => k.endsWith(":cycle0-quarantine") && byOption[k].length === 4);
        const hasC1 = optionKeys.some((k) => k.endsWith(":cycle1-eligible") && byOption[k].length === 4);
        if (!hasC0 || !hasC1) {
          if (!brokenEventRunIds.includes(run.runId)) {
            brokenEventRunIds.push(run.runId);
          }
        }
      }
      for (const optEvents of Object.values(byOption)) {
        const sorted = [...optEvents].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        let prevEvDigest: string | null = null;
        for (let i = 0; i < sorted.length; i++) {
          const ev = sorted[i];
          totalEventsVerified += 1;
          if (ev.sequenceNumber !== i + 1 || (ev.previousEventDigest ?? null) !== prevEvDigest) {
            if (!brokenEventRunIds.includes(run.runId)) {
              brokenEventRunIds.push(run.runId);
            }
          }
          prevEvDigest = ev.eventDigest;
        }
      }
    }
  }

  const isValid = brokenRunIds.length === 0 && brokenEventRunIds.length === 0;
  const headLedgerDigest = runs.length > 0 ? runs[runs.length - 1].ledgerEntryDigest : null;

  return {
    isValid,
    totalRunsVerified: runs.length,
    totalEventsVerified,
    headLedgerDigest,
    brokenRunIds,
    brokenEventRunIds,
    summary: isValid
      ? `VERIFIED: ${runs.length} governed runs & ${totalEventsVerified} sol-edge events hash-chained to head ${headLedgerDigest?.slice(0, 24) ?? "EMPTY"}`
      : `TAMPER DETECTED: broken runs=${brokenRunIds.join(",")} | broken event chains=${brokenEventRunIds.join(",")}`,
  };
}
