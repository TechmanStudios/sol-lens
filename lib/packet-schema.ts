import {
  SOL_SCORING_PROFILE,
  courtVerdict,
  metricsMatch,
  scoreLogons,
  type LogonStatus,
  type SolMetrics,
  type SolVerdict,
} from "./sol-engine.ts";

export const PACKET_SCHEMA_V01 = "techman.sol-lens.proof-packet/v0.1";
export const PACKET_SCHEMA_V02 = "techman.sol-lens.proof-packet/v0.2";
export const MAX_PACKET_BYTES = 5 * 1024 * 1024;
export const MAX_PACKET_LOGONS = 5_000;
export const MAX_PACKET_EDGES = 20_000;

export type TraceLogon = {
  id: string;
  label: string;
  status: LogonStatus;
  evidence: number;
  rho: number;
  psi: number;
  pressure: number;
  detail: string;
  source: string;
  phase_id?: string;
  group_id?: string;
  timestamp?: string;
  evidence_refs?: string[];
};

export type TraceEdgeKind =
  | "dependency"
  | "evidence"
  | "constraint"
  | "flow"
  | "feedback";

export type TraceEdge = {
  id: string;
  from: string;
  to: string;
  status: LogonStatus;
  kind?: TraceEdgeKind;
  weight?: number;
  active?: boolean;
};

export type TraceGroup = {
  id: string;
  label: string;
  logon_ids: string[];
  phase?: string;
};

export type ClaimedEvaluation = {
  metrics?: SolMetrics;
  verdict?: SolVerdict;
};

export type BaselineEvaluation = {
  label: string;
  logon_count: number;
  metrics: SolMetrics;
  verdict: SolVerdict;
  source?: string;
};

export type PacketEvaluation = {
  engine: "SOL Engine";
  scoring_profile: typeof SOL_SCORING_PROFILE;
  metrics: SolMetrics;
  verdict: SolVerdict;
  claimed_evaluation_match?: boolean;
};

export interface SolChangeHandoffManifest {
  experiment_id?: string;
  study_name?: string;
  baseline_packet_path: string;
  baseline_context_path: string;
  candidate_packet_path: string;
  candidate_context_path: string;
  experiment_archive_path?: string;
  markdown_report_path?: string;
  repeat_trial_bundle_path?: string | null;
  repeat_trials_path?: string;
  experiment_dir?: string;
  observatory_db_registered?: boolean;
  comparability: string;
  outcome?: string;
  review_status: string;
  measured_baseline_time_s?: number;
  measured_candidate_time_s?: number;
  measured_execution_time_s?: number;
  measured_cost_usd?: number | null;
  cli_commands?: {
    import_continuum: string;
    compare: string;
    evaluate_trials: string;
    assess?: string;
  };
  warnings?: string[];
  adapter_version?: string;
}

export interface FrontierOVerification {
  wgsl_decision_prover_verified?: boolean;
  shader_validation?: Record<string, unknown>;
  trade_space_sweep?: Record<string, unknown>;
  msck_inflection_prover?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  calibration_spec?: Record<string, unknown>;
  repeat_trial_governance?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  summary_digest?: string;
  [key: string]: unknown;
}

export interface FrontierPVerification {
  swarm_cohomology_verified?: boolean;
  fleet_kinematics_and_payload?: Record<string, unknown>;
  closed_chain_sheaf_audit?: Record<string, unknown>;
  decentralized_se3_holonomy?: Record<string, unknown>;
  estop_safety_arbiter?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  gemini_reasoning?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  repeat_trial_summary?: Record<string, unknown>;
  frontier_p_summary_digest?: string;
  summary_digest?: string;
  [key: string]: unknown;
}

export interface FrontierQVerification {
  umok_kernel_verified?: boolean;
  geodesic_verlet_kernel?: Record<string, unknown>;
  riemannian_alu_verification?: Record<string, unknown>;
  zero_copy_ipc_can_bridge?: Record<string, unknown>;
  eligibility_interlock?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  gemini_reasoning?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  repeat_trial_summary?: Record<string, unknown>;
  frontier_q_summary_digest?: string;
  summary_digest?: string;
  [key: string]: unknown;
}

export interface FrontierRVerification {
  mitotic_foliation_verified?: boolean;
  mitotic_surface_fission?: Record<string, unknown>;
  toroidal_surgery_homology?: Record<string, unknown>;
  hawking_radiation_memory_sink?: Record<string, unknown>;
  formal_theorem_proof?: Record<string, unknown>;
  eligibility_interlock?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  gemini_reasoning?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  repeat_trial_summary?: Record<string, unknown>;
  frontier_r_summary_digest?: string;
  summary_digest?: string;
  [key: string]: unknown;
}

export interface FrontierSVerification {
  stwm_wavefront_verified?: boolean;
  coprime_quadrature_pdm?: Record<string, unknown>;
  interlane_prefix_carry?: Record<string, unknown>;
  hierarchical_waveguide_fabric?: Record<string, unknown>;
  quantum_wavefront_calibration?: Record<string, unknown>;
  autonomic_mhd_gru_jeans_bus?: Record<string, unknown>;
  formal_theorem_proof?: Record<string, unknown>;
  eligibility_interlock?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  gemini_reasoning?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  repeat_trial_summary?: Record<string, unknown>;
  frontier_s_summary_digest?: string;
  summary_digest?: string;
  [key: string]: unknown;
}

export interface FrontierTVerification {
  rsi_compiler_verified?: boolean;
  sandboxed_rsi_and_claim_compiler?: Record<string, unknown>;
  governed_compiler_invocation?: Record<string, unknown>;
  governed_pass_replay?: Record<string, unknown>;
  release_certification_bundle?: Record<string, unknown>;
  formal_theorem_proof?: Record<string, unknown>;
  eligibility_interlock?: Record<string, unknown>;
  cycle0_audit?: Record<string, unknown>;
  cycle1_audit?: Record<string, unknown>;
  gemini_reasoning?: Record<string, unknown>;
  sol_change_handoff?: SolChangeHandoffManifest | Record<string, unknown>;
  repeat_trial_summary?: Record<string, unknown>;
  frontier_t_summary_digest?: string;
  summary_digest?: string;
  [key: string]: unknown;
}

export type SolLensPacketV02 = {
  schema: typeof PACKET_SCHEMA_V02;
  packet_id: string;
  generated_at: string;
  observable_trace_only: true;
  fixture?: string;
  models?: {
    baseline?: string;
    candidate?: string;
  };
  observatory_context?: Record<string, unknown>;
  lumina_sovereign_context?: Record<string, unknown>;
  frontier_k_verification?: Record<string, unknown>;
  frontier_l_verification?: Record<string, unknown>;
  frontier_n_verification?: Record<string, unknown>;
  frontier_o_verification?: FrontierOVerification;
  frontier_p_verification?: FrontierPVerification;
  frontier_q_verification?: FrontierQVerification;
  frontier_r_verification?: FrontierRVerification;
  frontier_s_verification?: FrontierSVerification;
  frontier_t_verification?: FrontierTVerification;
  reasoning_telemetry?: Record<string, unknown>;
  baseline_evaluation?: BaselineEvaluation;
  logons: TraceLogon[];
  edges: TraceEdge[];
  groups?: TraceGroup[];
  metrics?: SolMetrics;
  verdict?: SolVerdict;
  evaluation?: PacketEvaluation;
  claimed_evaluation?: ClaimedEvaluation;
};

export type NormalizedSolLensPacket = Omit<
  SolLensPacketV02,
  "metrics" | "verdict" | "evaluation"
> & {
  evaluation: PacketEvaluation;
};

export type PacketValidationResult =
  | { ok: true; packet: NormalizedSolLensPacket }
  | { ok: false; errors: string[] };

