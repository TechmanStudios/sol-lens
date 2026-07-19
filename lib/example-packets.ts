import { demoPacket } from "./demo-packet.ts";
import {
  PACKET_SCHEMA_V02,
  normalizePacket,
  type NormalizedSolLensPacket,
  type SolLensPacketV02,
  type TraceEdge,
  type TraceGroup,
  type TraceLogon,
} from "./packet-schema.ts";
import type { LogonStatus, SolVerdict } from "./sol-engine.ts";

export type PacketExample = {
  id: string;
  title: string;
  scale: "Small" | "Medium" | "Large";
  structure: string;
  summary: string;
  packet: NormalizedSolLensPacket;
  verdict: SolVerdict;
};

const GENERATED_AT = "2026-07-19T16:00:00.000Z";

function requirePacket(input: SolLensPacketV02) {
  const result = normalizePacket(input);
  if (!result.ok) {
    throw new Error(
      `Invalid checked-in example packet ${input.packet_id}: ${result.errors.join(" ")}`,
    );
  }
  return result.packet;
}

function packet(
  packetId: string,
  logons: TraceLogon[],
  edges: TraceEdge[],
  groups?: TraceGroup[],
) {
  return requirePacket({
    schema: PACKET_SCHEMA_V02,
    packet_id: packetId,
    generated_at: GENERATED_AT,
    observable_trace_only: true,
    fixture: packetId,
    models: {
      baseline: "reference agent",
      candidate: "candidate agent",
    },
    logons,
    edges,
    ...(groups ? { groups } : {}),
  });
}

function edge(
  id: string,
  from: string,
  to: string,
  status: LogonStatus = "supported",
  kind: TraceEdge["kind"] = "flow",
): TraceEdge {
  return { id, from, to, status, kind };
}

const linearLogons: TraceLogon[] = [
  ["L01", "User request", "supported", "Prompt"],
  ["L02", "Constraint extraction", "supported", "Trace parser"],
  ["L03", "Tool lookup", "inferred", "Observable tool call"],
  ["L04", "Evidence returned", "supported", "Tool result"],
  ["L05", "Answer checked", "supported", "Constraint gate"],
  ["L06", "Answer delivered", "supported", "Candidate output"],
].map(([id, label, status, source], index) => ({
  id,
  label,
  status: status as LogonStatus,
  evidence: status === "inferred" ? 0.86 : 0.94,
  rho: 0.84 + (index % 3) * 0.03,
  psi: 0.91,
  pressure: 0.1 + (index % 2) * 0.05,
  detail: `${label} is retained as an observable step in a straight-through agent trace.`,
  source,
  group_id: index < 2 ? "G01" : index < 4 ? "G02" : "G03",
}));

const linearPacket = packet(
  "example-grounded-linear-06",
  linearLogons,
  linearLogons.slice(1).map((logon, index) =>
    edge(
      `E${String(index + 1).padStart(2, "0")}`,
      linearLogons[index].id,
      logon.id,
      logon.status,
      index === 2 ? "evidence" : index === 3 ? "constraint" : "flow",
    ),
  ),
  [
    { id: "G01", label: "Intent", phase: "Ground", logon_ids: ["L01", "L02"] },
    { id: "G02", label: "Evidence", phase: "Observe", logon_ids: ["L03", "L04"] },
    { id: "G03", label: "Answer", phase: "Decide", logon_ids: ["L05", "L06"] },
  ],
);

const feedbackPhaseNames = [
  "Frame intent",
  "Plan investigation",
  "Gather evidence",
  "Synthesize findings",
  "Challenge draft",
  "Revise answer",
];
const feedbackLaneNames = [
  "requirements",
  "repository",
  "tests",
  "documentation",
  "runtime",
  "security",
  "edge cases",
  "decision",
];

const feedbackLogons: TraceLogon[] = feedbackPhaseNames.flatMap(
  (phase, phaseIndex) =>
    feedbackLaneNames.map((lane, laneIndex) => {
      const index = phaseIndex * feedbackLaneNames.length + laneIndex;
      const status: LogonStatus =
        phaseIndex === 4 && laneIndex === 6
          ? "contradiction"
          : phaseIndex === 2 || phaseIndex === 3
            ? "inferred"
            : "supported";
      return {
        id: `F${String(index + 1).padStart(3, "0")}`,
        label: `${phase} · ${lane}`,
        status,
        evidence: status === "contradiction" ? 0.61 : status === "inferred" ? 0.87 : 0.94,
        rho: 0.78 + (laneIndex % 4) * 0.04,
        psi: status === "contradiction" ? 0.72 : 0.9,
        pressure: status === "contradiction" ? 0.76 : 0.13 + (laneIndex % 3) * 0.04,
        detail:
          status === "contradiction"
            ? "An edge-case claim conflicts with an observed constraint and is routed back for revision."
            : `${phase} records the observable ${lane} contribution to the correction loop.`,
        source: status === "contradiction" ? "Challenge gate" : "Observable trace",
        group_id: `G${String(phaseIndex + 1).padStart(2, "0")}`,
        phase_id: `P${String(phaseIndex + 1).padStart(2, "0")}`,
      };
    }),
);

