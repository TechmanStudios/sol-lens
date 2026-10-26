import assert from "node:assert/strict";
import test from "node:test";

import { demoPacket, demoPacketInput } from "../lib/demo-packet.ts";
import {
  MAX_PACKET_BYTES,
  PACKET_SCHEMA_V02,
  createProofPacket,
  normalizePacket,
  parsePacketJson,
} from "../lib/packet-schema.ts";
import {
  duplicateIdPacket,
  legacyV01Packet,
  missingTargetPacket,
  outOfRangePacket,
  valid24Packet,
} from "./fixtures/packets.mjs";

const requirePacket = (result) => {
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join(" "));
  return result.packet;
};

test("the checked-in demo is canonical and layout-free", () => {
  assert.equal(demoPacket.schema, PACKET_SCHEMA_V02);
  assert.equal(demoPacket.logons.length, 10);
  assert.equal(demoPacket.edges.length, 14);
  assert.equal("x" in demoPacket.logons[0], false);
  assert.equal("y" in demoPacket.logons[0], false);
  assert.equal(demoPacketInput.observable_trace_only, true);
  assert.equal(demoPacket.baseline_evaluation.verdict, "HOLD");
  assert.equal(demoPacket.evaluation.verdict, "PROMOTE");
});

test("validates duplicate IDs, missing targets, and out-of-range measures", () => {
  const duplicate = normalizePacket(duplicateIdPacket);
  const missing = normalizePacket(missingTargetPacket);
  const range = normalizePacket(outOfRangePacket);

  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors.join(" "), /duplicates Logon ID/);
  assert.equal(missing.ok, false);
  assert.match(missing.errors.join(" "), /references missing Logon/);
  assert.equal(range.ok, false);
  assert.match(range.errors.join(" "), /between 0 and 1/);
});

test("normalizes v0.1 packets and generates stable unique edge IDs", () => {
  const first = requirePacket(normalizePacket(legacyV01Packet));
  const second = requirePacket(normalizePacket(legacyV01Packet));

  assert.equal(first.schema, PACKET_SCHEMA_V02);
  assert.equal(first.packet_id, second.packet_id);
  assert.deepEqual(
    first.edges.map((edge) => edge.id),
    second.edges.map((edge) => edge.id),
  );
  assert.equal(new Set(first.edges.map((edge) => edge.id)).size, 2);
  assert.equal(first.evaluation.claimed_evaluation_match, false);
  assert.equal(first.claimed_evaluation.verdict, "QUARANTINE");
});

test("recomputes supplied evaluation claims instead of trusting them", () => {
  const packet = structuredClone(valid24Packet);
  packet.metrics = {
    evidence: 0,
    coherence: 0,
    contradiction: 1,
    continuity: 0,
    authority: 0,
    faithfulness: 0,
  };
  packet.verdict = "QUARANTINE";

  const normalized = requirePacket(normalizePacket(packet));
  assert.notEqual(normalized.evaluation.metrics.evidence, 0);
  assert.equal(normalized.evaluation.claimed_evaluation_match, false);
  assert.equal(normalized.claimed_evaluation.verdict, "QUARANTINE");
});

test("validates optional observable baseline summaries", () => {
  const packet = structuredClone(valid24Packet);
  packet.baseline_evaluation = {
    label: "Broken baseline",
    logon_count: 0,
    metrics: {
      evidence: 2,
      coherence: 0.7,
      contradiction: 0.1,
      continuity: 0.7,
      authority: 0.7,
      faithfulness: 0.7,
    },
    verdict: "MAYBE",
  };

  const result = normalizePacket(packet);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /baseline_evaluation\.logon_count/);
  assert.match(result.errors.join(" "), /baseline_evaluation\.metrics\.evidence/);
  assert.match(result.errors.join(" "), /baseline_evaluation\.verdict/);
});

test("exports and reimports v0.2 without losing graph or evaluation", () => {
  const normalized = requirePacket(normalizePacket(valid24Packet));
  const exported = createProofPacket(
    normalized,
    "2026-07-19T13:00:00.000Z",
  );
  const replay = requirePacket(normalizePacket(exported));

  assert.equal(exported.schema, PACKET_SCHEMA_V02);
  assert.equal(exported.edges.length, normalized.edges.length);
  assert.deepEqual(
    replay.logons.map((logon) => logon.id),
    normalized.logons.map((logon) => logon.id),
  );
  assert.deepEqual(replay.edges, normalized.edges);
  assert.deepEqual(replay.evaluation.metrics, normalized.evaluation.metrics);
  assert.equal(replay.evaluation.verdict, normalized.evaluation.verdict);
  assert.equal(replay.evaluation.claimed_evaluation_match, true);
});

test("preserves an observable baseline summary through export and replay", () => {
  const exported = createProofPacket(
    demoPacket,
    "2026-07-19T13:30:00.000Z",
  );
  const replay = requirePacket(normalizePacket(exported));

  assert.deepEqual(replay.baseline_evaluation, demoPacket.baseline_evaluation);
  assert.equal(replay.baseline_evaluation.verdict, "HOLD");
  assert.equal(replay.evaluation.verdict, "PROMOTE");
});

test("returns useful JSON and browser-size errors", () => {
  const invalid = parsePacketJson("{ definitely not json");
  const oversized = parsePacketJson("x".repeat(MAX_PACKET_BYTES + 1));

  assert.equal(invalid.ok, false);
  assert.match(invalid.errors[0], /not valid JSON/);
  assert.equal(oversized.ok, false);
  assert.match(oversized.errors[0], /5 MiB/);
});

test("normalizes live Gemini 4 Argon Dialectical H1 Hodge negotiation packet with exact evaluation parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_dialectical_h1_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");

  // Verify 3 specialist sub-agent logons in G01
  const specialistLogons = packet.logons.filter((lg) =>
    lg.label.startsWith("Specialist Sub-Agent:"),
  );
  assert.equal(specialistLogons.length, 3);

  // Verify Cycle 0 H^1 Obstruction -> Cycle 1 Hodge-Harmonic Negotiation feedback edge
  const h1PreLogon = packet.logons.find((lg) =>
    lg.label.includes("Cycle 0 H^1 Topological Obstruction"),
  );
  const h1PostLogon = packet.logons.find((lg) =>
    lg.label.includes("Cycle 1 Hodge-Harmonic Negotiation Cleared"),
  );
  assert.ok(h1PreLogon, "Expected Cycle 0 H^1 Obstruction logon");
  assert.ok(h1PostLogon, "Expected Cycle 1 Hodge-Harmonic Negotiation Cleared logon");
  assert.equal(h1PreLogon.status, "contradiction");
  assert.equal(h1PostLogon.status, "supported");

  const feedbackEdge = packet.edges.find(
    (e) => e.from === h1PreLogon.id && e.to === h1PostLogon.id && e.kind === "feedback",
  );
  assert.ok(feedbackEdge, "Expected kind='feedback' edge from Cycle 0 H^1 Obstruction to Cycle 1 Hodge Negotiation");
});

