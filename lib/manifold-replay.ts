import type {
  NormalizedSolLensPacket,
  TraceEdge,
  TraceLogon,
} from "./packet-schema.ts";

export type ManifoldReplayConfig = {
  dt: number;
  pressureGain: number;
  pressureSeedGain: number;
  damping: number;
  defaultEdgeWeight: number;
  maxFlux: number;
  backgroundSeed: number;
  entryPulse: number;
  activeThreshold: number;
  maxRho: number;
};

export type ReplayNodeState = {
  id: string;
  rho: number;
  pressure: number;
  psi: number;
  pressureSeed: number;
  packetRho: number;
  netFlux: number;
};

export type ReplayEdgeState = {
  id: string;
  from: string;
  to: string;
  kind: string;
  conductance: number;
  flux: number;
};

export type ReplayMetrics = {
  totalMass: number;
  entropy: number;
  totalFlux: number;
  maxFlux: number;
  activeNodes: number;
};

export type ManifoldReplayState = {
  step: number;
  time: number;
  entryLogonId: string;
  nodes: ReplayNodeState[];
  edges: ReplayEdgeState[];
  metrics: ReplayMetrics;
};

export const DEFAULT_MANIFOLD_REPLAY_CONFIG: Readonly<ManifoldReplayConfig> =
  Object.freeze({
    dt: 0.04,
    pressureGain: 3,
    pressureSeedGain: 0.22,
    damping: 0.035,
    defaultEdgeWeight: 0.7,
    maxFlux: 0.35,
    backgroundSeed: 0.12,
    entryPulse: 0.85,
    activeThreshold: 0.05,
    maxRho: 1.5,
  });

const STATUS_FACTOR = Object.freeze({
  supported: 1,
  inferred: 0.72,
  contradiction: 0.28,
});
const ROUNDING_FACTOR = 1_000_000_000;

