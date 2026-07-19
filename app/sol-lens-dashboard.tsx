"use client";

import { useMemo, useState } from "react";
import {
  courtVerdict,
  createProofPacket,
  demoEdges,
  demoLogons,
  scoreLogons,
  type LogonStatus,
} from "../lib/sol-engine";

type Filter = "all" | LogonStatus;
type RunState = "ready" | "running" | "complete";

const baselineTrace = "2,30 22,27 42,29 62,21 82,24 102,18 122,21 142,16 162,20 182,13 202,17 222,10";
const candidateTrace = "2,31 22,28 42,25 62,25 82,18 102,20 122,15 142,18 162,12 182,14 202,9 222,7";

const fieldPaths = [
  "M44 165 C170 48 276 74 438 200 S690 366 864 164",
  "M35 242 C176 116 308 146 456 235 S693 324 870 235",
  "M80 330 C208 250 300 248 430 295 S670 388 840 308",
  "M120 84 C278 22 390 86 512 154 S730 208 878 92",
  "M55 386 C182 312 338 348 464 353 S694 350 860 388",
];

const percentage = (value: number) => Math.round(value * 100);

export default function SolLensDashboard() {
  const [selectedId, setSelectedId] = useState("L06");
  const [filter, setFilter] = useState<Filter>("all");
  const [runState, setRunState] = useState<RunState>("complete");
  const metrics = useMemo(() => scoreLogons(demoLogons), []);
  const selectedLogon = demoLogons.find((logon) => logon.id === selectedId) ?? demoLogons[0];
  const verdict = courtVerdict(metrics);

  const runComparison = () => {
    if (runState === "running") return;
    setRunState("running");
    window.setTimeout(() => setRunState("complete"), 1350);
  };

  const loadDemo = () => {
    setSelectedId("L06");
    setFilter("all");
    setRunState("complete");
  };

  const downloadProofPacket = () => {
    const packet = createProofPacket(demoLogons, metrics);
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sol-lens-proof-packet.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const nodeById = (id: string) => demoLogons.find((logon) => logon.id === id)!;
  const isDimmed = (status: LogonStatus) => filter !== "all" && filter !== status;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand" aria-label="SOL Lens">
            <span className="brand-mark" aria-hidden="true"><span className="brand-sun" /></span>
            <span className="brand-name">SOL Lens</span>
          </div>
          <span className="status-badge"><i /> GPT-5.6 × SOL Engine</span>
        </div>
        <div className="topbar-actions" aria-label="Application controls">
          <button className="icon-button" type="button" aria-label="Run status">⌁</button>
          <button className="icon-button" type="button" aria-label="Trace activity">∿</button>
          <button className="icon-button" type="button" aria-label="Workspace settings">⚙</button>
        </div>
      </header>

      <div className="main-grid">
        <section className="left-stack" aria-label="Comparison setup">
          <div className="hero">
            <p className="eyebrow">Semantic migration workbench</p>
            <h1>See whether your agent actually got better.</h1>
            <p className="hero-copy">
              Compare observable agent traces, compile them into Logons, and let SOL measure
              evidence, coherence, contradiction, and promotion readiness.
            </p>
            <div className="button-row">
              <button className="primary-button" type="button" onClick={runComparison} disabled={runState === "running"}>
                {runState === "running" ? "Tracing semantic flow…" : "Run comparison"}
                <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="secondary-button" type="button" onClick={loadDemo}>Load demo</button>
            </div>
          </div>

          <div className="model-grid" aria-label="Model comparison">
            <ModelCard
              className="baseline"
              title="GPT-5.5 Baseline"
              trace={baselineTrace}
              stroke="#55cff5"
              status={runState}
              steps="24"
              latency="1.24 s"
              risk="Low"
            />
            <ModelCard
              className="candidate"
              title="GPT-5.6 Sol"
              trace={candidateTrace}
              stroke="#f2bd60"
              status={runState}
              steps="19"
              latency="0.86 s"
              risk="Low"
            />
          </div>
        </section>

        <section className="right-stack" aria-label="Semantic analysis">
          <article className="panel graph-panel">
            {runState === "running" && <span className="running-wash" aria-hidden="true" />}
            <header className="panel-header">
              <div className="panel-title-row">
                <div>
                  <span className="panel-kicker">Observable trace · 10 atomic units</span>
                  <h2 className="panel-title">Semantic Logon graph</h2>
                </div>
              </div>
              <div className="legend" aria-label="Graph legend">
                <span className="legend-item"><i className="legend-dot" />Supported</span>
                <span className="legend-item"><i className="legend-dot inferred" />Inferred</span>
                <span className="legend-item"><i className="legend-diamond" />Contradiction</span>
              </div>
            </header>

            <div className="graph-toolbar" role="group" aria-label="Filter Logons">
              {(["all", "supported", "inferred", "contradiction"] as Filter[]).map((item) => (
                <button
                  className={`filter-button ${filter === item ? "active" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="graph-stage">
              <svg viewBox="0 0 920 450" role="img" aria-label="Interactive semantic Logon dependency graph">
                <defs>
                  <marker id="arrowNeutral" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(166,189,210,.52)" />
                  </marker>
                  <marker id="arrowSolar" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(217,154,54,.78)" />
                  </marker>
                  <marker id="arrowDanger" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(255,107,69,.82)" />
                  </marker>
                </defs>

                {fieldPaths.map((path, index) => (
                  <path className={`field-line ${index % 2 ? "solar" : ""}`} d={path} key={path} />
                ))}

                {demoEdges.map((edge) => {
                  const from = nodeById(edge.from);
                  const to = nodeById(edge.to);
                  const dimmed = isDimmed(edge.status);
                  return (
                    <path
                      className={`graph-edge ${edge.status} ${edge.active ? "active-flow" : ""} ${dimmed ? "dimmed" : ""}`}
                      d={`M${from.x} ${from.y} C${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`}
                      key={`${edge.from}-${edge.to}`}
                    />
                  );
                })}

                {demoLogons.map((logon) => (
                  <g
                    className={`logon-node ${logon.status} ${selectedId === logon.id ? "selected" : ""} ${isDimmed(logon.status) ? "dimmed" : ""}`}
                    key={logon.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${logon.label}, ${logon.status}`}
                    onClick={() => setSelectedId(logon.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedId(logon.id);
                    }}
                  >
                    <circle className="node-halo" cx={logon.x} cy={logon.y} r="24" />
                    {logon.status === "contradiction" ? (
                      <rect className="node-core" x={logon.x - 15} y={logon.y - 15} width="30" height="30" rx="3" transform={`rotate(45 ${logon.x} ${logon.y})`} />
                    ) : (
                      <circle className="node-core" cx={logon.x} cy={logon.y} r={logon.id === "L06" ? 18 : 14} />
                    )}
                    <text className="node-label" x={logon.x} y={logon.y + (logon.y > 300 ? 34 : -25)}>{logon.label}</text>
                    <text className="node-id" x={logon.x} y={logon.y + (logon.y > 300 ? 47 : -12)}>{logon.id}</text>
                  </g>
                ))}
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
              <p className="inspector-detail">{selectedLogon.detail}</p>
              <span className={`status-chip ${selectedLogon.status}`}>{selectedLogon.status}</span>
            </div>
          </article>

          <div className="metrics-grid" aria-label="SOL evaluation metrics">
            <MetricCard
              title="Evidence"
              symbol="ρ"
              score={metrics.evidence}
              lines={[["Coverage", 0.93], ["Authority", metrics.authority]]}
            />
            <MetricCard
              title="Coherence"
              symbol="j"
              className="coherence"
              score={metrics.coherence}
              lines={[["Continuity", metrics.continuity], ["Faithfulness", metrics.faithfulness]]}
            />
            <MetricCard
              title="Contradiction"
              symbol="Δ"
              className="contradiction"
              score={metrics.contradiction}
              lines={[["Rate", metrics.contradiction], ["Severity", 0.06]]}
            />
            <article className="panel metric-card verdict-card">
              <span className="verdict-label">Promotion court · final</span>
              <div>
                <h3 className="verdict-word">{verdict}</h3>
                <p className="verdict-copy">Evidence and constraint gates satisfied. Proof packet is ready for replay.</p>
              </div>
              <button className="text-button" type="button" onClick={downloadProofPacket}>Download proof packet ↓</button>
            </article>
          </div>

          <footer className="footer-row">
            <span><strong>Demo fixture</strong> · build-week-agent-migration-01</span>
            <span>Observable traces only · no hidden reasoning claims</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function ModelCard({
  className,
  title,
  trace,
  stroke,
  status,
  steps,
  latency,
  risk,
}: {
  className: string;
  title: string;
  trace: string;
  stroke: string;
  status: RunState;
  steps: string;
  latency: string;
  risk: string;
}) {
  return (
    <article className={`panel model-card ${className}`}>
      <div className="model-title-row"><h2 className="model-title">{title}</h2><i className="model-dot" /></div>
      <p className="model-status">Trace status <strong>{status === "running" ? "mapping" : "complete"}</strong></p>
      <div className="mini-trace" aria-hidden="true">
        <svg viewBox="0 0 224 40" preserveAspectRatio="none">
          <line x1="0" y1="35" x2="224" y2="35" stroke="rgba(151,178,203,.12)" />
          <polyline points={trace} fill="none" stroke={stroke} strokeWidth="1.25" />
        </svg>
      </div>
      <div className="model-stats">
        <div className="model-stat"><span>Atomic steps</span><strong>{steps}</strong></div>
        <div className="model-stat"><span>Latency</span><strong>{latency}</strong></div>
        <div className="model-stat"><span>Risk</span><strong>{risk}</strong></div>
      </div>
    </article>
  );
}

function MetricCard({
  title,
  symbol,
  score,
  lines,
  className = "",
}: {
  title: string;
  symbol: string;
  score: number;
  lines: [string, number][];
  className?: string;
}) {
  return (
    <article className={`panel metric-card ${className}`}>
      <div className="metric-heading"><h3>{title}</h3><span className="metric-symbol">{symbol}</span></div>
      <div className="metric-body">
        <div className="score-ring" style={{ "--score": percentage(score) } as React.CSSProperties}>
          <span>{score.toFixed(2)}</span>
        </div>
        <div className="metric-lines">
          {lines.map(([label, value]) => (
            <div className="metric-line" key={label}>
              <span>{label}</span><strong>{value.toFixed(2)}</strong>
              <div className="metric-bar"><i style={{ width: `${percentage(value)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