test("verifies Persistent Governance Court Ledger SHA-256 hash chain and detects tampering", async () => {
  const {
    computeLedgerEntryDigest,
    verifyGovernanceCourtLedgerChain,
    GOVERNANCE_LEDGER_DDL,
  } = await import("../lib/governance-ledger.ts");

  assert.match(GOVERNANCE_LEDGER_DDL, /CREATE TABLE IF NOT EXISTS governance_court_runs/);
  assert.match(GOVERNANCE_LEDGER_DDL, /CREATE TABLE IF NOT EXISTS differential_shock_timeline/);

  const run1Digest = computeLedgerEntryDigest({
    runId: "run:dialectical-h1:001",
    packetId: "pkt:h1:001",
    studyName: "DeepSpace_Bus_Dialectical_H1",
    runMode: "dialectical_h1",
    modelUsed: "gemini-4-argon",
    interactionId: "int-h1-001",
    selectedOptionId: "sub_structures_mass",
    policyStatus: "eligible",
    finalStateDigest: "sha256:aaaa1111",
    priorQuarantinedStateDigest: "sha256:0000ffff",
    previousRunDigest: null,
  });

  const run2Digest = computeLedgerEntryDigest({
    runId: "run:sysml-cosim:002",
    packetId: "pkt:sysml:002",
    studyName: "Artemis_Lunar_6DOF_Manipulator_SysML",
    runMode: "sysml_shock_cosim",
    modelUsed: "gemini-4-argon",
    interactionId: "int-sysml-002",
    selectedOptionId: "sysml_hybridsupercapharmonicdrivearm",
    policyStatus: "eligible",
    finalStateDigest: "sha256:bbbb2222",
    priorQuarantinedStateDigest: "sha256:cccc3333",
    previousRunDigest: run1Digest,
  });

  const runs = [
    {
      runId: "run:dialectical-h1:001",
      packetId: "pkt:h1:001",
      studyName: "DeepSpace_Bus_Dialectical_H1",
      runMode: "dialectical_h1",
      modelUsed: "gemini-4-argon",
      interactionId: "int-h1-001",
      thinkingLevel: "high",
      selectedOptionId: "sub_structures_mass",
      selectedOptionName: "Iso-Grid Carbon-SiC Primary Truss",
      policyStatus: "eligible",
      runtimeStatus: "eligible",
      nextTransition: "release_review",
      preBeta1: 1,
      postBeta1: 0,
      dirichletEnergy: 0.0,
      coboundaryNorm: 0.0,
      kuramotoOrderR: 0.99,
      causalEmergenceDeltaEi: 1.42,
      finalStateDigest: "sha256:aaaa1111",
      priorQuarantinedStateDigest: "sha256:0000ffff",
      previousRunDigest: null,
      ledgerEntryDigest: run1Digest,
      isSigned: true,
      signerName: "Dr. Elena Vance",
      signerRole: "PEO Deep Space",
      proofPacketJson: "{}",
      createdAt: "2026-10-15T14:00:00Z",
    },
    {
      runId: "run:sysml-cosim:002",
      packetId: "pkt:sysml:002",
      studyName: "Artemis_Lunar_6DOF_Manipulator_SysML",
      runMode: "sysml_shock_cosim",
      modelUsed: "gemini-4-argon",
      interactionId: "int-sysml-002",
      thinkingLevel: "high",
      selectedOptionId: "sysml_hybridsupercapharmonicdrivearm",
      selectedOptionName: "HybridSupercapHarmonicDriveArm_ThinWallTiB2_v2",
      policyStatus: "eligible",
      runtimeStatus: "eligible",
      nextTransition: "release_review",
      preBeta1: 0,
      postBeta1: 0,
      dirichletEnergy: 0.0,
      coboundaryNorm: 0.0,
      kuramotoOrderR: 1.0,
      causalEmergenceDeltaEi: 1.25,
      finalStateDigest: "sha256:bbbb2222",
      priorQuarantinedStateDigest: "sha256:cccc3333",
      previousRunDigest: run1Digest,
      ledgerEntryDigest: run2Digest,
      isSigned: false,
      signerName: null,
      signerRole: "PEO Artemis Surface Systems",
      proofPacketJson: "{}",
      createdAt: "2026-10-15T14:05:00Z",
    },
  ];

  const eventsByRunId = {
    "run:dialectical-h1:001": [
      {
        runId: "run:dialectical-h1:001",
        optionId: "sub_structures_mass",
        sequenceNumber: 1,
        eventId: "event:run-opened",
        eventType: "run_opened",
        occurredAt: "2026-10-15T14:00:00Z",
        previousEventDigest: null,
        eventDigest: "sha256:ev1",
        payloadJson: "{}",
      },
      {
        runId: "run:dialectical-h1:001",
        optionId: "sub_structures_mass",
        sequenceNumber: 2,
        eventId: "event:proposal-recorded",
        eventType: "proposal_recorded",
        occurredAt: "2026-10-15T14:00:00Z",
        previousEventDigest: "sha256:ev1",
        eventDigest: "sha256:ev2",
        payloadJson: "{}",
      },
    ],
  };

  const validReport = verifyGovernanceCourtLedgerChain(runs, eventsByRunId);
  assert.equal(validReport.isValid, true);
  assert.equal(validReport.totalRunsVerified, 2);
  assert.equal(validReport.totalEventsVerified, 2);
  assert.equal(validReport.headLedgerDigest, run2Digest);

  // Tamper with run 2 policyStatus
  const tamperedRuns = structuredClone(runs);
  tamperedRuns[1].policyStatus = "authorized";
  const tamperedReport = verifyGovernanceCourtLedgerChain(tamperedRuns, eventsByRunId);
  assert.equal(tamperedReport.isValid, false);
  assert.deepEqual(tamperedReport.brokenRunIds, ["run:sysml-cosim:002"]);
});

test("normalizes live Gemini 4 Argon Inter-Dimensional Wormhole Homology & Multi-Substrate packet with exact parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_wormhole_homology_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.equal(packet.logons.length, 6);
  assert.equal(packet.edges.length, 5);

  const l02 = packet.logons.find((lg) => lg.id === "L02");
  const l03 = packet.logons.find((lg) => lg.id === "L03");
  const l06 = packet.logons.find((lg) => lg.id === "L06");
  assert.ok(l02 && l02.label.includes("α=0.00"));
  assert.ok(l03 && l03.label.includes("α=1.00"));
  assert.ok(l06 && l06.label.includes("PROVED_THEOREM"));

  const feedbackEdge = packet.edges.find(
    (e) => e.from === "L02" && e.to === "L03" && e.kind === "feedback",
  );
  assert.ok(feedbackEdge);
});

test("normalizes live Gemini 4 Argon Persistent Homology & Ollivier-Ricci Surgery packet with exact parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_ricci_surgery_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.equal(packet.logons.length, 6);
  assert.equal(packet.edges.length, 5);

  const l02 = packet.logons.find((lg) => lg.id === "L02");
  const l03 = packet.logons.find((lg) => lg.id === "L03");
  const l04 = packet.logons.find((lg) => lg.id === "L04");
  const l06 = packet.logons.find((lg) => lg.id === "L06");
  assert.ok(l02 && l02.label.includes("Neck-Pinch QUARANTINE"));
  assert.ok(l03 && l03.label.includes("Hamilton-Perelman Ricci Surgery"));
  assert.ok(l04 && l04.label.includes("Persistence Barcode Separation"));
  assert.ok(l06 && l06.label.includes("Bottleneck Stability"));

  const feedbackEdge = packet.edges.find(
    (e) => e.from === "L02" && e.to === "L03" && e.kind === "feedback",
  );
  assert.ok(feedbackEdge);
});

test("normalizes live Gemini 4 Argon Non-Hermitian Skin Effect & Exceptional Point PT-Symmetry packet with exact parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_non_hermitian_pt_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.equal(packet.logons.length, 6);
  assert.equal(packet.edges.length, 5);

  const l02 = packet.logons.find((lg) => lg.id === "L02");
  const l03 = packet.logons.find((lg) => lg.id === "L03");
  const l04 = packet.logons.find((lg) => lg.id === "L04");
  const l06 = packet.logons.find((lg) => lg.id === "L06");
  assert.ok(l02 && l02.label.includes("PT-Broken & NHSE Skin Pileup QUARANTINE"));
  assert.ok(l03 && l03.label.includes("GBZ Imaginary Gauge & PT Stabilization"));
  assert.ok(l04 && l04.label.includes("NHSE Skin Delocalization"));
  assert.ok(l06 && l06.label.includes("Unbroken PT-Symmetry"));

  const feedbackEdge = packet.edges.find(
    (e) => e.from === "L02" && e.to === "L03" && e.kind === "feedback",
  );
  assert.ok(feedbackEdge);
});

