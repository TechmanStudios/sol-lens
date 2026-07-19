const SCHEMA_V02 = "techman.sol-lens.proof-packet/v0.2";

const idFor = (index) => `N${String(index + 1).padStart(4, "0")}`;

export function makeTracePacket(
  count,
  { packetId = `fixture-${count}`, withGroups = false, feedback = false } = {},
) {
  const logons = Array.from({ length: count }, (_, index) => {
    const status =
      index > 0 && index % 29 === 0
        ? "contradiction"
        : index % 4 === 2
          ? "inferred"
          : "supported";
    return {
      id: idFor(index),
      label: `Observable unit ${index + 1}`,
      status,
      evidence: Number((0.82 + (index % 9) * 0.018).toFixed(3)),
      rho: Number((0.7 + (index % 7) * 0.035).toFixed(3)),
      psi: Number((0.78 + (index % 6) * 0.035).toFixed(3)),
      pressure:
        status === "contradiction"
          ? 0.72
          : Number((0.08 + (index % 8) * 0.035).toFixed(3)),
      detail: `Deterministic observable fixture unit ${index + 1}.`,
      source: index % 3 === 0 ? "Tool event" : "Trace event",
      ...(withGroups
        ? {
            group_id: `G${String(Math.floor(index / 25) + 1).padStart(2, "0")}`,
            phase_id: `P${String(Math.floor(index / 50) + 1).padStart(2, "0")}`,
          }
        : {}),
    };
  });

  const edges = [];
  for (let index = 1; index < count; index += 1) {
    const parent = Math.max(0, index - 6);
    edges.push({
      id: `E${String(index).padStart(5, "0")}`,
      from: idFor(parent),
      to: idFor(index),
      status: logons[index].status,
      kind: index % 5 === 0 ? "evidence" : "flow",
      active: index % 11 === 0,
    });
  }
  if (feedback && count >= 3) {
    edges.push({
      id: "E-FEEDBACK",
      from: idFor(count - 1),
      to: idFor(1),
      status: "inferred",
      kind: "feedback",
    });
  }

  const groups = withGroups
    ? Array.from({ length: Math.ceil(count / 25) }, (_, index) => ({
        id: `G${String(index + 1).padStart(2, "0")}`,
        label: `Trace cohort ${index + 1}`,
        phase: `Phase ${Math.floor(index / 2) + 1}`,
        logon_ids: logons
          .slice(index * 25, (index + 1) * 25)
          .map((logon) => logon.id),
      }))
    : undefined;

  return {
    schema: SCHEMA_V02,
    packet_id: packetId,
    generated_at: "2026-07-19T12:00:00.000Z",
    observable_trace_only: true,
    models: {
      baseline: "fixture-baseline",
      candidate: "fixture-candidate",
    },
    logons,
    edges,
    ...(groups ? { groups } : {}),
  };
}

export const oneLogonPacket = makeTracePacket(1, {
  packetId: "fixture-one",
});
export const disconnectedPacket = {
  ...makeTracePacket(4, { packetId: "fixture-disconnected" }),
  edges: [],
};
export const feedbackPacket = makeTracePacket(8, {
  packetId: "fixture-feedback",
  feedback: true,
});
export const explorationPacket = makeTracePacket(50, {
  packetId: "fixture-exploration-50",
});
export const overviewPacket = makeTracePacket(250, {
  packetId: "fixture-overview-250",
});
export const valid24Packet = makeTracePacket(24, {
  packetId: "fixture-valid-24",
});
export const exploration120Packet = makeTracePacket(120, {
  packetId: "fixture-exploration-120",
});
export const overview500Packet = makeTracePacket(500, {
  packetId: "fixture-overview-500",
  withGroups: true,
});

export const duplicateIdPacket = {
  ...makeTracePacket(2, { packetId: "fixture-invalid-duplicate" }),
  logons: [
    makeTracePacket(1).logons[0],
    { ...makeTracePacket(1).logons[0], label: "Duplicate" },
  ],
};

export const missingTargetPacket = {
  ...makeTracePacket(2, { packetId: "fixture-invalid-target" }),
  edges: [
    {
      id: "E-MISSING",
      from: "N0001",
      to: "N9999",
      status: "supported",
    },
  ],
};

export const outOfRangePacket = {
  ...makeTracePacket(1, { packetId: "fixture-invalid-measure" }),
  logons: [{ ...makeTracePacket(1).logons[0], evidence: 1.4 }],
};

export const legacyV01Packet = {
  schema: "techman.sol-lens.proof-packet/v0.1",
  generated_at: "2026-07-18T00:00:00.000Z",
  observable_trace_only: true,
  fixture: "legacy-v01",
  logons: makeTracePacket(3).logons,
  edges: [
    {
      from: "N0001",
      to: "N0002",
      status: "supported",
      kind: "dependency",
    },
    {
      from: "N0002",
      to: "N0003",
      status: "inferred",
      kind: "evidence",
    },
  ],
  metrics: {
    evidence: 0.1,
    coherence: 0.1,
    contradiction: 0.1,
    continuity: 0.1,
    authority: 0.1,
    faithfulness: 0.1,
  },
  verdict: "QUARANTINE",
};
