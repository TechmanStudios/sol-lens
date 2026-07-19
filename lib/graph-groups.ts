import {
  layoutGraph,
  type GraphLayout,
  type PositionedLogon,
} from "./graph-layout.ts";
import type {
  NormalizedSolLensPacket,
  TraceEdge,
  TraceLogon,
} from "./packet-schema.ts";
import type { LogonStatus } from "./sol-engine.ts";

export const MAX_OVERVIEW_GROUPS = 36;
const MAX_FOCUSED_GROUP_SIZE = 40;

export type OverviewGroup = {
  id: string;
  label: string;
  logon_ids: string[];
  status: LogonStatus;
  source: "packet" | "structural" | "bundled";
  counts: {
    supported: number;
    inferred: number;
    contradiction: number;
  };
  layer_min: number;
  layer_max: number;
};

export type PositionedOverviewGroup = OverviewGroup & {
  x: number;
  y: number;
  layer: number;
};

export type OverviewEdge = TraceEdge & {
  count: number;
};

export type OverviewGraph = {
  groups: PositionedOverviewGroup[];
  edges: OverviewEdge[];
  layout: GraphLayout;
};

type GroupSeed = {
  id: string;
  label: string;
  logon_ids: string[];
  source: OverviewGroup["source"];
};

const lexical = (left: string, right: string) => left.localeCompare(right);

function statusCounts(logons: readonly TraceLogon[]) {
  return {
    supported: logons.filter((logon) => logon.status === "supported").length,
    inferred: logons.filter((logon) => logon.status === "inferred").length,
    contradiction: logons.filter(
      (logon) => logon.status === "contradiction",
    ).length,
  };
}

function aggregateStatus(logons: readonly TraceLogon[]): LogonStatus {
  if (logons.some((logon) => logon.status === "contradiction")) {
    return "contradiction";
  }
  if (logons.some((logon) => logon.status === "inferred")) return "inferred";
  return "supported";
}

function splitSeeds(seeds: GroupSeed[]) {
  const split: GroupSeed[] = [];
  for (const seed of seeds.sort((left, right) => lexical(left.id, right.id))) {
    const ids = [...seed.logon_ids].sort(lexical);
    const segmentCount = Math.ceil(ids.length / MAX_FOCUSED_GROUP_SIZE);
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const suffix = segmentCount > 1 ? `:${segment + 1}` : "";
      split.push({
        ...seed,
        id: `${seed.id}${suffix}`,
        label:
          segmentCount > 1
            ? `${seed.label} · segment ${segment + 1}`
            : seed.label,
        logon_ids: ids.slice(
          segment * MAX_FOCUSED_GROUP_SIZE,
          (segment + 1) * MAX_FOCUSED_GROUP_SIZE,
        ),
      });
    }
  }
  return split;
}

function capSeeds(seeds: GroupSeed[]) {
  if (seeds.length <= MAX_OVERVIEW_GROUPS) return seeds;
  const bundleSize = Math.ceil(seeds.length / MAX_OVERVIEW_GROUPS);
  const bundled: GroupSeed[] = [];
  for (let index = 0; index < seeds.length; index += bundleSize) {
    const members = seeds.slice(index, index + bundleSize);
    bundled.push({
      id: `bundle:${String(bundled.length + 1).padStart(2, "0")}`,
      label: `Trace bundle ${bundled.length + 1} · ${members.length} groups`,
      logon_ids: members.flatMap((member) => member.logon_ids),
      source: "bundled",
    });
  }
  return bundled;
}

function seedGroups(
  packet: NormalizedSolLensPacket,
  fullLayout: GraphLayout,
) {
  const assigned = new Set<string>();
  const seeds: GroupSeed[] = [];
  const explicitGroups = [...(packet.groups ?? [])].sort((left, right) =>
    lexical(left.id, right.id),
  );

  for (const group of explicitGroups) {
    const ids = group.logon_ids
      .filter((id) => !assigned.has(id))
      .sort(lexical);
    if (ids.length === 0) continue;
    ids.forEach((id) => assigned.add(id));
    seeds.push({
      id: `packet:${group.id}`,
      label: group.phase ? `${group.phase} · ${group.label}` : group.label,
      logon_ids: ids,
      source: "packet",
    });
  }

  const remainingByMetadata = new Map<string, GroupSeed>();
  for (const logon of [...packet.logons].sort((left, right) =>
    lexical(left.id, right.id),
  )) {
    if (assigned.has(logon.id)) continue;
    const metadataId = logon.group_id
      ? `group:${logon.group_id}`
      : logon.phase_id
        ? `phase:${logon.phase_id}`
        : undefined;
    if (!metadataId) continue;
    const label = logon.group_id
      ? `Packet group · ${logon.group_id}`
      : `Phase · ${logon.phase_id}`;
    const seed = remainingByMetadata.get(metadataId) ?? {
      id: metadataId,
      label,
      logon_ids: [],
      source: "packet" as const,
    };
    seed.logon_ids.push(logon.id);
    remainingByMetadata.set(metadataId, seed);
    assigned.add(logon.id);
  }
  seeds.push(...remainingByMetadata.values());

  const layerById = new Map(
    fullLayout.nodes.map((node) => [node.id, node.layer]),
  );
  const structural = new Map<string, GroupSeed>();
  for (const logon of [...packet.logons].sort((left, right) =>
    lexical(left.id, right.id),
  )) {
    if (assigned.has(logon.id)) continue;
    const layer = layerById.get(logon.id) ?? 0;
    const firstLayer = Math.floor(layer / 3) * 3;
    const key = `structure:${String(firstLayer).padStart(4, "0")}`;
    const seed = structural.get(key) ?? {
      id: key,
      label: `Structure · layers ${firstLayer}–${firstLayer + 2}`,
      logon_ids: [],
      source: "structural" as const,
    };
    seed.logon_ids.push(logon.id);
    structural.set(key, seed);
  }
  seeds.push(...structural.values());
  return capSeeds(splitSeeds(seeds));
}

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) /
  Math.max(values.length, 1);