test("normalizes live Gemini 4 Argon SOL Continuum Discovery & Change Observatory packet with exact parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_sol_continuum_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.equal(packet.logons.length, 6);
  assert.equal(packet.edges.length, 5);
  assert.ok(packet.observatory_context);
  assert.equal(packet.observatory_context.schema_version, "1.0");
  assert.equal(packet.observatory_context.workflow_version, "v2.0-gemini4-proved-discovery-guild");

  const l02 = packet.logons.find((lg) => lg.id === "L02");
  const l03 = packet.logons.find((lg) => lg.id === "L03");
  const l04 = packet.logons.find((lg) => lg.id === "L04");
  const l05 = packet.logons.find((lg) => lg.id === "L05");
  const l06 = packet.logons.find((lg) => lg.id === "L06");
  assert.ok(l02 && l02.label.includes("Unproved Conjecture & Curriculum Drift QUARANTINE"));
  assert.ok(l03 && l03.label.includes("Conjecture Proved & WGSL Verified"));
  assert.ok(l04 && l04.label.includes("Guild Curriculum Evolution & Epistemic Gain"));
  assert.ok(l05 && l05.label.includes("SOL Change Observatory Schema-1.0 Archive"));
  assert.ok(l06 && l06.label.includes("Zero-Trust Discovery Gate ELIGIBLE"));

  const exported = createProofPacket(packet, "2026-10-15T22:00:00.000Z");
  assert.deepEqual(exported.observatory_context, packet.observatory_context);
  assert.ok(packet.frontier_k_verification);
  assert.equal(packet.frontier_k_verification.formal_proof_certificate.verdict, "PROVED_THEOREM");
  assert.equal(packet.frontier_k_verification.metaplasticity_report.is_healed, true);
  assert.ok(packet.frontier_k_verification.metaplasticity_report.perturbed_max_cond > 100.0);
  assert.ok(packet.frontier_k_verification.metaplasticity_report.repaired_max_cond <= 100.0);
  assert.ok(packet.reasoning_telemetry);
  assert.deepEqual(exported.frontier_k_verification, packet.frontier_k_verification);
  assert.ok(packet.frontier_n_verification);
  assert.equal(packet.frontier_n_verification.autopoietic_loop_verified, true);
  assert.equal(packet.frontier_n_verification.epistemic_gap_intake.core_immutability_verified, true);
  assert.equal(
    packet.frontier_n_verification.bilateral_entangler_control.cycle0_control.nudge_rejection_reason,
    "msf_unstable",
  );
  assert.equal(
    packet.frontier_n_verification.statistical_evolution_governance.self_train_gatekeeper.accepted,
    true,
  );
  assert.deepEqual(exported.frontier_n_verification, packet.frontier_n_verification);
  assert.deepEqual(exported.reasoning_telemetry, packet.reasoning_telemetry);
});

test("normalizes live Gemini 4 Argon Lumina Coding Library & Ranger Corps Sovereign Observatory packet with exact parity", async () => {
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(
    new URL("../samples/live_gemini4_lumina_ranger_packet.json", import.meta.url),
    "utf-8",
  );
  const parsed = parsePacketJson(raw);
  const packet = requirePacket(parsed);

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.claimed_evaluation_match, true);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.equal(packet.logons.length, 6);
  assert.equal(packet.edges.length, 5);
  assert.ok(packet.observatory_context);
  assert.equal(packet.observatory_context.schema_version, "1.0");
  assert.equal(packet.observatory_context.workflow_version, "v2.0-lumina-ranger-court-observatory");
  assert.ok(packet.lumina_sovereign_context);
  assert.equal(packet.lumina_sovereign_context.mission.mission_id, "L12_WIDEWORD_PDM_PATROL_001");
  assert.equal(
    packet.lumina_sovereign_context.staged_component.verification_status,
    "AWAITING_OBSERVATORY_REVIEW",
  );
  assert.equal(packet.lumina_sovereign_context.staged_component.review_status, "awaiting_review");
  assert.deepEqual(
    packet.lumina_sovereign_context.command_protocol_trace.map((step) => step.verb),
    ["PROPOSE", "TRAVEL", "INSPECT", "PATCH", "REPORT", "VERIFY", "ARCHIVE", "PROMOTE"],
  );

  const lr02 = packet.logons.find((lg) => lg.id === "LR02");
  const lr03 = packet.logons.find((lg) => lg.id === "LR03");
  const lr04 = packet.logons.find((lg) => lg.id === "LR04");
  const lr05 = packet.logons.find((lg) => lg.id === "LR05");
  const lr06 = packet.logons.find((lg) => lg.id === "LR06");
  assert.ok(lr02 && lr02.label.includes("Cycle 0 PhaseRanger Drift & Mass Violation Intercepted"));
  assert.ok(lr03 && lr03.label.includes("Bounded Frontier Calibration & PhaseRanger Patrol"));
  assert.ok(lr04 && lr04.label.includes("PromotionCourt & FinalizationRanger 25-Gate Verification"));
  assert.ok(lr05 && lr05.label.includes("Lumina Coding Library Vault Staging & Rule 7 Lesson Law"));
  assert.ok(lr06 && lr06.label.includes("SOL Change Observatory Archive & Sovereign Gate ELIGIBLE"));

  const exported = createProofPacket(packet, "2026-10-16T08:00:00.000Z");
  assert.deepEqual(exported.observatory_context, packet.observatory_context);
  assert.deepEqual(exported.lumina_sovereign_context, packet.lumina_sovereign_context);
  assert.ok(packet.frontier_l_verification);
  assert.equal(
    packet.frontier_l_verification.circuit_to_wideword_lowering.vm_executions["32bit"].oracle_match,
    true,
  );
  assert.equal(
    packet.frontier_l_verification.circuit_to_wideword_lowering.vm_executions["32bit"].circuit_truth_table_match,
    true,
  );
  assert.deepEqual(
    packet.frontier_l_verification.circuit_to_wideword_lowering.vm_executions["32bit"].circuit_outputs,
    { SUM: 1, COUT: 1 },
  );
  assert.equal(
    packet.frontier_l_verification.circuit_to_wideword_lowering.vm_executions["64bit"].oracle_match,
    true,
  );
  assert.equal(
    packet.frontier_l_verification.circuit_to_wideword_lowering.vm_executions["64bit"].circuit_truth_table_match,
    true,
  );
  assert.equal(
    packet.frontier_l_verification.circuit_to_wideword_lowering.micro_isa_summary.program_isa_valid,
    true,
  );
  assert.equal(
    packet.frontier_l_verification.fault_matrix_verification.pipeline_wavefront_fault_matrix.total_cases,
    33,
  );
  assert.equal(
    packet.frontier_l_verification.multimanifold_atomic_commit.commit_status,
    "commit",
  );
  assert.equal(
    packet.frontier_l_verification.sovereign_runtime_shadow.allow_production_execution,
    false,
  );
  assert.deepEqual(exported.frontier_l_verification, packet.frontier_l_verification);
  assert.ok(packet.frontier_n_verification);
  assert.equal(packet.frontier_n_verification.autopoietic_loop_verified, true);
  assert.equal(packet.frontier_n_verification.epistemic_gap_intake.core_immutability_verified, true);
  assert.equal(packet.frontier_n_verification.bilateral_entangler_control.bilateral_lock_verified, true);
  assert.equal(
    packet.frontier_n_verification.statistical_evolution_governance.promotion_statistically_governed,
    true,
  );
  assert.deepEqual(exported.frontier_n_verification, packet.frontier_n_verification);
  assert.ok(packet.reasoning_telemetry);
  assert.deepEqual(exported.reasoning_telemetry, packet.reasoning_telemetry);

  // Verify tamper/malformed rejection for frontier_l_verification
  const nonObjectFrontierL = structuredClone(exported);
  nonObjectFrontierL.frontier_l_verification = "tampered";
  const resNonObj = normalizePacket(nonObjectFrontierL);
  assert.equal(resNonObj.ok, false);
  assert.match(resNonObj.errors.join(" "), /frontier_l_verification must be an object/);

  const badSectionFrontierL = structuredClone(exported);
  badSectionFrontierL.frontier_l_verification.fault_matrix_verification = [];
  const resBadSection = normalizePacket(badSectionFrontierL);
  assert.equal(resBadSection.ok, false);
  assert.match(
    resBadSection.errors.join(" "),
    /frontier_l_verification\.fault_matrix_verification must be an object/,
  );

  const prodTamperedFrontierL = structuredClone(exported);
  prodTamperedFrontierL.frontier_l_verification.sovereign_runtime_shadow.allow_production_execution = true;
  const resProdTamper = normalizePacket(prodTamperedFrontierL);
  assert.equal(resProdTamper.ok, false);
  assert.match(
    resProdTamper.errors.join(" "),
    /sovereign_runtime_shadow\.allow_production_execution must be false/,
  );

  // Verify tamper/malformed rejection for frontier_n_verification
  const nonObjectFrontierN = structuredClone(exported);
  nonObjectFrontierN.frontier_n_verification = "tampered";
  const resNonObjN = normalizePacket(nonObjectFrontierN);
  assert.equal(resNonObjN.ok, false);
  assert.match(resNonObjN.errors.join(" "), /frontier_n_verification must be an object/);

  const immutabilityTamperedFrontierN = structuredClone(exported);
  immutabilityTamperedFrontierN.frontier_n_verification.epistemic_gap_intake.core_immutability_verified = false;
  const resImmutabilityTamper = normalizePacket(immutabilityTamperedFrontierN);
  assert.equal(resImmutabilityTamper.ok, false);
  assert.match(
    resImmutabilityTamper.errors.join(" "),
    /epistemic_gap_intake\.core_immutability_verified must be true/,
  );

  const dreamTamperedFrontierN = structuredClone(exported);
  dreamTamperedFrontierN.frontier_n_verification.bimodal_dream_consolidation.bimodal_synapse_verified = false;
  const resDreamTamper = normalizePacket(dreamTamperedFrontierN);
  assert.equal(resDreamTamper.ok, false);
  assert.match(
    resDreamTamper.errors.join(" "),
    /bimodal_dream_consolidation\.bimodal_synapse_verified must be true/,
  );

  const msfTamperedFrontierN = structuredClone(exported);
  msfTamperedFrontierN.frontier_n_verification.bilateral_entangler_control.transverse_msf_lambda_hat = 0.05;
  const resMsfTamper = normalizePacket(msfTamperedFrontierN);
  assert.equal(resMsfTamper.ok, false);
  assert.match(
    resMsfTamper.errors.join(" "),
    /transverse_msf_lambda_hat must be a finite non-positive number/,
  );

  const statTamperedFrontierN = structuredClone(exported);
  statTamperedFrontierN.frontier_n_verification.statistical_evolution_governance.promotion_statistically_governed = false;
  const resStatTamper = normalizePacket(statTamperedFrontierN);
  assert.equal(resStatTamper.ok, false);
  assert.match(
    resStatTamper.errors.join(" "),
    /statistical_evolution_governance\.promotion_statistically_governed must be true/,
  );
});