const compareIds = (left: { id: string }, right: { id: string }) =>
  left.id < right.id ? -1 : left.id > right.id ? 1 : 0;

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function stableRound(value: number): number {
  const rounded = Math.round(finiteOr(value, 0) * ROUNDING_FACTOR) /
    ROUNDING_FACTOR;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function sanitizeConfig(
  config: Partial<ManifoldReplayConfig> = {},
): ManifoldReplayConfig {
  const defaults = DEFAULT_MANIFOLD_REPLAY_CONFIG;
  const maxRho = clamp(finiteOr(config.maxRho, defaults.maxRho), 0.000001, 100);
  return {
    dt: clamp(finiteOr(config.dt, defaults.dt), 0.000001, 1),
    pressureGain: clamp(
      finiteOr(config.pressureGain, defaults.pressureGain),
      0.000001,
      100,
    ),
    pressureSeedGain: clamp(
      finiteOr(config.pressureSeedGain, defaults.pressureSeedGain),
      0,
      10,
    ),
    damping: clamp(finiteOr(config.damping, defaults.damping), 0, 100),
    defaultEdgeWeight: clamp(
      finiteOr(config.defaultEdgeWeight, defaults.defaultEdgeWeight),
      0,
      10,
    ),
    maxFlux: clamp(finiteOr(config.maxFlux, defaults.maxFlux), 0, 100),
    backgroundSeed: clamp(
      finiteOr(config.backgroundSeed, defaults.backgroundSeed),
      0,
      10,
    ),
    entryPulse: clamp(
      finiteOr(config.entryPulse, defaults.entryPulse),
      0,
      maxRho,
    ),
    activeThreshold: clamp(
      finiteOr(config.activeThreshold, defaults.activeThreshold),
      0,
      maxRho,
    ),
    maxRho,
  };
}

function sortedPacket(packet: NormalizedSolLensPacket) {
  const nodes = [...packet.logons].sort(compareIds);
  const ids = new Set(nodes.map((node) => node.id));
  const edges = [...packet.edges]
    .sort(compareIds)
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  return { nodes, edges };
}

function nodeSeeds(logon: TraceLogon, config: ManifoldReplayConfig) {
  return {
    packetRho: clamp(finiteOr(logon.rho, 0), 0, config.maxRho),
    psi: clamp(finiteOr(logon.psi, 0), 0, 1),
    pressureSeed: clamp(finiteOr(logon.pressure, 0), 0, 1),
  };
}

function dynamicPressure(
  rho: number,
  pressureSeed: number,
  config: ManifoldReplayConfig,
) {
  const densityPressure =
    Math.log(1 + config.pressureGain * clamp(rho, 0, config.maxRho)) /
    Math.log(1 + config.pressureGain);
  return stableRound(
    clamp(
      densityPressure + config.pressureSeedGain * pressureSeed,
      0,
      1.25,
    ),
  );
}

function edgeConductance(
  edge: TraceEdge,
  from: ReplayNodeState,
  to: ReplayNodeState,
  destination: TraceLogon,
  config: ManifoldReplayConfig,
) {
  const meanPsi = clamp((from.psi + to.psi) / 2, 0, 1);
  const modeGate = 0.35 + 0.65 * meanPsi;
  const weight = clamp(
    finiteOr(edge.weight, config.defaultEdgeWeight),
    0,
    10,
  );
  const statusFactor = STATUS_FACTOR[destination.status] ??
    STATUS_FACTOR.inferred;
  return stableRound(clamp(weight * statusFactor * modeGate, 0, 2));
}

function replayMetrics(
  nodes: readonly ReplayNodeState[],
  edges: readonly ReplayEdgeState[],
  config: ManifoldReplayConfig,
): ReplayMetrics {
  const totalMass = stableRound(
    nodes.reduce((sum, node) => sum + finiteOr(node.rho, 0), 0),
  );
  const absoluteFluxes = edges.map((edge) =>
    Math.abs(finiteOr(edge.flux, 0)),
  );
  const totalFlux = stableRound(
    absoluteFluxes.reduce((sum, flux) => sum + flux, 0),
  );
  const maxFlux = stableRound(
    absoluteFluxes.length > 0 ? Math.max(...absoluteFluxes) : 0,
  );
  const activeNodes = nodes.filter(
    (node) => node.rho >= config.activeThreshold,
  ).length;

  let entropy = 0;
  if (totalMass > 0 && nodes.length > 1) {
    const rawEntropy = nodes.reduce((sum, node) => {
      const share = clamp(node.rho / totalMass, 0, 1);
      return share > 0 ? sum - share * Math.log(share) : sum;
    }, 0);
    entropy = stableRound(clamp(rawEntropy / Math.log(nodes.length), 0, 1));
  }

  return { totalMass, entropy, totalFlux, maxFlux, activeNodes };
}

function chooseEntryLogon(
  nodes: readonly TraceLogon[],
  edges: readonly TraceEdge[],
) {
  const incoming = new Set(edges.map((edge) => edge.to));
  return (
    nodes.find(
      (node) => node.status === "supported" && !incoming.has(node.id),
    ) ??
    nodes.find((node) => node.status === "supported") ??
    nodes[0]
  );
}

function zeroMetrics(): ReplayMetrics {
  return {
    totalMass: 0,
    entropy: 0,
    totalFlux: 0,
    maxFlux: 0,
    activeNodes: 0,
  };
}

export function createInitialReplayState(
  packet: NormalizedSolLensPacket,
  config: Partial<ManifoldReplayConfig> = {},
): ManifoldReplayState {
  const safeConfig = sanitizeConfig(config);
  const { nodes: packetNodes, edges: packetEdges } = sortedPacket(packet);
  if (packetNodes.length === 0) {
    return {
      step: 0,
      time: 0,
      entryLogonId: "",
      nodes: [],
      edges: [],
      metrics: zeroMetrics(),
    };
  }

  const entry = chooseEntryLogon(packetNodes, packetEdges);
  const nodes = packetNodes.map((logon) => {
    const seeds = nodeSeeds(logon, safeConfig);
    const rho = stableRound(
      clamp(
        seeds.packetRho * safeConfig.backgroundSeed +
          (logon.id === entry.id ? safeConfig.entryPulse : 0),
        0,
        safeConfig.maxRho,
      ),
    );
    return {
      id: logon.id,
      rho,
      pressure: dynamicPressure(rho, seeds.pressureSeed, safeConfig),
      psi: stableRound(seeds.psi),
      pressureSeed: stableRound(seeds.pressureSeed),
      packetRho: stableRound(seeds.packetRho),
      netFlux: 0,
    };
  });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const packetNodeById = new Map(
    packetNodes.map((node) => [node.id, node]),
  );
  const edges = packetEdges.map((edge) => {
    const from = nodeById.get(edge.from)!;
    const to = nodeById.get(edge.to)!;
    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: edge.kind ?? "flow",
      conductance: edgeConductance(
        edge,
        from,
        to,
        packetNodeById.get(edge.to)!,
        safeConfig,
      ),
      flux: 0,
    };
  });

  return {
    step: 0,
    time: 0,
    entryLogonId: entry.id,
    nodes,
    edges,
    metrics: replayMetrics(nodes, edges, safeConfig),
  };
}

