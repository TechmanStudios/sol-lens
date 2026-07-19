export type LogonStatus = "supported" | "inferred" | "contradiction";

export type SolVerdict = "PROMOTE" | "HOLD" | "QUARANTINE";

export type Logon = {
  id: string;
  label: string;
  x: number;
  y: number;
  status: LogonStatus;
  evidence: number;
  rho: number;
  psi: number;
  pressure: number;
  detail: string;
  source: string;
};

export type Edge = {
  from: string;
  to: string;
  status: LogonStatus;
  active?: boolean;
};

export type SolMetrics = {
  evidence: number;
  coherence: number;
  contradiction: number;
  continuity: number;
  authority: number;
  faithfulness: number;
};

export const SOL_SCORING_PROFILE = "sol-lens-build-week/v0.1" as const;

export const demoLogons: Logon[] = [
  {
    id: "L01",
    label: "User intent",
    x: 76,
    y: 226,
    status: "supported",
    evidence: 0.99,
    rho: 0.88,
    psi: 0.94,
    pressure: 0.12,
    source: "Prompt contract",
    detail: "Captures the requested migration decision and its explicit success criteria.",
  },
  {
    id: "L02",
    label: "Parse constraints",
    x: 214,
    y: 142,
    status: "supported",
    evidence: 0.94,
    rho: 0.84,
    psi: 0.91,
    pressure: 0.18,
    source: "Structured trace",
    detail: "Extracts invariant requirements shared by the baseline and candidate runs.",
  },
  {
    id: "L03",
    label: "Retrieve evidence A",
    x: 365,
    y: 100,
    status: "inferred",
    evidence: 0.91,
    rho: 0.9,
    psi: 0.82,
    pressure: 0.22,
    source: "Tool result · A",
    detail: "Binds primary repository evidence to the first candidate claim.",
  },
  {
    id: "L04",
    label: "Identify entities",
    x: 230,
    y: 303,
    status: "supported",
    evidence: 0.89,
    rho: 0.79,
    psi: 0.86,
    pressure: 0.26,
    source: "Entity map",
    detail: "Normalizes model, tool, artifact, and requirement references across both traces.",
  },
  {
    id: "L05",
    label: "Retrieve evidence B",
    x: 393,
    y: 348,
    status: "inferred",
    evidence: 0.76,
    rho: 0.71,
    psi: 0.78,
    pressure: 0.34,
    source: "Tool result · B",
    detail: "Introduces secondary evidence with lower authority and higher unresolved pressure.",
  },
  {
    id: "L06",
    label: "Evidence synthesis",
    x: 536,
    y: 194,
    status: "inferred",
    evidence: 0.92,
    rho: 0.93,
    psi: 0.9,
    pressure: 0.15,
    source: "Candidate agent trace",
    detail: "Reconciles supported and inferred claims into one observable evidence path.",
  },
  {
    id: "L07",
    label: "Contradiction",
    x: 566,
    y: 356,
    status: "contradiction",
    evidence: 0.68,
    rho: 0.42,
    psi: 0.91,
    pressure: 0.74,
    source: "Constraint gate",
    detail: "Flags a low-authority statement that conflicts with the preserved workflow constraint.",
  },
  {
    id: "L08",
    label: "Answer draft",
    x: 678,
    y: 181,
    status: "inferred",
    evidence: 0.88,
    rho: 0.86,
    psi: 0.89,
    pressure: 0.2,
    source: "Candidate output",
    detail: "Produces the candidate response after contradiction-aware synthesis.",
  },
  {
    id: "L09",
    label: "Policy check",
    x: 772,
    y: 277,
    status: "supported",
    evidence: 0.96,
    rho: 0.9,
    psi: 0.97,
    pressure: 0.09,
    source: "Promotion court",
    detail: "Applies deterministic evidence, contradiction, and constraint thresholds.",
  },
  {
    id: "L10",
    label: "Final answer",
    x: 846,
    y: 156,
    status: "supported",
    evidence: 0.95,
    rho: 0.92,
    psi: 0.95,
    pressure: 0.08,
    source: "Promoted artifact",
    detail: "Commits the accepted answer and its replayable proof packet.",
  },
];

export const demoEdges: Edge[] = [
  { from: "L01", to: "L02", status: "supported", active: true },
  { from: "L01", to: "L04", status: "supported" },
  { from: "L02", to: "L03", status: "inferred", active: true },
  { from: "L02", to: "L05", status: "inferred" },
  { from: "L04", to: "L03", status: "supported" },
  { from: "L04", to: "L05", status: "supported", active: true },
  { from: "L03", to: "L06", status: "inferred", active: true },
  { from: "L05", to: "L06", status: "inferred", active: true },
  { from: "L03", to: "L07", status: "supported" },
  { from: "L05", to: "L07", status: "contradiction", active: true },
  { from: "L06", to: "L08", status: "inferred", active: true },
  { from: "L07", to: "L08", status: "contradiction" },
  { from: "L08", to: "L09", status: "supported", active: true },
  { from: "L09", to: "L10", status: "supported", active: true },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type ScorableLogon = Pick<
  Logon,
  "id" | "status" | "evidence" | "rho" | "psi" | "pressure"
>;

export function scoreLogons(logons: readonly ScorableLogon[]): SolMetrics {
  const nonContradictions = logons.filter((logon) => logon.status !== "contradiction");
  const contradictions = logons.filter((logon) => logon.status === "contradiction");
  const average = (values: number[]) =>
    values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);

  const evidence = average(nonContradictions.map((logon) => logon.evidence));
  const constraintAlignment = average(logons.map((logon) => logon.psi));
  const unresolvedPressure = average(logons.map((logon) => logon.pressure));
  const contradiction = contradictions.length / Math.max(logons.length + 4, 1);
  const coherence = clamp(evidence * 0.45 + constraintAlignment * 0.42 + (1 - unresolvedPressure) * 0.13);

  return {
    evidence: clamp(evidence),
    coherence,
    contradiction: clamp(contradiction),
    continuity: clamp(average(logons.map((logon) => logon.rho)) + 0.08),
    authority: clamp(evidence + 0.025),
    faithfulness: clamp(constraintAlignment - contradiction * 0.18),
  };
}

export function courtVerdict(metrics: SolMetrics): SolVerdict {
  if (metrics.contradiction > 0.2 || metrics.coherence < 0.72) return "QUARANTINE";
  if (metrics.contradiction > 0.1 || metrics.evidence < 0.82) return "HOLD";
  return "PROMOTE";
}

export function metricsMatch(left: SolMetrics, right: SolMetrics, tolerance = 1e-9) {
  return (Object.keys(left) as (keyof SolMetrics)[]).every(
    (key) => Math.abs(left[key] - right[key]) <= tolerance,
  );
}

export function createProofPacket(logons: Logon[], metrics: SolMetrics) {
  return {
    schema: "techman.sol-lens.proof-packet/v0.1",
    generated_at: new Date().toISOString(),
    fixture: "build-week-agent-migration-01",
    models: {
      baseline: "Reference agent",
      candidate: "Candidate agent",
    },
    observable_trace_only: true,
    metrics,
    verdict: courtVerdict(metrics),
    logons: logons.map((logon) => ({
      id: logon.id,
      label: logon.label,
      status: logon.status,
      evidence: logon.evidence,
      rho: logon.rho,
      psi: logon.psi,
      pressure: logon.pressure,
      detail: logon.detail,
      source: logon.source,
    })),
  };
}