test("validates and round-trips Frontier O WGSL Decision Prover & SOL Change Producer packet (live_gemini4_wgsl_decision_prover_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_wgsl_decision_prover_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.observatory_context);
  assert.equal(
    packet.observatory_context.conditions.study_name,
    "NGCV_WGSL_Pareto_MSCK_Inflection_Study_v1",
  );
  assert.equal(packet.observatory_context.conditions.wgsl_shader_name, "decision_prover.wgsl");

  assert.ok(packet.frontier_o_verification);
  assert.equal(packet.frontier_o_verification.wgsl_decision_prover_verified, true);
  assert.equal(packet.frontier_o_verification.shader_validation.is_valid, true);
  assert.equal(packet.frontier_o_verification.trade_space_sweep.total_grid_cells, 4096);
  assert.equal(packet.frontier_o_verification.trade_space_sweep.num_permutations, 10000);
  assert.ok(packet.frontier_o_verification.trade_space_sweep.speedup_factor > 1);
  assert.equal(
    packet.frontier_o_verification.msck_inflection_prover.cycle0_frustrated_point.effective_beta_1,
    1,
  );
  assert.equal(
    packet.frontier_o_verification.msck_inflection_prover.cycle1_harmonic_point.effective_beta_1,
    0,
  );
  assert.ok(
    Array.isArray(packet.frontier_o_verification.msck_inflection_prover.assumption_inflection_points),
  );
  assert.equal(packet.frontier_o_verification.repeat_trial_governance.comparability, "compatible");
  assert.equal(packet.frontier_o_verification.repeat_trial_governance.overall_outcome, "improved");
  assert.equal(
    packet.frontier_o_verification.repeat_trial_governance.evidence_stats.statistically_significant_95,
    true,
  );
  assert.ok(packet.frontier_o_verification.sol_change_handoff);
  assert.equal(packet.frontier_o_verification.sol_change_handoff.review_status, "awaiting_review");
  assert.equal(packet.frontier_o_verification.sol_change_handoff.measured_cost_usd, null);
  assert.ok(packet.frontier_o_verification.sol_change_handoff.cli_commands.compare);

  const exported = createProofPacket(packet, "2026-10-22T16:00:00.000Z");
  assert.deepEqual(exported.frontier_o_verification, packet.frontier_o_verification);

  // Tamper checks for frontier_o_verification
  const nonObjFrontierO = structuredClone(exported);
  nonObjFrontierO.frontier_o_verification = "tampered";
  const resNonObjO = normalizePacket(nonObjFrontierO);
  assert.equal(resNonObjO.ok, false);
  assert.match(resNonObjO.errors.join(" "), /frontier_o_verification must be an object/);

  const unverifiedFrontierO = structuredClone(exported);
  unverifiedFrontierO.frontier_o_verification.wgsl_decision_prover_verified = false;
  const resUnverifiedO = normalizePacket(unverifiedFrontierO);
  assert.equal(resUnverifiedO.ok, false);
  assert.match(
    resUnverifiedO.errors.join(" "),
    /frontier_o_verification\.wgsl_decision_prover_verified must be true/,
  );

  const badShaderFrontierO = structuredClone(exported);
  badShaderFrontierO.frontier_o_verification.shader_validation.is_valid = false;
  const resBadShaderO = normalizePacket(badShaderFrontierO);
  assert.equal(resBadShaderO.ok, false);
  assert.match(
    resBadShaderO.errors.join(" "),
    /frontier_o_verification\.shader_validation\.is_valid must be true/,
  );

  const badSweepFrontierO = structuredClone(exported);
  badSweepFrontierO.frontier_o_verification.trade_space_sweep = "invalid";
  const resBadSweepO = normalizePacket(badSweepFrontierO);
  assert.equal(resBadSweepO.ok, false);
  assert.match(
    resBadSweepO.errors.join(" "),
    /frontier_o_verification\.trade_space_sweep must be an object/,
  );

  const badCycle1FrontierO = structuredClone(exported);
  badCycle1FrontierO.frontier_o_verification.cycle1_audit.is_quarantined = true;
  const resBadCycle1O = normalizePacket(badCycle1FrontierO);
  assert.equal(resBadCycle1O.ok, false);
  assert.match(
    resBadCycle1O.errors.join(" "),
    /frontier_o_verification\.cycle1_audit\.is_quarantined must be false/,
  );

  const badTrialsFrontierO = structuredClone(exported);
  badTrialsFrontierO.frontier_o_verification.repeat_trial_governance.trial_count = 2;
  const resBadTrialsO = normalizePacket(badTrialsFrontierO);
  assert.equal(resBadTrialsO.ok, false);
  assert.match(
    resBadTrialsO.errors.join(" "),
    /frontier_o_verification\.repeat_trial_governance\.trial_count must be an integer >= 3/,
  );

  const badHandoffFrontierO = structuredClone(exported);
  badHandoffFrontierO.frontier_o_verification.sol_change_handoff.review_status = "approved";
  const resBadHandoffO = normalizePacket(badHandoffFrontierO);
  assert.equal(resBadHandoffO.ok, false);
  assert.match(
    resBadHandoffO.errors.join(" "),
    /frontier_o_verification\.sol_change_handoff\.review_status must be awaiting_review/,
  );
});

