"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DEFAULT_MANIFOLD_REPLAY_CONFIG,
  createInitialReplayState,
  replayFluxEndpoints,
  stepManifoldReplay,
  type ManifoldReplayState,
  type ReplayNodeState,
} from "../../lib/manifold-replay.ts";
import {
  layoutGraph,
  type PositionedLogon,
} from "../../lib/graph-layout.ts";
import type { NormalizedSolLensPacket } from "../../lib/packet-schema.ts";

type ManifoldReplayPanelProps = {
  packet: NormalizedSolLensPacket;
  sourceLabel: string;
  sourceDetail: string;
  courtVerdict: string;
};

const MAX_STEPS = 300;
const MAX_SUBSTEPS = 8;
const SETTLED_FLUX = 0.0001;
const SETTLED_UPDATES = 24;
const PHYSICS_INTERVAL_MS = DEFAULT_MANIFOLD_REPLAY_CONFIG.dt * 1_000;
const SPEEDS = [0.5, 1, 2] as const;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const shortLabel = (label: string, length = 26) =>
  label.length > length ? `${label.slice(0, length - 1)}…` : label;

function replayEdgePath(from: PositionedLogon, to: PositionedLogon) {
  if (from.id === to.id) {
    return `M${from.x} ${from.y - 14} C${from.x + 54} ${from.y - 70}, ${from.x + 54} ${from.y + 70}, ${from.x} ${from.y + 14}`;
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const offset = Math.min(17, distance / 3);
  const startX = from.x + (dx / distance) * offset;
  const startY = from.y + (dy / distance) * offset;
  const endX = to.x - (dx / distance) * offset;
  const endY = to.y - (dy / distance) * offset;
  return `M${startX} ${startY} L${endX} ${endY}`;
}

function replayStatus(
  state: ManifoldReplayState,
  playing: boolean,
  settledUpdates: number,
) {
  if (state.step >= MAX_STEPS) return "Complete";
  if (settledUpdates >= SETTLED_UPDATES) return "Settled";
  return playing ? "Running" : "Paused";
}

function formatMetric(value: number, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.000";
}

export function ManifoldReplayPanel({
  packet,
  sourceLabel,
  sourceDetail,
  courtVerdict,
}: ManifoldReplayPanelProps) {
  const initialState = useMemo(
    () => createInitialReplayState(packet),
    [packet],
  );
  const [replay, setReplay] = useState(initialState);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [selectedId, setSelectedId] = useState(initialState.entryLogonId);
  const [settledUpdates, setSettledUpdates] = useState(0);
  const replayRef = useRef(replay);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const settledRef = useRef(0);

  const layout = useMemo(
    () => layoutGraph(packet.logons, packet.edges),
    [packet],
  );
  const positionById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout],
  );
  const replayNodeById = useMemo(
    () => new Map(replay.nodes.map((node) => [node.id, node])),
    [replay.nodes],
  );
  const packetNodeById = useMemo(
    () => new Map(packet.logons.map((node) => [node.id, node])),
    [packet],
  );

  const resetClock = () => {
    lastTimeRef.current = null;
    accumulatorRef.current = 0;
    settledRef.current = 0;
    setSettledUpdates(0);
  };

  const recordSettling = (state: ManifoldReplayState) => {
    settledRef.current =
      state.step > 0 && state.metrics.maxFlux < SETTLED_FLUX
        ? settledRef.current + 1
        : 0;
    setSettledUpdates(settledRef.current);
  };

  useEffect(() => {
    if (
      !playing ||
      replayRef.current.nodes.length === 0 ||
      replayRef.current.step >= MAX_STEPS ||
      settledRef.current >= SETTLED_UPDATES
    ) {
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const elapsed = Math.min(timestamp - lastTimeRef.current, 250);
      lastTimeRef.current = timestamp;
      accumulatorRef.current += elapsed * speed;
      let next = replayRef.current;
      let substeps = 0;

      while (
        accumulatorRef.current >= PHYSICS_INTERVAL_MS &&
        next.step < MAX_STEPS &&
        settledRef.current < SETTLED_UPDATES &&
        substeps < MAX_SUBSTEPS
      ) {
        next = stepManifoldReplay(packet, next);
        accumulatorRef.current -= PHYSICS_INTERVAL_MS;
        substeps += 1;
        settledRef.current =
          next.metrics.maxFlux < SETTLED_FLUX
            ? settledRef.current + 1
            : 0;
      }

      if (substeps > 0) {
        replayRef.current = next;
        setReplay(next);
        setSettledUpdates(settledRef.current);
      }

      if (
        next.step >= MAX_STEPS ||
        settledRef.current >= SETTLED_UPDATES
      ) {
        setPlaying(false);
        animationFrameRef.current = null;
        return;
      }
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [packet, playing, speed]);

  const onStep = () => {
    if (replayRef.current.step >= MAX_STEPS || replay.nodes.length === 0) {
      return;
    }
    setPlaying(false);
    lastTimeRef.current = null;
    const next = stepManifoldReplay(packet, replayRef.current);
    replayRef.current = next;
    setReplay(next);
    recordSettling(next);
  };

  const onReset = () => {
    const next = createInitialReplayState(packet);
    replayRef.current = next;
    setReplay(next);
    setPlaying(false);
    setSelectedId(next.entryLogonId);
    resetClock();
  };

  const selectedPacketNode =
    packetNodeById.get(selectedId) ?? packet.logons[0];
  const selectedReplayNode =
    replayNodeById.get(selectedPacketNode?.id ?? "") ?? replay.nodes[0];
  const entryNode = packetNodeById.get(replay.entryLogonId);
  const status = replayStatus(replay, playing, settledUpdates);
  const isFinished = status === "Complete" || status === "Settled";
  const graphPadding = 70;
  const viewBox = `${layout.bounds.minX - graphPadding} ${layout.bounds.minY - graphPadding} ${Math.max(layout.bounds.width + graphPadding * 2, 1)} ${Math.max(layout.bounds.height + graphPadding * 2, 1)}`;
  const compact = packet.logons.length > 40;
  const overview = packet.logons.length > 200;

  return (
    <div className="manifold-replay-shell">
      <header className="replay-header panel">
        <div>
          <p className="eyebrow">Experimental deterministic projection</p>
          <h1>Optional Manifold Replay Engine</h1>
          <p className="replay-intro">
            Experimental deterministic graph replay using dynamic density,
            pressure, mode-shaped conductance, edge flux, and damping. It does
            not alter the promotion court and does not represent hidden model
            reasoning.
          </p>
        </div>
        <aside className="replay-court-reference">
          <span>Trace Court reference</span>
          <strong className={`status-chip ${courtVerdict.toLowerCase()}`}>
            {courtVerdict}
          </strong>
          <small>Replay does not modify this verdict.</small>
        </aside>
        <p className="replay-disclaimer">
          This replay visualizes SOL-inspired density and flux dynamics from
          observable packet fields. It does not change the Trace Court verdict.
        </p>
        <dl className="replay-packet-meta">
          <div>
            <dt>Packet</dt>
            <dd>{packet.packet_id}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{sourceLabel}</dd>
          </div>
          <div>
            <dt>Detail</dt>
            <dd>{sourceDetail}</dd>
          </div>
          <div>
            <dt>Graph</dt>
            <dd>{packet.logons.length} Logons · {replay.edges.length} valid edges</dd>
          </div>
        </dl>
      </header>

      {replay.nodes.length === 0 ? (
        <section className="panel replay-empty" aria-live="polite">
          <h2>No Logons are available for manifold replay.</h2>
          <p>Load a packet with observable Logons in Trace Court, then return here.</p>
        </section>
      ) : (
        <>
          <section className="panel replay-toolbar" aria-label="Replay controls">
            <div className="replay-control-group">
              <button
                className="primary-button compact"
                type="button"
                onClick={() => {
                  lastTimeRef.current = null;
                  setPlaying((current) => !current);
                }}
                disabled={isFinished}
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                className="quiet-button replay-button"
                type="button"
                onClick={onStep}
                disabled={playing || isFinished}
              >
                Step
              </button>
              <button
                className="quiet-button replay-button"
                type="button"
                onClick={onReset}
              >
                Reset
              </button>
            </div>
            <div className="replay-speed-group" role="group" aria-label="Replay speed">
              <span>Speed</span>
              {SPEEDS.map((value) => (
                <button
                  className={speed === value ? "active" : ""}
                  type="button"
                  aria-pressed={speed === value}
                  onClick={() => setSpeed(value)}
                  key={value}
                >
                  {value}×
                </button>
              ))}
            </div>
            <div className="replay-status" aria-live="polite">
              <strong>{status}</strong>
              <span>Step {replay.step} / {MAX_STEPS}</span>
              {status === "Settled" && (
                <small>Numerical flux stayed below {SETTLED_FLUX}.</small>
              )}
            </div>
          </section>

          <section className="replay-metric-grid" aria-label="Replay telemetry">
            <ReplayMetric label="Total mass" value={formatMetric(replay.metrics.totalMass)} />
            <ReplayMetric label="Entropy" value={formatMetric(replay.metrics.entropy)} />
            <ReplayMetric label="Total flux" value={formatMetric(replay.metrics.totalFlux)} />
            <ReplayMetric label="Max |flux|" value={formatMetric(replay.metrics.maxFlux)} />
            <ReplayMetric label="Active Logons" value={String(replay.metrics.activeNodes)} />
            <ReplayMetric label="Simulation time" value={`${formatMetric(replay.time, 2)} s`} />
          </section>

          <section className="replay-workspace">
            <article className="panel replay-stage">
              <header className="panel-header replay-stage-header">
                <div>
                  <span className="panel-kicker">Dynamic graph telemetry</span>
                  <h2 className="panel-title">Pressure and flux replay</h2>
                </div>
                <div className="replay-stage-meta">
                  <span>Initial pulse: {entryNode?.label ?? replay.entryLogonId}</span>
                  <span>Fixed dt {DEFAULT_MANIFOLD_REPLAY_CONFIG.dt}</span>
                  <span>Damping {DEFAULT_MANIFOLD_REPLAY_CONFIG.damping}</span>
                </div>
              </header>
              <div className={`replay-graph ${compact ? "compact" : ""} ${overview ? "overview" : ""}`}>
                <svg
                  viewBox={viewBox}
                  role="img"
                  aria-label={`Manifold replay graph with ${replay.nodes.length} Logons and ${replay.edges.length} valid edges`}
                >
                  <defs>
                    <marker
                      id="replay-arrow"
                      markerWidth="7"
                      markerHeight="7"
                      refX="6"
                      refY="3.5"
                      orient="auto"
                    >
                      <path d="M0,0 L7,3.5 L0,7 z" />
                    </marker>
                  </defs>
                  {replay.edges.map((edge) => {
                    const endpoints = replayFluxEndpoints(edge);
                    const from = positionById.get(endpoints.from);
                    const to = positionById.get(endpoints.to);
                    if (!from || !to) return null;
                    const intensity = clamp(
                      Math.abs(edge.flux) /
                        DEFAULT_MANIFOLD_REPLAY_CONFIG.maxFlux,
                      0,
                      1,
                    );
                    return (
                      <path
                        className="replay-edge"
                        d={replayEdgePath(from, to)}
                        key={edge.id}
                        markerEnd="url(#replay-arrow)"
                        style={{
                          "--flux-intensity": intensity,
                          "--flux-width": `${0.7 + intensity * 4.8}px`,
                        } as CSSProperties}
                      >
                        <title>
                          {edge.kind} · flux {formatMetric(edge.flux)} · conductance {formatMetric(edge.conductance)}
                        </title>
                      </path>
                    );
                  })}
                  {layout.nodes.map((node) => {
                    const dynamic = replayNodeById.get(node.id);
                    if (!dynamic) return null;
                    const rhoScale = clamp(
                      dynamic.rho / DEFAULT_MANIFOLD_REPLAY_CONFIG.maxRho,
                      0,
                      1,
                    );
                    const pressureScale = clamp(dynamic.pressure / 1.25, 0, 1);
                    const baseRadius = overview ? 5 : compact ? 8 : 12;
                    const radius = baseRadius + rhoScale * (overview ? 5 : 9);
                    return (
                      <g
                        className={`replay-node ${node.status} ${selectedId === node.id ? "selected" : ""}`}
                        key={node.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${node.label}, ${node.status}, dynamic density ${formatMetric(dynamic.rho)}, dynamic pressure ${formatMetric(dynamic.pressure)}`}
                        onClick={() => setSelectedId(node.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(node.id);
                          }
                        }}
                        style={{
                          "--rho-opacity": 0.12 + rhoScale * 0.68,
                          "--halo-radius": `${radius + 7 + pressureScale * 18}px`,
                        } as CSSProperties}
                      >
                        <circle
                          className="replay-node-halo"
                          cx={node.x}
                          cy={node.y}
                          r={radius + 7 + pressureScale * 18}
                        />
                        {node.status === "contradiction" ? (
                          <rect
                            className="replay-node-core"
                            x={node.x - radius * 0.72}
                            y={node.y - radius * 0.72}
                            width={radius * 1.44}
                            height={radius * 1.44}
                            rx="2"
                            transform={`rotate(45 ${node.x} ${node.y})`}
                          />
                        ) : (
                          <circle
                            className="replay-node-core"
                            cx={node.x}
                            cy={node.y}
                            r={radius}
                          />
                        )}
                        {!compact && (
                          <text className="replay-node-label" x={node.x} y={node.y - radius - 11}>
                            {shortLabel(node.label)}
                          </text>
                        )}
                        <title>{node.label}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </article>

            {selectedPacketNode && selectedReplayNode && (
              <ReplayInspector
                dynamic={selectedReplayNode}
                packetNode={selectedPacketNode}
                sourceLabel={sourceLabel}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ReplayMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel replay-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ReplayInspector({
  dynamic,
  packetNode,
  sourceLabel,
}: {
  dynamic: ReplayNodeState;
  packetNode: NormalizedSolLensPacket["logons"][number];
  sourceLabel: string;
}) {
  return (
    <aside className="panel replay-inspector" aria-live="polite">
      <header>
        <span className="panel-kicker">Selected Logon</span>
        <h2>{packetNode.label}</h2>
        <div className="replay-inspector-badges">
          <span className={`status-chip ${packetNode.status}`}>{packetNode.status}</span>
          <span className="source-chip">{sourceLabel}</span>
        </div>
      </header>
      <dl className="replay-inspector-values">
        <div><dt>ID</dt><dd>{packetNode.id}</dd></div>
        <div><dt>Dynamic replay rho</dt><dd>{formatMetric(dynamic.rho)}</dd></div>
        <div><dt>Packet seed rho</dt><dd>{formatMetric(dynamic.packetRho)}</dd></div>
        <div><dt>Dynamic replay pressure</dt><dd>{formatMetric(dynamic.pressure)}</dd></div>
        <div><dt>Packet pressure seed</dt><dd>{formatMetric(dynamic.pressureSeed)}</dd></div>
        <div><dt>Fixed psi</dt><dd>{formatMetric(dynamic.psi)}</dd></div>
        <div><dt>Net flux</dt><dd>{formatMetric(dynamic.netFlux)}</dd></div>
        <div><dt>Packet evidence</dt><dd>{formatMetric(packetNode.evidence)}</dd></div>
      </dl>
      <div className="replay-inspector-copy">
        <span>Source</span>
        <strong>{packetNode.source}</strong>
        <p>{packetNode.detail}</p>
        {packetNode.evidence_refs?.length ? (
          <p>{packetNode.evidence_refs.length} packet evidence reference{packetNode.evidence_refs.length === 1 ? "" : "s"}</p>
        ) : (
          <p>No packet evidence references supplied.</p>
        )}
      </div>
    </aside>
  );
}