type JsonRecord = Record<string, unknown>;

const STATUSES = new Set<LogonStatus>([
  "supported",
  "inferred",
  "contradiction",
]);
const EDGE_KINDS = new Set<TraceEdgeKind>([
  "dependency",
  "evidence",
  "constraint",
  "flow",
  "feedback",
]);
const VERDICTS = new Set<SolVerdict>([
  "PROMOTE",
  "HOLD",
  "QUARANTINE",
]);
const METRIC_KEYS: (keyof SolMetrics)[] = [
  "evidence",
  "coherence",
  "contradiction",
  "continuity",
  "authority",
  "faithfulness",
];

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const finiteUnitValue = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

const readString = (
  value: unknown,
  path: string,
  errors: string[],
  optional = false,
) => {
  if (value === undefined && optional) return undefined;
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path} must be a nonempty string.`);
    return "";
  }
  return value;
};

const readMeasure = (
  value: unknown,
  path: string,
  errors: string[],
  optional = false,
) => {
  if (value === undefined && optional) return undefined;
  if (!finiteUnitValue(value)) {
    errors.push(`${path} must be a finite number between 0 and 1.`);
    return 0;
  }
  return value;
};

const readStatus = (
  value: unknown,
  path: string,
  errors: string[],
): LogonStatus => {
  if (typeof value !== "string" || !STATUSES.has(value as LogonStatus)) {
    errors.push(
      `${path} must be supported, inferred, or contradiction.`,
    );
    return "inferred";
  }
  return value as LogonStatus;
};

const readVerdict = (
  value: unknown,
  path: string,
  errors: string[],
) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !VERDICTS.has(value as SolVerdict)) {
    errors.push(`${path} must be PROMOTE, HOLD, or QUARANTINE.`);
    return undefined;
  }
  return value as SolVerdict;
};

const readMetrics = (
  value: unknown,
  path: string,
  errors: string[],
) => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push(`${path} must be an object.`);
    return undefined;
  }

  const metrics = {} as SolMetrics;
  for (const key of METRIC_KEYS) {
    metrics[key] = readMeasure(value[key], `${path}.${key}`, errors) ?? 0;
  }
  return metrics;
};

const fnv1a = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
};

const generatedPacketId = (
  logons: readonly TraceLogon[],
  edges: readonly Pick<TraceEdge, "from" | "to" | "status">[],
) =>
  `legacy-${fnv1a(
    JSON.stringify({
      logons: logons.map((logon) => logon.id),
      edges: edges.map((edge) => [edge.from, edge.to, edge.status]),
    }),
  )}`;

function readLogons(value: unknown, errors: string[]) {
  if (!Array.isArray(value)) {
    errors.push("logons must be an array.");
    return [] as TraceLogon[];
  }
  if (value.length === 0) {
    errors.push("logons must contain at least one atomic unit.");
  }
  if (value.length > MAX_PACKET_LOGONS) {
    errors.push(
      `logons exceeds the browser limit of ${MAX_PACKET_LOGONS.toLocaleString()}.`,
    );
  }

  const logons: TraceLogon[] = [];
  const ids = new Set<string>();

  value.forEach((item, index) => {
    const path = `logons[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }

    const id = readString(item.id, `${path}.id`, errors) ?? "";
    if (id && ids.has(id)) {
      errors.push(`${path}.id duplicates Logon ID "${id}".`);
    }
    ids.add(id);

    const logon: TraceLogon = {
      id,
      label: readString(item.label, `${path}.label`, errors) ?? "",
      status: readStatus(item.status, `${path}.status`, errors),
      evidence:
        readMeasure(item.evidence, `${path}.evidence`, errors) ?? 0,
      rho: readMeasure(item.rho, `${path}.rho`, errors) ?? 0,
      psi: readMeasure(item.psi, `${path}.psi`, errors) ?? 0,
      pressure:
        readMeasure(item.pressure, `${path}.pressure`, errors) ?? 0,
      detail: readString(item.detail, `${path}.detail`, errors) ?? "",
      source: readString(item.source, `${path}.source`, errors) ?? "",
    };

    for (const optionalKey of [
      "phase_id",
      "group_id",
      "timestamp",
    ] as const) {
      const optionalValue = readString(
        item[optionalKey],
        `${path}.${optionalKey}`,
        errors,
        true,
      );
      if (optionalValue !== undefined) logon[optionalKey] = optionalValue;
    }

    if (item.evidence_refs !== undefined) {
      if (
        !Array.isArray(item.evidence_refs) ||
        item.evidence_refs.some(
          (reference) =>
            typeof reference !== "string" || reference.trim() === "",
        )
      ) {
        errors.push(
          `${path}.evidence_refs must be an array of nonempty strings.`,
        );
      } else {
        logon.evidence_refs = [...item.evidence_refs] as string[];
      }
    }
    logons.push(logon);
  });

  return logons;
}

function readEdges(
  value: unknown,
  schema: string,
  logonIds: Set<string>,
  errors: string[],
) {
  if (value === undefined && schema === PACKET_SCHEMA_V01) {
    return [] as TraceEdge[];
  }
  if (!Array.isArray(value)) {
    errors.push("edges must be an array.");
    return [] as TraceEdge[];
  }
  if (value.length > MAX_PACKET_EDGES) {
    errors.push(
      `edges exceeds the browser limit of ${MAX_PACKET_EDGES.toLocaleString()}.`,
    );
  }

  const providedIds = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isRecord(item) || item.id === undefined) continue;
    const id = readString(item.id, `edges[${index}].id`, errors) ?? "";
    if (id && providedIds.has(id)) {
      errors.push(`edges[${index}].id duplicates edge ID "${id}".`);
    }
    providedIds.add(id);
  }

  const usedIds = new Set(providedIds);
  const generatedCounts = new Map<string, number>();
  const edges: TraceEdge[] = [];

  value.forEach((item, index) => {
    const path = `edges[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }

    const from = readString(item.from, `${path}.from`, errors) ?? "";
    const to = readString(item.to, `${path}.to`, errors) ?? "";
    const status = readStatus(item.status, `${path}.status`, errors);
    if (from && !logonIds.has(from)) {
      errors.push(`${path}.from references missing Logon "${from}".`);
    }
    if (to && !logonIds.has(to)) {
      errors.push(`${path}.to references missing Logon "${to}".`);
    }

    let id =
      item.id === undefined
        ? undefined
        : readString(item.id, `${path}.id`, errors);
    if (!id && schema !== PACKET_SCHEMA_V01) {
      errors.push(`${path}.id is required for v0.2 packets.`);
    }
    if (!id) {
      const base = `E-${fnv1a(
        [from, to, status, String(item.kind ?? "dependency")].join("|"),
      )}`;
      let suffix = generatedCounts.get(base) ?? 0;
      do {
        suffix += 1;
        id = suffix === 1 ? base : `${base}-${suffix}`;
      } while (usedIds.has(id));
      generatedCounts.set(base, suffix);
      usedIds.add(id);
    }

    const edge: TraceEdge = { id, from, to, status };
    if (item.kind !== undefined) {
      if (
        typeof item.kind !== "string" ||
        !EDGE_KINDS.has(item.kind as TraceEdgeKind)
      ) {
        errors.push(`${path}.kind is not a recognized edge kind.`);
      } else {
        edge.kind = item.kind as TraceEdgeKind;
      }
    }
    const weight = readMeasure(item.weight, `${path}.weight`, errors, true);
    if (weight !== undefined) edge.weight = weight;
    if (item.active !== undefined) {
      if (typeof item.active !== "boolean") {
        errors.push(`${path}.active must be a boolean.`);
      } else {
        edge.active = item.active;
      }
    }
    edges.push(edge);
  });

  return edges;
}

function readGroups(
  value: unknown,
  logons: readonly TraceLogon[],
  errors: string[],
) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    errors.push("groups must be an array when provided.");
    return undefined;
  }

  const logonIds = new Set(logons.map((logon) => logon.id));
  const groupIds = new Set<string>();
  const groups: TraceGroup[] = [];

  value.forEach((item, index) => {
    const path = `groups[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }
    const id = readString(item.id, `${path}.id`, errors) ?? "";
    if (id && groupIds.has(id)) {
      errors.push(`${path}.id duplicates group ID "${id}".`);
    }
    groupIds.add(id);
    if (!Array.isArray(item.logon_ids) || item.logon_ids.length === 0) {
      errors.push(`${path}.logon_ids must be a nonempty array.`);
    }
    const rawIds = Array.isArray(item.logon_ids) ? item.logon_ids : [];
    const groupLogonIds: string[] = [];
    const seen = new Set<string>();
    rawIds.forEach((rawId, logonIndex) => {
      const logonId =
        readString(
          rawId,
          `${path}.logon_ids[${logonIndex}]`,
          errors,
        ) ?? "";
      if (logonId && seen.has(logonId)) {
        errors.push(`${path}.logon_ids repeats "${logonId}".`);
      }
      if (logonId && !logonIds.has(logonId)) {
        errors.push(`${path}.logon_ids references missing Logon "${logonId}".`);
      }
      seen.add(logonId);
      groupLogonIds.push(logonId);
    });

    const group: TraceGroup = {
      id,
      label: readString(item.label, `${path}.label`, errors) ?? "",
      logon_ids: groupLogonIds,
    };
    const phase = readString(
      item.phase,
      `${path}.phase`,
      errors,
      true,
    );
    if (phase !== undefined) group.phase = phase;
    groups.push(group);
  });

  if (groups.length > 0) {
    for (const logon of logons) {
      if (logon.group_id && !groupIds.has(logon.group_id)) {
        errors.push(
          `Logon "${logon.id}" references missing group "${logon.group_id}".`,
        );
      }
    }
  }
  return groups;
}