test("validates and round-trips Frontier P Multi-Robot Swarm Cohomology & 25kg Bimanual Manipulation packet (live_gemini4_swarm_cohomology_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_swarm_cohomology_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.observatory_context);
  assert.equal(
    packet.observatory_context.conditions.study_name,
    "Frontier_P_Bimanual_25kg_Swarm_Cohomology",
  );
  assert.equal(packet.observatory_context.conditions.payload_mass_kg, 25.0);
  assert.equal(packet.observatory_context.conditions.num_robots, 2);

  assert.ok(packet.frontier_p_verification);
  assert.equal(packet.frontier_p_verification.swarm_cohomology_verified, true);
  assert.equal(packet.frontier_p_verification.fleet_kinematics_and_payload.payload_mass_kg, 25.0);
  assert.equal(packet.frontier_p_verification.fleet_kinematics_and_payload.num_robots, 2);
  assert.equal(packet.frontier_p_verification.fleet_kinematics_and_payload.total_dof, 12);
  assert.equal(packet.frontier_p_verification.decentralized_se3_holonomy.gps_or_mocap_required, false);
  assert.equal(packet.frontier_p_verification.closed_chain_sheaf_audit.cycle0_effective_beta_1, 1);
  assert.equal(packet.frontier_p_verification.closed_chain_sheaf_audit.cycle1_effective_beta_1, 0);
  assert.ok(
    packet.frontier_p_verification.closed_chain_sheaf_audit.cycle0_internal_squeeze_wrench_n > 15.0,
  );
  assert.ok(
    packet.frontier_p_verification.closed_chain_sheaf_audit.cycle1_internal_squeeze_wrench_n <= 15.0,
  );
  assert.ok(
    packet.frontier_p_verification.decentralized_se3_holonomy.cycle0_rotational_defect_deg > 3.0,
  );
  assert.ok(
    packet.frontier_p_verification.decentralized_se3_holonomy.cycle1_rotational_defect_deg <= 3.0,
  );
  assert.ok(packet.frontier_p_verification.estop_safety_arbiter.estop_latency_us <= 200.0);
  assert.equal(packet.frontier_p_verification.estop_safety_arbiter.cycle0_estop_triggered, true);
  assert.equal(packet.frontier_p_verification.estop_safety_arbiter.cycle1_estop_triggered, false);
  assert.equal(packet.frontier_p_verification.cycle1_audit.is_quarantined, false);
  assert.equal(packet.frontier_p_verification.cycle1_audit.policy_status, "ELIGIBLE");
  assert.equal(packet.frontier_p_verification.sol_change_handoff.review_status, "awaiting_review");

  const exported = createProofPacket(packet, "2026-10-22T16:30:00.000Z");
  assert.deepEqual(exported.frontier_p_verification, packet.frontier_p_verification);

  // Tamper checks for frontier_p_verification
  const nonObjFrontierP = structuredClone(exported);
  nonObjFrontierP.frontier_p_verification = "tampered";
  const resNonObjP = normalizePacket(nonObjFrontierP);
  assert.equal(resNonObjP.ok, false);
  assert.match(resNonObjP.errors.join(" "), /frontier_p_verification must be an object/);

  const lowPayloadP = structuredClone(exported);
  lowPayloadP.frontier_p_verification.fleet_kinematics_and_payload.payload_mass_kg = 20.0;
  const resLowPayloadP = normalizePacket(lowPayloadP);
  assert.equal(resLowPayloadP.ok, false);
  assert.match(
    resLowPayloadP.errors.join(" "),
    /frontier_p_verification\.fleet_kinematics_and_payload\.payload_mass_kg must be a finite number >= 25\.0/,
  );

  const gpsRequiredP = structuredClone(exported);
  gpsRequiredP.frontier_p_verification.decentralized_se3_holonomy.gps_or_mocap_required = true;
  const resGpsP = normalizePacket(gpsRequiredP);
  assert.equal(resGpsP.ok, false);
  assert.match(
    resGpsP.errors.join(" "),
    /frontier_p_verification\.decentralized_se3_holonomy\.gps_or_mocap_required must be false/,
  );

  const highSqueezeP = structuredClone(exported);
  highSqueezeP.frontier_p_verification.closed_chain_sheaf_audit.cycle1_internal_squeeze_wrench_n = 18.5;
  const resHighSqueezeP = normalizePacket(highSqueezeP);
  assert.equal(resHighSqueezeP.ok, false);
  assert.match(
    resHighSqueezeP.errors.join(" "),
    /frontier_p_verification\.closed_chain_sheaf_audit\.cycle1_internal_squeeze_wrench_n must be between 0 and 15\.0 N/,
  );

  const highRotP = structuredClone(exported);
  highRotP.frontier_p_verification.decentralized_se3_holonomy.cycle1_rotational_defect_deg = 4.2;
  const resHighRotP = normalizePacket(highRotP);
  assert.equal(resHighRotP.ok, false);
  assert.match(
    resHighRotP.errors.join(" "),
    /frontier_p_verification\.decentralized_se3_holonomy\.cycle1_rotational_defect_deg must be between 0 and 3\.0 deg/,
  );

  const slowEstopP = structuredClone(exported);
  slowEstopP.frontier_p_verification.estop_safety_arbiter.estop_latency_us = 250.0;
  const resSlowEstopP = normalizePacket(slowEstopP);
  assert.equal(resSlowEstopP.ok, false);
  assert.match(
    resSlowEstopP.errors.join(" "),
    /frontier_p_verification\.estop_safety_arbiter\.estop_latency_us must be between 0 and 200\.0 us/,
  );

  const cycle0EstopNotTriggeredP = structuredClone(exported);
  cycle0EstopNotTriggeredP.frontier_p_verification.estop_safety_arbiter.cycle0_estop_triggered = false;
  const resCycle0EstopNotTriggeredP = normalizePacket(cycle0EstopNotTriggeredP);
  assert.equal(resCycle0EstopNotTriggeredP.ok, false);
  assert.match(
    resCycle0EstopNotTriggeredP.errors.join(" "),
    /frontier_p_verification\.estop_safety_arbiter\.cycle0_estop_triggered must be true/,
  );

  const highTransP = structuredClone(exported);
  highTransP.frontier_p_verification.decentralized_se3_holonomy.cycle1_translational_defect_mm = 7.5;
  const resHighTransP = normalizePacket(highTransP);
  assert.equal(resHighTransP.ok, false);
  assert.match(
    resHighTransP.errors.join(" "),
    /frontier_p_verification\.decentralized_se3_holonomy\.cycle1_translational_defect_mm must be between 0 and 5\.0 mm/,
  );

  const estopTriggeredP = structuredClone(exported);
  estopTriggeredP.frontier_p_verification.estop_safety_arbiter.cycle1_estop_triggered = true;
  const resEstopTriggeredP = normalizePacket(estopTriggeredP);
  assert.equal(resEstopTriggeredP.ok, false);
  assert.match(
    resEstopTriggeredP.errors.join(" "),
    /frontier_p_verification\.estop_safety_arbiter\.cycle1_estop_triggered must be false/,
  );

  const cycle1QuarantinedP = structuredClone(exported);
  cycle1QuarantinedP.frontier_p_verification.cycle1_audit.is_quarantined = true;
  const resCycle1QuarantinedP = normalizePacket(cycle1QuarantinedP);
  assert.equal(resCycle1QuarantinedP.ok, false);
  assert.match(
    resCycle1QuarantinedP.errors.join(" "),
    /frontier_p_verification\.cycle1_audit\.is_quarantined must be false/,
  );
});

