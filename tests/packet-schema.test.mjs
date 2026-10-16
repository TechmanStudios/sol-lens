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