function readClaimedEvaluation(value: JsonRecord, errors: string[]) {
  if (value.claimed_evaluation !== undefined) {
    if (!isRecord(value.claimed_evaluation)) {
      errors.push("claimed_evaluation must be an object.");
      return undefined;
    }
    return {
      metrics: readMetrics(
        value.claimed_evaluation.metrics,
        "claimed_evaluation.metrics",
        errors,
      ),
      verdict: readVerdict(
        value.claimed_evaluation.verdict,
        "claimed_evaluation.verdict",
        errors,
      ),
    };
  }

  const evaluation = isRecord(value.evaluation)
    ? value.evaluation
    : undefined;
  const metrics = readMetrics(
    value.metrics ?? evaluation?.metrics,
    value.metrics === undefined ? "evaluation.metrics" : "metrics",
    errors,
  );
  const verdict = readVerdict(
    value.verdict ?? evaluation?.verdict,
    value.verdict === undefined ? "evaluation.verdict" : "verdict",
    errors,
  );
  return metrics || verdict ? { metrics, verdict } : undefined;
}

function readBaselineEvaluation(value: unknown, errors: string[]) {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("baseline_evaluation must be an object when provided.");
    return undefined;
  }

  const label = readString(
    value.label,
    "baseline_evaluation.label",
    errors,
  ) ?? "";
  const source = readString(
    value.source,
    "baseline_evaluation.source",
    errors,
    true,
  );
  const logonCount = value.logon_count;
  if (
    !Number.isInteger(logonCount) ||
    (logonCount as number) < 1 ||
    (logonCount as number) > MAX_PACKET_LOGONS
  ) {
    errors.push(
      `baseline_evaluation.logon_count must be an integer between 1 and ${MAX_PACKET_LOGONS.toLocaleString()}.`,
    );
  }
  const metrics = readMetrics(
    value.metrics,
    "baseline_evaluation.metrics",
    errors,
  );
  if (!metrics) {
    errors.push("baseline_evaluation.metrics is required.");
  }
  const verdict = readVerdict(
    value.verdict,
    "baseline_evaluation.verdict",
    errors,
  );
  if (!verdict) {
    errors.push("baseline_evaluation.verdict is required.");
  }

  if (!metrics || !verdict || !Number.isInteger(logonCount)) {
    return undefined;
  }
  return {
    label,
    logon_count: logonCount as number,
    metrics,
    verdict,
    ...(source ? { source } : {}),
  } satisfies BaselineEvaluation;
}

export function normalizeFrontierOVerification(
  value: unknown,
  errors: string[],
): FrontierOVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_o_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "shader_validation",
    "trade_space_sweep",
    "msck_inflection_prover",
    "cycle0_audit",
    "cycle1_audit",
    "calibration_spec",
    "repeat_trial_governance",
    "sol_change_handoff",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_o_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.wgsl_decision_prover_verified === false) {
    errors.push(
      "frontier_o_verification.wgsl_decision_prover_verified must be true.",
    );
  }

  const shaderVal = value.shader_validation;
  if (isRecord(shaderVal) && shaderVal.is_valid === false) {
    errors.push(
      "frontier_o_verification.shader_validation.is_valid must be true.",
    );
  }

  const sweep = value.trade_space_sweep;
  if (isRecord(sweep)) {
    if (sweep.shader_valid === false) {
      errors.push(
        "frontier_o_verification.trade_space_sweep.shader_valid must be true.",
      );
    }
    for (const positiveKey of [
      "total_grid_cells",
      "num_permutations",
      "speedup_ratio",
      "speedup_factor",
    ] as const) {
      const v = sweep[positiveKey];
      if (
        v !== undefined &&
        (typeof v !== "number" || !Number.isFinite(v) || v <= 0)
      ) {
        errors.push(
          `frontier_o_verification.trade_space_sweep.${positiveKey} must be a finite positive number.`,
        );
      }
    }
    for (const nonNegKey of [
      "min_dirichlet_energy",
      "optimal_flip_margin_l2",
      "winner_stability_fraction",
      "carnot_dissipation_energy",
    ] as const) {
      const v = sweep[nonNegKey];
      if (
        v !== undefined &&
        (typeof v !== "number" || !Number.isFinite(v) || v < 0)
      ) {
        errors.push(
          `frontier_o_verification.trade_space_sweep.${nonNegKey} must be a finite non-negative number.`,
        );
      }
    }
  }

  const msck = value.msck_inflection_prover;
  if (isRecord(msck)) {
    for (const nonNegKey of [
      "total_surface_points",
      "inflection_boundary_locus_count",
      "min_inflection_delta_pct",
    ] as const) {
      const v = msck[nonNegKey];
      if (
        v !== undefined &&
        (typeof v !== "number" || !Number.isFinite(v) || v < 0)
      ) {
        errors.push(
          `frontier_o_verification.msck_inflection_prover.${nonNegKey} must be a finite non-negative number.`,
        );
      }
    }
  }

  const cycle1 = value.cycle1_audit;
  if (isRecord(cycle1)) {
    if (cycle1.is_quarantined === true) {
      errors.push(
        "frontier_o_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (
      cycle1.policy_status !== undefined &&
      cycle1.policy_status !== "ELIGIBLE"
    ) {
      errors.push(
        "frontier_o_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
    if (
      cycle1.effective_beta_1 !== undefined &&
      cycle1.effective_beta_1 !== 0
    ) {
      errors.push(
        "frontier_o_verification.cycle1_audit.effective_beta_1 must be 0.",
      );
    }
  }

  const rtg = value.repeat_trial_governance;
  if (isRecord(rtg)) {
    if (
      rtg.trial_count !== undefined &&
      (typeof rtg.trial_count !== "number" ||
        !Number.isInteger(rtg.trial_count) ||
        rtg.trial_count < 3)
    ) {
      errors.push(
        "frontier_o_verification.repeat_trial_governance.trial_count must be an integer >= 3.",
      );
    }
    if (
      rtg.comparability !== undefined &&
      rtg.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_o_verification.repeat_trial_governance.comparability must be compatible.",
      );
    }
  }

  const handoff = value.sol_change_handoff;
  if (isRecord(handoff)) {
    if (
      handoff.comparability !== undefined &&
      handoff.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_o_verification.sol_change_handoff.comparability must be compatible.",
      );
    }
    if (
      handoff.review_status !== undefined &&
      handoff.review_status !== "awaiting_review"
    ) {
      errors.push(
        "frontier_o_verification.sol_change_handoff.review_status must be awaiting_review.",
      );
    }
    for (const timeKey of [
      "measured_execution_time_s",
      "measured_baseline_time_s",
      "measured_candidate_time_s",
    ] as const) {
      const tv = handoff[timeKey];
      if (
        tv !== undefined &&
        (typeof tv !== "number" || !Number.isFinite(tv) || tv < 0)
      ) {
        errors.push(
          `frontier_o_verification.sol_change_handoff.${timeKey} must be a finite non-negative number.`,
        );
      }
    }
  }

  return structuredClone(value) as FrontierOVerification;
}

