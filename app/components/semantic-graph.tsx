"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  buildOverviewGraph,
  focusedGroupGraph,
  type OverviewGroup,
} from "../../lib/graph-groups.ts";
import {
  connectedLogonIds,
  fitTransform,
  layoutGraph,
  scaleModeForCount,
  type PositionedLogon,
  type ViewTransform,
} from "../../lib/graph-layout.ts";
import type { NormalizedSolLensPacket } from "../../lib/packet-schema.ts";
import type { LogonStatus } from "../../lib/sol-engine.ts";

type Filter = "all" | LogonStatus;

type SemanticGraphProps = {
  filter: Filter;
  onFilter: (filter: Filter) => void;
  onSelect: (id: string) => void;
  packet: NormalizedSolLensPacket;
  selectedId: string;
  sourceLabel: string;
};

const VIEWPORT_WIDTH = 920;
const VIEWPORT_HEIGHT = 450;
const MIN_ZOOM = 0.18;
const MAX_ZOOM = 2.4;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const shortLabel = (label: string, length = 24) =>
  label.length > length ? `${label.slice(0, length - 1)}…` : label;

function edgePath(from: PositionedLogon, to: PositionedLogon) {
  if (from.id === to.id) {
    return `M${from.x} ${from.y - 18} C${from.x + 58} ${from.y - 78}, ${from.x + 58} ${from.y + 78}, ${from.x} ${from.y + 18}`;
  }
  const distance = Math.max(Math.abs(to.x - from.x), 60);
  const bend = Math.min(distance * 0.46, 130);
  const direction = to.x >= from.x ? 1 : -1;
  return `M${from.x} ${from.y} C${from.x + bend * direction} ${from.y}, ${to.x - bend * direction} ${to.y}, ${to.x} ${to.y}`;
}

function evaluationLabel(packet: NormalizedSolLensPacket) {
  const match = packet.evaluation.claimed_evaluation_match;
  if (match === true) return "Recomputed · supplied evaluation matches";
  if (match === false) return "Recomputed · supplied evaluation differs";
  return "Recomputed locally";
}

