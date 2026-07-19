import type { TraceEdge, TraceLogon } from "./packet-schema.ts";

export type ScaleMode = "detail" | "exploration" | "overview";

export type PositionedLogon = TraceLogon & {
  x: number;
  y: number;
  layer: number;
  component_id: string;
  cyclic?: boolean;
};

export type GraphBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type GraphLayout = {
  nodes: PositionedLogon[];
  bounds: GraphBounds;
  layerCount: number;
  componentCount: number;
};

export type ViewTransform = {
  x: number;
  y: number;
  scale: number;
};

type Component = {
  id: string;
  members: string[];
  cyclic: boolean;
  layer: number;
  width: number;
  height: number;
};

const lexical = (left: string, right: string) => left.localeCompare(right);

export function scaleModeForCount(count: number): ScaleMode {
  if (count <= 40) return "detail";
  if (count <= 200) return "exploration";
  return "overview";
}

function buildAdjacency(
  logons: readonly Pick<TraceLogon, "id">[],
  edges: readonly Pick<TraceEdge, "from" | "to">[],
) {
  const adjacency = new Map<string, string[]>();
  const reverse = new Map<string, string[]>();
  for (const logon of logons) {
    adjacency.set(logon.id, []);
    reverse.set(logon.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.from)?.push(edge.to);
    reverse.get(edge.to)?.push(edge.from);
  }
  for (const neighbors of adjacency.values()) neighbors.sort(lexical);
  for (const neighbors of reverse.values()) neighbors.sort(lexical);
  return { adjacency, reverse };
}

export function findStronglyConnectedComponents(
  logons: readonly Pick<TraceLogon, "id">[],
  edges: readonly Pick<TraceEdge, "from" | "to">[],
) {
  const { adjacency } = buildAdjacency(logons, edges);
  const ids = logons.map((logon) => logon.id).sort(lexical);
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];
  let nextIndex = 0;

  const visit = (id: string) => {
    indices.set(id, nextIndex);
    lowLinks.set(id, nextIndex);
    nextIndex += 1;
    stack.push(id);
    onStack.add(id);

    for (const neighbor of adjacency.get(id) ?? []) {
      if (!indices.has(neighbor)) {
        visit(neighbor);
        lowLinks.set(
          id,
          Math.min(lowLinks.get(id) ?? 0, lowLinks.get(neighbor) ?? 0),
        );
      } else if (onStack.has(neighbor)) {
        lowLinks.set(
          id,
          Math.min(lowLinks.get(id) ?? 0, indices.get(neighbor) ?? 0),
        );
      }
    }

    if (lowLinks.get(id) !== indices.get(id)) return;
    const component: string[] = [];
    while (stack.length > 0) {
      const member = stack.pop();
      if (!member) break;
      onStack.delete(member);
      component.push(member);
      if (member === id) break;
    }
    components.push(component.sort(lexical));
  };

  for (const id of ids) {
    if (!indices.has(id)) visit(id);
  }
  return components.sort((left, right) => lexical(left[0], right[0]));
}

function componentDimensions(memberCount: number, cyclic: boolean) {
  if (!cyclic || memberCount === 1) return { width: 142, height: 96 };
  if (memberCount <= 8) {
    const radius = 42 + memberCount * 5;
    return { width: radius * 2 + 72, height: radius * 2 + 64 };
  }
  const columns = Math.ceil(Math.sqrt(memberCount));
  const rows = Math.ceil(memberCount / columns);
  return { width: columns * 78 + 54, height: rows * 68 + 48 };
}

function barycenter(
  componentId: string,
  neighbors: Map<string, Set<string>>,
  order: Map<string, number>,
) {
  const positions = [...(neighbors.get(componentId) ?? [])]
    .map((neighbor) => order.get(neighbor))
    .filter((position): position is number => position !== undefined);
  if (positions.length === 0) return undefined;
  return positions.reduce((sum, position) => sum + position, 0) /
    positions.length;
}