const feedbackEdges: TraceEdge[] = [];
for (let phaseIndex = 0; phaseIndex < feedbackPhaseNames.length - 1; phaseIndex += 1) {
  for (let laneIndex = 0; laneIndex < feedbackLaneNames.length; laneIndex += 1) {
    const fromIndex = phaseIndex * feedbackLaneNames.length + laneIndex;
    const toIndex = fromIndex + feedbackLaneNames.length;
    feedbackEdges.push(
      edge(
        `FE${String(feedbackEdges.length + 1).padStart(3, "0")}`,
        feedbackLogons[fromIndex].id,
        feedbackLogons[toIndex].id,
        feedbackLogons[toIndex].status,
        phaseIndex === 1 ? "evidence" : phaseIndex === 3 ? "constraint" : "flow",
      ),
    );
  }
}
for (let laneIndex = 0; laneIndex < feedbackLaneNames.length - 1; laneIndex += 1) {
  feedbackEdges.push(
    edge(
      `FE${String(feedbackEdges.length + 1).padStart(3, "0")}`,
      feedbackLogons[24 + laneIndex].id,
      feedbackLogons[24 + laneIndex + 1].id,
      "inferred",
      "dependency",
    ),
  );
}
feedbackEdges.push(
  edge(
    `FE${String(feedbackEdges.length + 1).padStart(3, "0")}`,
    "F048",
    "F010",
    "inferred",
    "feedback",
  ),
);

const feedbackPacket = packet(
  "example-self-correction-loop-48",
  feedbackLogons,
  feedbackEdges,
  feedbackPhaseNames.map((label, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    label,
    phase: `Phase ${index + 1}`,
    logon_ids: feedbackLogons
      .slice(index * feedbackLaneNames.length, (index + 1) * feedbackLaneNames.length)
      .map((logon) => logon.id),
  })),
);

const conflictSources = [
  "Product docs",
  "API response",
  "Repository state",
  "Policy check",
  "Benchmark run",
  "Operator note",
];
const conflictStages = [
  "capture claim",
  "locate evidence",
  "bind source",
  "detect conflict",
  "score authority",
  "compare timestamp",
  "check scope",
  "detect conflict",
  "normalize terms",
  "test dependency",
  "weigh evidence",
  "detect conflict",
  "trace consequence",
  "apply constraint",
  "draft finding",
  "detect conflict",
  "request review",
  "record uncertainty",
  "prepare decision",
  "detect conflict",
];

const conflictLogons: TraceLogon[] = conflictSources.flatMap(
  (source, sourceIndex) =>
    conflictStages.map((stage, stageIndex) => {
      const index = sourceIndex * conflictStages.length + stageIndex;
      const status: LogonStatus = stage === "detect conflict" ? "contradiction" : stageIndex % 3 === 1 ? "inferred" : "supported";
      return {
        id: `C${String(index + 1).padStart(3, "0")}`,
        label: `${source} · ${stage}`,
        status,
        evidence: status === "contradiction" ? 0.48 : status === "inferred" ? 0.84 : 0.9,
        rho: status === "contradiction" ? 0.52 : 0.82,
        psi: status === "contradiction" ? 0.45 : 0.88,
        pressure: status === "contradiction" ? 0.82 : 0.21,
        detail:
          status === "contradiction"
            ? `${source} conflicts with another observable claim at this gate.`
            : `${source} contributes an observable ${stage} unit to the multi-source comparison.`,
        source,
        group_id: `G${String(sourceIndex + 1).padStart(2, "0")}`,
        phase_id: `P${String(Math.floor(stageIndex / 5) + 1).padStart(2, "0")}`,
      };
    }),
);

const conflictEdges: TraceEdge[] = [];
for (let sourceIndex = 0; sourceIndex < conflictSources.length; sourceIndex += 1) {
  const offset = sourceIndex * conflictStages.length;
  for (let stageIndex = 1; stageIndex < conflictStages.length; stageIndex += 1) {
    const to = conflictLogons[offset + stageIndex];
    conflictEdges.push(
      edge(
        `CE${String(conflictEdges.length + 1).padStart(3, "0")}`,
        conflictLogons[offset + stageIndex - 1].id,
        to.id,
        to.status,
        to.status === "contradiction" ? "constraint" : stageIndex % 3 === 2 ? "evidence" : "flow",
      ),
    );
  }
  if (sourceIndex > 0) {
    conflictEdges.push(
      edge(
        `CE${String(conflictEdges.length + 1).padStart(3, "0")}`,
        "C001",
        conflictLogons[offset].id,
        "supported",
        "dependency",
      ),
    );
  }
}

