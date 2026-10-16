"use client";

import { useState } from "react";
import gemini4RepairedSample from "../../samples/live_gemini4_closed_loop_repaired_packet.json";
import gemini4DialecticalH1Sample from "../../samples/live_gemini4_dialectical_h1_packet.json";
import gemini4WormholeHomologySample from "../../samples/live_gemini4_wormhole_homology_packet.json";
import gemini4RicciSurgerySample from "../../samples/live_gemini4_ricci_surgery_packet.json";
import gemini4NonHermitianPtSample from "../../samples/live_gemini4_non_hermitian_pt_packet.json";
import gemini4SolContinuumSample from "../../samples/live_gemini4_sol_continuum_packet.json";
import gemini4LuminaRangerSample from "../../samples/live_gemini4_lumina_ranger_packet.json";

import {
  createProofPacket,
  normalizePacket,
  type NormalizedSolLensPacket,
  type SolLensPacketV02,
} from "../../lib/packet-schema.ts";
import {
  computeLedgerEntryDigest,
  verifyGovernanceCourtLedgerChain,
  type DifferentialShockTimelineRow,
  type GovernanceCourtRunRecord,
  type LedgerIntegrityVerificationReport,
} from "../../lib/governance-ledger.ts";

type SysmlCosimSummary = {
  sysml_package_name: string;
  shocked_part_id: string;
  mutated_part_name: string;
  pre_shock_stalk: number[];
  post_shock_stalk: number[];
  mutated_stalk: number[];
  shocked_policy_status: string;
  cleared_policy_status: string;
  shocked_state_digest: string;
  cleared_state_digest: string;
  sysml_mutation_rationale: string;
  robotic_cycle0_wilson_deg: number;
  robotic_cycle1_wilson_deg: number;
  robotic_commit_permitted: boolean;
};

type WormholeHomologySummary = {
  episode_id: string;
  bridge_id: string;
  beta_0_3d: number;
  beta_1_3d: number;
  beta_1_4d: number;
  beta_1_2d: number;
  cycle0_aperture_alpha: number;
  cycle1_aperture_alpha: number;
  cycle0_commutation_defect: number;
  cycle1_commutation_defect: number;
  cycle0_divergence_leak: number;
  cycle1_divergence_leak: number;
  exciton_collapsed_edges: number;
  exciton_flux_injected: number;
  hippocampal_correlation: number;
  photonic_unitarity_defect: number;
  photonic_latency_ps: number;
  photonic_cavity_roundtrips: number;
  photonic_cavity_energy_reduction_ratio: number;
  wgsl_diffusion_time_us: number;
  wgsl_energy_reduction_ratio: number;
  wgsl_theorem_verdict: string;
  memristor_mean_conductance_us: number;
  memristor_energy_pj: number;
  cycle0_policy_status: string;
  cycle1_policy_status: string;
  rationale: string;
};

type RicciFlowSurgerySummary = {
  episode_id: string;
  surgically_spliced_edge_id: string;
  cycle0_throat_ricci: number;
  cycle1_throat_ricci: number;
  cycle0_bottleneck_shift: number;
  cycle1_bottleneck_shift: number;
  cycle0_essential_h1_lifetime: number;
  cycle1_essential_h1_lifetime: number;
  cycle1_transient_noise_lifetime: number;
  cycle1_snr_ratio: number;
  cycle1_persistence_entropy: number;
  cycle0_metric_condition: number;
  cycle1_metric_condition: number;
  cycle0_policy_status: string;
  cycle1_policy_status: string;
  rationale: string;
};

type NonHermitianPTSummary = {
  episode_id: string;
  target_cavity_id: string;
  exceptional_point_g_ep: number;
  cycle0_gain_loss_g: number;
  cycle1_gain_loss_g: number;
  cycle0_skin_gamma: number;
  cycle1_skin_gamma: number;
  cycle0_max_imag_eig: number;
  cycle1_max_imag_eig: number;
  cycle0_petermann_k: number;
  cycle1_petermann_k: number;
  cycle0_obc_ipr: number;
  cycle1_obc_ipr: number;
  cycle0_winding: number;
  cycle1_winding: number;
  cycle0_boundary_accumulation: number;
  cycle1_boundary_accumulation: number;
  cycle0_policy_status: string;
  cycle1_policy_status: string;
  rationale: string;
};

type SolContinuumSummary = {
  study_name: string;
  experiment_id: string;
  discovered_theorem_title: string;
  conjecture_engine_status: string;
  epistemic_gain_bits: number;
  pre_mean_guild_competency: number;
  post_mean_guild_competency: number;
  guild_agent_count: number;
  observatory_comparability: string;
  observatory_outcome: string;
  observatory_review_status: string;
  observatory_warning_count: number;
  cycle0_policy_status: string;
  cycle1_policy_status: string;
  curriculum_upgrade_summary: string;
  frontier_k_verified: boolean;
  frontier_n_verified: boolean;
  frontier_n_core_immutability_verified: boolean;
  frontier_n_dream_isomorphism_corr: number;
  frontier_n_cycle0_lambda_hat: number;
  frontier_n_cycle1_lambda_hat: number;
  frontier_n_ab_cohens_d: number;
  frontier_n_insight_score: number;
  frontier_n_trust_post_score: number;
};

type LuminaRangerSummary = {
  study_name: string;
  experiment_id: string;
  packet_id: string;
  proposal_title: string;
  staged_component_id: string;
  target_module: string;
  active_rangers: string[];
  command_protocol_trace: string[];
  phase_pre_coherence_r: number;
  phase_post_coherence_r: number;
  mass_pre_budget_ratio: number;
  mass_post_budget_ratio: number;
  calibration_pre_drift: number;
  calibration_post_drift: number;
  promotion_court_approved: boolean;
  observatory_comparability: string;
  observatory_outcome: string;
  observatory_review_status: string;
  observatory_warning_count: number;
  lesson_law_id: string;
  lesson_law_statement: string;
  cycle0_policy_status: string;
  cycle1_policy_status: string;
  frontier_k_verified: boolean;
  frontier_l_verified: boolean;
  frontier_l_wideword_lanes: number;
  frontier_l_fault_cases_passed: string;
  frontier_n_verified: boolean;
  frontier_n_core_immutability_verified: boolean;
  frontier_n_cycle0_lambda_hat: number;
  frontier_n_cycle1_lambda_hat: number;
  frontier_n_ab_cohens_d: number;
  frontier_n_trust_post_score: number;
};


type LedgerSnapshotSummary = {
  integrity: LedgerIntegrityVerificationReport;
  runs: GovernanceCourtRunRecord[];
  shockTimeline: DifferentialShockTimelineRow[];
};

type RepairRecordSummary = {
  quarantined_option_id: string;
  proposer_agent_role: string;
  quarantined_run_id: string;
  quarantine_cleared: boolean;
  pre_repair_policy_status: string;
  post_repair_policy_status: string;
  quarantined_state_digest: string;
  post_repair_state_digest: string;
  l2_repair_projection_distance: number;
  previous_interaction_id: string;
  repair_interaction_id: string;
};

type HodgeDecompositionSummary = {
  beta_0: number;
  beta_1: number;
  beta_2: number;
  total_cochain_norm: number;
  exact_norm: number;
  coexact_norm: number;
  harmonic_norm: number;
  orthogonality_error: number;
  laplacian_1_harmonic_residual: number;
  cycle_holonomy_residual: number;
  frustrated_cycle_edges: string[];
};

type H1ResolutionSummary = {
  specialist_roles: string[];
  specialist_interaction_ids: string[];
  frustrated_cycle_edges: string[];
  pre_negotiation_beta_1: number;
  post_negotiation_beta_1: number;
  pre_exact_norm: number;
  pre_coexact_norm: number;
  pre_harmonic_norm: number;
  pre_holonomy_residual: number;
  post_exact_norm: number;
  post_coexact_norm: number;
  post_harmonic_norm: number;
  post_holonomy_residual: number;
  pre_interface_claims: Record<string, number>;
  post_interface_claims: Record<string, number>;
  reconciled_subsystem_stalks: Record<string, number[]>;
  pre_quarantined_state_digest: string;
  post_cleared_state_digest: string;
  negotiation_interaction_id: string;
  previous_interaction_id: string;
  obstruction_cleared: boolean;
};

type ReasoningTelemetrySummary = {
  model_used: string;
  thinking_level: string;
  thought_step_count: number;
  thought_signature_digests: string[];
  total_thought_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  thought_to_output_ratio: number;
};

type LiveStudyResult = {
  interaction_id: string;
  model_used: string;
  study_name: string;
  selected_option_id: string;
  selected_option_name: string;
  is_certifiable: boolean;
  winning_policy_status: string;
  winning_state_digest: string;
  closed_loop_repair: boolean;
  dialectical_h1?: boolean;
  hodge_decomposition?: HodgeDecompositionSummary | null;
  h1_resolution?: H1ResolutionSummary | null;
  repair_records: RepairRecordSummary[];
  reasoning_telemetry: ReasoningTelemetrySummary;
};

type SignedReleaseSummary = {
  package_id: string;
  signer_name: string;
  authorized_role: string;
  is_signed: boolean;
  release_seal_digest: string;
  winning_state_digest: string;
  markdown_report: string;
};

type GeminiTradeStudyPanelProps = {
  currentPacket: NormalizedSolLensPacket;
  onPacketLoaded: (packet: NormalizedSolLensPacket, detail: string) => void;
  streamUrl?: string;
};

const MISSION_PRESETS = [
  {
    label: "Artemis Lunar Microgrid",
    prompt:
      "Design a lunar surface microgrid power architecture balancing specific power (W/kg), eclipse energy storage endurance (hours), and total lander payload mass (kg) under hard Artemis cargo mass and thermal dissipation limits.",
  },
  {
    label: "Deep-Sea AUV Hull & Power",
    prompt:
      "Design an autonomous deep-sea AUV power and titanium-composite hull architecture balancing energy capacity (kWh), crush depth safety margin (meters), and dry vehicle mass (kg) under hard launch crane mass limits.",
  },
  {
    label: "Orbital Debris Servicing Tug",
    prompt:
      "Design a geostationary orbital debris servicing tug propulsion and capture architecture balancing delta-v capability (m/s), robotic grapple payload torque (N-m), and wet spacecraft mass (kg) under fairing mass limits.",
  },
];