export function normalizeFrontierPVerification(
  value: unknown,
  errors: string[],
): FrontierPVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_p_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "fleet_kinematics_and_payload",
    "closed_chain_sheaf_audit",
    "decentralized_se3_holonomy",
    "estop_safety_arbiter",
    "cycle0_audit",
    "cycle1_audit",
    "gemini_reasoning",
    "sol_change_handoff",
    "repeat_trial_summary",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_p_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.swarm_cohomology_verified !== true) {
    errors.push(
      "frontier_p_verification.swarm_cohomology_verified must be true.",
    );
  }

  const fleet = value.fleet_kinematics_and_payload;
  if (!isRecord(fleet)) {
    errors.push(
      "frontier_p_verification.fleet_kinematics_and_payload is required.",
    );
  } else {
    if (
      typeof fleet.num_robots !== "number" ||
      !Number.isInteger(fleet.num_robots) ||
      fleet.num_robots < 2
    ) {
      errors.push(
        "frontier_p_verification.fleet_kinematics_and_payload.num_robots must be an integer >= 2.",
      );
    }
    if (
      typeof fleet.payload_mass_kg !== "number" ||
      !Number.isFinite(fleet.payload_mass_kg) ||
      fleet.payload_mass_kg < 25.0
    ) {
      errors.push(
        "frontier_p_verification.fleet_kinematics_and_payload.payload_mass_kg must be a finite number >= 25.0.",
      );
    }
    if (
      fleet.fleet_metric_condition_number !== undefined &&
      (typeof fleet.fleet_metric_condition_number !== "number" ||
        !Number.isFinite(fleet.fleet_metric_condition_number) ||
        fleet.fleet_metric_condition_number <= 0)
    ) {
      errors.push(
        "frontier_p_verification.fleet_kinematics_and_payload.fleet_metric_condition_number must be a finite positive number.",
      );
    }
  }

  const sheaf = value.closed_chain_sheaf_audit;
  if (!isRecord(sheaf)) {
    errors.push(
      "frontier_p_verification.closed_chain_sheaf_audit is required.",
    );
  } else {
    if (sheaf.cycle1_effective_beta_1 !== 0) {
      errors.push(
        "frontier_p_verification.closed_chain_sheaf_audit.cycle1_effective_beta_1 must be 0.",
      );
    }
    if (
      typeof sheaf.cycle1_internal_squeeze_wrench_n !== "number" ||
      !Number.isFinite(sheaf.cycle1_internal_squeeze_wrench_n) ||
      sheaf.cycle1_internal_squeeze_wrench_n < 0 ||
      sheaf.cycle1_internal_squeeze_wrench_n > 15.0
    ) {
      errors.push(
        "frontier_p_verification.closed_chain_sheaf_audit.cycle1_internal_squeeze_wrench_n must be between 0 and 15.0 N.",
      );
    }
  }

  const se3 = value.decentralized_se3_holonomy;
  if (!isRecord(se3)) {
    errors.push(
      "frontier_p_verification.decentralized_se3_holonomy is required.",
    );
  } else {
    if (
      typeof se3.cycle1_rotational_defect_deg !== "number" ||
      !Number.isFinite(se3.cycle1_rotational_defect_deg) ||
      se3.cycle1_rotational_defect_deg < 0 ||
      se3.cycle1_rotational_defect_deg > 3.0
    ) {
      errors.push(
        "frontier_p_verification.decentralized_se3_holonomy.cycle1_rotational_defect_deg must be between 0 and 3.0 deg.",
      );
    }
    if (
      se3.cycle1_translational_defect_mm !== undefined &&
      (typeof se3.cycle1_translational_defect_mm !== "number" ||
        !Number.isFinite(se3.cycle1_translational_defect_mm) ||
        se3.cycle1_translational_defect_mm < 0 ||
        se3.cycle1_translational_defect_mm > 5.0)
    ) {
      errors.push(
        "frontier_p_verification.decentralized_se3_holonomy.cycle1_translational_defect_mm must be between 0 and 5.0 mm.",
      );
    }
    if (se3.gps_or_mocap_required !== false) {
      errors.push(
        "frontier_p_verification.decentralized_se3_holonomy.gps_or_mocap_required must be false.",
      );
    }
  }

  const estop = value.estop_safety_arbiter;
  if (!isRecord(estop)) {
    errors.push(
      "frontier_p_verification.estop_safety_arbiter is required.",
    );
  } else {
    if (
      typeof estop.estop_latency_us !== "number" ||
      !Number.isFinite(estop.estop_latency_us) ||
      estop.estop_latency_us <= 0 ||
      estop.estop_latency_us > 200.0
    ) {
      errors.push(
        "frontier_p_verification.estop_safety_arbiter.estop_latency_us must be between 0 and 200.0 us.",
      );
    }
    if (estop.cycle0_estop_triggered !== true) {
      errors.push(
        "frontier_p_verification.estop_safety_arbiter.cycle0_estop_triggered must be true.",
      );
    }
    if (estop.cycle1_estop_triggered !== false) {
      errors.push(
        "frontier_p_verification.estop_safety_arbiter.cycle1_estop_triggered must be false.",
      );
    }
  }

  const cycle1 = value.cycle1_audit;
  if (!isRecord(cycle1)) {
    errors.push("frontier_p_verification.cycle1_audit is required.");
  } else {
    if (cycle1.is_quarantined !== false) {
      errors.push(
        "frontier_p_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (cycle1.policy_status !== "ELIGIBLE") {
      errors.push(
        "frontier_p_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
  }

  const rts = value.repeat_trial_summary;
  if (isRecord(rts)) {
    if (
      rts.trial_count !== undefined &&
      (typeof rts.trial_count !== "number" ||
        !Number.isInteger(rts.trial_count) ||
        rts.trial_count < 3)
    ) {
      errors.push(
        "frontier_p_verification.repeat_trial_summary.trial_count must be an integer >= 3.",
      );
    }
    if (
      rts.comparability !== undefined &&
      rts.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_p_verification.repeat_trial_summary.comparability must be compatible.",
      );
    }
  }

  const handoff = value.sol_change_handoff;
  if (isRecord(handoff)) {
    if (
      handoff.comparability !== undefined &&
      handoff.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_p_verification.sol_change_handoff.comparability must be compatible.",
      );
    }
    if (
      handoff.review_status !== undefined &&
      handoff.review_status !== "awaiting_review"
    ) {
      errors.push(
        "frontier_p_verification.sol_change_handoff.review_status must be awaiting_review.",
      );
    }
  }

  return structuredClone(value) as FrontierPVerification;
}