export function SemanticGraph({
  filter,
  onFilter,
  onSelect,
  packet,
  selectedId,
  sourceLabel,
}: SemanticGraphProps) {
  const [focus, setFocus] = useState<
    { packetId: string; groupId: string } | undefined
  >(undefined);
  const fullLayout = useMemo(
    () => layoutGraph(packet.logons, packet.edges),
    [packet],
  );
  const packetMode = scaleModeForCount(packet.logons.length);
  const overview = useMemo(
    () =>
      packetMode === "overview"
        ? buildOverviewGraph(packet, fullLayout)
        : undefined,
    [fullLayout, packet, packetMode],
  );
  const focusedGroupId =
    focus?.packetId === packet.packet_id ? focus.groupId : undefined;
  const focusedGroup = overview?.groups.find(
    (group) => group.id === focusedGroupId,
  );
  const focused = useMemo(
    () =>
      focusedGroup
        ? focusedGroupGraph(packet, focusedGroup)
        : undefined,
    [focusedGroup, packet],
  );
  const showingOverview = packetMode === "overview" && !focusedGroup;
  const activeLayout = showingOverview
    ? overview?.layout ?? fullLayout
    : focused?.layout ?? fullLayout;
  const activeEdges = showingOverview
    ? overview?.edges ?? []
    : focused?.edges ?? packet.edges;
  const activeNodes = showingOverview
    ? []
    : focused?.layout.nodes ?? fullLayout.nodes;
  const visualMode = showingOverview
    ? "overview"
    : scaleModeForCount(activeNodes.length);
  const layoutKey = `${packet.packet_id}:${focusedGroupId ?? "root"}:${packet.logons.length}`;
  const defaultTransform = fitTransform(
    activeLayout.bounds,
    VIEWPORT_WIDTH,
    VIEWPORT_HEIGHT,
  );
  const [viewState, setViewState] = useState<{
    key: string;
    transform: ViewTransform;
  }>(() => ({ key: layoutKey, transform: defaultTransform }));
  const transform =
    viewState.key === layoutKey ? viewState.transform : defaultTransform;
  const setTransform = (
    next: ViewTransform | ((current: ViewTransform) => ViewTransform),
  ) => {
    setViewState((current) => {
      const currentTransform =
        current.key === layoutKey ? current.transform : defaultTransform;
      return {
        key: layoutKey,
        transform:
          typeof next === "function" ? next(currentTransform) : next,
      };
    });
  };
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedLogon =
    packet.logons.find((logon) => logon.id === selectedId) ?? packet.logons[0];
  const positions = new Map(
    activeNodes.map((node) => [node.id, node] as const),
  );
  const connected = connectedLogonIds(selectedId, activeEdges);
  const isDimmed = (status: LogonStatus) =>
    filter !== "all" && filter !== status;

  const setZoom = (nextScale: number, centerX = 460, centerY = 225) => {
    setTransform((current) => {
      const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
      const worldX = (centerX - current.x) / current.scale;
      const worldY = (centerY - current.y) / current.scale;
      return {
        scale,
        x: centerX - worldX * scale,
        y: centerY - worldY * scale,
      };
    });
  };

  const fitGraph = () =>
    setTransform(
      fitTransform(activeLayout.bounds, VIEWPORT_WIDTH, VIEWPORT_HEIGHT),
    );

  const resetGraph = () => {
    const centerX = (activeLayout.bounds.minX + activeLayout.bounds.maxX) / 2;
    const centerY = (activeLayout.bounds.minY + activeLayout.bounds.maxY) / 2;
    setTransform({
      scale: 1,
      x: VIEWPORT_WIDTH / 2 - centerX,
      y: VIEWPORT_HEIGHT / 2 - centerY,
    });
  };

  const viewportPoint = (
    event:
      | PointerEvent<SVGRectElement>
      | PointerEvent<SVGSVGElement>,
  ) => {
    const svg = event.currentTarget.ownerSVGElement ?? event.currentTarget;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWPORT_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEWPORT_HEIGHT,
    };
  };

  const onWheel = useEffectEvent((event: globalThis.WheelEvent) => {
    event.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * VIEWPORT_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEWPORT_HEIGHT,
    };
    setZoom(transform.scale * Math.exp(-event.deltaY * 0.0014), point.x, point.y);
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPanStart = (event: PointerEvent<SVGRectElement>) => {
    const point = viewportPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      originX: transform.x,
      originY: transform.y,
    };
  };

  const onPanMove = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = viewportPoint(event);
    setTransform((current) => ({
      ...current,
      x: drag.originX + point.x - drag.startX,
      y: drag.originY + point.y - drag.startY,
    }));
  };

  const onPanEnd = (event: PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = undefined;
    }
  };

  const openGroup = (group: OverviewGroup) => {
    setFocus({
      packetId: packet.packet_id,
      groupId: group.id,
    });
    const ids = new Set(group.logon_ids);
    const first =
      packet.logons.find(
        (logon) => ids.has(logon.id) && logon.status === "supported",
      ) ?? packet.logons.find((logon) => ids.has(logon.id));
    if (first) onSelect(first.id);
  };

  const exitGroup = () => {
    setFocus(undefined);
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && focusedGroup) {
      event.preventDefault();
      exitGroup();
    }
  };

  return (
    <article
      className="panel graph-panel phase-two"
      onKeyDown={onPanelKeyDown}
      data-scale-mode={packetMode}
      data-testid="semantic-graph"
    >
      <header className="panel-header graph-panel-header">
        <div className="panel-title-row">
          <div>
            <span className="panel-kicker" data-testid="atomic-count">
              Observable trace · {packet.logons.length} atomic units
              {showingOverview && overview
                ? ` · ${overview.groups.length} groups visible`
                : ""}
            </span>
            <h2 className="panel-title">Semantic Logon graph</h2>
          </div>
        </div>
        <div className="graph-header-meta">
          <span
            className={`evaluation-state ${packet.evaluation.claimed_evaluation_match === false ? "mismatch" : ""}`}
            data-testid="evaluation-state"
          >
            {evaluationLabel(packet)}
          </span>
          <div className="legend" aria-label="Graph legend">
            <span className="legend-item">
              <i className="legend-dot" />Supported
            </span>
            <span className="legend-item">
              <i className="legend-dot inferred" />Inferred
            </span>
            <span className="legend-item">
              <i className="legend-diamond" />Contradiction
            </span>
          </div>
        </div>
      </header>

      <div className="graph-toolbar">
        <div className="filter-group" role="group" aria-label="Filter Logons">
          {(["all", "supported", "inferred", "contradiction"] as Filter[]).map(
            (item) => (
              <button
                className={`filter-button ${filter === item ? "active" : ""}`}
                key={item}
                type="button"
                onClick={() => onFilter(item)}
                aria-pressed={filter === item}
                data-testid={`filter-${item}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <div className="graph-navigation">
          {focusedGroup && (
            <button
              className="breadcrumb-button"
              type="button"
              onClick={exitGroup}
              aria-label="Return to overview"
              data-testid="exit-group"
            >
              Overview <span aria-hidden="true">/</span>{" "}
              {shortLabel(focusedGroup.label, 28)}
            </button>
          )}
          <div className="zoom-controls" role="group" aria-label="Graph view controls">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom(transform.scale / 1.18)}
              data-testid="zoom-out"
            >
              −
            </button>
            <output aria-label="Current graph zoom">
              {Math.round(transform.scale * 100)}%
            </output>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom(transform.scale * 1.18)}
              data-testid="zoom-in"
            >
              +
            </button>
            <button type="button" onClick={fitGraph} data-testid="fit-graph">
              Fit graph
            </button>
            <button type="button" onClick={resetGraph} data-testid="reset-view">
              Reset view
            </button>
          </div>
        </div>
      </div>

      <div
        className={`graph-stage mode-${visualMode} ${visualMode === "exploration" && transform.scale < 0.86 ? "labels-reduced" : ""}`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
          role="img"
          aria-label={`${visualMode} semantic trace graph with ${showingOverview ? overview?.groups.length ?? 0 : activeNodes.length} visible units`}
          onPointerMove={onPanMove}
          onPointerUp={onPanEnd}
          onPointerCancel={onPanEnd}
        >
          <defs>
            <marker
              id="arrowNeutral"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(166,189,210,.52)" />
            </marker>
            <marker
              id="arrowSolar"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(217,154,54,.78)" />
            </marker>
            <marker
              id="arrowDanger"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(255,107,69,.82)" />
            </marker>
          </defs>

          <rect
            className="graph-pan-surface"
            x="0"
            y="0"
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            onPointerDown={onPanStart}
          />

          <g
            className="graph-viewport"
            transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
          >
            {activeEdges.map((edge) => {
              const from = showingOverview
                ? overview?.groups.find((group) => group.id === edge.from)
                : positions.get(edge.from);
              const to = showingOverview
                ? overview?.groups.find((group) => group.id === edge.to)
                : positions.get(edge.to);
              if (!from || !to) return null;
              const unrelated =
                visualMode === "exploration" &&
                selectedId &&
                edge.from !== selectedId &&
                edge.to !== selectedId;
              return (
                <path
                  className={`graph-edge ${edge.status} ${edge.active ? "active-flow" : ""} ${isDimmed(edge.status) ? "dimmed" : ""} ${unrelated ? "unrelated" : ""}`}
                  d={edgePath(from as PositionedLogon, to as PositionedLogon)}
                  key={edge.id}
                />
              );
            })}

            {showingOverview &&
              overview?.groups.map((group) => (
                <g
                  className={`overview-node ${group.status} ${isDimmed(group.status) ? "dimmed" : ""}`}
                  key={group.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${group.label}, ${group.logon_ids.length} atomic units, ${group.status}`}
                  onClick={() => openGroup(group)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openGroup(group);
                    }
                  }}
                  data-testid="overview-group"
                >
                  <rect
                    className="overview-core"
                    x={group.x - 78}
                    y={group.y - 38}
                    width="156"
                    height="76"
                    rx="9"
                  />
                  <text className="overview-label" x={group.x} y={group.y - 9}>
                    {shortLabel(group.label)}
                  </text>
                  <text className="overview-count" x={group.x} y={group.y + 11}>
                    {group.logon_ids.length} atomic units
                  </text>
                  <text className="overview-status" x={group.x} y={group.y + 27}>
                    {group.counts.supported} supported · {group.counts.inferred} inferred
                  </text>
                </g>
              ))}

            {!showingOverview &&
              activeNodes.map((logon) => {
                const unrelated =
                  visualMode === "exploration" &&
                  selectedId &&
                  !connected.has(logon.id);
                return (
                  <g
                    className={`logon-node ${logon.status} ${selectedId === logon.id ? "selected" : ""} ${isDimmed(logon.status) ? "dimmed" : ""} ${unrelated ? "unrelated" : ""}`}
                    key={logon.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${logon.label}, ${logon.status}`}
                    onClick={() => onSelect(logon.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(logon.id);
                      }
                    }}
                    data-testid={`logon-${logon.id}`}
                  >
                    <circle
                      className="node-halo"
                      cx={logon.x}
                      cy={logon.y}
                      r="24"
                    />
                    {logon.status === "contradiction" ? (
                      <rect
                        className="node-core"
                        x={logon.x - 15}
                        y={logon.y - 15}
                        width="30"
                        height="30"
                        rx="3"
                        transform={`rotate(45 ${logon.x} ${logon.y})`}
                      />
                    ) : (
                      <circle
                        className="node-core"
                        cx={logon.x}
                        cy={logon.y}
                        r={selectedId === logon.id ? 18 : 14}
                      />
                    )}
                    <text
                      className="node-label"
                      x={logon.x}
                      y={logon.y - 26}
                    >
                      {shortLabel(logon.label, 28)}
                    </text>
                    <text className="node-id" x={logon.x} y={logon.y - 13}>
                      {logon.id}
                    </text>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>

      <div className="graph-footer" aria-live="polite">
        <div>
          <h3 className="inspector-title">{selectedLogon.label}</h3>
          <div className="inspector-meta">
            <span>ρ {selectedLogon.rho.toFixed(2)}</span>
            <span>p {selectedLogon.pressure.toFixed(2)}</span>
            <span>ψ {selectedLogon.psi.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <p className="inspector-detail">{selectedLogon.detail}</p>
          <p className="inspector-source">
            {selectedLogon.source}
            {selectedLogon.evidence_refs?.length
              ? ` · ${selectedLogon.evidence_refs.length} evidence refs`
              : ""}
          </p>
        </div>
        <div className="inspector-state">
          <span className={`status-chip ${selectedLogon.status}`}>
            {selectedLogon.status}
          </span>
          <span className="source-chip">{sourceLabel}</span>
        </div>
      </div>
    </article>
  );
}