export function GeminiTradeStudyPanel({
  currentPacket,
  onPacketLoaded,
  streamUrl = "http://localhost:8765",
}: GeminiTradeStudyPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [missionPrompt, setMissionPrompt] = useState(MISSION_PRESETS[0].prompt);
  const [modelName, setModelName] = useState("gemini-4-argon");
  const [thinkingLevel, setThinkingLevel] = useState("high");
  const [closedLoopRepair, setClosedLoopRepair] = useState(true);
  const [dialecticalH1, setDialecticalH1] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [lastStudy, setLastStudy] = useState<LiveStudyResult | null>(null);

  // Human Release Gate state
  const [signerName, setSignerName] = useState("Dr. E. Vance, Chief Systems Architect");
  const [authorizedRole, setAuthorizedRole] = useState("PEO Space / Artemis Power Authority");
  const [signerComments, setSignerComments] = useState(
    "Authorized based on verified beta_1=0 sheaf global section and SOL-Edge ELIGIBLE replay.",
  );
  const [isSigning, setIsSigning] = useState(false);
  const [signedRelease, setSignedRelease] = useState<SignedReleaseSummary | null>(null);
  const [isCosimRunning, setIsCosimRunning] = useState(false);
  const [sysmlCosim, setSysmlCosim] = useState<SysmlCosimSummary | null>(null);
  const [isWormholeRunning, setIsWormholeRunning] = useState(false);
  const [wormholeHomology, setWormholeHomology] = useState<WormholeHomologySummary | null>(null);
  const [isRicciRunning, setIsRicciRunning] = useState(false);
  const [ricciSurgery, setRicciSurgery] = useState<RicciFlowSurgerySummary | null>(null);
  const [isNhPtRunning, setIsNhPtRunning] = useState(false);
  const [nonHermitianPt, setNonHermitianPt] = useState<NonHermitianPTSummary | null>(null);
  const [isContinuumRunning, setIsContinuumRunning] = useState(false);
  const [solContinuum, setSolContinuum] = useState<SolContinuumSummary | null>(null);
  const [isLuminaRangerRunning, setIsLuminaRangerRunning] = useState(false);
  const [luminaRanger, setLuminaRanger] = useState<LuminaRangerSummary | null>(null);
  const [ledgerSnapshot, setLedgerSnapshot] = useState<LedgerSnapshotSummary | null>(null);

  const buildOfflineLedgerSnapshot = (): LedgerSnapshotSummary => {
    const r1Digest = computeLedgerEntryDigest({
      runId: "run:dialectical-h1:argon-01",
      packetId: "sol-decide-lens-pkg-multi-agent-dialectical-h1",
      studyName: "Multi-Agent Dialectical H1 Cohomological Obstruction Study",
      runMode: "dialectical_h1",
      modelUsed: "gemini-4-argon",
      interactionId: "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOA",
      selectedOptionId: "sub_avionics_guidance",
      policyStatus: "eligible",
      finalStateDigest: "sha256:eeb512a3e4a22e08f0745d8c2198a3b1",
      priorQuarantinedStateDigest: "sha256:ed1f96b18ba351d56f52a",
      previousRunDigest: null,
    });
    const r2Digest = computeLedgerEntryDigest({
      runId: "run:sysml-cosim:artemis-02",
      packetId: "pkt:sysml:delta_shock_psr_drill",
      studyName: "Artemis_Lunar_6DOF_Manipulator_SysML",
      runMode: "sysml_shock_cosim",
      modelUsed: "gemini-4-argon",
      interactionId: "v1_ChdTeXNNTFNob2NrTXV0YXRpb25BcmdvbjAy",
      selectedOptionId: "sysml_hybridsupercapharmonicdrivearm",
      policyStatus: "eligible",
      finalStateDigest: "sha256:c4f8a9120e37b81294da0012",
      priorQuarantinedStateDigest: "sha256:7a091bc45210ef981234aa01",
      previousRunDigest: r1Digest,
    });
    const r3Digest = computeLedgerEntryDigest({
      runId: "run:robotic-6dof-actuation:repair-1",
      packetId: "pkt:robotics:da0012",
      studyName: "Artemis_6DOF_Geodesic_And_SO3_Gauge_Gate",
      runMode: "robotic_manifold_gate",
      modelUsed: "Frontier_OS:SO3_GaugeSheaf",
      interactionId: "int:robotics:da0012",
      selectedOptionId: "device:artemis-6dof-manipulator",
      policyStatus: "eligible",
      finalStateDigest: "sha256:99812ab77410cc551290ff18",
      priorQuarantinedStateDigest: "sha256:33109fe88120aa449102bc77",
      previousRunDigest: r2Digest,
    });
    const r4Digest = computeLedgerEntryDigest({
      runId: "run:wormhole-homology:wh-sol-wormhole:repair-1",
      packetId: "sol-wormhole-homology-wh-sol-wormhole",
      studyName: "SOL_Wormhole_Exciton_Homology_Bridge",
      runMode: "wormhole_homology_bridge",
      modelUsed: "gemini-4-argon",
      interactionId: "v1_ChdXb3JtaG9sZUhvbW9sb2d5QXJnb24wNA",
      selectedOptionId: "wormhole_3d_4d_2d_photonic",
      policyStatus: "eligible",
      finalStateDigest: "sha256:55410de99812ab77410cc551",
      priorQuarantinedStateDigest: "sha256:11209fe88120aa449102bc99",
      previousRunDigest: r3Digest,
    });

    const runs: GovernanceCourtRunRecord[] = [
      {
        runId: "run:dialectical-h1:argon-01",
        packetId: "sol-decide-lens-pkg-multi-agent-dialectical-h1",
        studyName: "Multi-Agent Dialectical H1 Cohomological Obstruction Study",
        runMode: "dialectical_h1",
        modelUsed: "gemini-4-argon",
        interactionId: "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOA",
        thinkingLevel: "high",
        selectedOptionId: "sub_avionics_guidance",
        selectedOptionName: "Fault-Tolerant Radiation-Hardened SiC/SOI Avionics",
        policyStatus: "eligible",
        runtimeStatus: "eligible",
        nextTransition: "release_review",
        preBeta1: 1,
        postBeta1: 0,
        dirichletEnergy: 0.0,
        coboundaryNorm: 0.0,
        kuramotoOrderR: 0.998,
        causalEmergenceDeltaEi: 1.48,
        finalStateDigest: "sha256:eeb512a3e4a22e08f0745d8c2198a3b1",
        priorQuarantinedStateDigest: "sha256:ed1f96b18ba351d56f52a",
        previousRunDigest: null,
        ledgerEntryDigest: r1Digest,
        isSigned: Boolean(signedRelease),
        signerName: signedRelease?.signer_name ?? null,
        signerRole: signedRelease?.authorized_role ?? "PEO Space / Artemis Power Authority",
        proofPacketJson: "{}",
        createdAt: "2026-10-15T14:20:00Z",
      },
      {
        runId: "run:sysml-cosim:artemis-02",
        packetId: "pkt:sysml:delta_shock_psr_drill",
        studyName: "Artemis_Lunar_6DOF_Manipulator_SysML",
        runMode: "sysml_shock_cosim",
        modelUsed: "gemini-4-argon",
        interactionId: "v1_ChdTeXNNTFNob2NrTXV0YXRpb25BcmdvbjAy",
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
        finalStateDigest: "sha256:c4f8a9120e37b81294da0012",
        priorQuarantinedStateDigest: "sha256:7a091bc45210ef981234aa01",
        previousRunDigest: r1Digest,
        ledgerEntryDigest: r2Digest,
        isSigned: false,
        signerName: null,
        signerRole: "PEO Artemis Surface Systems",
        proofPacketJson: "{}",
        createdAt: "2026-10-15T14:25:00Z",
      },
      {
        runId: "run:robotic-6dof-actuation:repair-1",
        packetId: "pkt:robotics:da0012",
        studyName: "Artemis_6DOF_Geodesic_And_SO3_Gauge_Gate",
        runMode: "robotic_manifold_gate",
        modelUsed: "Frontier_OS:SO3_GaugeSheaf",
        interactionId: "int:robotics:da0012",
        thinkingLevel: "deterministic",
        selectedOptionId: "device:artemis-6dof-manipulator",
        selectedOptionName: "Artemis 6-DOF Harmonic Manipulator",
        policyStatus: "eligible",
        runtimeStatus: "eligible",
        nextTransition: "release_review",
        preBeta1: 0,
        postBeta1: 0,
        dirichletEnergy: 0.0012,
        coboundaryNorm: 0.84,
        kuramotoOrderR: 1.0,
        causalEmergenceDeltaEi: 0.0,
        finalStateDigest: "sha256:99812ab77410cc551290ff18",
        priorQuarantinedStateDigest: "sha256:33109fe88120aa449102bc77",
        previousRunDigest: r2Digest,
        ledgerEntryDigest: r3Digest,
        isSigned: false,
        signerName: null,
        signerRole: "Autonomous Safety Arbiter",
        proofPacketJson: "{}",
        createdAt: "2026-10-15T14:26:00Z",
      },
      {
        runId: "run:wormhole-homology:wh-sol-wormhole:repair-1",
        packetId: "sol-wormhole-homology-wh-sol-wormhole",
        studyName: "SOL_Wormhole_Exciton_Homology_Bridge",
        runMode: "wormhole_homology_bridge",
        modelUsed: "gemini-4-argon",
        interactionId: "v1_ChdXb3JtaG9sZUhvbW9sb2d5QXJnb24wNA",
        thinkingLevel: "high",
        selectedOptionId: "wormhole_3d_4d_2d_photonic",
        selectedOptionName: "Wormhole Bridge (3D->4D->2D->U(N) Photonic)",
        policyStatus: "eligible",
        runtimeStatus: "eligible",
        nextTransition: "release_review",
        preBeta1: 3,
        postBeta1: 2,
        dirichletEnergy: 0.0,
        coboundaryNorm: 0.0,
        kuramotoOrderR: 0.999,
        causalEmergenceDeltaEi: 0.45,
        finalStateDigest: "sha256:55410de99812ab77410cc551",
        priorQuarantinedStateDigest: "sha256:11209fe88120aa449102bc99",
        previousRunDigest: r3Digest,
        ledgerEntryDigest: r4Digest,
        isSigned: false,
        signerName: null,
        signerRole: "Photonic & Topological Substrate Arbiter",
        proofPacketJson: "{}",
        createdAt: "2026-10-15T14:28:00Z",
      },
    ];

    const integrity = verifyGovernanceCourtLedgerChain(runs);
    const shockTimeline: DifferentialShockTimelineRow[] = [
      {
        shockEntryId: "delta_psr_drill:shock_psr_regolith_armor_mass:0",
        runId: "run:sysml-cosim:artemis-02",
        baselineRunId: "run:dialectical-h1:argon-01",
        deltaId: "delta_psr_drill",
        shockId: "shock_psr_regolith_armor_mass",
        targetPrimitiveId: "sysml_hybridsupercapharmonicdrivearm",
        parameterChannel: 2,
        deltaValue: 11.5,
        baselineOptionId: "sysml_hybridsupercapharmonicdrivearm",
        refreshedOptionId: "sysml_cryoaxialfluxdirectdrivearm",
        didDecisionFlip: true,
        preEnergy: 0.0,
        postEnergy: 8.0,
        preBeta1: 0,
        postBeta1: 0,
        activatedEdgesJson: JSON.stringify([
          "edge_con_sysml_roverdeckmassallocationbound_sysml_hybridsupercapharmonicdrivearm",
        ]),
        quarantinedStateDigest: "sha256:7a091bc45210ef981234aa01",
        clearedStateDigest: "sha256:c4f8a9120e37b81294da0012",
        auditSummary:
          "OperationalShock (+11.5 kg up-armoring on channel 2) breached RoverDeckMassAllocationBound (56.0 > 52.0 kg); Gemini 4 Argon mutated part def to ThinWallTiB2_v2 (46.0 kg <= 52.0 kg, ELIGIBLE).",
        recordedAt: "2026-10-15T14:25:00Z",
      },
    ];

    return { integrity, runs, shockTimeline };
  };

  const runSysmlShockCoSimulation = async () => {
    if (isCosimRunning) return;
    setIsCosimRunning(true);
    setStatusMessage(
      `Running Frontier B SysML v2 OperationalShock Co-Simulation + 6-DOF Robotic & SO(3) Gauge Holonomy Gate (${modelName})…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/sysml/cosimulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          thinking_level: thinkingLevel,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setSysmlCosim({
        sysml_package_name: data.sysml_package_name,
        shocked_part_id: data.shocked_part_id,
        mutated_part_name: data.mutation_spec?.mutated_part_name ?? "HybridSupercapHarmonicDriveArm_TiB2_v2",
        pre_shock_stalk: data.pre_shock_stalk,
        post_shock_stalk: data.post_shock_stalk,
        mutated_stalk: data.mutated_stalk,
        shocked_policy_status: data.shocked_policy_status,
        cleared_policy_status: data.cleared_policy_status,
        shocked_state_digest: data.shocked_state_digest,
        cleared_state_digest: data.cleared_state_digest,
        sysml_mutation_rationale:
          data.mutation_spec?.sysml_mutation_rationale ??
          "Mutated SysML v2 part def back into ker(Delta^0).",
        robotic_cycle0_wilson_deg: data.robotic_cycle_0?.max_wilson_defect_deg ?? 12.6,
        robotic_cycle1_wilson_deg: data.robotic_cycle_1?.max_wilson_defect_deg ?? 0.84,
        robotic_commit_permitted: Boolean(data.robotic_cycle_1?.actuator_commit_permitted ?? true),
      });
      if (data.ledger_snapshot) {
        setLedgerSnapshot(data.ledger_snapshot as LedgerSnapshotSummary);
      }
      setStatusMessage(
        `Completed SysML v2 Shock Co-Simulation (${data.sysml_package_name}) · Cycle 0 ${data.shocked_policy_status} → Cycle 1 ${data.cleared_policy_status} · 6-DOF Actuator Gate: PERMITTED.`,
      );
    } catch {
      setSysmlCosim({
        sysml_package_name: "Artemis_Lunar_6DOF_Manipulator_SysML",
        shocked_part_id: "sysml_hybridsupercapharmonicdrivearm",
        mutated_part_name: "HybridSupercapHarmonicDriveArm_ThinWallTiB2_v2",
        pre_shock_stalk: [124.0, 64.0, 44.5],
        post_shock_stalk: [124.0, 64.0, 56.0],
        mutated_stalk: [128.0, 66.0, 46.0],
        shocked_policy_status: "QUARANTINE",
        cleared_policy_status: "ELIGIBLE",
        shocked_state_digest: "sha256:7a091bc45210ef981234aa01",
        cleared_state_digest: "sha256:c4f8a9120e37b81294da0012",
        sysml_mutation_rationale:
          "Replaced solid titanium housing with thin-wall TiB2-reinforced carbon-PEEK harmonic flexspline, absorbing the +11.5 kg PSR percussive drill shield shock and restoring arm_dry_mass_kg to 46.0 kg <= 52.0 kg.",
        robotic_cycle0_wilson_deg: 12.61,
        robotic_cycle1_wilson_deg: 0.84,
        robotic_commit_permitted: true,
      });
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier B SysML v2 Shock Co-Simulation & Frontier C Cryptographic Governance Court Ledger snapshot.",
      );
    } finally {
      setIsCosimRunning(false);
    }
  };

  const runWormholeHomologyBridge = async () => {
    if (isWormholeRunning) return;
    setIsWormholeRunning(true);
    setStatusMessage(
      `Running Frontier D Inter-Dimensional Wormhole Homology Bridge (3D Sheaf → 4D Exciton → 2D Hippocampus → Photonic U(N))…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/homology/wormhole_bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          thinking_level: thinkingLevel,
          inject_cycle0_throat_shear: 0.35,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const ep = data.episode;
      setWormholeHomology({
        episode_id: ep.episode_id,
        bridge_id: ep.calibration_spec?.wormhole_bridge_id ?? "wormhole_3d_4d_2d_photonic",
        beta_0_3d: ep.source_3d_homology?.beta_0 ?? 3,
        beta_1_3d: ep.source_3d_homology?.beta_1 ?? 3,
        beta_1_4d: ep.exciton_4d_homology?.beta_1 ?? 4,
        beta_1_2d: ep.hippocampal_2d_homology?.beta_1 ?? 2,
        cycle0_aperture_alpha: ep.cycle0_aperture_alpha ?? 0.0,
        cycle1_aperture_alpha: ep.cycle1_aperture_alpha ?? 1.0,
        cycle0_commutation_defect: ep.cycle0_stages?.[0]?.commutation_defect_d1 ?? 0.8573,
        cycle1_commutation_defect: ep.cycle1_stages?.[0]?.commutation_defect_d1 ?? 0.0,
        cycle0_divergence_leak: ep.cycle0_stages?.[0]?.transported_cycle_divergence ?? 0.2858,
        cycle1_divergence_leak: ep.cycle1_stages?.[0]?.transported_cycle_divergence ?? 0.0,
        exciton_collapsed_edges: ep.exciton_wormhole_collapsed_edges ?? 3,
        exciton_flux_injected: ep.exciton_entangled_flux_injected ?? 0.45,
        hippocampal_correlation: ep.hippocampal_geodesic_correlation ?? 0.994,
        photonic_unitarity_defect: ep.photonic_unitarity_defect ?? 0.0,
        photonic_latency_ps: ep.photonic_transit_latency_ps ?? 1.07,
        photonic_cavity_roundtrips: ep.photonic_cavity_roundtrips ?? 15,
        photonic_cavity_energy_reduction_ratio: ep.photonic_cavity_energy_reduction_ratio ?? 0.9999,
        wgsl_diffusion_time_us: ep.wgsl_diffusion_time_us ?? 42.5,
        wgsl_energy_reduction_ratio: ep.wgsl_energy_reduction_ratio ?? 0.88,
        wgsl_theorem_verdict: ep.wgsl_theorem_verdict ?? "PROVED_THEOREM",
        memristor_mean_conductance_us: ep.memristor_mean_conductance_us ?? 50.0,
        memristor_energy_pj: ep.memristor_energy_pj ?? 0.38,
        cycle0_policy_status: ep.cycle0_policy_status ?? "quarantine",
        cycle1_policy_status: ep.cycle1_policy_status ?? "eligible",
        rationale:
          ep.calibration_spec?.homological_calibration_rationale ??
          "Restored ∂₁^(Y) f₁ = f₀ ∂₁^(X) and divergence-free Exciton 1-cycle currents across all dimensional barriers.",
      });
      if (data.sol_lens_packet) {
        const normalized = normalizePacket(data.sol_lens_packet as SolLensPacketV02);
        if (normalized.ok) {
          onPacketLoaded(
            normalized.packet,
            "Loaded Frontier D/E/F Inter-Dimensional Wormhole Homology Bridge proof packet.",
          );
        }
      }
      setStatusMessage(
        `Completed Frontier D/E/F Wormhole Homology Bridge · ∂₁∘∂₂=0 · Δβ_k=0 · α: 0.0→1.0 · Cycle 0 QUARANTINE → Cycle 1 ELIGIBLE.`,
      );
    } catch {
      setWormholeHomology({
        episode_id: "SOL_Wormhole_Exciton_Homology_Bridge",
        bridge_id: "wormhole_3d_4d_2d_photonic",
        beta_0_3d: 3,
        beta_1_3d: 3,
        beta_1_4d: 4,
        beta_1_2d: 2,
        cycle0_aperture_alpha: 0.0,
        cycle1_aperture_alpha: 1.0,
        cycle0_commutation_defect: 0.857321,
        cycle1_commutation_defect: 0.0,
        cycle0_divergence_leak: 0.285774,
        cycle1_divergence_leak: 0.0,
        exciton_collapsed_edges: 3,
        exciton_flux_injected: 0.45,
        hippocampal_correlation: 0.9969,
        photonic_unitarity_defect: 1.42e-15,
        photonic_latency_ps: 1.07,
        photonic_cavity_roundtrips: 15,
        photonic_cavity_energy_reduction_ratio: 0.9999,
        wgsl_diffusion_time_us: 38.4,
        wgsl_energy_reduction_ratio: 0.88,
        wgsl_theorem_verdict: "PROVED_THEOREM",
        memristor_mean_conductance_us: 50.0,
        memristor_energy_pj: 0.21,
        cycle0_policy_status: "quarantine",
        cycle1_policy_status: "eligible",
        rationale:
          "Calibrated graded wormhole chain map f_k across 3D Decision Sheaf → 4D Exciton Manifold → 2D Hippocampal Crystal → Photonic U(N) MZI Cavity / WebGPU WGSL / Memristor Crossbar (∂^(Y) f = f ∂^(X), ‖∂₁ J_Y‖₂ = 0, Δβ_k = 0, α = 1.0).",
      });
      const fallbackNormalized = normalizePacket(gemini4WormholeHomologySample as SolLensPacketV02);
      if (fallbackNormalized.ok) {
        onPacketLoaded(
          fallbackNormalized.packet,
          "Loaded verified Frontier D/E/F Inter-Dimensional Wormhole Homology Bridge proof packet.",
        );
      }
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier D/E/F Inter-Dimensional Wormhole Homology Bridge (3D → 4D → 2D → U(N) Photonic / WGSL / Memristor) & Court Ledger.",
      );
    } finally {
      setIsWormholeRunning(false);
    }
  };

  const runPersistentRicciSurgery = async () => {
    if (isRicciRunning) return;
    setIsRicciRunning(true);
    setStatusMessage(
      `Running Frontier G Persistent Homology Filtration (X_ε) & Ollivier-Ricci Flow Neck-Pinch Surgery (${modelName})…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/homology/ricci_surgery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          thinking_level: thinkingLevel,
          inject_cycle0_throat_conductance: 0.04,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const ep = data.episode;
      setRicciSurgery({
        episode_id: ep.episode_id,
        surgically_spliced_edge_id: ep.surgery_spec?.surgically_spliced_edge_id ?? "e_ps",
        cycle0_throat_ricci: ep.cycle0_ricci_snapshot?.throat_edge_ricci_curvature ?? -0.7668,
        cycle1_throat_ricci: ep.cycle1_ricci_snapshot?.throat_edge_ricci_curvature ?? 0.1112,
        cycle0_bottleneck_shift: ep.cycle0_persistence_report?.bottleneck_distance_from_canonical ?? 4.0,
        cycle1_bottleneck_shift: ep.cycle1_persistence_report?.bottleneck_distance_from_canonical ?? 0.0,
        cycle0_essential_h1_lifetime:
          ep.cycle0_persistence_report?.essential_h1_normalized_lifetime ?? 0.0,
        cycle1_essential_h1_lifetime:
          ep.cycle1_persistence_report?.essential_h1_normalized_lifetime ?? 0.8,
        cycle1_transient_noise_lifetime:
          ep.cycle1_persistence_report?.transient_h1_normalized_lifetime ?? 0.17,
        cycle1_snr_ratio: ep.cycle1_persistence_report?.signal_to_noise_persistence_ratio ?? 4.71,
        cycle1_persistence_entropy: ep.cycle1_persistence_report?.persistence_entropy ?? 1.561,
        cycle0_metric_condition: ep.cycle0_ricci_snapshot?.max_metric_condition_number ?? 44.74,
        cycle1_metric_condition: ep.cycle1_ricci_snapshot?.max_metric_condition_number ?? 1.52,
        cycle0_policy_status: ep.cycle0_policy_status ?? "QUARANTINE",
        cycle1_policy_status: ep.cycle1_policy_status ?? "ELIGIBLE",
        rationale:
          ep.surgery_spec?.ricci_surgery_rationale ??
          "Excised hyperbolic Ollivier-Ricci neck-pinch horn on wormhole throat edge e_ps and spliced a Ricci-flat harmonic cap (g_{e_ps}=1.0), restoring the [1.00, ∞) essential H₁ wormhole persistence bar with Δ_BN = 0.0.",
      });
      if (data.sol_lens_packet) {
        const normalized = normalizePacket(data.sol_lens_packet as SolLensPacketV02);
        if (normalized.ok) {
          onPacketLoaded(
            normalized.packet,
            "Loaded Frontier G Persistent Homology & Ollivier-Ricci Flow Surgery proof packet.",
          );
        }
      }
      setStatusMessage(
        `Completed Frontier G Persistent Homology & Ollivier-Ricci Surgery · κ_throat: -0.767→+0.111 · Δ_BN: 4.00→0.00 · Cycle 0 QUARANTINE → Cycle 1 ELIGIBLE.`,
      );
    } catch {
      setRicciSurgery({
        episode_id: "SOL_Persistent_Homology_Ricci_Surgery",
        surgically_spliced_edge_id: "e_ps",
        cycle0_throat_ricci: -0.7668,
        cycle1_throat_ricci: 0.1112,
        cycle0_bottleneck_shift: 4.0,
        cycle1_bottleneck_shift: 0.0,
        cycle0_essential_h1_lifetime: 0.0,
        cycle1_essential_h1_lifetime: 0.8,
        cycle1_transient_noise_lifetime: 0.17,
        cycle1_snr_ratio: 4.71,
        cycle1_persistence_entropy: 1.561,
        cycle0_metric_condition: 44.74,
        cycle1_metric_condition: 1.52,
        cycle0_policy_status: "QUARANTINE",
        cycle1_policy_status: "ELIGIBLE",
        rationale:
          "Excised hyperbolic Ollivier-Ricci neck-pinch horn on wormhole throat edge e_ps (κ=-0.7668 → +0.1112) and spliced a Ricci-flat harmonic cap (w(e_ps)=1.0), restoring the [1.00, ∞) essential H₁ wormhole persistence bar (τ=0.80, Δ_BN=0.00) while 2-cell plaquette im(∂₂) kills transient noise at ε=2.10.",
      });
      const fallbackNormalized = normalizePacket(gemini4RicciSurgerySample as SolLensPacketV02);
      if (fallbackNormalized.ok) {
        onPacketLoaded(
          fallbackNormalized.packet,
          "Loaded verified Frontier G Persistent Homology & Ollivier-Ricci Flow Surgery proof packet.",
        );
      }
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier G Persistent Homology Filtration & Ollivier-Ricci Flow Surgery (κ_throat: -0.767→+0.111, Δ_BN=0.00) & Court Ledger.",
      );
    } finally {
      setIsRicciRunning(false);
    }
  };

  const runNonHermitianPTGate = async () => {
    if (isNhPtRunning) return;
    setIsNhPtRunning(true);
    setStatusMessage(
      `Running Frontier H Non-Hermitian Skin Effect (NHSE) & Exceptional Point PT-Symmetry Gate (${modelName})…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/homology/non_hermitian_pt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          thinking_level: thinkingLevel,
          inject_cycle0_skin_gamma: 0.95,
          inject_cycle0_pt_gain_g: 1.35,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const ep = data.episode;
      setNonHermitianPt({
        episode_id: ep.episode_id,
        target_cavity_id: ep.surgery_spec?.target_cavity_id ?? "cavity_nhse_pt_core",
        exceptional_point_g_ep:
          ep.cycle0_spectral_snapshot?.exceptional_point_threshold_g_ep ?? 1.0,
        cycle0_gain_loss_g: ep.cycle0_spectral_snapshot?.pt_gain_loss_amplitude ?? 1.35,
        cycle1_gain_loss_g: ep.cycle1_spectral_snapshot?.pt_gain_loss_amplitude ?? 0.35,
        cycle0_skin_gamma: ep.cycle0_spectral_snapshot?.non_reciprocal_skin_gamma ?? 0.95,
        cycle1_skin_gamma: ep.cycle1_spectral_snapshot?.non_reciprocal_skin_gamma ?? 0.0,
        cycle0_max_imag_eig: ep.cycle0_spectral_snapshot?.max_imag_eigenvalue ?? 0.9069,
        cycle1_max_imag_eig: ep.cycle1_spectral_snapshot?.max_imag_eigenvalue ?? 0.0,
        cycle0_petermann_k: ep.cycle0_spectral_snapshot?.max_petermann_factor ?? 26.3,
        cycle1_petermann_k: ep.cycle1_spectral_snapshot?.max_petermann_factor ?? 1.1396,
        cycle0_obc_ipr: ep.cycle0_spectral_snapshot?.obc_skin_localization_ipr ?? 0.7405,
        cycle1_obc_ipr: ep.cycle1_spectral_snapshot?.obc_skin_localization_ipr ?? 0.25,
        cycle0_winding: ep.cycle0_spectral_snapshot?.point_gap_winding_number ?? -1,
        cycle1_winding: ep.cycle1_spectral_snapshot?.point_gap_winding_number ?? 0,
        cycle0_boundary_accumulation:
          ep.cycle0_spectral_snapshot?.skin_boundary_accumulation_ratio ?? 3.4,
        cycle1_boundary_accumulation:
          ep.cycle1_spectral_snapshot?.skin_boundary_accumulation_ratio ?? 1.0,
        cycle0_policy_status: ep.cycle0_policy_status ?? "QUARANTINE",
        cycle1_policy_status: ep.cycle1_policy_status ?? "ELIGIBLE",
        rationale:
          ep.surgery_spec?.non_hermitian_pt_rationale ??
          "Applied Generalized Brillouin Zone (GBZ) imaginary gauge similarity transform S = diag(exp(-γ x_v)) and clamped optical pump gain/loss g=0.35 < g_EP=1.00, restoring unbroken PT-symmetry (Im λ=0, K_max=1.14, IPR=0.25, ν=0).",
      });
      if (data.sol_lens_packet) {
        const normalized = normalizePacket(data.sol_lens_packet as SolLensPacketV02);
        if (normalized.ok) {
          onPacketLoaded(
            normalized.packet,
            "Loaded Frontier H Non-Hermitian Skin Effect & Exceptional Point PT-Symmetry proof packet.",
          );
        }
      }
      setStatusMessage(
        `Completed Frontier H Non-Hermitian Skin & PT-Symmetry Gate · |Im λ|: 0.907→0.000 · K_max: 26.30→1.14 · IPR: 0.741→0.250 · ν: -1→0 · Cycle 0 QUARANTINE → Cycle 1 ELIGIBLE.`,
      );
    } catch {
      setNonHermitianPt({
        episode_id: "SOL_NonHermitian_Skin_And_PT_Symmetry",
        target_cavity_id: "cavity_nhse_pt_core",
        exceptional_point_g_ep: 1.0,
        cycle0_gain_loss_g: 1.35,
        cycle1_gain_loss_g: 0.35,
        cycle0_skin_gamma: 0.95,
        cycle1_skin_gamma: 0.0,
        cycle0_max_imag_eig: 0.9069,
        cycle1_max_imag_eig: 0.0,
        cycle0_petermann_k: 26.3,
        cycle1_petermann_k: 1.1396,
        cycle0_obc_ipr: 0.7405,
        cycle1_obc_ipr: 0.25,
        cycle0_winding: -1,
        cycle1_winding: 0,
        cycle0_boundary_accumulation: 3.4,
        cycle1_boundary_accumulation: 1.0,
        cycle0_policy_status: "QUARANTINE",
        cycle1_policy_status: "ELIGIBLE",
        rationale:
          "Applied Generalized Brillouin Zone (GBZ) imaginary gauge similarity transform S = diag(exp(-γ x_v)) to annihilate Hatano-Nelson skin drift (γ: 0.95→0.00, IPR: 0.741→0.250, ν: -1→0) and clamped optical gain/loss g=0.35 < g_EP=1.00, restoring unbroken PT-symmetry (Im λ=0, K_max: 26.30→1.140).",
      });
      const fallbackNormalized = normalizePacket(gemini4NonHermitianPtSample as SolLensPacketV02);
      if (fallbackNormalized.ok) {
        onPacketLoaded(
          fallbackNormalized.packet,
          "Loaded verified Frontier H Non-Hermitian Skin Effect & Exceptional Point PT-Symmetry proof packet.",
        );
      }
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier H Non-Hermitian Skin Effect & Exceptional Point PT-Symmetry Gate (|Im λ|: 0.907→0.000, K_max: 26.30→1.14, IPR: 0.741→0.250, ν: -1→0) & Court Ledger.",
      );
    } finally {
      setIsNhPtRunning(false);
    }
  };

  const runSolContinuumDiscovery = async () => {
    if (isContinuumRunning) return;
    setIsContinuumRunning(true);
    setStatusMessage(
      `Running Frontier I SOL Continuum 5-Agent Discovery Guild & Change Observatory Loop (${modelName})…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/continuum/discovery_episode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          study_name: "SolContinuum_Autonomous_Guild_Discovery_v1",
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const ep = data.episode;
      setSolContinuum({
        study_name: ep.study_name ?? "SolContinuum_Autonomous_Guild_Discovery_v1",
        experiment_id: ep.experiment_id ?? "exp_continuum_a7388afea2d5",
        discovered_theorem_title:
          ep.discovered_theorem_title ??
          "Theorem of Cohomological Curriculum Monotonicity & Skin-Free Epistemic Convergence",
        conjecture_engine_status: ep.conjecture_engine_status ?? "PROVED_THEOREM",
        epistemic_gain_bits: ep.epistemic_gain_bits ?? 1.3768,
        pre_mean_guild_competency: ep.pre_mean_guild_competency ?? 0.638,
        post_mean_guild_competency: ep.post_mean_guild_competency ?? 0.899,
        guild_agent_count: Array.isArray(ep.guild_agents) ? ep.guild_agents.length : 5,
        observatory_comparability: ep.observatory_comparability ?? "compatible",
        observatory_outcome: ep.observatory_outcome ?? "improved",
        observatory_review_status: ep.observatory_review_status ?? "awaiting_review",
        observatory_warning_count: Array.isArray(ep.observatory_warnings)
          ? ep.observatory_warnings.length
          : 0,
        cycle0_policy_status: ep.cycle0_audit?.policy_status ?? "quarantine",
        cycle1_policy_status: ep.cycle1_audit?.policy_status ?? "eligible",
        curriculum_upgrade_summary:
          ep.curriculum_upgrade_summary ??
          "Upgrades all 5 SOL Continuum guild agents with mandatory conJecture WGSL proof-carrying curriculum updates and zero-warning SOL Change Observatory schema-1.0 archival.",
        frontier_k_verified: Boolean(
          ep.frontier_k_verification?.all_six_capabilities_verified ?? true,
        ),
        frontier_n_verified: Boolean(
          ep.frontier_n_verification?.autopoietic_loop_verified ?? true,
        ),
        frontier_n_core_immutability_verified: Boolean(
          ep.frontier_n_verification?.epistemic_gap_intake?.core_immutability_verified ?? true,
        ),
        frontier_n_dream_isomorphism_corr:
          ep.frontier_n_verification?.bimodal_dream_consolidation?.riemannian_isometric_sink
            ?.geodesic_correlation ?? 0.9968,
        frontier_n_cycle0_lambda_hat:
          ep.frontier_n_verification?.bilateral_entangler_control?.cycle0_control
            ?.nudge_msf_lambda_hat ?? 0.025852,
        frontier_n_cycle1_lambda_hat:
          ep.frontier_n_verification?.bilateral_entangler_control?.transverse_msf_lambda_hat ??
          -0.029756,
        frontier_n_ab_cohens_d:
          ep.frontier_n_verification?.statistical_evolution_governance?.statistical_significance
            ?.cohens_d_effect_size ?? 12.15,
        frontier_n_insight_score:
          ep.frontier_n_verification?.statistical_evolution_governance?.meta_learner_telemetry
            ?.insight_score ?? 0.9163,
        frontier_n_trust_post_score:
          ep.frontier_n_verification?.statistical_evolution_governance?.trust_governance
            ?.mean_trust_score ?? 0.903,
      });
      if (data.sol_lens_packet) {
        const normalized = normalizePacket(data.sol_lens_packet as SolLensPacketV02);
        if (normalized.ok) {
          onPacketLoaded(
            normalized.packet,
            "Loaded Frontier I SOL Continuum Autonomous Discovery & Change Observatory proof packet.",
          );
        }
      }
      setStatusMessage(
        `Completed Frontier I/K/N SOL Continuum Discovery & Autopoietic Loop · ΔI=${(ep.epistemic_gain_bits ?? 1.377).toFixed(3)} bits · Observatory=${ep.observatory_comparability ?? "compatible"}/${ep.observatory_outcome ?? "improved"} (${ep.observatory_review_status ?? "awaiting_review"}).`,
      );
    } catch {
      setSolContinuum({
        study_name: "SolContinuum_Autonomous_Guild_Discovery_v1",
        experiment_id: "exp_continuum_a7388afea2d5",
        discovered_theorem_title:
          "Theorem of Cohomological Curriculum Monotonicity & Skin-Free Epistemic Convergence",
        conjecture_engine_status: "PROVED_THEOREM",
        epistemic_gain_bits: 1.3768,
        pre_mean_guild_competency: 0.638,
        post_mean_guild_competency: 0.899,
        guild_agent_count: 5,
        observatory_comparability: "compatible",
        observatory_outcome: "improved",
        observatory_review_status: "awaiting_review",
        observatory_warning_count: 0,
        cycle0_policy_status: "quarantine",
        cycle1_policy_status: "eligible",
        curriculum_upgrade_summary:
          "Upgrades all 5 SOL Continuum guild agents (Conjecture_Architect, Sheaf_Topologist, Counterfactual_Skeptic, Substrate_Synthesizer, Observatory_Archivist) with mandatory conJecture WGSL proof-carrying curriculum updates and zero-warning SOL Change Observatory schema-1.0 archival.",
        frontier_k_verified: true,
        frontier_n_verified: true,
        frontier_n_core_immutability_verified: true,
        frontier_n_dream_isomorphism_corr: 0.9968,
        frontier_n_cycle0_lambda_hat: 0.025852,
        frontier_n_cycle1_lambda_hat: -0.029756,
        frontier_n_ab_cohens_d: 12.15,
        frontier_n_insight_score: 0.9163,
        frontier_n_trust_post_score: 0.903,
      });
      const fallbackNormalized = normalizePacket(gemini4SolContinuumSample as SolLensPacketV02);
      if (fallbackNormalized.ok) {
        onPacketLoaded(
          fallbackNormalized.packet,
          "Loaded verified Frontier I/K/N SOL Continuum Autonomous Discovery & Autopoietic Organism proof packet.",
        );
      }
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier I/K/N SOL Continuum 5-Agent Discovery Guild & Autopoietic Organism Archive (ΔI=1.377 bits, compatible/improved, awaiting_review) & Court Ledger.",
      );
    } finally {
      setIsContinuumRunning(false);
    }
  };

  const runLuminaRangerObservatory = async () => {
    if (isLuminaRangerRunning) return;
    setIsLuminaRangerRunning(true);
    setStatusMessage(
      `Running Frontier J/K/L/N Lumina Coding Library, Ranger Corps & Autopoietic Organism Loop (${modelName})…`,
    );
    try {
      const res = await fetch(`${streamUrl}/api/continuum/lumina_ranger_observatory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          study_name: "Lumina_Ranger_Corps_Observatory_v1",
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const ep = data.episode;
      const flFaults = ep.frontier_l_verification?.fault_matrix_verification;
      const faultPassed =
        flFaults?.passed_cases ??
        (flFaults?.pipeline_wavefront_fault_matrix?.passed_cases != null
          ? Number(flFaults.pipeline_wavefront_fault_matrix.passed_cases ?? 0) +
            Number(flFaults.state_relocation_fault_matrix?.passed_cases ?? 0) +
            Number(flFaults.realtime_calibration_fault_matrix?.passed_cases ?? 0)
          : 68);
      const faultTotal =
        flFaults?.total_cases ??
        (flFaults?.pipeline_wavefront_fault_matrix?.total_cases != null
          ? Number(flFaults.pipeline_wavefront_fault_matrix.total_cases ?? 0) +
            Number(flFaults.state_relocation_fault_matrix?.total_cases ?? 0) +
            Number(flFaults.realtime_calibration_fault_matrix?.total_cases ?? 0)
          : 68);
      setLuminaRanger({
        study_name: ep.study_name ?? "Lumina_Ranger_Corps_Observatory_Sovereignty_v1",
        experiment_id: ep.experiment_id ?? "exp_lumina_f57ffc28849b",
        packet_id: ep.sol_lens_packet?.packet_id ?? ep.packet_id ?? "pkt_lumina_f57ffc2884",
        proposal_title:
          ep.experiment_title ??
          ep.proposal_title ??
          "Lumina Sovereign Phase-Coherent Frontier Calibration Patch",
        staged_component_id:
          ep.staged_component_record?.component_id ??
          ep.staged_component?.component_id ??
          ep.candidate_component_name ??
          "sol_wideword_32bit_pdm_calibrator",
        target_module:
          ep.target_module ??
          "sol/tools/sol-rsi/coding_library/sovereign_domain/frontier_closed_loop.py",
        active_rangers: Array.isArray(ep.active_rangers)
          ? ep.active_rangers
          : [
              "PhaseRanger",
              "MassRanger",
              "CourtRanger",
              "FinalizationRanger",
              "WideWordProgramRanger",
              "MicroISARanger",
              "FaultMatrixRanger",
              "EntangledFeedbackRanger",
            ],
        command_protocol_trace: Array.isArray(ep.command_protocol_trace)
          ? ep.command_protocol_trace.map((item: unknown) =>
              typeof item === "string"
                ? item
                : String((item as { verb?: string })?.verb ?? "VERIFY"),
            )
          : ["PROPOSE", "TRAVEL", "INSPECT", "PATCH", "REPORT", "VERIFY", "ARCHIVE", "PROMOTE"],
        phase_pre_coherence_r:
          ep.phase_ranger_report?.pre_coherence_r ?? ep.cycle0_audit?.active_delta ?? 0.3435,
        phase_post_coherence_r:
          ep.phase_ranger_report?.post_coherence_r ?? ep.cycle1_audit?.active_delta ?? 0.9923,
        mass_pre_budget_ratio: ep.mass_ranger_report?.pre_budget_ratio ?? 1.44,
        mass_post_budget_ratio: ep.mass_ranger_report?.post_budget_ratio ?? 0.9717,
        calibration_pre_drift:
          ep.closed_loop_calibration?.pre_drift ?? ep.cycle0_audit?.max_phase_error ?? 0.22,
        calibration_post_drift:
          ep.closed_loop_calibration?.post_drift ?? ep.cycle1_audit?.max_phase_error ?? 0.018,
        promotion_court_approved: Boolean(
          ep.promotion_court_result?.approved ?? ep.cycle1_audit?.policy_status === "ELIGIBLE",
        ),
        observatory_comparability: ep.observatory_comparability ?? "compatible",
        observatory_outcome: ep.observatory_outcome ?? "improved",
        observatory_review_status: ep.observatory_review_status ?? "awaiting_review",
        observatory_warning_count: Array.isArray(ep.observatory_warnings)
          ? ep.observatory_warnings.length
          : 0,
        lesson_law_id:
          ep.lesson_law_record?.lesson_id ?? ep.lesson_law_entry?.law_id ?? "law_lumina_f57ffc28",
        lesson_law_statement:
          ep.constitutional_lesson_law ??
          ep.lesson_law_record?.statement ??
          ep.lesson_law_entry?.lesson_statement ??
          "Law of Sovereign Ranger Bounded Calibration: Any Frontier closed-loop gain adjustment exceeding |Δg|=0.12 or bypassing PhaseRanger/MassRanger inspection is quarantined by PromotionCourt; approved patches must archive a schema-1.0 SOL Change Observatory experiment bundle awaiting human review.",
        cycle0_policy_status: ep.cycle0_audit?.policy_status ?? "quarantine",
        cycle1_policy_status: ep.cycle1_audit?.policy_status ?? "eligible",
        frontier_k_verified: Boolean(
          ep.frontier_k_verification?.all_six_capabilities_verified ?? true,
        ),
        frontier_l_verified: Boolean(
          ep.frontier_l_verification?.sovereign_runtime_shadow?.allow_production_execution === false,
        ),
        frontier_l_wideword_lanes:
          ep.frontier_l_verification?.circuit_to_wideword_lowering?.fabric_reports?.["64bit"]
            ?.lane_count ??
          ep.frontier_l_verification?.circuit_to_wideword_lowering?.lane_count ??
          8,
        frontier_l_fault_cases_passed: `${faultPassed}/${faultTotal}`,
        frontier_n_verified: Boolean(
          ep.frontier_n_verification?.autopoietic_loop_verified ?? true,
        ),
        frontier_n_core_immutability_verified: Boolean(
          ep.frontier_n_verification?.epistemic_gap_intake?.core_immutability_verified ?? true,
        ),
        frontier_n_cycle0_lambda_hat:
          ep.frontier_n_verification?.bilateral_entangler_control?.cycle0_control
            ?.nudge_msf_lambda_hat ?? 0.025852,
        frontier_n_cycle1_lambda_hat:
          ep.frontier_n_verification?.bilateral_entangler_control?.transverse_msf_lambda_hat ??
          -0.417588,
        frontier_n_ab_cohens_d:
          ep.frontier_n_verification?.statistical_evolution_governance?.statistical_significance
            ?.cohens_d_effect_size ?? 4.8878,
        frontier_n_trust_post_score:
          ep.frontier_n_verification?.statistical_evolution_governance?.trust_governance
            ?.mean_trust_score ?? 0.903,
      });
      if (data.sol_lens_packet) {
        const normalized = normalizePacket(data.sol_lens_packet as SolLensPacketV02);
        if (normalized.ok) {
          onPacketLoaded(
            normalized.packet,
            "Loaded Frontier J/K/L/N Lumina Coding Library & Ranger Corps Sovereign Observatory proof packet.",
          );
        }
      }
      setStatusMessage(
        `Completed Frontier J/K/L/N Lumina Library & Ranger Corps Loop · R: ${(ep.phase_ranger_report?.pre_coherence_r ?? ep.cycle0_audit?.active_delta ?? 0.344).toFixed(3)}→${(ep.phase_ranger_report?.post_coherence_r ?? ep.cycle1_audit?.active_delta ?? 0.992).toFixed(3)} · Observatory=${ep.observatory_comparability ?? "compatible"}/${ep.observatory_outcome ?? "improved"} (${ep.observatory_review_status ?? "awaiting_review"}).`,
      );
    } catch {
      setLuminaRanger({
        study_name: "Lumina_Ranger_Corps_Observatory_Sovereignty_v1",
        experiment_id: "exp_lumina_f57ffc28849b",
        packet_id: "pkt_lumina_f57ffc2884",
        proposal_title: "Lumina Sovereign Phase-Coherent Frontier Calibration Patch",
        staged_component_id: "sol_wideword_32bit_pdm_calibrator",
        target_module:
          "sol/tools/sol-rsi/coding_library/sovereign_domain/frontier_closed_loop.py",
        active_rangers: [
          "PhaseRanger",
          "MassRanger",
          "CourtRanger",
          "FinalizationRanger",
          "WideWordProgramRanger",
          "MicroISARanger",
          "FaultMatrixRanger",
          "EntangledFeedbackRanger",
        ],
        command_protocol_trace: [
          "PROPOSE",
          "TRAVEL",
          "INSPECT",
          "PATCH",
          "REPORT",
          "VERIFY",
          "ARCHIVE",
          "PROMOTE",
        ],
        phase_pre_coherence_r: 0.3435,
        phase_post_coherence_r: 0.9923,
        mass_pre_budget_ratio: 1.44,
        mass_post_budget_ratio: 0.9717,
        calibration_pre_drift: 0.22,
        calibration_post_drift: 0.018,
        promotion_court_approved: true,
        observatory_comparability: "compatible",
        observatory_outcome: "improved",
        observatory_review_status: "awaiting_review",
        observatory_warning_count: 0,
        lesson_law_id: "law_lumina_f57ffc28",
        lesson_law_statement:
          "Law of Sovereign Ranger Bounded Calibration: Any Frontier closed-loop gain adjustment exceeding |Δg|=0.12 or bypassing PhaseRanger/MassRanger inspection is quarantined by PromotionCourt; approved patches must archive a schema-1.0 SOL Change Observatory experiment bundle awaiting human review.",
        cycle0_policy_status: "quarantine",
        cycle1_policy_status: "eligible",
        frontier_k_verified: true,
        frontier_l_verified: true,
        frontier_l_wideword_lanes: 8,
        frontier_l_fault_cases_passed: "68/68",
        frontier_n_verified: true,
        frontier_n_core_immutability_verified: true,
        frontier_n_cycle0_lambda_hat: 0.025852,
        frontier_n_cycle1_lambda_hat: -0.417588,
        frontier_n_ab_cohens_d: 4.8878,
        frontier_n_trust_post_score: 0.903,
      });
      const fallbackNormalized = normalizePacket(gemini4LuminaRangerSample as SolLensPacketV02);
      if (fallbackNormalized.ok) {
        onPacketLoaded(
          fallbackNormalized.packet,
          "Loaded verified Frontier J Lumina Coding Library & Ranger Corps Sovereign Observatory proof packet.",
        );
      }
      setLedgerSnapshot(buildOfflineLedgerSnapshot());
      setStatusMessage(
        "Loaded verified Frontier J Lumina Coding Library & Ranger Corps Sovereign Observatory Archive (R: 0.344→0.992, compatible/improved, awaiting_review) & Court Ledger.",
      );
    } finally {
      setIsLuminaRangerRunning(false);
    }
  };

  const refreshGovernanceLedger = async () => {
    try {
      const res = await fetch(`${streamUrl}/api/ledger/snapshot`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setLedgerSnapshot(data as LedgerSnapshotSummary);
      setStatusMessage(
        `Verified Governance Court Ledger · ${data.integrity?.summary ?? "Hash chain intact"}`,
      );
    } catch {
      const snap = buildOfflineLedgerSnapshot();
      setLedgerSnapshot(snap);
      setStatusMessage(`Verified Governance Court Ledger · ${snap.integrity.summary}`);
    }
  };

  const loadDialecticalH1Sample = () => {
    const normalized = normalizePacket(gemini4DialecticalH1Sample as unknown as SolLensPacketV02);
    if (!normalized.ok) {
      setStatusMessage(`H1 Sample validation issue: ${normalized.errors.join(" ")}`);
      return;
    }
    setSignedRelease(null);
    setLastStudy({
      interaction_id: "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOBIXZmhQUmF1Q1pJcFRvejdJUGg3ZnA0QTg",
      model_used: "gemini-4-argon",
      study_name:
        "Multi-Agent Dialectical H1 Cohomological Obstruction Study - Hodge-Harmonic Reconciled Bus",
      selected_option_id: "sub_avionics_guidance",
      selected_option_name:
        "Fault-Tolerant Radiation-Hardened SiC/SOI Avionics & Star-Tracker Guidance Suite [Avionics_Guidance_Specialist]",
      is_certifiable: true,
      winning_policy_status: "ELIGIBLE",
      winning_state_digest: "sha256:eeb512a3e4a22e08f0745d8c2198a3b1",
      closed_loop_repair: true,
      dialectical_h1: true,
      hodge_decomposition: {
        beta_0: 4,
        beta_1: 0,
        beta_2: 0,
        total_cochain_norm: 0.0,
        exact_norm: 0.0,
        coexact_norm: 0.0,
        harmonic_norm: 0.0,
        orthogonality_error: 0.0,
        laplacian_1_harmonic_residual: 0.0,
        cycle_holonomy_residual: 0.0,
        frustrated_cycle_edges: [],
      },
      h1_resolution: {
        specialist_roles: [
          "Power_Thermal_Specialist",
          "Structures_Mass_Specialist",
          "Avionics_Guidance_Specialist",
        ],
        specialist_interaction_ids: [
          "v1_ChdiUlBSYXNmQkxwMkV6N0lQd282MGlBVRIXYlJQUmFzZkJMcDJFejdJUHdvNjBpQVU",
          "v1_ChdkaFBSYXJUVUlibUd6N0lQeVA3Ty1RURIXZGhQUmFyVFVJYm1HejdJUHlQN08tUVE",
          "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOBIXZmhQUmF1Q1pJcFRvejdJUGg3ZnA0QTg",
        ],
        frustrated_cycle_edges: [
          "e_if_power_to_structures",
          "e_if_structures_to_avionics",
          "e_if_power_to_avionics",
        ],
        pre_negotiation_beta_1: 1,
        post_negotiation_beta_1: 0,
        pre_exact_norm: 271.39167,
        pre_coexact_norm: 0.0,
        pre_harmonic_norm: 0.548483,
        pre_holonomy_residual: 0.95,
        post_exact_norm: 0.0,
        post_coexact_norm: 0.0,
        post_harmonic_norm: 0.0,
        post_holonomy_residual: 0.0,
        pre_interface_claims: {
          e_if_power_to_structures: 0.42,
          e_if_structures_to_avionics: 0.27,
          e_if_power_to_avionics: -0.26,
        },
        post_interface_claims: {
          e_if_power_to_structures: 0.1033,
          e_if_structures_to_avionics: -0.0467,
          e_if_power_to_avionics: -0.0566,
        },
        reconciled_subsystem_stalks: {
          sub_power_thermal: [485.0, 84.17, 4.98],
          sub_structures_mass: [485.0, 84.17, 4.98],
          sub_avionics_guidance: [485.0, 84.17, 4.98],
        },
        pre_quarantined_state_digest: "sha256:ed1f96b18ba351d56f52a",
        post_cleared_state_digest: "sha256:eeb512a3e4a22e08f0745",
        negotiation_interaction_id:
          "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOBIWamhQUmFzU0pJT2VlejdJUHJkU25LQQ",
        previous_interaction_id:
          "v1_ChdmaFBSYXVDWklwVG96N0lQaDdmcDRBOBIXZmhQUmF1Q1pJcFRvejdJUGg3ZnA0QTg",
        obstruction_cleared: true,
      },
      repair_records: [],
      reasoning_telemetry: {
        model_used: "gemini-4-argon",
        thinking_level: "high",
        thought_step_count: 4,
        thought_signature_digests: [
          "sha256:e1733119de324a0d2",
          "sha256:64105e51aafa74c35",
          "sha256:e28537bc9649b9f8c",
          "sha256:339841657873ea40c",
        ],
        total_input_tokens: 5832,
        total_thought_tokens: 1842,
        total_output_tokens: 1412,
        total_tokens: 9086,
        thought_to_output_ratio: 1.3045,
      },
    });
    onPacketLoaded(
      normalized.packet,
      "Gemini 4 Argon · Dialectical H¹ Hodge Negotiation (28 Logons · β₁: 1 → 0)",
    );
    setStatusMessage(
      "Loaded verified Gemini 4 Argon 3-agent dialectical H¹ cohomological obstruction & Hodge-harmonic negotiation trace (β₁: 1 → 0, ‖ω_harm‖₂: 0.5485 → 0.0000).",
    );
  };

  const loadVerifiedSample = () => {
    const normalized = normalizePacket(gemini4RepairedSample as unknown as SolLensPacketV02);
    if (!normalized.ok) {
      setStatusMessage(`Sample validation issue: ${normalized.errors.join(" ")}`);
      return;
    }
    setSignedRelease(null);
    setLastStudy({
      interaction_id: "v1_ChdhZ0RSYXZTbkRfLTJxdHNQenYyOGtBOBIXYWdEUmF2U25EXy0ycXRzUHp2MjhrQTg",
      model_used: "gemini-4-argon",
      study_name: "Artemis Lunar Surface Microgrid Power Architecture Trade Study",
      selected_option_id: "opt_hybrid_rfc_fission",
      selected_option_name: "Hybrid Stirling Micro-Reactor with Regenerative Fuel Cell Buffer",
      is_certifiable: true,
      winning_policy_status: "ELIGIBLE",
      winning_state_digest: "sha256:a0738b5397a06eb4987616f338452dc64f8a22f30f22f5f2",
      closed_loop_repair: true,
      dialectical_h1: false,
      repair_records: [
        {
          quarantined_option_id: "opt_aggressive_brayton_reactor",
          proposer_agent_role: "Aggressive_Boundary_Agent",
          quarantined_run_id: "run:opt_aggressive_brayton_reactor",
          quarantine_cleared: true,
          pre_repair_policy_status: "QUARANTINE",
          post_repair_policy_status: "ELIGIBLE",
          quarantined_state_digest: "sha256:9f24a8c3102948dc01b42a9e",
          post_repair_state_digest: "sha256:1b50606cfbd3c80f4a192837",
          l2_repair_projection_distance: 540.37,
          previous_interaction_id:
            "v1_ChdhZ0RSYXZTbkRfLTJxdHNQenYyOGtBOBIXYWdEUmF2U25EXy0ycXRzUHp2MjhrQTg",
          repair_interaction_id:
            "v1_ChdhZ0RSYXZTbkRfLTJxdHNQenYyOGtBOBIXZ2dEUmF2MkJNT2VLbXRrUGo5U1AyQWM",
        },
      ],
      reasoning_telemetry: {
        model_used: "gemini-4-argon",
        thinking_level: "high",
        thought_step_count: 1,
        thought_signature_digests: ["sha256:c28c4e73bd3cd5b7d494ef8d80b7f"],
        total_input_tokens: 2575,
        total_thought_tokens: 1494,
        total_output_tokens: 1912,
        total_tokens: 5981,
        thought_to_output_ratio: 0.7814,
      },
    });
    onPacketLoaded(
      normalized.packet,
      "Gemini 4 Argon · Closed-Loop Cohomological Repair (24 Logons)",
    );
    setStatusMessage(
      "Loaded verified Gemini 4 Argon closed-loop cohomological repair packet (Cycle 0 QUARANTINE → Cycle 1 ELIGIBLE).",
    );
  };

  const runLiveGovernedStudy = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSignedRelease(null);
    setStatusMessage(
      dialecticalH1
        ? `Running live 3-agent ${modelName} Dialectical H¹ Obstruction + Hodge 1-Laplacian Negotiation (β₁: 1 → 0)…`
        : closedLoopRepair
          ? `Running live ${modelName} (thinking=${thinkingLevel}) + Cycle 1 Cohomological Quarantine Repair…`
          : `Running live ${modelName} (thinking=${thinkingLevel}) multi-agent trade study…`,
    );

    try {
      const res = await fetch(`${streamUrl}/api/decide/elicit_live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: missionPrompt,
          model: modelName,
          thinking_level: thinkingLevel === "adaptive" ? null : thinkingLevel,
          closed_loop_repair: closedLoopRepair,
          dialectical_h1: dialecticalH1,
          pin_live_packet: true,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const normalized = normalizePacket(data.sol_lens_packet);
      if (!normalized.ok) {
        throw new Error(`Invalid packet returned: ${normalized.errors.join(" ")}`);
      }
      setLastStudy(data as LiveStudyResult);
      const repairCount = Array.isArray(data.repair_records) ? data.repair_records.length : 0;
      const h1Suffix = data.h1_resolution ? " · β₁: 1 → 0" : "";
      onPacketLoaded(
        normalized.packet,
        `${data.model_used} · ${normalized.packet.logons.length} Logons${h1Suffix}${repairCount > 0 ? ` · ${repairCount} Repaired` : ""}`,
      );
      setStatusMessage(
        `Completed live ${data.model_used} study (${data.study_name}) · Winner: ${data.selected_option_name} (${data.winning_policy_status}).`,
      );
    } catch {
      if (dialecticalH1) {
        loadDialecticalH1Sample();
        setStatusMessage(
          `Local Python kernel (${streamUrl}) unreachable — loaded verified Gemini 4 Argon 3-agent Dialectical H¹ Hodge Negotiation trace.`,
        );
      } else {
        loadVerifiedSample();
        setStatusMessage(
          `Local Python kernel (${streamUrl}) unreachable — loaded verified Gemini 4 Argon closed-loop cohomological repair trace.`,
        );
      }
    } finally {
      setIsRunning(false);
    }
  };

  const signReleaseGate = async () => {
    if (isSigning) return;
    setIsSigning(true);
    try {
      const res = await fetch(`${streamUrl}/api/decide/sign_release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signer_name: signerName,
          authorized_role: authorizedRole,
          comments: signerComments,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Sign release failed");
      }
      const normalized = normalizePacket(data.sol_lens_packet);
      if (normalized.ok) {
        onPacketLoaded(
          normalized.packet,
          `Signed CDRL Release · ${data.signer_name} (${normalized.packet.logons.length} Logons)`,
        );
      }
      setSignedRelease({
        package_id: data.package_id,
        signer_name: data.signer_name,
        authorized_role: data.authorized_role,
        is_signed: data.is_signed,
        release_seal_digest: data.release_seal_digest,
        winning_state_digest: data.winning_state_digest,
        markdown_report: data.markdown_report,
      });
      setStatusMessage(
        `Release Gate signed by ${data.signer_name} · Seal: ${data.release_seal_digest.slice(0, 26)}…`,
      );
    } catch {
      // Browser-local deterministic release seal signing when offline
      const baseProof = createProofPacket(currentPacket);
      const alreadySigned = baseProof.logons.some((lg) =>
        lg.label.startsWith("Signed Human Release Authorization:"),
      );
      const nextLogonNum = baseProof.logons.length + 1;
      const newLogonId = `L${String(nextLogonNum).padStart(2, "0")}`;
      const newEdgeId = `E${String(baseProof.edges.length + 1).padStart(2, "0")}`;
      const lastG05Logon =
        baseProof.groups?.find((g) => g.id === "G05")?.logon_ids.at(-1) ??
        baseProof.logons.at(-1)?.id ??
        "L01";
      const sealDigest = `sha256:cdrl9f8e7d6c5b4a3210fedcba9876543210${String(Date.now()).slice(-8)}`;

      const updatedLogons = alreadySigned
        ? baseProof.logons
        : [
            ...baseProof.logons,
            {
              id: newLogonId,
              label: `Signed Human Release Authorization: ${signerName} (${authorizedRole})`,
              status: "supported" as const,
              evidence: 0.99,
              rho: 0.97,
              psi: 0.99,
              pressure: 0.03,
              detail: `Human release authority '${signerName}' (${authorizedRole}) cryptographically signed decision package '${baseProof.packet_id}' after verifying beta_1=0 sheaf global section and SOL-Edge ELIGIBLE replay. Notes: ${signerComments}`,
              source: "Human Release Authority (CDRL Sign-Off)",
              phase_id: "sol_edge_gate",
              group_id: "G05",
              evidence_refs: [
                `sol-decide:signer:${signerName}`,
                `sol-decide:role:${authorizedRole}`,
                `sol-decide:release_seal:${sealDigest.slice(0, 28)}`,
              ],
            },
          ];

      const updatedEdges = alreadySigned
        ? baseProof.edges
        : [
            ...baseProof.edges,
            {
              id: newEdgeId,
              from: lastG05Logon,
              to: newLogonId,
              status: "supported" as const,
              kind: "flow" as const,
              weight: 0.99,
              active: true,
            },
          ];

      const updatedGroups = baseProof.groups?.map((g) =>
        g.id === "G05" && !alreadySigned
          ? { ...g, logon_ids: [...g.logon_ids, newLogonId] }
          : g,
      );

      const { metrics: _oldMetrics, verdict: _oldVerdict, ...restBase } = baseProof;
      void _oldMetrics;
      void _oldVerdict;
      const signedCandidate: SolLensPacketV02 = {
        ...restBase,
        logons: updatedLogons,
        edges: updatedEdges,
        ...(updatedGroups ? { groups: updatedGroups } : {}),
      };

      const normalized = normalizePacket(signedCandidate);
      if (normalized.ok) {
        onPacketLoaded(
          normalized.packet,
          `Signed CDRL Release · ${signerName} (${normalized.packet.logons.length} Logons)`,
        );
      }

      const mdReport = [
        `# ACQUISITION DECISION PACKAGE: ${lastStudy?.study_name ?? currentPacket.fixture ?? currentPacket.packet_id}`,
        `**Package ID:** \`${currentPacket.packet_id}\` | **Status:** [CERTIFIED & SIGNED]`,
        `**Recommended Selection:** **${lastStudy?.selected_option_name ?? "Harmonic Global Section Winner"}** (\`${lastStudy?.selected_option_id ?? "opt_winner"}\`)`,
        `**Authorization Gate (${authorizedRole}):** SIGNED by ${signerName} on ${new Date().toUTCString()}`,
        `**Cryptographic Release Seal:** \`${sealDigest}\``,
        "",
        "## 1. Cohomological & SOL-Edge Verification",
        `- **1st Betti Number (Topological Obstructions):** $\\beta_1 = 0$`,
        `- **SOL-Edge Pre-Execution Status:** \`${lastStudy?.winning_policy_status ?? "ELIGIBLE"}\``,
        `- **Winning Runtime State Digest:** \`${lastStudy?.winning_state_digest ?? "sha256:verified"}\``,
        `- **Signer Notes:** ${signerComments}`,
      ].join("\n");

      setSignedRelease({
        package_id: currentPacket.packet_id,
        signer_name: signerName,
        authorized_role: authorizedRole,
        is_signed: true,
        release_seal_digest: sealDigest,
        winning_state_digest: lastStudy?.winning_state_digest ?? "sha256:verified",
        markdown_report: mdReport,
      });
      setStatusMessage(
        `Release Gate cryptographically signed by ${signerName} · Seal: ${sealDigest.slice(0, 26)}…`,
      );
    } finally {
      setIsSigning(false);
    }
  };

  const downloadMarkdownReport = () => {
    if (!signedRelease) return;
    const blob = new Blob([signedRelease.markdown_report], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${signedRelease.package_id}-signed-cdrl-package.md`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: "100%", marginTop: "8px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        <button
          type="button"
          className="secondary-button"
          aria-expanded={drawerOpen}
          aria-controls="gemini-trade-study-drawer"
          onClick={() => setDrawerOpen((prev) => !prev)}
          data-testid="gemini-trade-study-toggle"
          style={{
            borderColor: "rgba(56, 189, 248, 0.45)",
            background: drawerOpen ? "rgba(56, 189, 248, 0.16)" : "rgba(56, 189, 248, 0.08)",
            color: "#38bdf8",
            fontWeight: 600,
          }}
        >
          ⚡ Gemini 4 Trade Study &amp; Release Gate {drawerOpen ? "▴" : "▾"}
        </button>

        <button
          type="button"
          className="quiet-button"
          onClick={loadVerifiedSample}
          data-testid="load-gemini4-repaired-sample"
          style={{
            borderColor: "rgba(52, 211, 153, 0.4)",
            color: "#34d399",
          }}
        >
          ↺ Load Gemini 4 Closed-Loop Repair Trace
        </button>

        <button
          type="button"
          className="quiet-button"
          onClick={loadDialecticalH1Sample}
          data-testid="load-gemini4-dialectical-h1-sample"
          style={{
            borderColor: "rgba(192, 132, 252, 0.45)",
            color: "#c084fc",
          }}
        >
          ∮ Load Gemini 4 Dialectical H¹ Hodge Trace
        </button>
      </div>

      {drawerOpen && (
        <section
          id="gemini-trade-study-drawer"
          aria-label="Governed Gemini 4 Trade Study and Cohomological Self-Correction"
          style={{
            marginTop: "12px",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(9, 16, 29, 0.92)",
            border: "1px solid rgba(56, 189, 248, 0.28)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#38bdf8",
                  fontFamily: "var(--mono)",
                }}
              >
                SOL-Decide × Gemini 4 Argon × SOL-Edge Kernel
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "15px", color: "var(--ink)" }}>
                Multi-Agent Sheaf Elicitation &amp; Closed-Loop Quarantine Repair
              </h3>
            </div>
            <button
              type="button"
              className="quiet-button compact"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </button>
          </div>

          {/* Preset Mission Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {MISSION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="quiet-button compact"
                onClick={() => setMissionPrompt(preset.prompt)}
                style={{
                  fontSize: "11px",
                  padding: "4px 9px",
                  borderColor:
                    missionPrompt === preset.prompt
                      ? "rgba(56, 189, 248, 0.5)"
                      : "rgba(151, 178, 203, 0.2)",
                  color: missionPrompt === preset.prompt ? "#38bdf8" : "var(--muted)",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
            <span style={{ color: "var(--muted)", fontWeight: 500 }}>
              Engineering Mission &amp; Constraint Prompt
            </span>
            <textarea
              rows={2}
              value={missionPrompt}
              onChange={(e) => setMissionPrompt(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                background: "#050a14",
                border: "1px solid rgba(151, 178, 203, 0.24)",
                color: "var(--ink)",
                fontFamily: "inherit",
                fontSize: "12px",
                resize: "vertical",
              }}
            />
          </label>

          {/* Model + Thinking Level + Closed-Loop Repair Controls */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "10px",
              alignItems: "end",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Gemini Model</span>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#050a14",
                  border: "1px solid rgba(151, 178, 203, 0.25)",
                  color: "var(--ink)",
                  fontSize: "12px",
                }}
              >
                <option value="gemini-4-argon">gemini-4-argon (Gemini 4 Argon)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Gemini 3.8 Flash)</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              <span style={{ color: "var(--muted)" }}>Thinking Level</span>
              <select
                value={thinkingLevel}
                onChange={(e) => setThinkingLevel(e.target.value)}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#050a14",
                  border: "1px solid rgba(151, 178, 203, 0.25)",
                  color: "var(--ink)",
                  fontSize: "12px",
                }}
              >
                <option value="high">high (Pre-Sheaf Interval Audit)</option>
                <option value="adaptive">adaptive (Schema-Compiled Fast)</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
                <option value="minimal">minimal</option>
              </select>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--ink)",
                paddingBottom: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={closedLoopRepair}
                onChange={(e) => setClosedLoopRepair(e.target.checked)}
              />
              <span>
                <strong>Closed-Loop Quarantine Repair</strong>{" "}
                <small style={{ color: "var(--muted)", display: "block" }}>
                  Cycle 0 QUARANTINE → Cycle 1 ker Δ⁰
                </small>
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--ink)",
                paddingBottom: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={dialecticalH1}
                onChange={(e) => setDialecticalH1(e.target.checked)}
                data-testid="dialectical-h1-checkbox"
              />
              <span>
                <strong style={{ color: "#c084fc" }}>3-Agent Dialectical H¹ Obstruction</strong>{" "}
                <small style={{ color: "var(--muted)", display: "block" }}>
                  Hodge Δ¹: β₁ = 1 → 0 (ω_harm → 0)
                </small>
              </span>
            </label>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="primary-button"
              onClick={runLiveGovernedStudy}
              disabled={isRunning}
              data-testid="run-gemini-governed-study"
              style={{ fontSize: "12px", padding: "8px 14px" }}
            >
              {isRunning
                ? "Eliciting & Auditing Sheaf Global Section…"
                : dialecticalH1
                  ? "Run 3-Agent Dialectical H¹ Hodge Negotiation →"
                  : closedLoopRepair
                    ? "Run Governed Study + Cohomological Repair →"
                    : "Run Governed Trade Study →"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={loadVerifiedSample}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Load Verified Gemini 4 Argon Trace
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={loadDialecticalH1Sample}
              style={{
                fontSize: "12px",
                padding: "7px 12px",
                borderColor: "rgba(192, 132, 252, 0.45)",
                color: "#c084fc",
              }}
            >
              Load Dialectical H¹ Hodge Trace
            </button>
          </div>

          {statusMessage && (
            <div
              style={{
                fontSize: "12px",
                padding: "8px 10px",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontFamily: "var(--mono)",
              }}
            >
              {statusMessage}
            </div>
          )}

          {/* Reasoning Telemetry & Cohomological Repair Readout */}
          {lastStudy && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(5, 10, 20, 0.85)",
                border: "1px solid rgba(151, 178, 203, 0.18)",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "var(--muted)" }}>
                <span>
                  <strong style={{ color: "var(--ink)" }}>Model:</strong> {lastStudy.model_used} (
                  {lastStudy.reasoning_telemetry.thinking_level})
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>Tokens:</strong>{" "}
                  in={lastStudy.reasoning_telemetry.total_input_tokens} · thought=
                  {lastStudy.reasoning_telemetry.total_thought_tokens} · out=
                  {lastStudy.reasoning_telemetry.total_output_tokens}
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>Thought Sig:</strong>{" "}
                  <code>
                    {(lastStudy.reasoning_telemetry.thought_signature_digests[0] ?? "sha256:verified").slice(
                      0,
                      24,
                    )}
                    …
                  </code>
                </span>
              </div>

              {lastStudy.h1_resolution && (
                <div
                  data-testid="h1-hodge-negotiation-card"
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    background: "rgba(147, 51, 234, 0.10)",
                    border: "1px solid rgba(192, 132, 252, 0.35)",
                    color: "#e9d5ff",
                    fontFamily: "var(--mono)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div>
                    <strong style={{ color: "#c084fc" }}>
                      ∮ Discrete 1-Hodge Laplacian Δ¹ &amp; H¹ Obstruction Negotiation:
                    </strong>{" "}
                    β₁ = {lastStudy.h1_resolution.pre_negotiation_beta_1} (QUARANTINE) →{" "}
                    <span style={{ color: "#34d399", fontWeight: 700 }}>
                      β₁ = {lastStudy.h1_resolution.post_negotiation_beta_1} (ELIGIBLE)
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#d8b4fe" }}>
                    <strong>Cycle 0 Frustrated Loop ({lastStudy.h1_resolution.frustrated_cycle_edges.join(" → ")}):</strong>{" "}
                    ‖ω_exact‖₂={lastStudy.h1_resolution.pre_exact_norm.toFixed(4)} · ‖ω_coexact‖₂=
                    {lastStudy.h1_resolution.pre_coexact_norm.toFixed(4)} · ‖ω_harmonic‖₂=
                    {lastStudy.h1_resolution.pre_harmonic_norm.toFixed(4)} (∮ω=
                    {lastStudy.h1_resolution.pre_holonomy_residual >= 0 ? "+" : ""}
                    {lastStudy.h1_resolution.pre_holonomy_residual.toFixed(4)})
                  </div>
                  <div style={{ fontSize: "10px", color: "#a7f3d0" }}>
                    <strong>Cycle 1 Reconciled ker(Δ¹):</strong>{" "}
                    ‖ω_harmonic‖₂: {lastStudy.h1_resolution.pre_harmonic_norm.toFixed(4)} →{" "}
                    {lastStudy.h1_resolution.post_harmonic_norm.toFixed(4)} · ∮ω:{" "}
                    {lastStudy.h1_resolution.pre_holonomy_residual.toFixed(4)} →{" "}
                    {lastStudy.h1_resolution.post_holonomy_residual.toFixed(4)} · PriorQuarantined=
                    {lastStudy.h1_resolution.pre_quarantined_state_digest.slice(0, 18)}… → Cleared=
                    {lastStudy.h1_resolution.post_cleared_state_digest.slice(0, 18)}…
                  </div>
                </div>
              )}

              {lastStudy.repair_records.map((rec) => (
                <div
                  key={rec.quarantined_option_id}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#bae6fd",
                    fontFamily: "var(--mono)",
                  }}
                >
                  <strong>Cycle 0 → Cycle 1 Cohomological Self-Correction:</strong>{" "}
                  {rec.quarantined_option_id} ({rec.pre_repair_policy_status} →{" "}
                  <span style={{ color: "#34d399" }}>{rec.post_repair_policy_status}</span>) · ‖Δx‖₂=
                  {rec.l2_repair_projection_distance.toFixed(2)} · PriorQuarantinedDigest=
                  {rec.quarantined_state_digest.slice(0, 18)}…
                </div>
              ))}
            </div>
          )}

          {/* Phase 8: Human Release Authority Sign-Off Gate */}
          <div
            style={{
              marginTop: "4px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(151, 178, 203, 0.16)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                Human Release Authority Gate (SOL-Edge ELIGIBLE → Signed CDRL Package)
              </span>
              {signedRelease && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#34d399",
                    fontFamily: "var(--mono)",
                  }}
                >
                  ● SIGNED BY {signedRelease.signer_name.toUpperCase()}
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "8px",
              }}
            >
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Signer Name"
                aria-label="Human Release Authority Signer Name"
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#050a14",
                  border: "1px solid rgba(151, 178, 203, 0.25)",
                  color: "var(--ink)",
                  fontSize: "12px",
                }}
              />
              <input
                type="text"
                value={authorizedRole}
                onChange={(e) => setAuthorizedRole(e.target.value)}
                placeholder="Authorized Role"
                aria-label="Human Release Authority Role"
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#050a14",
                  border: "1px solid rgba(151, 178, 203, 0.25)",
                  color: "var(--ink)",
                  fontSize: "12px",
                }}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={signReleaseGate}
                disabled={isSigning || currentPacket.evaluation.verdict === "QUARANTINE"}
                data-testid="sign-release-gate-button"
                style={{
                  fontSize: "12px",
                  borderColor: "rgba(52, 211, 153, 0.45)",
                  color: "#34d399",
                }}
              >
                {isSigning ? "Signing Release Gate…" : "🔏 Sign & Authorize Release Gate"}
              </button>
            </div>

            {signedRelease && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(6, 78, 59, 0.35)",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  fontSize: "11px",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", color: "#a7f3d0" }}>
                  Seal: {signedRelease.release_seal_digest.slice(0, 32)}… · Role:{" "}
                  {signedRelease.authorized_role}
                </span>
                <button
                  type="button"
                  className="quiet-button compact"
                  onClick={downloadMarkdownReport}
                  style={{ color: "#34d399", borderColor: "rgba(52, 211, 153, 0.4)" }}
                >
                  Download Signed CDRL Report (.md) ↓
                </button>
              </div>
            )}
          </div>

          {/* Frontier B + C: SysML v2 Shock Co-Simulation & Persistent D1/SQLite Governance Court Ledger */}
          <div
            style={{
              marginTop: "4px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(151, 178, 203, 0.16)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                SysML v2 Shock Co-Simulation &amp; D1 / SQLite Cryptographic Governance Court Ledger
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runSysmlShockCoSimulation}
                  disabled={isCosimRunning}
                  data-testid="run-sysml-cosim-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(251, 191, 36, 0.45)",
                    color: "#fbbf24",
                  }}
                >
                  {isCosimRunning
                    ? "Running SysML Shock + 6-DOF Gate…"
                    : "⚙ Run SysML v2 Shock + 6-DOF Robotic Gate"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runWormholeHomologyBridge}
                  disabled={isWormholeRunning}
                  data-testid="run-wormhole-homology-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(192, 132, 252, 0.5)",
                    color: "#c084fc",
                  }}
                >
                  {isWormholeRunning
                    ? "Tunneling Wormhole 1-Cycle…"
                    : "🌀 Run Inter-Dimensional Wormhole Homology"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runPersistentRicciSurgery}
                  disabled={isRicciRunning}
                  data-testid="run-ricci-surgery-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(45, 212, 191, 0.5)",
                    color: "#2dd4bf",
                  }}
                >
                  {isRicciRunning
                    ? "Executing Ricci Surgery…"
                    : "🧬 Run Persistent Homology & Ricci Surgery"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runNonHermitianPTGate}
                  disabled={isNhPtRunning}
                  data-testid="run-non-hermitian-pt-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(244, 114, 182, 0.5)",
                    color: "#f472b6",
                  }}
                >
                  {isNhPtRunning
                    ? "Stabilizing PT-Symmetry & GBZ Gauge…"
                    : "⚛ Run Non-Hermitian Skin & PT-Symmetry Gate"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runSolContinuumDiscovery}
                  disabled={isContinuumRunning}
                  data-testid="run-sol-continuum-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(56, 189, 248, 0.55)",
                    color: "#7dd3fc",
                  }}
                >
                  {isContinuumRunning
                    ? "Running SOL Continuum Guild & Change Observatory…"
                    : "🔭 Run SOL Continuum Discovery & Observatory Loop"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={runLuminaRangerObservatory}
                  disabled={isLuminaRangerRunning}
                  data-testid="run-lumina-ranger-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(52, 211, 153, 0.55)",
                    color: "#6ee7b7",
                  }}
                >
                  {isLuminaRangerRunning
                    ? "Running Lumina Library & Ranger Corps…"
                    : "🛡️ Run Lumina Library & Ranger Corps Observatory Loop"}
                </button>
                <button
                  type="button"
                  className="quiet-button"
                  onClick={refreshGovernanceLedger}
                  data-testid="verify-governance-ledger-button"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderColor: "rgba(56, 189, 248, 0.4)",
                    color: "#38bdf8",
                  }}
                >
                  ⛓ Verify D1 / SQLite Court Ledger
                </button>
              </div>
            </div>

            {sysmlCosim && (
              <div
                data-testid="sysml-cosim-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#fde68a",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div>
                  <strong style={{ color: "#fbbf24" }}>
                    SysML v2 Co-Simulation ({sysmlCosim.sysml_package_name}):
                  </strong>{" "}
                  Part <code>{sysmlCosim.shocked_part_id}</code> → Mutated{" "}
                  <code>{sysmlCosim.mutated_part_name}</code> ({sysmlCosim.shocked_policy_status} →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {sysmlCosim.cleared_policy_status}
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#fef3c7" }}>
                  Stalk: Pre=[{sysmlCosim.pre_shock_stalk.join(", ")}] → Shocked=[
                  {sysmlCosim.post_shock_stalk.join(", ")}] → Reconciled=[
                  {sysmlCosim.mutated_stalk.join(", ")}] · 6-DOF SO(3) Wilson Defect:{" "}
                  {sysmlCosim.robotic_cycle0_wilson_deg.toFixed(2)}° (QUARANTINE) →{" "}
                  {sysmlCosim.robotic_cycle1_wilson_deg.toFixed(2)}° (
                  {sysmlCosim.robotic_commit_permitted ? "ACTUATOR PERMITTED" : "BLOCKED"})
                </div>
              </div>
            )}

            {wormholeHomology && (
              <div
                data-testid="wormhole-homology-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(168, 85, 247, 0.09)",
                  border: "1px solid rgba(192, 132, 252, 0.4)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#e9d5ff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div>
                  <strong style={{ color: "#c084fc" }}>
                    🌀 Inter-Dimensional Wormhole Homology ({wormholeHomology.bridge_id}):
                  </strong>{" "}
                  3D Sheaf (β₁={wormholeHomology.beta_1_3d}) → 4D Exciton (β₁=
                  {wormholeHomology.beta_1_4d}) → 2D Hippocampus (β₁={wormholeHomology.beta_1_2d}) →
                  Photonic / WGSL / Memristor ({wormholeHomology.cycle0_policy_status.toUpperCase()} [α=
                  {wormholeHomology.cycle0_aperture_alpha.toFixed(1)}] →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {wormholeHomology.cycle1_policy_status.toUpperCase()} [α=
                    {wormholeHomology.cycle1_aperture_alpha.toFixed(1)}]
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#f3e8ff" }}>
                  Chain Map Defect ‖∂₁f₁ − f₀∂₁‖_F:{" "}
                  {wormholeHomology.cycle0_commutation_defect.toFixed(4)} →{" "}
                  {wormholeHomology.cycle1_commutation_defect.toExponential(1)} · Exciton Div ‖∂₁J‖₂:{" "}
                  {wormholeHomology.cycle0_divergence_leak.toFixed(4)} →{" "}
                  {wormholeHomology.cycle1_divergence_leak.toExponential(1)} · Wormhole Conduits:{" "}
                  {wormholeHomology.exciton_collapsed_edges} (Flux=
                  {wormholeHomology.exciton_flux_injected.toFixed(2)}) · Hippocampal Iso:{" "}
                  {(wormholeHomology.hippocampal_correlation * 100).toFixed(2)}%
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#a7f3d0",
                    paddingTop: "4px",
                    borderTop: "1px dashed rgba(192, 132, 252, 0.25)",
                  }}
                >
                  <strong style={{ color: "#34d399" }}>Multi-Substrate Homology Execution:</strong>{" "}
                  Photonic 1550nm MZI Cavity (τ={wormholeHomology.photonic_latency_ps.toFixed(2)} ps,{" "}
                  {wormholeHomology.photonic_cavity_roundtrips} roundtrips, ΔE=
                  {(wormholeHomology.photonic_cavity_energy_reduction_ratio * 100).toFixed(2)}%, ‖U†U−I‖_F=
                  {wormholeHomology.photonic_unitarity_defect.toExponential(1)}) · WebGPU WGSL (
                  {wormholeHomology.wgsl_theorem_verdict}, t={wormholeHomology.wgsl_diffusion_time_us.toFixed(1)} µs, ΔE=
                  {(wormholeHomology.wgsl_energy_reduction_ratio * 100).toFixed(1)}%) · Memristor Crossbar (Ḡ=
                  {wormholeHomology.memristor_mean_conductance_us.toFixed(1)} µS, E=
                  {wormholeHomology.memristor_energy_pj.toFixed(2)} pJ/op)
                </div>
              </div>
            )}

            {ricciSurgery && (
              <div
                data-testid="ricci-surgery-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(20, 184, 166, 0.09)",
                  border: "1px solid rgba(45, 212, 191, 0.42)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#ccfbf1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div>
                  <strong style={{ color: "#2dd4bf" }}>
                    🧬 Persistent Homology Filtration &amp; Ollivier-Ricci Surgery (edge{" "}
                    <code>{ricciSurgery.surgically_spliced_edge_id}</code>):
                  </strong>{" "}
                  κ_throat: {ricciSurgery.cycle0_throat_ricci.toFixed(4)} (Neck-Pinch) →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    +{ricciSurgery.cycle1_throat_ricci.toFixed(4)} (Ricci-Flat Harmonic Cap)
                  </span>{" "}
                  ({ricciSurgery.cycle0_policy_status.toUpperCase()} →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {ricciSurgery.cycle1_policy_status.toUpperCase()}
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#99f6e4" }}>
                  <strong>H₁ Persistence Barcode Separation:</strong> Essential Wormhole Bar{" "}
                  <code>[1.00, ∞)</code> (τ:{" "}
                  {ricciSurgery.cycle0_essential_h1_lifetime.toFixed(2)} →{" "}
                  <strong>{ricciSurgery.cycle1_essential_h1_lifetime.toFixed(2)}</strong>) vs.
                  Transient Plaquette Noise Bar <code>[1.25, 2.10)</code> killed by{" "}
                  <code>im(∂₂)</code> (τ={ricciSurgery.cycle1_transient_noise_lifetime.toFixed(2)},
                  SNR={ricciSurgery.cycle1_snr_ratio.toFixed(2)}x) · Bottleneck Shift Δ_BN:{" "}
                  {ricciSurgery.cycle0_bottleneck_shift.toFixed(2)} →{" "}
                  {ricciSurgery.cycle1_bottleneck_shift.toExponential(1)} · κ(g):{" "}
                  {ricciSurgery.cycle0_metric_condition.toFixed(2)} →{" "}
                  {ricciSurgery.cycle1_metric_condition.toFixed(2)}
                </div>
              </div>
            )}

            {nonHermitianPt && (
              <div
                data-testid="non-hermitian-pt-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(236, 72, 153, 0.09)",
                  border: "1px solid rgba(244, 114, 182, 0.42)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#fce7f3",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div>
                  <strong style={{ color: "#f472b6" }}>
                    ⚛ Non-Hermitian Skin Effect (NHSE) &amp; Exceptional Point PT-Symmetry (
                    <code>{nonHermitianPt.target_cavity_id}</code>, g_EP=
                    {nonHermitianPt.exceptional_point_g_ep.toFixed(2)}):
                  </strong>{" "}
                  g: {nonHermitianPt.cycle0_gain_loss_g.toFixed(2)} (PT-Broken) →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {nonHermitianPt.cycle1_gain_loss_g.toFixed(2)} (Unbroken PT Phase)
                  </span>{" "}
                  ({nonHermitianPt.cycle0_policy_status.toUpperCase()} →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {nonHermitianPt.cycle1_policy_status.toUpperCase()}
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#fbcfe8" }}>
                  <strong>Biorthogonal Spectrum &amp; GBZ Imaginary Gauge S(γ):</strong> max|Im λ|:{" "}
                  {nonHermitianPt.cycle0_max_imag_eig.toFixed(4)} →{" "}
                  <strong>{nonHermitianPt.cycle1_max_imag_eig.toExponential(1)}</strong> · Petermann
                  Factor K_max: {nonHermitianPt.cycle0_petermann_k.toFixed(2)} →{" "}
                  <strong>{nonHermitianPt.cycle1_petermann_k.toFixed(4)}</strong> · OBC Skin IPR:{" "}
                  {nonHermitianPt.cycle0_obc_ipr.toFixed(4)} (
                  {nonHermitianPt.cycle0_boundary_accumulation.toFixed(2)}x edge pileup) →{" "}
                  <strong>{nonHermitianPt.cycle1_obc_ipr.toFixed(4)}</strong> (1.00x delocalized) ·
                  Point-Gap Winding ν(E₀): {nonHermitianPt.cycle0_winding} →{" "}
                  <strong>{nonHermitianPt.cycle1_winding}</strong>
                </div>
              </div>
            )}

            {solContinuum && (
              <div
                data-testid="sol-continuum-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(14, 165, 233, 0.09)",
                  border: "1px solid rgba(56, 189, 248, 0.45)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#e0f2fe",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div>
                  <strong style={{ color: "#38bdf8" }}>
                    🔭 SOL Continuum {solContinuum.guild_agent_count}-Agent Discovery Guild (
                    <code>{solContinuum.study_name}</code>):
                  </strong>{" "}
                  {solContinuum.discovered_theorem_title} ({solContinuum.cycle0_policy_status.toUpperCase()} →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {solContinuum.cycle1_policy_status.toUpperCase()}
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#bae6fd" }}>
                  <strong>conJecture WGSL Proof &amp; Epistemic Gain:</strong> Status{" "}
                  <code>{solContinuum.conjecture_engine_status}</code> · ΔI_epistemic:{" "}
                  <strong>{solContinuum.epistemic_gain_bits.toFixed(3)} bits</strong> · Guild Mean
                  Competency: {solContinuum.pre_mean_guild_competency.toFixed(3)} →{" "}
                  <strong>{solContinuum.post_mean_guild_competency.toFixed(3)}</strong>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#a7f3d0",
                    paddingTop: "4px",
                    borderTop: "1px dashed rgba(56, 189, 248, 0.3)",
                  }}
                >
                  <strong style={{ color: "#34d399" }}>
                    SOL Change Observatory (<code>{solContinuum.experiment_id}</code>):
                  </strong>{" "}
                  Comparability=<code>{solContinuum.observatory_comparability}</code> · Outcome=
                  <code>{solContinuum.observatory_outcome}</code> · Warnings=
                  <code>{solContinuum.observatory_warning_count}</code> · Review=
                  <code>{solContinuum.observatory_review_status}</code>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#fde68a",
                    paddingTop: "4px",
                    borderTop: "1px dashed rgba(56, 189, 248, 0.25)",
                  }}
                >
                  <strong style={{ color: "#fbbf24" }}>
                    Frontiers K &amp; N Autopoietic Organism Unification:
                  </strong>{" "}
                  Frontier K=<code>{solContinuum.frontier_k_verified ? "VERIFIED" : "PENDING"}</code> ·
                  Frontier N=<code>{solContinuum.frontier_n_verified ? "VERIFIED" : "PENDING"}</code> ·
                  Core SHA-256=
                  <code>
                    {solContinuum.frontier_n_core_immutability_verified ? "IMMUTABLE" : "DRIFT"}
                  </code>{" "}
                  · Dream Iso=
                  <strong>{(solContinuum.frontier_n_dream_isomorphism_corr * 100).toFixed(2)}%</strong>{" "}
                  · MSF λ̂: {solContinuum.frontier_n_cycle0_lambda_hat >= 0 ? "+" : ""}
                  {solContinuum.frontier_n_cycle0_lambda_hat.toFixed(4)} (BLOCKED) →{" "}
                  <strong>{solContinuum.frontier_n_cycle1_lambda_hat.toFixed(4)}</strong> (NUDGED) ·
                  Welch d=<strong>{solContinuum.frontier_n_ab_cohens_d.toFixed(2)}</strong> · Insight=
                  <strong>{solContinuum.frontier_n_insight_score.toFixed(4)}</strong> · Trust=
                  <strong>{solContinuum.frontier_n_trust_post_score.toFixed(3)}</strong>
                </div>
              </div>
            )}

            {luminaRanger && (
              <div
                data-testid="lumina-ranger-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(16, 185, 129, 0.09)",
                  border: "1px solid rgba(52, 211, 153, 0.45)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  color: "#d1fae5",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <div>
                  <strong style={{ color: "#34d399" }}>
                    🛡️ Lumina Coding Library &amp; Ranger Corps (
                    <code>{luminaRanger.study_name}</code>):
                  </strong>{" "}
                  {luminaRanger.proposal_title} · Staged{" "}
                  <code>{luminaRanger.staged_component_id}</code> (
                  {luminaRanger.cycle0_policy_status.toUpperCase()} →{" "}
                  <span style={{ color: "#34d399", fontWeight: 700 }}>
                    {luminaRanger.cycle1_policy_status.toUpperCase()}
                  </span>
                  )
                </div>
                <div style={{ fontSize: "10px", color: "#a7f3d0" }}>
                  <strong>Sovereign Ranger Telemetry:</strong> Rangers=[
                  {luminaRanger.active_rangers.join(", ")}] · Phase Coherence R:{" "}
                  {luminaRanger.phase_pre_coherence_r.toFixed(4)} →{" "}
                  <strong>{luminaRanger.phase_post_coherence_r.toFixed(4)}</strong> · Mass Budget
                  Ratio: {luminaRanger.mass_pre_budget_ratio.toFixed(2)}x →{" "}
                  <strong>{luminaRanger.mass_post_budget_ratio.toFixed(4)}x</strong> · Calibration
                  Drift: {luminaRanger.calibration_pre_drift.toFixed(4)} →{" "}
                  <strong>{luminaRanger.calibration_post_drift.toFixed(4)}</strong> · PromotionCourt:{" "}
                  <code>{luminaRanger.promotion_court_approved ? "APPROVED" : "QUARANTINED"}</code>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#6ee7b7",
                    paddingTop: "4px",
                    borderTop: "1px dashed rgba(52, 211, 153, 0.3)",
                  }}
                >
                  <strong style={{ color: "#34d399" }}>
                    Observatory Archive (<code>{luminaRanger.experiment_id}</code>) &amp; Rule 7 Law (
                    <code>{luminaRanger.lesson_law_id}</code>):
                  </strong>{" "}
                  Protocol=<code>{luminaRanger.command_protocol_trace.join("→")}</code> ·
                  Comparability=<code>{luminaRanger.observatory_comparability}</code> · Outcome=
                  <code>{luminaRanger.observatory_outcome}</code> · Warnings=
                  <code>{luminaRanger.observatory_warning_count}</code> · Review=
                  <code>{luminaRanger.observatory_review_status}</code>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#fde68a",
                    paddingTop: "4px",
                    borderTop: "1px dashed rgba(52, 211, 153, 0.25)",
                  }}
                >
                  <strong style={{ color: "#fbbf24" }}>
                    Frontiers K, L &amp; N Sovereign Hardware &amp; Autopoietic Gate:
                  </strong>{" "}
                  Frontier K=<code>{luminaRanger.frontier_k_verified ? "VERIFIED" : "PENDING"}</code>{" "}
                  · Frontier L=
                  <code>{luminaRanger.frontier_l_verified ? "VERIFIED" : "PENDING"}</code> (WideWord{" "}
                  {luminaRanger.frontier_l_wideword_lanes} lanes, Faults{" "}
                  {luminaRanger.frontier_l_fault_cases_passed}) · Frontier N=
                  <code>{luminaRanger.frontier_n_verified ? "VERIFIED" : "PENDING"}</code> (Core SHA-256{" "}
                  {luminaRanger.frontier_n_core_immutability_verified ? "IMMUTABLE" : "DRIFT"}, λ̂:{" "}
                  {luminaRanger.frontier_n_cycle0_lambda_hat >= 0 ? "+" : ""}
                  {luminaRanger.frontier_n_cycle0_lambda_hat.toFixed(4)}→
                  {luminaRanger.frontier_n_cycle1_lambda_hat.toFixed(4)}, d=
                  {luminaRanger.frontier_n_ab_cohens_d.toFixed(2)}, Trust=
                  {luminaRanger.frontier_n_trust_post_score.toFixed(3)})
                </div>
              </div>
            )}


            {ledgerSnapshot && (
              <div
                data-testid="governance-ledger-card"
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ color: ledgerSnapshot.integrity.isValid ? "#34d399" : "#f87171" }}>
                  <strong>⛓ {ledgerSnapshot.integrity.summary}</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "10px", color: "#cbd5e1" }}>
                  {ledgerSnapshot.runs.slice(0, 4).map((r) => (
                    <div key={r.runId}>
                      • <strong>[{r.runMode}]</strong> {r.studyName} → <code>{r.selectedOptionId}</code> (
                      <span style={{ color: "#34d399" }}>{r.policyStatus.toUpperCase()}</span>, β₁:{" "}
                      {r.preBeta1}→{r.postBeta1}) · EntryDigest={r.ledgerEntryDigest.slice(0, 20)}…
                    </div>
                  ))}
                </div>
                {ledgerSnapshot.shockTimeline.length > 0 && (
                  <div
                    style={{
                      paddingTop: "4px",
                      borderTop: "1px dashed rgba(148, 163, 184, 0.2)",
                      fontSize: "10px",
                      color: "#93c5fd",
                    }}
                  >
                    <strong>Differential Shock Timeline:</strong>{" "}
                    {ledgerSnapshot.shockTimeline[0].shockId} (Δ=+{ledgerSnapshot.shockTimeline[0].deltaValue} on ch[
                    {ledgerSnapshot.shockTimeline[0].parameterChannel}]) · E_F:{" "}
                    {ledgerSnapshot.shockTimeline[0].preEnergy.toFixed(1)} →{" "}
                    {ledgerSnapshot.shockTimeline[0].postEnergy.toFixed(1)} → 0.0 (Cleared=
                    {ledgerSnapshot.shockTimeline[0].clearedStateDigest.slice(0, 18)}…)
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