test("validates and round-trips Frontier Q Unified Manifold Operating Kernel & Zero-Copy CAN Bridge packet (live_gemini4_umok_edge_kernel_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_umok_edge_kernel_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.observatory_context);
  assert.equal(
    packet.observatory_context.conditions.study_name,
    "Frontier_Q_UMOK_Sub_Microsecond_Edge_Kernel",
  );

  assert.ok(packet.frontier_q_verification);
  assert.equal(packet.frontier_q_verification.umok_kernel_verified, true);
  assert.equal(packet.frontier_q_verification.geodesic_verlet_kernel.steps_executed, 2048);
  assert.ok(
    packet.frontier_q_verification.geodesic_verlet_kernel.cycle0_mean_step_latency_us > 1.0,
  );
  assert.ok(
    packet.frontier_q_verification.geodesic_verlet_kernel.cycle1_mean_step_latency_us <= 1.0,
  );
  assert.equal(packet.frontier_q_verification.geodesic_verlet_kernel.lock_free_c_buffer, true);
  assert.equal(
    packet.frontier_q_verification.geodesic_verlet_kernel.zero_heap_allocations_verified,
    true,
  );
  assert.equal(packet.frontier_q_verification.riemannian_alu_verification.all_gates_passed, true);
  assert.equal(packet.frontier_q_verification.riemannian_alu_verification.passed_cases, 20);
  assert.equal(packet.frontier_q_verification.riemannian_alu_verification.mismatch_count, 0);
  assert.equal(packet.frontier_q_verification.zero_copy_ipc_can_bridge.zero_copy_verified, true);
  assert.equal(
    packet.frontier_q_verification.zero_copy_ipc_can_bridge.cycle0_crc_or_seq_fault_detected,
    true,
  );
  assert.equal(
    packet.frontier_q_verification.zero_copy_ipc_can_bridge.cycle1_crc32_verified,
    true,
  );
  assert.equal(packet.frontier_q_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(
    packet.frontier_q_verification.eligibility_interlock.cycle0_safe_state_triggered,
    true,
  );
  assert.equal(
    packet.frontier_q_verification.eligibility_interlock.cycle1_safe_state_triggered,
    false,
  );
  assert.equal(
    packet.frontier_q_verification.eligibility_interlock.cycle1_staged_frames_count,
    4,
  );
  assert.equal(packet.frontier_q_verification.cycle1_audit.is_quarantined, false);
  assert.equal(packet.frontier_q_verification.cycle1_audit.policy_status, "ELIGIBLE");
  assert.equal(packet.frontier_q_verification.sol_change_handoff.review_status, "awaiting_review");

  const exported = createProofPacket(packet, "2026-10-22T17:00:00.000Z");
  assert.deepEqual(exported.frontier_q_verification, packet.frontier_q_verification);

  // Tamper checks for frontier_q_verification
  const nonObjFrontierQ = structuredClone(exported);
  nonObjFrontierQ.frontier_q_verification = "tampered";
  const resNonObjQ = normalizePacket(nonObjFrontierQ);
  assert.equal(resNonObjQ.ok, false);
  assert.match(resNonObjQ.errors.join(" "), /frontier_q_verification must be an object/);

  const slowKernelQ = structuredClone(exported);
  slowKernelQ.frontier_q_verification.geodesic_verlet_kernel.cycle1_mean_step_latency_us = 1.45;
  const resSlowKernelQ = normalizePacket(slowKernelQ);
  assert.equal(resSlowKernelQ.ok, false);
  assert.match(
    resSlowKernelQ.errors.join(" "),
    /frontier_q_verification\.geodesic_verlet_kernel\.cycle1_mean_step_latency_us must be between 0 and 1\.0 us/,
  );

  const authClaimedQ = structuredClone(exported);
  authClaimedQ.frontier_q_verification.eligibility_interlock.authorized_claimed = true;
  const resAuthClaimedQ = normalizePacket(authClaimedQ);
  assert.equal(resAuthClaimedQ.ok, false);
  assert.match(
    resAuthClaimedQ.errors.join(" "),
    /frontier_q_verification\.eligibility_interlock\.authorized_claimed must be false/,
  );

  const aluMismatchQ = structuredClone(exported);
  aluMismatchQ.frontier_q_verification.riemannian_alu_verification.passed_cases = 19;
  const resAluMismatchQ = normalizePacket(aluMismatchQ);
  assert.equal(resAluMismatchQ.ok, false);
  assert.match(
    resAluMismatchQ.errors.join(" "),
    /frontier_q_verification\.riemannian_alu_verification\.passed_cases must be an integer >= 20/,
  );

  const zeroCopyFailedQ = structuredClone(exported);
  zeroCopyFailedQ.frontier_q_verification.zero_copy_ipc_can_bridge.zero_copy_verified = false;
  const resZeroCopyFailedQ = normalizePacket(zeroCopyFailedQ);
  assert.equal(resZeroCopyFailedQ.ok, false);
  assert.match(
    resZeroCopyFailedQ.errors.join(" "),
    /frontier_q_verification\.zero_copy_ipc_can_bridge\.zero_copy_verified must be true/,
  );

  const cycle1QuarantinedQ = structuredClone(exported);
  cycle1QuarantinedQ.frontier_q_verification.cycle1_audit.is_quarantined = true;
  const resCycle1QuarantinedQ = normalizePacket(cycle1QuarantinedQ);
  assert.equal(resCycle1QuarantinedQ.ok, false);
  assert.match(
    resCycle1QuarantinedQ.errors.join(" "),
    /frontier_q_verification\.cycle1_audit\.is_quarantined must be false/,
  );
});

test("validates and round-trips Frontier R Mitotic 2D Surface Foliation & Toroidal Surgery packet (live_gemini4_mitotic_foliation_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_mitotic_foliation_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_r_verification);
  assert.equal(packet.frontier_r_verification.mitotic_foliation_verified, true);
  assert.equal(packet.frontier_r_verification.mitotic_surface_fission.cycle1_alpha, 0.5);
  assert.equal(packet.frontier_r_verification.toroidal_surgery_homology.toroidal_genus_g, 1);
  assert.equal(packet.frontier_r_verification.toroidal_surgery_homology.euler_characteristic_chi, 0);
  assert.equal(
    packet.frontier_r_verification.hawking_radiation_memory_sink.sacred_core_immutable,
    true,
  );
  assert.equal(packet.frontier_r_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T12:00:05.000Z");
  assert.deepEqual(exported.frontier_r_verification, packet.frontier_r_verification);

  const unbalancedAlphaR = structuredClone(exported);
  unbalancedAlphaR.frontier_r_verification.mitotic_surface_fission.cycle1_alpha = 0.88;
  const resUnbalancedR = normalizePacket(unbalancedAlphaR);
  assert.equal(resUnbalancedR.ok, false);
  assert.match(
    resUnbalancedR.errors.join(" "),
    /frontier_r_verification\.mitotic_surface_fission\.cycle1_alpha must be balanced in \[0\.45, 0\.55\]/,
  );

  const boundaryAlphaHighR = structuredClone(exported);
  boundaryAlphaHighR.frontier_r_verification.mitotic_surface_fission.cycle1_alpha = 0.55;
  assert.equal(normalizePacket(boundaryAlphaHighR).ok, true);

  const boundaryAlphaLowR = structuredClone(exported);
  boundaryAlphaLowR.frontier_r_verification.mitotic_surface_fission.cycle1_alpha = 0.45;
  assert.equal(normalizePacket(boundaryAlphaLowR).ok, true);

  const badGenusR = structuredClone(exported);
  badGenusR.frontier_r_verification.toroidal_surgery_homology.toroidal_genus_g = 0;
  const resBadGenusR = normalizePacket(badGenusR);
  assert.equal(resBadGenusR.ok, false);
  assert.match(
    resBadGenusR.errors.join(" "),
    /frontier_r_verification\.toroidal_surgery_homology\.toroidal_genus_g must be 1/,
  );
});