export function normalizeFrontierQVerification(
  value: unknown,
  errors: string[],
): FrontierQVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_q_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "geodesic_verlet_kernel",
    "riemannian_alu_verification",
    "zero_copy_ipc_can_bridge",
    "eligibility_interlock",
    "cycle0_audit",
    "cycle1_audit",
    "gemini_reasoning",
    "sol_change_handoff",
    "repeat_trial_summary",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_q_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.umok_kernel_verified !== true) {
    errors.push("frontier_q_verification.umok_kernel_verified must be true.");
  }

  const kernel = value.geodesic_verlet_kernel;
  if (!isRecord(kernel)) {
    errors.push(
      "frontier_q_verification.geodesic_verlet_kernel is required.",
    );
  } else {
    if (
      typeof kernel.steps_executed !== "number" ||
      !Number.isInteger(kernel.steps_executed) ||
      kernel.steps_executed < 1
    ) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.steps_executed must be an integer >= 1.",
      );
    }
    if (
      typeof kernel.cycle1_mean_step_latency_us !== "number" ||
      !Number.isFinite(kernel.cycle1_mean_step_latency_us) ||
      kernel.cycle1_mean_step_latency_us <= 0 ||
      kernel.cycle1_mean_step_latency_us > 1.0
    ) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.cycle1_mean_step_latency_us must be between 0 and 1.0 us.",
      );
    }
    if (
      typeof kernel.cycle0_mean_step_latency_us !== "number" ||
      !Number.isFinite(kernel.cycle0_mean_step_latency_us) ||
      kernel.cycle0_mean_step_latency_us <= 1.0
    ) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.cycle0_mean_step_latency_us must be > 1.0 us.",
      );
    }
    if (kernel.cycle1_deadline_met !== true) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.cycle1_deadline_met must be true.",
      );
    }
    if (kernel.lock_free_c_buffer !== true) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.lock_free_c_buffer must be true.",
      );
    }
    if (kernel.zero_heap_allocations_verified !== true) {
      errors.push(
        "frontier_q_verification.geodesic_verlet_kernel.zero_heap_allocations_verified must be true.",
      );
    }
  }

  const alu = value.riemannian_alu_verification;
  if (!isRecord(alu)) {
    errors.push(
      "frontier_q_verification.riemannian_alu_verification is required.",
    );
  } else {
    if (alu.all_gates_passed !== true) {
      errors.push(
        "frontier_q_verification.riemannian_alu_verification.all_gates_passed must be true.",
      );
    }
    if (
      typeof alu.passed_cases !== "number" ||
      !Number.isInteger(alu.passed_cases) ||
      alu.passed_cases < 20
    ) {
      errors.push(
        "frontier_q_verification.riemannian_alu_verification.passed_cases must be an integer >= 20.",
      );
    }
    if (alu.mismatch_count !== 0) {
      errors.push(
        "frontier_q_verification.riemannian_alu_verification.mismatch_count must be 0.",
      );
    }
  }

  const bridge = value.zero_copy_ipc_can_bridge;
  if (!isRecord(bridge)) {
    errors.push(
      "frontier_q_verification.zero_copy_ipc_can_bridge is required.",
    );
  } else {
    if (bridge.zero_copy_verified !== true) {
      errors.push(
        "frontier_q_verification.zero_copy_ipc_can_bridge.zero_copy_verified must be true.",
      );
    }
    if (bridge.cycle0_crc_or_seq_fault_detected !== true) {
      errors.push(
        "frontier_q_verification.zero_copy_ipc_can_bridge.cycle0_crc_or_seq_fault_detected must be true.",
      );
    }
    if (bridge.cycle1_crc32_verified !== true) {
      errors.push(
        "frontier_q_verification.zero_copy_ipc_can_bridge.cycle1_crc32_verified must be true.",
      );
    }
    if (bridge.cycle1_sequence_monotonic !== true) {
      errors.push(
        "frontier_q_verification.zero_copy_ipc_can_bridge.cycle1_sequence_monotonic must be true.",
      );
    }
  }

  const interlock = value.eligibility_interlock;
  if (!isRecord(interlock)) {
    errors.push("frontier_q_verification.eligibility_interlock is required.");
  } else {
    if (interlock.cycle0_safe_state_triggered !== true) {
      errors.push(
        "frontier_q_verification.eligibility_interlock.cycle0_safe_state_triggered must be true.",
      );
    }
    if (interlock.cycle1_safe_state_triggered !== false) {
      errors.push(
        "frontier_q_verification.eligibility_interlock.cycle1_safe_state_triggered must be false.",
      );
    }
    if (interlock.authorized_claimed !== false) {
      errors.push(
        "frontier_q_verification.eligibility_interlock.authorized_claimed must be false.",
      );
    }
    if (
      typeof interlock.cycle1_staged_frames_count !== "number" ||
      !Number.isInteger(interlock.cycle1_staged_frames_count) ||
      interlock.cycle1_staged_frames_count < 1
    ) {
      errors.push(
        "frontier_q_verification.eligibility_interlock.cycle1_staged_frames_count must be an integer >= 1.",
      );
    }
  }

  const cycle1 = value.cycle1_audit;
  if (!isRecord(cycle1)) {
    errors.push("frontier_q_verification.cycle1_audit is required.");
  } else {
    if (cycle1.is_quarantined !== false) {
      errors.push(
        "frontier_q_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (cycle1.policy_status !== "ELIGIBLE") {
      errors.push(
        "frontier_q_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
  }

  const rts = value.repeat_trial_summary;
  if (isRecord(rts)) {
    if (
      rts.trial_count !== undefined &&
      (typeof rts.trial_count !== "number" ||
        !Number.isInteger(rts.trial_count) ||
        rts.trial_count < 3)
    ) {
      errors.push(
        "frontier_q_verification.repeat_trial_summary.trial_count must be an integer >= 3.",
      );
    }
    if (
      rts.comparability !== undefined &&
      rts.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_q_verification.repeat_trial_summary.comparability must be compatible.",
      );
    }
  }

  const handoff = value.sol_change_handoff;
  if (isRecord(handoff)) {
    if (
      handoff.comparability !== undefined &&
      handoff.comparability !== "compatible"
    ) {
      errors.push(
        "frontier_q_verification.sol_change_handoff.comparability must be compatible.",
      );
    }
    if (
      handoff.review_status !== undefined &&
      handoff.review_status !== "awaiting_review"
    ) {
      errors.push(
        "frontier_q_verification.sol_change_handoff.review_status must be awaiting_review.",
      );
    }
  }

  return structuredClone(value) as FrontierQVerification;
}

export function normalizeFrontierRVerification(
  value: unknown,
  errors: string[],
): FrontierRVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_r_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "mitotic_surface_fission",
    "toroidal_surgery_homology",
    "hawking_radiation_memory_sink",
    "formal_theorem_proof",
    "eligibility_interlock",
    "cycle0_audit",
    "cycle1_audit",
    "gemini_reasoning",
    "sol_change_handoff",
    "repeat_trial_summary",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_r_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.mitotic_foliation_verified !== true) {
    errors.push(
      "frontier_r_verification.mitotic_foliation_verified must be true.",
    );
  }

  const fission = value.mitotic_surface_fission;
  if (!isRecord(fission)) {
    errors.push(
      "frontier_r_verification.mitotic_surface_fission is required.",
    );
  } else {
    if (
      typeof fission.cycle1_alpha !== "number" ||
      !Number.isFinite(fission.cycle1_alpha) ||
      fission.cycle1_alpha < 0.45 - 1e-9 ||
      fission.cycle1_alpha > 0.55 + 1e-9
    ) {
      errors.push(
        "frontier_r_verification.mitotic_surface_fission.cycle1_alpha must be balanced in [0.45, 0.55].",
      );
    }
  }

  const torus = value.toroidal_surgery_homology;
  if (!isRecord(torus)) {
    errors.push(
      "frontier_r_verification.toroidal_surgery_homology is required.",
    );
  } else {
    if (torus.toroidal_genus_g !== 1) {
      errors.push(
        "frontier_r_verification.toroidal_surgery_homology.toroidal_genus_g must be 1.",
      );
    }
    if (torus.euler_characteristic_chi !== 0) {
      errors.push(
        "frontier_r_verification.toroidal_surgery_homology.euler_characteristic_chi must be 0.",
      );
    }
  }

  const hawking = value.hawking_radiation_memory_sink;
  if (!isRecord(hawking)) {
    errors.push(
      "frontier_r_verification.hawking_radiation_memory_sink is required.",
    );
  } else {
    if (
      typeof hawking.cycle1_mass_conservation_residual !== "number" ||
      !Number.isFinite(hawking.cycle1_mass_conservation_residual) ||
      hawking.cycle1_mass_conservation_residual < 0 ||
      hawking.cycle1_mass_conservation_residual > 1e-6
    ) {
      errors.push(
        "frontier_r_verification.hawking_radiation_memory_sink.cycle1_mass_conservation_residual must be <= 1e-6.",
      );
    }
    if (hawking.sacred_core_immutable !== true) {
      errors.push(
        "frontier_r_verification.hawking_radiation_memory_sink.sacred_core_immutable must be true.",
      );
    }
  }

  const cycle1 = value.cycle1_audit;
  if (!isRecord(cycle1)) {
    errors.push("frontier_r_verification.cycle1_audit is required.");
  } else {
    if (cycle1.is_quarantined !== false) {
      errors.push(
        "frontier_r_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (cycle1.policy_status !== "ELIGIBLE") {
      errors.push(
        "frontier_r_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
  }

  return structuredClone(value) as FrontierRVerification;
}

export function normalizeFrontierSVerification(
  value: unknown,
  errors: string[],
): FrontierSVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_s_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "coprime_quadrature_pdm",
    "interlane_prefix_carry",
    "hierarchical_waveguide_fabric",
    "quantum_wavefront_calibration",
    "autonomic_mhd_gru_jeans_bus",
    "formal_theorem_proof",
    "eligibility_interlock",
    "cycle0_audit",
    "cycle1_audit",
    "gemini_reasoning",
    "sol_change_handoff",
    "repeat_trial_summary",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_s_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.stwm_wavefront_verified !== true) {
    errors.push(
      "frontier_s_verification.stwm_wavefront_verified must be true.",
    );
  }

  const pdm = value.coprime_quadrature_pdm;
  if (!isRecord(pdm)) {
    errors.push("frontier_s_verification.coprime_quadrature_pdm is required.");
  } else if (
    typeof pdm.passed_cases !== "number" ||
    !Number.isInteger(pdm.passed_cases) ||
    pdm.passed_cases < 6
  ) {
    errors.push(
      "frontier_s_verification.coprime_quadrature_pdm.passed_cases must be an integer >= 6.",
    );
  }

  const prefix = value.interlane_prefix_carry;
  if (!isRecord(prefix)) {
    errors.push("frontier_s_verification.interlane_prefix_carry is required.");
  } else if (
    typeof prefix.passed_cases !== "number" ||
    !Number.isInteger(prefix.passed_cases) ||
    prefix.passed_cases < 8
  ) {
    errors.push(
      "frontier_s_verification.interlane_prefix_carry.passed_cases must be an integer >= 8.",
    );
  }

  const fabric = value.hierarchical_waveguide_fabric;
  if (!isRecord(fabric)) {
    errors.push(
      "frontier_s_verification.hierarchical_waveguide_fabric is required.",
    );
  } else if (fabric.passed_32b !== 5 || fabric.passed_64b !== 5) {
    errors.push(
      "frontier_s_verification.hierarchical_waveguide_fabric must pass 5/5 32b and 5/5 64b cases.",
    );
  }

  const qcal = value.quantum_wavefront_calibration;
  if (!isRecord(qcal)) {
    errors.push(
      "frontier_s_verification.quantum_wavefront_calibration is required.",
    );
  } else if (
    typeof qcal.passed_regimes !== "number" ||
    !Number.isInteger(qcal.passed_regimes) ||
    qcal.passed_regimes < 12
  ) {
    errors.push(
      "frontier_s_verification.quantum_wavefront_calibration.passed_regimes must be an integer >= 12.",
    );
  }

  const cycle1 = value.cycle1_audit;
  if (!isRecord(cycle1)) {
    errors.push("frontier_s_verification.cycle1_audit is required.");
  } else {
    if (cycle1.is_quarantined !== false) {
      errors.push(
        "frontier_s_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (cycle1.policy_status !== "ELIGIBLE") {
      errors.push(
        "frontier_s_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
  }

  return structuredClone(value) as FrontierSVerification;
}

export function normalizeFrontierTVerification(
  value: unknown,
  errors: string[],
): FrontierTVerification | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    errors.push("frontier_t_verification must be an object when provided.");
    return undefined;
  }

  for (const sectionKey of [
    "sandboxed_rsi_and_claim_compiler",
    "governed_compiler_invocation",
    "governed_pass_replay",
    "release_certification_bundle",
    "formal_theorem_proof",
    "eligibility_interlock",
    "cycle0_audit",
    "cycle1_audit",
    "gemini_reasoning",
    "sol_change_handoff",
    "repeat_trial_summary",
  ] as const) {
    const sectionVal = value[sectionKey];
    if (sectionVal !== undefined && !isRecord(sectionVal)) {
      errors.push(
        `frontier_t_verification.${sectionKey} must be an object when provided.`,
      );
    }
  }

  if (value.rsi_compiler_verified !== true) {
    errors.push("frontier_t_verification.rsi_compiler_verified must be true.");
  }

  const inv = value.governed_compiler_invocation;
  if (!isRecord(inv)) {
    errors.push(
      "frontier_t_verification.governed_compiler_invocation is required.",
    );
  } else {
    if (inv.production_mutation_allowed !== false) {
      errors.push(
        "frontier_t_verification.governed_compiler_invocation.production_mutation_allowed must be false.",
      );
    }
  }

  const rep = value.governed_pass_replay;
  if (!isRecord(rep)) {
    errors.push("frontier_t_verification.governed_pass_replay is required.");
  } else {
    if (rep.replay_failed_count !== 0) {
      errors.push(
        "frontier_t_verification.governed_pass_replay.replay_failed_count must be 0.",
      );
    }
  }

  const interlock = value.eligibility_interlock;
  if (isRecord(interlock)) {
    if (interlock.allow_production_execution !== false) {
      errors.push(
        "frontier_t_verification.eligibility_interlock.allow_production_execution must be false.",
      );
    }
    if (interlock.authorized_claimed !== false) {
      errors.push(
        "frontier_t_verification.eligibility_interlock.authorized_claimed must be false.",
      );
    }
  }

  const cycle1 = value.cycle1_audit;
  if (!isRecord(cycle1)) {
    errors.push("frontier_t_verification.cycle1_audit is required.");
  } else {
    if (cycle1.is_quarantined !== false) {
      errors.push(
        "frontier_t_verification.cycle1_audit.is_quarantined must be false.",
      );
    }
    if (cycle1.policy_status !== "ELIGIBLE") {
      errors.push(
        "frontier_t_verification.cycle1_audit.policy_status must be ELIGIBLE.",
      );
    }
  }

  return structuredClone(value) as FrontierTVerification;
}

export function normalizePacket(value: unknown): PacketValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, errors: ["The packet root must be a JSON object."] };
  }

  const schema = value.schema;
  if (schema !== PACKET_SCHEMA_V01 && schema !== PACKET_SCHEMA_V02) {
    errors.push(
      `schema must be ${PACKET_SCHEMA_V02} or safely migratable ${PACKET_SCHEMA_V01}.`,
    );
  }
  const acceptedSchema =
    schema === PACKET_SCHEMA_V01 ? PACKET_SCHEMA_V01 : PACKET_SCHEMA_V02;

  if (value.observable_trace_only !== true) {
    errors.push("observable_trace_only must be true.");
  }

  const logons = readLogons(value.logons, errors);
  const logonIds = new Set(logons.map((logon) => logon.id));
  const edges = readEdges(value.edges, acceptedSchema, logonIds, errors);
  const groups = readGroups(value.groups, logons, errors);
  const claimedEvaluation = readClaimedEvaluation(value, errors);
  const baselineEvaluation = readBaselineEvaluation(
    value.baseline_evaluation,
    errors,
  );

  const fixture = readString(value.fixture, "fixture", errors, true);
  let models: SolLensPacketV02["models"];
  if (value.models !== undefined) {
    if (!isRecord(value.models)) {
      errors.push("models must be an object when provided.");
    } else {
      const baseline = readString(
        value.models.baseline,
        "models.baseline",
        errors,
        true,
      );
      const candidate = readString(
        value.models.candidate,
        "models.candidate",
        errors,
        true,
      );
      if (baseline || candidate) models = { baseline, candidate };
    }
  }

  let observatoryContext: Record<string, unknown> | undefined;
  if (value.observatory_context !== undefined) {
    if (!isRecord(value.observatory_context)) {
      errors.push("observatory_context must be an object when provided.");
    } else {
      observatoryContext = structuredClone(value.observatory_context);
    }
  }

  let luminaSovereignContext: Record<string, unknown> | undefined;
  if (value.lumina_sovereign_context !== undefined) {
    if (!isRecord(value.lumina_sovereign_context)) {
      errors.push("lumina_sovereign_context must be an object when provided.");
    } else {
      luminaSovereignContext = structuredClone(value.lumina_sovereign_context);
    }
  }

  let frontierKVerification: Record<string, unknown> | undefined;
  if (value.frontier_k_verification !== undefined) {
    if (!isRecord(value.frontier_k_verification)) {
      errors.push("frontier_k_verification must be an object when provided.");
    } else {
      frontierKVerification = structuredClone(value.frontier_k_verification);
    }
  }

  let frontierLVerification: Record<string, unknown> | undefined;
  if (value.frontier_l_verification !== undefined) {
    if (!isRecord(value.frontier_l_verification)) {
      errors.push("frontier_l_verification must be an object when provided.");
    } else {
      for (const sectionKey of [
        "circuit_to_wideword_lowering",
        "fault_matrix_verification",
        "multimanifold_atomic_commit",
        "sovereign_runtime_shadow",
        "ranger_squadron_packets",
      ] as const) {
        const sectionVal = value.frontier_l_verification[sectionKey];
        if (sectionVal !== undefined && !isRecord(sectionVal)) {
          errors.push(
            `frontier_l_verification.${sectionKey} must be an object when provided.`,
          );
        }
      }
      const rtShadow = value.frontier_l_verification.sovereign_runtime_shadow;
      if (
        isRecord(rtShadow) &&
        rtShadow.allow_production_execution === true
      ) {
        errors.push(
          "frontier_l_verification.sovereign_runtime_shadow.allow_production_execution must be false.",
        );
      }
      frontierLVerification = structuredClone(value.frontier_l_verification);
    }
  }

  let frontierNVerification: Record<string, unknown> | undefined;
  if (value.frontier_n_verification !== undefined) {
    if (!isRecord(value.frontier_n_verification)) {
      errors.push("frontier_n_verification must be an object when provided.");
    } else {
      for (const sectionKey of [
        "epistemic_gap_intake",
        "bimodal_dream_consolidation",
        "bilateral_entangler_control",
        "statistical_evolution_governance",
      ] as const) {
        const sectionVal = value.frontier_n_verification[sectionKey];
        if (sectionVal !== undefined && !isRecord(sectionVal)) {
          errors.push(
            `frontier_n_verification.${sectionKey} must be an object when provided.`,
          );
        }
      }
      if (value.frontier_n_verification.autopoietic_loop_verified === false) {
        errors.push(
          "frontier_n_verification.autopoietic_loop_verified must be true.",
        );
      }
      const gapIntake = value.frontier_n_verification.epistemic_gap_intake;
      if (
        isRecord(gapIntake) &&
        gapIntake.core_immutability_verified === false
      ) {
        errors.push(
          "frontier_n_verification.epistemic_gap_intake.core_immutability_verified must be true.",
        );
      }
      const bimodalDream = value.frontier_n_verification.bimodal_dream_consolidation;
      if (
        isRecord(bimodalDream) &&
        bimodalDream.bimodal_synapse_verified === false
      ) {
        errors.push(
          "frontier_n_verification.bimodal_dream_consolidation.bimodal_synapse_verified must be true.",
        );
      }
      const bilateralControl = value.frontier_n_verification.bilateral_entangler_control;
      if (isRecord(bilateralControl)) {
        if (bilateralControl.bilateral_lock_verified === false) {
          errors.push(
            "frontier_n_verification.bilateral_entangler_control.bilateral_lock_verified must be true.",
          );
        }
        if (
          bilateralControl.transverse_msf_lambda_hat !== undefined &&
          (typeof bilateralControl.transverse_msf_lambda_hat !== "number" ||
            !Number.isFinite(bilateralControl.transverse_msf_lambda_hat) ||
            bilateralControl.transverse_msf_lambda_hat > 0)
        ) {
          errors.push(
            "frontier_n_verification.bilateral_entangler_control.transverse_msf_lambda_hat must be a finite non-positive number.",
          );
        }
      }
      const statGov = value.frontier_n_verification.statistical_evolution_governance;
      if (
        isRecord(statGov) &&
        statGov.promotion_statistically_governed === false
      ) {
        errors.push(
          "frontier_n_verification.statistical_evolution_governance.promotion_statistically_governed must be true.",
        );
      }
      frontierNVerification = structuredClone(value.frontier_n_verification);
    }
  }
  let frontierOVerification: FrontierOVerification | undefined;
  if (value.frontier_o_verification !== undefined) {
    frontierOVerification = normalizeFrontierOVerification(
      value.frontier_o_verification,
      errors,
    );
  }
  let frontierPVerification: FrontierPVerification | undefined;
  if (value.frontier_p_verification !== undefined) {
    frontierPVerification = normalizeFrontierPVerification(
      value.frontier_p_verification,
      errors,
    );
  }
  let frontierQVerification: FrontierQVerification | undefined;
  if (value.frontier_q_verification !== undefined) {
    frontierQVerification = normalizeFrontierQVerification(
      value.frontier_q_verification,
      errors,
    );
  }
  let frontierRVerification: FrontierRVerification | undefined;
  if (value.frontier_r_verification !== undefined) {
    frontierRVerification = normalizeFrontierRVerification(
      value.frontier_r_verification,
      errors,
    );
  }
  let frontierSVerification: FrontierSVerification | undefined;
  if (value.frontier_s_verification !== undefined) {
    frontierSVerification = normalizeFrontierSVerification(
      value.frontier_s_verification,
      errors,
    );
  }
  let frontierTVerification: FrontierTVerification | undefined;
  if (value.frontier_t_verification !== undefined) {
    frontierTVerification = normalizeFrontierTVerification(
      value.frontier_t_verification,
      errors,
    );
  }

  let reasoningTelemetry: Record<string, unknown> | undefined;
  if (value.reasoning_telemetry !== undefined) {
    if (!isRecord(value.reasoning_telemetry)) {
      errors.push("reasoning_telemetry must be an object when provided.");
    } else {
      reasoningTelemetry = structuredClone(value.reasoning_telemetry);
    }
  }

  let packetId: string;
  if (acceptedSchema === PACKET_SCHEMA_V02) {
    packetId = readString(value.packet_id, "packet_id", errors) ?? "";
  } else {
    packetId =
      (typeof value.packet_id === "string" && value.packet_id.trim()
        ? value.packet_id
        : undefined) ?? generatedPacketId(logons, edges);
  }

  let generatedAt =
    readString(
      value.generated_at,
      "generated_at",
      errors,
      acceptedSchema === PACKET_SCHEMA_V01,
    ) ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(generatedAt))) {
    errors.push("generated_at must be a valid date-time string.");
    generatedAt = new Date().toISOString();
  }

  if (errors.length > 0) return { ok: false, errors };

  const metrics = scoreLogons(logons);
  const verdict = courtVerdict(metrics);
  const claimedEvaluationMatch = claimedEvaluation
    ? (!claimedEvaluation.metrics ||
        metricsMatch(metrics, claimedEvaluation.metrics)) &&
      (!claimedEvaluation.verdict || claimedEvaluation.verdict === verdict)
    : undefined;

  const packet: NormalizedSolLensPacket = {
    schema: PACKET_SCHEMA_V02,
    packet_id: packetId,
    generated_at: generatedAt,
    observable_trace_only: true,
    logons,
    edges,
    evaluation: {
      engine: "SOL Engine",
      scoring_profile: SOL_SCORING_PROFILE,
      metrics,
      verdict,
      ...(claimedEvaluationMatch === undefined
        ? {}
        : { claimed_evaluation_match: claimedEvaluationMatch }),
    },
  };
  if (fixture) packet.fixture = fixture;
  if (models) packet.models = models;
  if (observatoryContext) packet.observatory_context = observatoryContext;
  if (luminaSovereignContext) packet.lumina_sovereign_context = luminaSovereignContext;
  if (frontierKVerification) packet.frontier_k_verification = frontierKVerification;
  if (frontierLVerification) packet.frontier_l_verification = frontierLVerification;
  if (frontierNVerification) packet.frontier_n_verification = frontierNVerification;
  if (frontierOVerification) packet.frontier_o_verification = frontierOVerification;
  if (frontierPVerification) packet.frontier_p_verification = frontierPVerification;
  if (frontierQVerification) packet.frontier_q_verification = frontierQVerification;
  if (frontierRVerification) packet.frontier_r_verification = frontierRVerification;
  if (frontierSVerification) packet.frontier_s_verification = frontierSVerification;
  if (frontierTVerification) packet.frontier_t_verification = frontierTVerification;
  if (reasoningTelemetry) packet.reasoning_telemetry = reasoningTelemetry;
  if (baselineEvaluation) packet.baseline_evaluation = baselineEvaluation;
  if (groups && groups.length > 0) packet.groups = groups;
  if (claimedEvaluation) packet.claimed_evaluation = claimedEvaluation;
  return { ok: true, packet };
}