export function stepManifoldReplay(
  packet: NormalizedSolLensPacket,
  state: ManifoldReplayState,
  config: Partial<ManifoldReplayConfig> = {},
): ManifoldReplayState {
  const safeConfig = sanitizeConfig(config);
  const { nodes: packetNodes, edges: packetEdges } = sortedPacket(packet);
  if (packetNodes.length === 0) {
    return {
      ...createInitialReplayState(packet, safeConfig),
      step: Math.max(0, Math.trunc(finiteOr(state.step, 0))) + 1,
      time: stableRound(finiteOr(state.time, 0) + safeConfig.dt),
    };
  }

  const priorById = new Map(state.nodes.map((node) => [node.id, node]));
  const packetNodeById = new Map(
    packetNodes.map((node) => [node.id, node]),
  );
  const priorNodes = packetNodes.map((logon) => {
    const seeds = nodeSeeds(logon, safeConfig);
    const rho = stableRound(
      clamp(
        finiteOr(
          priorById.get(logon.id)?.rho,
          seeds.packetRho * safeConfig.backgroundSeed,
        ),
        0,
        safeConfig.maxRho,
      ),
    );
    return {
      id: logon.id,
      rho,
      pressure: dynamicPressure(rho, seeds.pressureSeed, safeConfig),
      psi: stableRound(seeds.psi),
      pressureSeed: stableRound(seeds.pressureSeed),
      packetRho: stableRound(seeds.packetRho),
      netFlux: 0,
    };
  });
  const priorNodeById = new Map(
    priorNodes.map((node) => [node.id, node]),
  );
  const deltas = new Map(priorNodes.map((node) => [node.id, 0]));
  const netFluxes = new Map(priorNodes.map((node) => [node.id, 0]));

  const edges = packetEdges.map((edge) => {
    const from = priorNodeById.get(edge.from)!;
    const to = priorNodeById.get(edge.to)!;
    const conductance = edgeConductance(
      edge,
      from,
      to,
      packetNodeById.get(edge.to)!,
      safeConfig,
    );
    const flux = stableRound(
      clamp(
        conductance * (from.pressure - to.pressure),
        -safeConfig.maxFlux,
        safeConfig.maxFlux,
      ),
    );
    deltas.set(
      from.id,
      finiteOr(deltas.get(from.id), 0) - safeConfig.dt * flux,
    );
    deltas.set(
      to.id,
      finiteOr(deltas.get(to.id), 0) + safeConfig.dt * flux,
    );
    netFluxes.set(
      from.id,
      finiteOr(netFluxes.get(from.id), 0) - flux,
    );
    netFluxes.set(
      to.id,
      finiteOr(netFluxes.get(to.id), 0) + flux,
    );
    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      kind: edge.kind ?? "flow",
      conductance,
      flux,
    };
  });

  const dampingFactor = Math.exp(-safeConfig.damping * safeConfig.dt);
  const nodes = priorNodes.map((node) => {
    const rho = stableRound(
      clamp(
        Math.max(0, node.rho + finiteOr(deltas.get(node.id), 0)) *
          dampingFactor,
        0,
        safeConfig.maxRho,
      ),
    );
    return {
      ...node,
      rho,
      pressure: dynamicPressure(rho, node.pressureSeed, safeConfig),
      netFlux: stableRound(finiteOr(netFluxes.get(node.id), 0)),
    };
  });

  return {
    step: Math.max(0, Math.trunc(finiteOr(state.step, 0))) + 1,
    time: stableRound(finiteOr(state.time, 0) + safeConfig.dt),
    entryLogonId:
      state.entryLogonId || chooseEntryLogon(packetNodes, packetEdges).id,
    nodes,
    edges,
    metrics: replayMetrics(nodes, edges, safeConfig),
  };
}

export function runManifoldReplay(
  packet: NormalizedSolLensPacket,
  steps: number,
  config: Partial<ManifoldReplayConfig> = {},
): ManifoldReplayState {
  if (!Number.isInteger(steps) || steps < 0) {
    throw new RangeError("Replay steps must be a non-negative integer.");
  }
  let state = createInitialReplayState(packet, config);
  for (let index = 0; index < steps; index += 1) {
    state = stepManifoldReplay(packet, state, config);
  }
  return state;
}

export function replayStateDigest(state: ManifoldReplayState): string {
  return JSON.stringify({
    step: state.step,
    time: stableRound(state.time),
    entryLogonId: state.entryLogonId,
    nodes: [...state.nodes].sort(compareIds).map((node) => ({
      ...node,
      rho: stableRound(node.rho),
      pressure: stableRound(node.pressure),
      psi: stableRound(node.psi),
      pressureSeed: stableRound(node.pressureSeed),
      packetRho: stableRound(node.packetRho),
      netFlux: stableRound(node.netFlux),
    })),
    edges: [...state.edges].sort(compareIds).map((edge) => ({
      ...edge,
      conductance: stableRound(edge.conductance),
      flux: stableRound(edge.flux),
    })),
    metrics: {
      totalMass: stableRound(state.metrics.totalMass),
      entropy: stableRound(state.metrics.entropy),
      totalFlux: stableRound(state.metrics.totalFlux),
      maxFlux: stableRound(state.metrics.maxFlux),
      activeNodes: state.metrics.activeNodes,
    },
  });
}

export function replayFluxEndpoints(
  edge: Pick<ReplayEdgeState, "from" | "to" | "flux">,
) {
  return edge.flux < 0
    ? { from: edge.to, to: edge.from }
    : { from: edge.from, to: edge.to };
}