test("validates and round-trips Frontier S Coprime STWM Waveguide & MHD-GRU Bus packet (live_gemini4_stwm_wavefront_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_stwm_wavefront_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_s_verification);
  assert.equal(packet.frontier_s_verification.stwm_wavefront_verified, true);
  assert.equal(packet.frontier_s_verification.coprime_quadrature_pdm.passed_cases, 6);
  assert.equal(packet.frontier_s_verification.interlane_prefix_carry.passed_cases, 8);
  assert.equal(packet.frontier_s_verification.hierarchical_waveguide_fabric.passed_32b, 5);
  assert.equal(packet.frontier_s_verification.hierarchical_waveguide_fabric.passed_64b, 5);
  assert.equal(packet.frontier_s_verification.quantum_wavefront_calibration.passed_regimes, 12);
  assert.equal(packet.frontier_s_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T13:00:05.000Z");
  assert.deepEqual(exported.frontier_s_verification, packet.frontier_s_verification);

  const badPdmS = structuredClone(exported);
  badPdmS.frontier_s_verification.coprime_quadrature_pdm.passed_cases = 4;
  const resBadPdmS = normalizePacket(badPdmS);
  assert.equal(resBadPdmS.ok, false);
  assert.match(
    resBadPdmS.errors.join(" "),
    /frontier_s_verification\.coprime_quadrature_pdm\.passed_cases must be an integer >= 6/,
  );

  const badQcalS = structuredClone(exported);
  badQcalS.frontier_s_verification.quantum_wavefront_calibration.passed_regimes = 9;
  const resBadQcalS = normalizePacket(badQcalS);
  assert.equal(resBadQcalS.ok, false);
  assert.match(
    resBadQcalS.errors.join(" "),
    /frontier_s_verification\.quantum_wavefront_calibration\.passed_regimes must be an integer >= 12/,
  );
});

test("validates and round-trips Frontier T Governed RSI & Waveguide Compiler Pass Admission/Replay packet (live_gemini4_rsi_compiler_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_rsi_compiler_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_t_verification);
  assert.equal(packet.frontier_t_verification.rsi_compiler_verified, true);
  assert.equal(
    packet.frontier_t_verification.governed_compiler_invocation.production_mutation_allowed,
    false,
  );
  assert.equal(packet.frontier_t_verification.governed_pass_replay.replay_failed_count, 0);
  assert.equal(packet.frontier_t_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_t_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T14:00:05.000Z");
  assert.deepEqual(exported.frontier_t_verification, packet.frontier_t_verification);

  const badMutT = structuredClone(exported);
  badMutT.frontier_t_verification.governed_compiler_invocation.production_mutation_allowed = true;
  const resBadMutT = normalizePacket(badMutT);
  assert.equal(resBadMutT.ok, false);
  assert.match(
    resBadMutT.errors.join(" "),
    /frontier_t_verification\.governed_compiler_invocation\.production_mutation_allowed must be false/,
  );

  const badReplayT = structuredClone(exported);
  badReplayT.frontier_t_verification.governed_pass_replay.replay_failed_count = 1;
  const resBadReplayT = normalizePacket(badReplayT);
  assert.equal(resBadReplayT.ok, false);
  assert.match(
    resBadReplayT.errors.join(" "),
    /frontier_t_verification\.governed_pass_replay\.replay_failed_count must be 0/,
  );
});

test("validates and round-trips Frontier U Banked HCAM, Cross-Shard Consensus, Geodesic Migration & GC packet (live_gemini4_hcam_shard_consensus_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_hcam_shard_consensus_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_u_verification);
  assert.equal(packet.frontier_u_verification.hcam_shard_verified, true);
  assert.equal(
    packet.frontier_u_verification.hcam_associative_recall.word_assembly_verified,
    true,
  );
  assert.equal(
    packet.frontier_u_verification.cross_shard_consensus.consensus_commit_verified,
    true,
  );
  assert.equal(
    packet.frontier_u_verification.transactional_geodesic_and_migration.route_optimization_passed,
    true,
  );
  assert.equal(
    packet.frontier_u_verification.manifold_garbage_collection.live_root_reclaimed,
    false,
  );
  assert.equal(packet.frontier_u_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_u_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T14:00:05.000Z");
  assert.deepEqual(exported.frontier_u_verification, packet.frontier_u_verification);

  const badGcU = structuredClone(exported);
  badGcU.frontier_u_verification.manifold_garbage_collection.live_root_reclaimed = true;
  const resBadGcU = normalizePacket(badGcU);
  assert.equal(resBadGcU.ok, false);
  assert.match(
    resBadGcU.errors.join(" "),
    /frontier_u_verification\.manifold_garbage_collection\.live_root_reclaimed must be false/,
  );

  const badConsU = structuredClone(exported);
  badConsU.frontier_u_verification.cross_shard_consensus.consensus_commit_verified = false;
  const resBadConsU = normalizePacket(badConsU);
  assert.equal(resBadConsU.ok, false);
  assert.match(
    resBadConsU.errors.join(" "),
    /frontier_u_verification\.cross_shard_consensus\.consensus_commit_verified must be true/,
  );
});

test("validates and round-trips Frontier V Waveguide Arithmetic, Predication, Scoreboard & 4-Core SIMD packet (live_gemini4_waveguide_simd_pipeline_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_waveguide_simd_pipeline_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_v_verification);
  assert.equal(packet.frontier_v_verification.waveguide_simd_verified, true);
  assert.equal(
    packet.frontier_v_verification.waveguide_arithmetic_and_predication.flags_externally_visible,
    false,
  );
  assert.equal(
    packet.frontier_v_verification.scoreboard_and_memory_alias.cycle1_schedule_serial_equivalent,
    true,
  );
  assert.equal(
    packet.frontier_v_verification.simd_multicore_and_route_rebalance.simd_oracle_match,
    true,
  );
  assert.equal(packet.frontier_v_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_v_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T14:15:05.000Z");
  assert.deepEqual(exported.frontier_v_verification, packet.frontier_v_verification);

  const badFlagsV = structuredClone(exported);
  badFlagsV.frontier_v_verification.waveguide_arithmetic_and_predication.flags_externally_visible = true;
  const resBadFlagsV = normalizePacket(badFlagsV);
  assert.equal(resBadFlagsV.ok, false);
  assert.match(
    resBadFlagsV.errors.join(" "),
    /frontier_v_verification\.waveguide_arithmetic_and_predication\.flags_externally_visible must be false/,
  );

  const badSimdV = structuredClone(exported);
  badSimdV.frontier_v_verification.simd_multicore_and_route_rebalance.simd_oracle_match = false;
  const resBadSimdV = normalizePacket(badSimdV);
  assert.equal(resBadSimdV.ok, false);
  assert.match(
    resBadSimdV.errors.join(" "),
    /frontier_v_verification\.simd_multicore_and_route_rebalance\.simd_oracle_match must be true/,
  );
});