const conflictPacket = packet(
  "example-conflicting-sources-120",
  conflictLogons,
  conflictEdges,
  conflictSources.map((label, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    label,
    phase: "Parallel source review",
    logon_ids: conflictLogons
      .slice(index * conflictStages.length, (index + 1) * conflictStages.length)
      .map((logon) => logon.id),
  })),
);

const programPhases = [
  "Intent inventory",
  "Constraint map",
  "Repository scan",
  "Tool migration",
  "Prompt migration",
  "Data contracts",
  "Security review",
  "Regression suite",
  "Performance evals",
  "Failure analysis",
  "Promotion court",
  "Release evidence",
];

const programLogons: TraceLogon[] = programPhases.flatMap((phase, phaseIndex) =>
  Array.from({ length: 25 }, (_, stepIndex) => {
    const index = phaseIndex * 25 + stepIndex;
    const status: LogonStatus = stepIndex === 17 ? "contradiction" : stepIndex % 5 === 2 ? "inferred" : "supported";
    return {
      id: `P${String(index + 1).padStart(3, "0")}`,
      label: `${phase} · unit ${String(stepIndex + 1).padStart(2, "0")}`,
      status,
      evidence: status === "contradiction" ? 0.64 : status === "inferred" ? 0.86 : 0.93,
      rho: 0.8 + (stepIndex % 4) * 0.035,
      psi: status === "contradiction" ? 0.7 : 0.91,
      pressure: status === "contradiction" ? 0.72 : 0.14 + (stepIndex % 4) * 0.025,
      detail:
        status === "contradiction"
          ? `${phase} contains a contained exception that remains visible to the promotion court.`
          : `${phase} records observable migration unit ${stepIndex + 1} of 25.`,
      source: status === "contradiction" ? "Regression exception" : "Migration trace",
      group_id: `G${String(phaseIndex + 1).padStart(2, "0")}`,
      phase_id: `P${String(phaseIndex + 1).padStart(2, "0")}`,
    };
  }),
);

const programEdges: TraceEdge[] = [];
for (let phaseIndex = 0; phaseIndex < programPhases.length; phaseIndex += 1) {
  const offset = phaseIndex * 25;
  for (let stepIndex = 1; stepIndex < 25; stepIndex += 1) {
    const to = programLogons[offset + stepIndex];
    programEdges.push(
      edge(
        `PE${String(programEdges.length + 1).padStart(4, "0")}`,
        programLogons[offset + stepIndex - 1].id,
        to.id,
        to.status,
        to.status === "contradiction" ? "constraint" : stepIndex % 5 === 2 ? "evidence" : "flow",
      ),
    );
  }
  for (let stepIndex = 5; stepIndex < 25; stepIndex += 5) {
    programEdges.push(
      edge(
        `PE${String(programEdges.length + 1).padStart(4, "0")}`,
        programLogons[offset].id,
        programLogons[offset + stepIndex].id,
        "inferred",
        "dependency",
      ),
    );
  }
  if (phaseIndex < programPhases.length - 1) {
    programEdges.push(
      edge(
        `PE${String(programEdges.length + 1).padStart(4, "0")}`,
        programLogons[offset + 24].id,
        programLogons[offset + 25].id,
        "supported",
        "flow",
      ),
    );
  }
}

const programPacket = packet(
  "example-program-migration-300",
  programLogons,
  programEdges,
  programPhases.map((label, index) => ({
    id: `G${String(index + 1).padStart(2, "0")}`,
    label,
    phase: `Migration phase ${index + 1}`,
    logon_ids: programLogons
      .slice(index * 25, (index + 1) * 25)
      .map((logon) => logon.id),
  })),
);

function example(
  id: string,
  title: string,
  scale: PacketExample["scale"],
  structure: string,
  summary: string,
  examplePacket: NormalizedSolLensPacket,
): PacketExample {
  return {
    id,
    title,
    scale,
    structure,
    summary,
    packet: examplePacket,
    verdict: examplePacket.evaluation.verdict,
  };
}

export const packetExamples: readonly PacketExample[] = [
  example(
    "linear",
    "Grounded answer",
    "Small",
    "Linear chain",
    "Six observable steps show the simplest request → evidence → checked answer flow.",
    linearPacket,
  ),
  example(
    "branching",
    "Agent migration",
    "Small",
    "Branch + merge",
    "Ten Logons split across evidence paths, surface a contradiction, then converge on a promotion decision.",
    demoPacket,
  ),
  example(
    "feedback",
    "Self-correction loop",
    "Medium",
    "Feedback cycle",
    "A 48-Logon trace challenges a draft and routes one finding back through planning before revision.",
    feedbackPacket,
  ),
  example(
    "conflict",
    "Conflicting sources",
    "Medium",
    "Parallel conflict field",
    "Six source branches expose enough observable contradictions to trigger quarantine across 120 Logons.",
    conflictPacket,
  ),
  example(
    "program",
    "Program-scale migration",
    "Large",
    "Grouped overview",
    "Three hundred Logons collapse into 12 inspectable migration phases, demonstrating overview and drill-down.",
    programPacket,
  ),
] as const;