export function layoutGraph(
  logons: readonly TraceLogon[],
  edges: readonly TraceEdge[],
): GraphLayout {
  if (logons.length === 0) {
    return {
      nodes: [],
      bounds: {
        minX: 0,
        minY: 0,
        maxX: 1,
        maxY: 1,
        width: 1,
        height: 1,
      },
      layerCount: 0,
      componentCount: 0,
    };
  }

  const { adjacency } = buildAdjacency(logons, edges);
  const componentMembers = findStronglyConnectedComponents(logons, edges);
  const componentByNode = new Map<string, string>();
  const components = componentMembers.map((members) => {
    const id = `C:${members.join("|")}`;
    const selfLoop =
      members.length === 1 &&
      (adjacency.get(members[0]) ?? []).includes(members[0]);
    const cyclic = members.length > 1 || selfLoop;
    const dimensions = componentDimensions(members.length, cyclic);
    members.forEach((member) => componentByNode.set(member, id));
    return {
      id,
      members,
      cyclic,
      layer: 0,
      ...dimensions,
    } satisfies Component;
  });
  const componentMap = new Map(
    components.map((component) => [component.id, component]),
  );
  const outgoing = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();
  for (const component of components) {
    outgoing.set(component.id, new Set());
    incoming.set(component.id, new Set());
  }
  for (const edge of edges) {
    const from = componentByNode.get(edge.from);
    const to = componentByNode.get(edge.to);
    if (!from || !to || from === to) continue;
    outgoing.get(from)?.add(to);
    incoming.get(to)?.add(from);
  }

  const indegree = new Map(
    components.map((component) => [
      component.id,
      incoming.get(component.id)?.size ?? 0,
    ]),
  );
  const ready = components
    .filter((component) => indegree.get(component.id) === 0)
    .map((component) => component.id)
    .sort(lexical);
  const topological: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift();
    if (!id) break;
    topological.push(id);
    for (const target of [...(outgoing.get(id) ?? [])].sort(lexical)) {
      indegree.set(target, (indegree.get(target) ?? 0) - 1);
      if (indegree.get(target) === 0) {
        ready.push(target);
        ready.sort(lexical);
      }
    }
  }

  for (const id of topological) {
    const component = componentMap.get(id);
    if (!component) continue;
    for (const target of outgoing.get(id) ?? []) {
      const next = componentMap.get(target);
      if (next) next.layer = Math.max(next.layer, component.layer + 1);
    }
  }

  const maxLayer = Math.max(...components.map((component) => component.layer));
  const layers = Array.from({ length: maxLayer + 1 }, () => [] as Component[]);
  for (const component of components) layers[component.layer].push(component);
  layers.forEach((layer) => layer.sort((left, right) => lexical(left.id, right.id)));

  for (let pass = 0; pass < 4; pass += 1) {
    const forward = pass % 2 === 0;
    const layerIndexes = Array.from(
      { length: Math.max(layers.length - 1, 0) },
      (_, index) => (forward ? index + 1 : layers.length - index - 2),
    );
    const order = new Map<string, number>();
    layers.forEach((layer) =>
      layer.forEach((component, index) => order.set(component.id, index)),
    );
    for (const layerIndex of layerIndexes) {
      const neighbors = forward ? incoming : outgoing;
      layers[layerIndex].sort((left, right) => {
        const leftCenter = barycenter(left.id, neighbors, order);
        const rightCenter = barycenter(right.id, neighbors, order);
        if (leftCenter === undefined && rightCenter === undefined) {
          return lexical(left.id, right.id);
        }
        if (leftCenter === undefined) return 1;
        if (rightCenter === undefined) return -1;
        return leftCenter - rightCenter || lexical(left.id, right.id);
      });
      layers[layerIndex].forEach((component, index) =>
        order.set(component.id, index),
      );
    }
  }

  const layerWidths = layers.map((layer) =>
    Math.max(...layer.map((component) => component.width), 142),
  );
  const layerCenters: number[] = [];
  let horizontalCursor = 72;
  layerWidths.forEach((width) => {
    layerCenters.push(horizontalCursor + width / 2);
    horizontalCursor += width + 112;
  });
  const layerHeights = layers.map(
    (layer) =>
      layer.reduce((sum, component) => sum + component.height, 0) +
      Math.max(layer.length - 1, 0) * 54,
  );
  const canvasHeight = Math.max(...layerHeights, 240) + 120;
  const logonById = new Map(logons.map((logon) => [logon.id, logon]));
  const positioned = new Map<string, PositionedLogon>();

  layers.forEach((layer, layerIndex) => {
    let verticalCursor = (canvasHeight - layerHeights[layerIndex]) / 2;
    for (const component of layer) {
      const centerX = layerCenters[layerIndex];
      const centerY = verticalCursor + component.height / 2;
      const members = [...component.members].sort(lexical);

      if (!component.cyclic || members.length === 1) {
        const logon = logonById.get(members[0]);
        if (logon) {
          positioned.set(logon.id, {
            ...logon,
            x: centerX,
            y: centerY,
            layer: layerIndex,
            component_id: component.id,
            ...(component.cyclic ? { cyclic: true } : {}),
          });
        }
      } else if (members.length <= 8) {
        const radius = Math.min(component.width, component.height) / 2 - 42;
        members.forEach((id, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / members.length;
          const logon = logonById.get(id);
          if (logon) {
            positioned.set(id, {
              ...logon,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              layer: layerIndex,
              component_id: component.id,
              cyclic: true,
            });
          }
        });
      } else {
        const columns = Math.ceil(Math.sqrt(members.length));
        const rows = Math.ceil(members.length / columns);
        members.forEach((id, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const logon = logonById.get(id);
          if (logon) {
            positioned.set(id, {
              ...logon,
              x: centerX + (column - (columns - 1) / 2) * 78,
              y: centerY + (row - (rows - 1) / 2) * 68,
              layer: layerIndex,
              component_id: component.id,
              cyclic: true,
            });
          }
        });
      }
      verticalCursor += component.height + 54;
    }
  });

  const nodes = logons
    .map((logon) => positioned.get(logon.id))
    .filter((logon): logon is PositionedLogon => Boolean(logon));
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs) - 72;
  const maxX = Math.max(...xs) + 72;
  const minY = Math.min(...ys) - 62;
  const maxY = Math.max(...ys) + 62;

  return {
    nodes,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(maxX - minX, 1),
      height: Math.max(maxY - minY, 1),
    },
    layerCount: layers.length,
    componentCount: components.length,
  };
}

export function fitTransform(
  bounds: GraphBounds,
  viewportWidth = 920,
  viewportHeight = 450,
  padding = 52,
): ViewTransform {
  const availableWidth = Math.max(viewportWidth - padding * 2, 1);
  const availableHeight = Math.max(viewportHeight - padding * 2, 1);
  const scale = Math.max(
    0.18,
    Math.min(
      1.35,
      availableWidth / Math.max(bounds.width, 1),
      availableHeight / Math.max(bounds.height, 1),
    ),
  );
  return {
    scale,
    x:
      viewportWidth / 2 -
      ((bounds.minX + bounds.maxX) / 2) * scale,
    y:
      viewportHeight / 2 -
      ((bounds.minY + bounds.maxY) / 2) * scale,
  };
}

export function connectedLogonIds(
  selectedId: string,
  edges: readonly TraceEdge[],
) {
  const connected = new Set([selectedId]);
  for (const edge of edges) {
    if (edge.from === selectedId) connected.add(edge.to);
    if (edge.to === selectedId) connected.add(edge.from);
  }
  return connected;
}