function compactOverviewLayout(layout: GraphLayout): GraphLayout {
  if (layout.nodes.length <= 1) return layout;
  const ordered = [...layout.nodes].sort(
    (left, right) =>
      left.layer - right.layer ||
      left.y - right.y ||
      left.x - right.x ||
      lexical(left.id, right.id),
  );
  const columns = Math.ceil(Math.sqrt(ordered.length));
  const rows = Math.ceil(ordered.length / columns);
  const horizontalGap = 196;
  const verticalGap = 116;
  const nodes = ordered.map((node, index) => {
    const row = Math.floor(index / columns);
    const indexInRow = index % columns;
    const rowLength = Math.min(columns, ordered.length - row * columns);
    const rowOffset = (columns - rowLength) / 2;
    const column =
      row % 2 === 0
        ? rowOffset + indexInRow
        : rowOffset + rowLength - 1 - indexInRow;
    return {
      ...node,
      x: column * horizontalGap,
      y: row * verticalGap,
    };
  });
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs) - 90;
  const maxX = Math.max(...xs) + 90;
  const minY = Math.min(...ys) - 54;
  const maxY = Math.max(...ys) + 54;
  return {
    ...layout,
    nodes,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(maxX - minX, 1),
      height: Math.max(maxY - minY, 1),
    },
    layerCount: rows,
  };
}

function groupAsLogon(
  group: OverviewGroup,
  logons: readonly TraceLogon[],
): TraceLogon {
  return {
    id: group.id,
    label: group.label,
    status: group.status,
    evidence: average(logons.map((logon) => logon.evidence)),
    rho: average(logons.map((logon) => logon.rho)),
    psi: average(logons.map((logon) => logon.psi)),
    pressure: average(logons.map((logon) => logon.pressure)),
    detail: `${logons.length} observable atomic units in this overview group.`,
    source: group.source === "packet" ? "Packet grouping" : "Structural grouping",
  };
}

export function buildOverviewGraph(
  packet: NormalizedSolLensPacket,
  fullLayout = layoutGraph(packet.logons, packet.edges),
): OverviewGraph {
  const logonById = new Map(packet.logons.map((logon) => [logon.id, logon]));
  const layerById = new Map(
    fullLayout.nodes.map((node) => [node.id, node.layer]),
  );
  const seeds = seedGroups(packet, fullLayout);
  const groupByLogon = new Map<string, string>();
  const groups: OverviewGroup[] = seeds.map((seed) => {
    const logons = seed.logon_ids
      .map((id) => logonById.get(id))
      .filter((logon): logon is TraceLogon => Boolean(logon));
    logons.forEach((logon) => groupByLogon.set(logon.id, seed.id));
    const layers = logons.map((logon) => layerById.get(logon.id) ?? 0);
    return {
      ...seed,
      status: aggregateStatus(logons),
      counts: statusCounts(logons),
      layer_min: Math.min(...layers),
      layer_max: Math.max(...layers),
    };
  });

  const aggregateEdges = new Map<string, OverviewEdge>();
  for (const edge of packet.edges) {
    const from = groupByLogon.get(edge.from);
    const to = groupByLogon.get(edge.to);
    if (!from || !to || from === to) continue;
    const key = [from, to, edge.status, edge.kind ?? "dependency"].join("|");
    const current = aggregateEdges.get(key);
    if (current) {
      current.count += 1;
      current.weight = Math.min(1, (current.weight ?? 0) + 0.05);
      current.active = current.active || edge.active;
    } else {
      aggregateEdges.set(key, {
        id: `overview:${key}`,
        from,
        to,
        status: edge.status,
        kind: edge.kind,
        active: edge.active,
        weight: Math.min(1, edge.weight ?? 0.1),
        count: 1,
      });
    }
  }
  const edges = [...aggregateEdges.values()].sort((left, right) =>
    lexical(left.id, right.id),
  );
  const overviewLogons = groups.map((group) =>
    groupAsLogon(
      group,
      group.logon_ids
        .map((id) => logonById.get(id))
        .filter((logon): logon is TraceLogon => Boolean(logon)),
    ),
  );
  const layout = compactOverviewLayout(layoutGraph(overviewLogons, edges));
  const positionById = new Map<string, PositionedLogon>(
    layout.nodes.map((node) => [node.id, node]),
  );
  const positionedGroups = groups.map((group) => {
    const position = positionById.get(group.id);
    return {
      ...group,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      layer: position?.layer ?? 0,
    };
  });
  return { groups: positionedGroups, edges, layout };
}

export function focusedGroupGraph(
  packet: NormalizedSolLensPacket,
  group: OverviewGroup,
) {
  const ids = new Set(group.logon_ids);
  const logons = packet.logons.filter((logon) => ids.has(logon.id));
  const edges = packet.edges.filter(
    (edge) => ids.has(edge.from) && ids.has(edge.to),
  );
  return {
    logons,
    edges,
    layout: layoutGraph(logons, edges),
  };
}