test("validates and round-trips Frontier W Sovereign Burn-In, Stability Ledger & Offline Attestation packet (live_gemini4_burnin_attestation_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_burnin_attestation_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_w_verification);
  assert.equal(packet.frontier_w_verification.burnin_attestation_verified, true);
  assert.equal(
    packet.frontier_w_verification.sovereign_burnin_and_stability_ledger.ledger_chain_valid,
    true,
  );
  assert.equal(
    packet.frontier_w_verification.package_archive_digest_attestation.archive_file_digest_match,
    true,
  );
  assert.equal(
    packet.frontier_w_verification.package_archive_digest_attestation.real_signature_claimed,
    false,
  );
  assert.equal(
    packet.frontier_w_verification.offline_consumer_verification_and_final_manifest.final_system_manifest_valid,
    true,
  );
  assert.equal(packet.frontier_w_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_w_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T14:30:05.000Z");
  assert.deepEqual(exported.frontier_w_verification, packet.frontier_w_verification);

  const badSigW = structuredClone(exported);
  badSigW.frontier_w_verification.package_archive_digest_attestation.real_signature_claimed = true;
  const resBadSigW = normalizePacket(badSigW);
  assert.equal(resBadSigW.ok, false);
  assert.match(
    resBadSigW.errors.join(" "),
    /frontier_w_verification\.package_archive_digest_attestation\.real_signature_claimed must be false/,
  );

  const badLedgerW = structuredClone(exported);
  badLedgerW.frontier_w_verification.sovereign_burnin_and_stability_ledger.ledger_chain_valid = false;
  const resBadLedgerW = normalizePacket(badLedgerW);
  assert.equal(resBadLedgerW.ok, false);
  assert.match(
    resBadLedgerW.errors.join(" "),
    /frontier_w_verification\.sovereign_burnin_and_stability_ledger\.ledger_chain_valid must be true/,
  );
});

test("validates and round-trips Frontier X Entangled Multi-Manifold 2PC Epoch, Cadence Skew & Wavefront Alignment packet (live_gemini4_entangled_cadence_wavefront_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_entangled_cadence_wavefront_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_x_verification);
  assert.equal(packet.frontier_x_verification.entangled_cadence_verified, true);
  assert.equal(
    packet.frontier_x_verification.entangled_sequencer_and_atomic_epoch.abort_rollback_verified,
    true,
  );
  assert.equal(
    packet.frontier_x_verification.multimanifold_cadence_and_autonomy_guard.autonomy_bounded,
    true,
  );
  assert.equal(
    packet.frontier_x_verification.wavefront_alignment_and_uncertainty_bounds.uncertainty_within_bounds,
    true,
  );
  assert.equal(packet.frontier_x_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_x_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T15:00:05.000Z");
  assert.deepEqual(exported.frontier_x_verification, packet.frontier_x_verification);

  const badAbortX = structuredClone(exported);
  badAbortX.frontier_x_verification.entangled_sequencer_and_atomic_epoch.abort_rollback_verified = false;
  const resBadAbortX = normalizePacket(badAbortX);
  assert.equal(resBadAbortX.ok, false);
  assert.match(
    resBadAbortX.errors.join(" "),
    /frontier_x_verification\.entangled_sequencer_and_atomic_epoch\.abort_rollback_verified must be true/,
  );

  const badAutonomyX = structuredClone(exported);
  badAutonomyX.frontier_x_verification.multimanifold_cadence_and_autonomy_guard.autonomy_bounded = false;
  const resBadAutonomyX = normalizePacket(badAutonomyX);
  assert.equal(resBadAutonomyX.ok, false);
  assert.match(
    resBadAutonomyX.errors.join(" "),
    /frontier_x_verification\.multimanifold_cadence_and_autonomy_guard\.autonomy_bounded must be true/,
  );
});

test("validates and round-trips Frontier Y Waveguide Channel Library, Layout Optimization & Local Staging packet (live_gemini4_waveguide_channel_staging_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_waveguide_channel_staging_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_y_verification);
  assert.equal(packet.frontier_y_verification.waveguide_channel_staging_verified, true);
  assert.equal(
    packet.frontier_y_verification.waveguide_channel_kernels_and_dependency.cycle1_batch_safe,
    true,
  );
  assert.equal(
    packet.frontier_y_verification.waveguide_channel_kernels_and_dependency.raw_hazard_detected_on_conflict,
    true,
  );
  assert.equal(
    packet.frontier_y_verification.package_assembly_dry_run_and_local_staging.physical_execution_permitted_by_gate,
    false,
  );
  assert.equal(packet.frontier_y_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_y_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T15:15:05.000Z");
  assert.deepEqual(exported.frontier_y_verification, packet.frontier_y_verification);

  const badPhysY = structuredClone(exported);
  badPhysY.frontier_y_verification.package_assembly_dry_run_and_local_staging.physical_execution_permitted_by_gate = true;
  const resBadPhysY = normalizePacket(badPhysY);
  assert.equal(resBadPhysY.ok, false);
  assert.match(
    resBadPhysY.errors.join(" "),
    /frontier_y_verification\.package_assembly_dry_run_and_local_staging\.physical_execution_permitted_by_gate must be false/,
  );

  const badRawY = structuredClone(exported);
  badRawY.frontier_y_verification.waveguide_channel_kernels_and_dependency.raw_hazard_detected_on_conflict = false;
  const resBadRawY = normalizePacket(badRawY);
  assert.equal(resBadRawY.ok, false);
  assert.match(
    resBadRawY.errors.join(" "),
    /frontier_y_verification\.waveguide_channel_kernels_and_dependency\.raw_hazard_detected_on_conflict must be true/,
  );
});

test("validates and round-trips Frontier Z Sovereign Court Promotion, 11-Gate Finalization Docket & System Lockdown packet (live_gemini4_sovereign_court_lockdown_packet.json)", async () => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const samplePath = path.resolve(
    import.meta.dirname,
    "../samples/live_gemini4_sovereign_court_lockdown_packet.json",
  );
  const rawJson = await fs.readFile(samplePath, "utf8");
  const packet = requirePacket(parsePacketJson(rawJson));

  assert.equal(packet.schema, PACKET_SCHEMA_V02);
  assert.equal(packet.evaluation.verdict, "PROMOTE");
  assert.equal(packet.baseline_evaluation.verdict, "QUARANTINE");
  assert.ok(packet.frontier_z_verification);
  assert.equal(packet.frontier_z_verification.sovereign_court_lockdown_verified, true);
  assert.equal(
    packet.frontier_z_verification.court_supervised_promotion_and_docket.auto_promote_allowed,
    false,
  );
  assert.equal(
    packet.frontier_z_verification.court_supervised_promotion_and_docket.production_authority_granted,
    false,
  );
  assert.equal(
    packet.frontier_z_verification.final_gate_registry_and_finalization_docket.all_gates_passed,
    true,
  );
  assert.equal(
    packet.frontier_z_verification.governance_freeze_and_system_lockdown.production_gateway_blocked_verified,
    true,
  );
  assert.equal(packet.frontier_z_verification.eligibility_interlock.allow_production_execution, false);
  assert.equal(packet.frontier_z_verification.eligibility_interlock.authorized_claimed, false);
  assert.equal(packet.frontier_z_verification.cycle1_audit.policy_status, "ELIGIBLE");

  const exported = createProofPacket(packet, "2026-10-23T15:30:05.000Z");
  assert.deepEqual(exported.frontier_z_verification, packet.frontier_z_verification);

  const badAutoZ = structuredClone(exported);
  badAutoZ.frontier_z_verification.court_supervised_promotion_and_docket.auto_promote_allowed = true;
  const resBadAutoZ = normalizePacket(badAutoZ);
  assert.equal(resBadAutoZ.ok, false);
  assert.match(
    resBadAutoZ.errors.join(" "),
    /frontier_z_verification\.court_supervised_promotion_and_docket\.auto_promote_allowed must be false/,
  );

  const badProdZ = structuredClone(exported);
  badProdZ.frontier_z_verification.eligibility_interlock.allow_production_execution = true;
  const resBadProdZ = normalizePacket(badProdZ);
  assert.equal(resBadProdZ.ok, false);
  assert.match(
    resBadProdZ.errors.join(" "),
    /frontier_z_verification\.eligibility_interlock\.allow_production_execution must be false/,
  );
});

