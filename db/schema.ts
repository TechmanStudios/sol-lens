import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Table 1: governance_court_runs
 * Master append-only ledger of governed SOL trade studies, closed-loop quarantine
 * repairs, 3-agent Dialectical H^1 Hodge negotiations, SysML v2 shock mutations,
 * and 6-DOF robotic manifold actuation episodes.
 *
 * Each row is hash-chained to its predecessor via `previousRunDigest` -> `ledgerEntryDigest`.
 */
export const governanceCourtRuns = sqliteTable("governance_court_runs", {
  runId: text("run_id").primaryKey(),
  packetId: text("packet_id").notNull(),
  studyName: text("study_name").notNull(),
  runMode: text("run_mode").notNull(), // "standard_moa" | "closed_loop_repair" | "dialectical_h1" | "sysml_shock_cosim" | "robotic_manifold_gate"
  modelUsed: text("model_used").notNull(),
  interactionId: text("interaction_id").notNull(),
  thinkingLevel: text("thinking_level").notNull().default("adaptive"),
  selectedOptionId: text("selected_option_id").notNull(),
  selectedOptionName: text("selected_option_name").notNull(),
  policyStatus: text("policy_status").notNull(), // "ELIGIBLE" | "REQUIRE_HUMAN_APPROVAL" | "QUARANTINE" | "DEFER" | "REJECT"
  runtimeStatus: text("runtime_status").notNull(),
  nextTransition: text("next_transition").notNull(),
  preBeta1: integer("pre_beta_1").notNull().default(0),
  postBeta1: integer("post_beta_1").notNull().default(0),
  dirichletEnergy: real("dirichlet_energy").notNull().default(0),
  coboundaryNorm: real("coboundary_norm").notNull().default(0),
  kuramotoOrderR: real("kuramoto_order_r").notNull().default(1),
  causalEmergenceDeltaEi: real("causal_emergence_delta_ei").notNull().default(0),
  finalStateDigest: text("final_state_digest").notNull(),
  priorQuarantinedStateDigest: text("prior_quarantined_state_digest"),
  previousRunDigest: text("previous_run_digest"),
  ledgerEntryDigest: text("ledger_entry_digest").notNull(),
  isSigned: integer("is_signed", { mode: "boolean" }).notNull().default(false),
  signerName: text("signer_name"),
  signerRole: text("signer_role"),
  proofPacketJson: text("proof_packet_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Table 2: sol_edge_runtime_events
 * Stores the 4-event hash-chained pre-execution state machine stream
 * (`RUN_OPENED` -> `PROPOSAL_RECORDED` -> `EVIDENCE_RECORDED` -> `POLICY_DECISION_RECORDED`)
 * for every governed run and option evaluation.
 */
export const solEdgeRuntimeEvents = sqliteTable("sol_edge_runtime_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => governanceCourtRuns.runId),
  optionId: text("option_id").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  occurredAt: text("occurred_at").notNull(),
  previousEventDigest: text("previous_event_digest"),
  eventDigest: text("event_digest").notNull(),
  payloadJson: text("payload_json").notNull(),
});

/**
 * Table 3: gemini_thought_signatures
 * Cryptographic audit log of Gemini 4 (`gemini-4-argon`) / Gemini 3.8 (`gemini-3.8-flash`)
 * `thought.signature` SHA-256 digests, thought summaries, and token telemetry.
 */
export const geminiThoughtSignatures = sqliteTable("gemini_thought_signatures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => governanceCourtRuns.runId),
  interactionId: text("interaction_id").notNull(),
  agentRole: text("agent_role").notNull(),
  modelUsed: text("model_used").notNull(),
  thinkingLevel: text("thinking_level").notNull(),
  stepIndex: integer("step_index").notNull().default(0),
  signatureDigest: text("signature_digest").notNull(),
  signatureLength: integer("signature_length").notNull().default(0),
  thoughtSummary: text("thought_summary").notNull().default(""),
  inputTokens: integer("input_tokens").notNull().default(0),
  thoughtTokens: integer("thought_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
});

/**
 * Table 4: cohomological_repair_records
 * Immutable provenance of closed-loop self-correction (`QUARANTINE` -> `ELIGIBLE`):
 * - Cycle 0 -> Cycle 1 coboundary projection (`CohomologicalRepairRecord`)
 * - 3-Agent Dialectical H^1 Hodge-harmonic negotiation (`H1ObstructionResolutionRecord`)
 * - SysML v2 operational shock mutation (`SysMLShockCoSimulationRecord`)
 * - 6-DOF SO(3) non-abelian Wilson loop gauge diffusion (`RoboticActuationGovernanceRecord`)
 */
export const cohomologicalRepairRecords = sqliteTable("cohomological_repair_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  runId: text("run_id")
    .notNull()
    .references(() => governanceCourtRuns.runId),
  repairKind: text("repair_kind").notNull(),
  targetOptionId: text("target_option_id").notNull(),
  preBeta1: integer("pre_beta_1").notNull().default(0),
  postBeta1: integer("post_beta_1").notNull().default(0),
  preHarmonicNorm: real("pre_harmonic_norm").notNull().default(0),
  postHarmonicNorm: real("post_harmonic_norm").notNull().default(0),
  l2ProjectionDistance: real("l2_projection_distance").notNull().default(0),
  quarantinedStateDigest: text("quarantined_state_digest").notNull(),
  clearedStateDigest: text("cleared_state_digest").notNull(),
  previousInteractionId: text("previous_interaction_id").notNull(),
  repairInteractionId: text("repair_interaction_id").notNull(),
  preStalkJson: text("pre_stalk_json").notNull(),
  postStalkJson: text("post_stalk_json").notNull(),
  rationale: text("rationale").notNull().default(""),
});

/**
 * Table 5: differential_shock_timeline
 * Multi-run differential shock timeline tracking how external physical/operational
 * shocks (`OperationalShock`) perturb sheaf coboundary edges, flip or quarantine
 * baseline decisions, and get cleared into a new certified equilibrium.
 */
export const differentialShockTimeline = sqliteTable("differential_shock_timeline", {
  shockEntryId: text("shock_entry_id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => governanceCourtRuns.runId),
  baselineRunId: text("baseline_run_id"),
  deltaId: text("delta_id").notNull(),
  shockId: text("shock_id").notNull(),
  targetPrimitiveId: text("target_primitive_id").notNull(),
  parameterChannel: integer("parameter_channel").notNull(),
  deltaValue: real("delta_value").notNull(),
  baselineOptionId: text("baseline_option_id").notNull(),
  refreshedOptionId: text("refreshed_option_id").notNull(),
  didDecisionFlip: integer("did_decision_flip", { mode: "boolean" }).notNull().default(false),
  preEnergy: real("pre_energy").notNull(),
  postEnergy: real("post_energy").notNull(),
  preBeta1: integer("pre_beta_1").notNull().default(0),
  postBeta1: integer("post_beta_1").notNull().default(0),
  activatedEdgesJson: text("activated_edges_json").notNull(),
  quarantinedStateDigest: text("quarantined_state_digest").notNull(),
  clearedStateDigest: text("cleared_state_digest").notNull(),
  auditSummary: text("audit_summary").notNull(),
  recordedAt: text("recorded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
