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
