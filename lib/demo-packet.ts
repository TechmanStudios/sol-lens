import { demoEdges, demoLogons } from "./sol-engine.ts";
import {
  PACKET_SCHEMA_V02,
  normalizePacket,
  type SolLensPacketV02,
  type TraceEdgeKind,
} from "./packet-schema.ts";

const groupByLogon: Record<string, string> = {
  L01: "G01",
  L02: "G01",
  L04: "G01",
  L03: "G02",
  L05: "G02",
  L06: "G02",
  L07: "G02",
  L08: "G03",
  L09: "G03",
  L10: "G03",
};

const edgeKinds: TraceEdgeKind[] = [
  "flow",
  "dependency",
  "evidence",
  "dependency",
  "evidence",
  "flow",
  "evidence",
  "evidence",
  "constraint",
  "constraint",
  "flow",
  "feedback",
  "constraint",
  "flow",
];

export const demoPacketInput: SolLensPacketV02 = {
  schema: PACKET_SCHEMA_V02,
  packet_id: "build-week-agent-migration-01",
  generated_at: "2026-07-18T00:00:00.000Z",
  observable_trace_only: true,
  fixture: "build-week-agent-migration-01",
  models: {
    baseline: "gpt-5.5",
    candidate: "gpt-5.6-sol",
  },
  logons: demoLogons.map(
    ({
      id,
      label,
      status,
      evidence,
      rho,
      psi,
      pressure,
      detail,
      source,
    }) => ({
      id,
      label,
      status,
      evidence,
      rho,
      psi,
      pressure,
      detail,
      source,
      group_id: groupByLogon[id],
    }),
  ),
  edges: demoEdges.map((edge, index) => ({
    id: `E${String(index + 1).padStart(2, "0")}`,
    ...edge,
    kind: edgeKinds[index],
  })),
  groups: [
    {
      id: "G01",
      label: "Intent and constraints",
      logon_ids: ["L01", "L02", "L04"],
      phase: "Grounding",
    },
    {
      id: "G02",
      label: "Evidence synthesis",
      logon_ids: ["L03", "L05", "L06", "L07"],
      phase: "Evaluation",
    },
    {
      id: "G03",
      label: "Promotion decision",
      logon_ids: ["L08", "L09", "L10"],
      phase: "Court",
    },
  ],
};

const normalizedDemo = normalizePacket(demoPacketInput);
if (!normalizedDemo.ok) {
  throw new Error(`Invalid checked-in demo packet: ${normalizedDemo.errors.join(" ")}`);
}

export const demoPacket = normalizedDemo.packet;