export function parsePacketJson(text: string): PacketValidationResult {
  if (new TextEncoder().encode(text).byteLength > MAX_PACKET_BYTES) {
    return {
      ok: false,
      errors: ["Packet exceeds the 5 MiB browser prototype limit."],
    };
  }
  try {
    return normalizePacket(JSON.parse(text) as unknown);
  } catch (error) {
    return {
      ok: false,
      errors: [
        `The packet is not valid JSON: ${error instanceof Error ? error.message : "parse failed"}`,
      ],
    };
  }
}

export function createProofPacket(
  packet: NormalizedSolLensPacket,
  generatedAt = new Date().toISOString(),
): SolLensPacketV02 {
  return {
    schema: PACKET_SCHEMA_V02,
    packet_id: packet.packet_id,
    generated_at: generatedAt,
    observable_trace_only: true,
    ...(packet.fixture ? { fixture: packet.fixture } : {}),
    ...(packet.models ? { models: { ...packet.models } } : {}),
    ...(packet.observatory_context
      ? { observatory_context: structuredClone(packet.observatory_context) }
      : {}),
    ...(packet.lumina_sovereign_context
      ? { lumina_sovereign_context: structuredClone(packet.lumina_sovereign_context) }
      : {}),
    ...(packet.frontier_k_verification
      ? { frontier_k_verification: structuredClone(packet.frontier_k_verification) }
      : {}),
    ...(packet.frontier_l_verification
      ? { frontier_l_verification: structuredClone(packet.frontier_l_verification) }
      : {}),
    ...(packet.frontier_n_verification
      ? { frontier_n_verification: structuredClone(packet.frontier_n_verification) }
      : {}),
    ...(packet.frontier_o_verification
      ? { frontier_o_verification: structuredClone(packet.frontier_o_verification) }
      : {}),
    ...(packet.frontier_p_verification
      ? { frontier_p_verification: structuredClone(packet.frontier_p_verification) }
      : {}),
    ...(packet.frontier_q_verification
      ? { frontier_q_verification: structuredClone(packet.frontier_q_verification) }
      : {}),
    ...(packet.frontier_r_verification
      ? { frontier_r_verification: structuredClone(packet.frontier_r_verification) }
      : {}),
    ...(packet.frontier_s_verification
      ? { frontier_s_verification: structuredClone(packet.frontier_s_verification) }
      : {}),
    ...(packet.frontier_t_verification
      ? { frontier_t_verification: structuredClone(packet.frontier_t_verification) }
      : {}),
    ...(packet.reasoning_telemetry
      ? { reasoning_telemetry: structuredClone(packet.reasoning_telemetry) }
      : {}),
    ...(packet.baseline_evaluation
      ? {
          baseline_evaluation: {
            ...packet.baseline_evaluation,
            metrics: { ...packet.baseline_evaluation.metrics },
          },
        }
      : {}),
    logons: packet.logons.map((logon) => ({
      ...logon,
      ...(logon.evidence_refs
        ? { evidence_refs: [...logon.evidence_refs] }
        : {}),
    })),
    edges: packet.edges.map((edge) => ({ ...edge })),
    ...(packet.groups
      ? {
          groups: packet.groups.map((group) => ({
            ...group,
            logon_ids: [...group.logon_ids],
          })),
        }
      : {}),
    metrics: { ...packet.evaluation.metrics },
    verdict: packet.evaluation.verdict,
    evaluation: {
      ...packet.evaluation,
      metrics: { ...packet.evaluation.metrics },
    },
    ...(packet.claimed_evaluation
      ? {
          claimed_evaluation: {
            ...(packet.claimed_evaluation.metrics
              ? { metrics: { ...packet.claimed_evaluation.metrics } }
              : {}),
            ...(packet.claimed_evaluation.verdict
              ? { verdict: packet.claimed_evaluation.verdict }
              : {}),
          },
        }
      : {}),
  };
}

export function chooseInitialLogon(packet: NormalizedSolLensPacket) {
  const incoming = new Set(packet.edges.map((edge) => edge.to));
  return (
    packet.logons.find(
      (logon) => logon.status === "supported" && !incoming.has(logon.id),
    ) ??
    packet.logons.find((logon) => logon.status === "supported") ??
    packet.logons[0]
  );
}
