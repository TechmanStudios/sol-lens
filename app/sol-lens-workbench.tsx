"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { PacketLoader } from "./components/packet-loader";
import { SemanticGraph } from "./components/semantic-graph";
import { demoPacket } from "../lib/demo-packet.ts";
import type { PacketExample } from "../lib/example-packets.ts";
import {
  chooseInitialLogon,
  createProofPacket,
  parsePacketJson,
  type NormalizedSolLensPacket,
} from "../lib/packet-schema.ts";
import type { LogonStatus } from "../lib/sol-engine.ts";

type Filter = "all" | LogonStatus;
type RunState = "ready" | "running" | "complete";
type PacketSource =
  | { kind: "demo"; label: "Demo fixture"; detail: string }
  | { kind: "example"; label: "Example packet"; detail: string }
  | { kind: "uploaded"; label: "Uploaded packet"; detail: string };

const baselineTrace =
  "2,30 22,27 42,29 62,21 82,24 102,18 122,21 142,16 162,20 182,13 202,17 222,10";
const candidateTrace =
  "2,31 22,28 42,25 62,25 82,18 102,20 122,15 142,18 162,12 182,14 202,9 222,7";

const percentage = (value: number) => Math.round(value * 100);

export default function SolLensWorkbench() {
  const [packet, setPacket] =
    useState<NormalizedSolLensPacket>(demoPacket);
  const [selectedId, setSelectedId] = useState("L06");
  const [filter, setFilter] = useState<Filter>("all");
  const [runState, setRunState] = useState<RunState>("complete");
  const [errors, setErrors] = useState<string[]>([]);
  const [source, setSource] = useState<PacketSource>({
    kind: "demo",
    label: "Demo fixture",
    detail: demoPacket.fixture ?? demoPacket.packet_id,
  });
  const comparisonTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (comparisonTimer.current !== undefined) {
        window.clearTimeout(comparisonTimer.current);
      }
    },
    [],
  );

  const metrics = packet.evaluation.metrics;
  const verdict = packet.evaluation.verdict;
  const traceStats = useMemo(() => {
    const supported = packet.logons.filter(
      (logon) => logon.status === "supported",
    ).length;
    const contradictions = packet.logons.filter(
      (logon) => logon.status === "contradiction",
    );
    return {
      coverage: supported / Math.max(packet.logons.length, 1),
      severity:
        contradictions.reduce(
          (sum, logon) => sum + logon.pressure,
          0,
        ) / Math.max(contradictions.length, 1),
    };
  }, [packet]);

  const runComparison = () => {
    if (runState === "running") return;
    setRunState("running");
    if (comparisonTimer.current !== undefined) {
      window.clearTimeout(comparisonTimer.current);
    }
    comparisonTimer.current = window.setTimeout(
      () => setRunState("complete"),
      1100,
    );
  };

  const loadDemo = () => {
    setPacket(demoPacket);
    setSelectedId("L06");
    setFilter("all");
    setRunState("complete");
    setErrors([]);
    setSource({
      kind: "demo",
      label: "Demo fixture",
      detail: demoPacket.fixture ?? demoPacket.packet_id,
    });
  };

  const loadExample = (example: PacketExample) => {
    const initial = chooseInitialLogon(example.packet);
    setPacket(example.packet);
    setSelectedId(initial.id);
    setFilter("all");
    setErrors([]);
    setSource({
      kind: "example",
      label: "Example packet",
      detail: example.title,
    });
    setRunState("running");
    if (comparisonTimer.current !== undefined) {
      window.clearTimeout(comparisonTimer.current);
    }
    comparisonTimer.current = window.setTimeout(
      () => setRunState("complete"),
      1100,
    );
  };

  const loadPacketText = (text: string, sourceName: string) => {
    const result = parsePacketJson(text);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const nextPacket = result.packet;
    const initial = chooseInitialLogon(nextPacket);
    setPacket(nextPacket);
    setSelectedId(initial.id);
    setFilter("all");
    setRunState("complete");
    setErrors([]);
    setSource({
      kind: "uploaded",
      label: "Uploaded packet",
      detail: sourceName,
    });
  };

  const downloadProofPacket = () => {
    const proofPacket = createProofPacket(packet);
    const blob = new Blob([JSON.stringify(proofPacket, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${packet.packet_id.replace(/[^a-z0-9-]+/gi, "-")}-proof-packet-v0.2.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const evaluationCopy =
    packet.evaluation.claimed_evaluation_match === false
      ? "The supplied evaluation differs from the locally replayed SOL result. This verdict uses observable Logon data."
      : "Evidence and constraint gates were replayed locally. The complete graph is ready for export and re-import.";

  return (
    <main className="app-shell phase-two-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand" aria-label="SOL Lens">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-sun" />
            </span>
            <span className="brand-name">SOL Lens</span>
          </div>
          <span className="status-badge">
            <i /> Local replay × SOL Engine
          </span>
        </div>
        <div className="topbar-actions" aria-label="Application status">
          <span className="topbar-mode">
            {source.label} · {packet.schema.split("/").at(-1)}
          </span>
        </div>
      </header>

      <div className="main-grid">
        <section className="left-stack" aria-label="Comparison setup">
          <div className="hero">
            <p className="eyebrow">Semantic migration workbench</p>
            <h1>See whether your agent actually got better.</h1>
            <p className="hero-copy">
              Load an observable SOL packet, explore its typed semantic graph,
              and replay evidence, coherence, contradiction, and promotion
              readiness without hidden reasoning claims.
            </p>
            <aside className="packet-primer">
              <strong>New to SOL? Start with an example.</strong>
              <span>
                A packet is a portable JSON record of observable agent steps.
                Each <b>Logon</b> is one atomic unit—such as a requirement,
                tool result, check, or output—and the links show how those
                units support, constrain, or challenge one another.
              </span>
            </aside>
            <div className="button-row phase-two-actions">
              <button
                className="primary-button"
                type="button"
                onClick={runComparison}
                disabled={runState === "running"}
              >
                {runState === "running"
                  ? "Tracing semantic flow…"
                  : "Run comparison"}
                <span className="button-arrow" aria-hidden="true">
                  →
                </span>
              </button>
              <PacketLoader
                errors={errors}
                onDemo={loadDemo}
                onErrors={setErrors}
                onExample={loadExample}
                onPacketText={loadPacketText}
              />
            </div>
            <div className="packet-summary" aria-live="polite">
              <span className={`provenance-dot ${source.kind}`} />
              <strong>{source.label}</strong>
              <span>{source.detail}</span>
              <span>{packet.packet_id}</span>
            </div>
          </div>

          <div className="model-grid" aria-label="Model comparison">
            <ModelCard
              className="baseline"
              title={packet.models?.baseline ?? "Baseline trace"}
              trace={baselineTrace}
              stroke="#55cff5"
              status={runState}
              steps={source.kind === "demo" ? "24" : "reference"}
              latency={source.kind === "demo" ? "1.24 s" : "packet"}
              risk="Observed"
            />
            <ModelCard
              className="candidate"
              title={packet.models?.candidate ?? "Candidate trace"}
              trace={candidateTrace}
              stroke="#f2bd60"
              status={runState}
              steps={String(packet.logons.length)}
              latency={source.kind === "demo" ? "0.86 s" : "local"}
              risk={
                packet.evaluation.verdict === "QUARANTINE"
                  ? "Review"
                  : "Measured"
              }
            />
          </div>
        </section>

        <section className="right-stack" aria-label="Semantic analysis">
          <SemanticGraph
            filter={filter}
            onErrors={setErrors}
            onFilter={setFilter}
            onPacketText={loadPacketText}
            onSelect={setSelectedId}
            packet={packet}
            selectedId={selectedId}
            sourceLabel={source.label}
          />

          <div className="metrics-grid" aria-label="SOL evaluation metrics">
            <MetricCard
              title="Evidence"
              symbol="ρ"
              score={metrics.evidence}
              lines={[
                ["Coverage", traceStats.coverage],
                ["Authority", metrics.authority],
              ]}
            />
            <MetricCard
              title="Coherence"
              symbol="j"
              className="coherence"
              score={metrics.coherence}
              lines={[
                ["Continuity", metrics.continuity],
                ["Faithfulness", metrics.faithfulness],
              ]}
            />
            <MetricCard
              title="Contradiction"
              symbol="Δ"
              className="contradiction"
              score={metrics.contradiction}
              lines={[
                ["Rate", metrics.contradiction],
                ["Severity", traceStats.severity],
              ]}
            />
            <article
              className={`panel metric-card verdict-card verdict-${verdict.toLowerCase()}`}
            >
              <span className="verdict-label">
                Promotion court · replayed
              </span>
              <div>
                <h3 className="verdict-word" data-testid="verdict">
                  {verdict}
                </h3>
                <p className="verdict-copy">{evaluationCopy}</p>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={downloadProofPacket}
                data-testid="download-proof"
              >
                Download v0.2 proof packet ↓
              </button>
            </article>
          </div>

          <footer className="footer-row">
            <span>
              <strong>{source.label}</strong> · {source.detail}
            </span>
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
      <div className="model-title-row">
        <h2 className="model-title">{title}</h2>
        <i className="model-dot" />
      </div>
      <p className="model-status">
        Trace status{" "}
        <strong>{status === "running" ? "mapping" : "complete"}</strong>
      </p>
      <div className="mini-trace" aria-hidden="true">
        <svg viewBox="0 0 224 40" preserveAspectRatio="none">
          <line
            x1="0"
            y1="35"
            x2="224"
            y2="35"
            stroke="rgba(151,178,203,.12)"
          />
          <polyline
            points={trace}
            fill="none"
            stroke={stroke}
            strokeWidth="1.25"
          />
        </svg>
      </div>
      <div className="model-stats">
        <div className="model-stat">
          <span>Atomic steps</span>
          <strong>{steps}</strong>
        </div>
        <div className="model-stat">
          <span>Trace source</span>
          <strong>{latency}</strong>
        </div>
        <div className="model-stat">
          <span>Risk</span>
          <strong>{risk}</strong>
        </div>
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
      <div className="metric-heading">
        <h3>{title}</h3>
        <span className="metric-symbol">{symbol}</span>
      </div>
      <div className="metric-body">
        <div
          className="score-ring"
          style={{ "--score": percentage(score) } as CSSProperties}
        >
          <span>{score.toFixed(2)}</span>
        </div>
        <div className="metric-lines">
          {lines.map(([label, value]) => (
            <div className="metric-line" key={label}>
              <span>{label}</span>
              <strong>{value.toFixed(2)}</strong>
              <div className="metric-bar">
                <i style={{ width: `${percentage(value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
