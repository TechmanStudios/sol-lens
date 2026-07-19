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
  type BaselineEvaluation,
  type NormalizedSolLensPacket,
} from "../lib/packet-schema.ts";
import type { LogonStatus } from "../lib/sol-engine.ts";

type Filter = "all" | LogonStatus;
type RunState = "ready" | "running" | "complete";
type PacketSource =
  | { kind: "demo"; label: "Demo fixture"; detail: string }
  | { kind: "example"; label: "Example packet"; detail: string }
  | { kind: "uploaded"; label: "Uploaded packet"; detail: string };

const percentage = (value: number) => Math.round(value * 100);
const signedDelta = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;

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
  const baseline = packet.baseline_evaluation;
  const candidateSnapshot: BaselineEvaluation = {
    label: "Locally replayed candidate",
    logon_count: packet.logons.length,
    source: source.detail,
    metrics,
    verdict,
  };
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
        <div className="sol-context" aria-label="About SOL and its repositories">
          <div className="sol-context-copy">
            <span>
              <strong>SOL</strong> = Self-Organizing Logos
            </span>
            <small>
              Engine: research foundation · Lens: semantic trace workbench · Not
              the GPT-5.6 Sol model name
            </small>
          </div>
          <nav className="repo-links" aria-label="Project repositories">
            <a
              href="https://github.com/TechmanStudios/sol"
              target="_blank"
              rel="noreferrer"
            >
              SOL Engine <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://github.com/TechmanStudios/sol-lens"
              target="_blank"
              rel="noreferrer"
            >
              SOL Lens repo <span aria-hidden="true">↗</span>
            </a>
          </nav>
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
                  ? baseline
                    ? "Comparing observable scores…"
                    : "Replaying evaluation…"
                  : baseline
                    ? "Run comparison"
                    : "Replay evaluation"}
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
              status={runState}
              snapshot={baseline}
            />
            <ModelCard
              className="candidate"
              title={packet.models?.candidate ?? "Candidate trace"}
              status={runState}
              snapshot={candidateSnapshot}
            />
            <ComparisonDelta baseline={baseline} candidate={candidateSnapshot} />
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
  status,
  snapshot,
}: {
  className: string;
  title: string;
  status: RunState;
  snapshot?: BaselineEvaluation;
}) {
  return (
    <article
      className={`panel model-card ${className} ${snapshot ? "" : "missing-snapshot"}`}
    >
      <div className="model-title-row">
        <h2 className="model-title">{title}</h2>
        <i className="model-dot" />
      </div>
      <p className="model-status">
        {snapshot ? snapshot.label : "No observable baseline supplied"}{" "}
        {snapshot && (
          <strong>{status === "running" ? "comparing" : "ready"}</strong>
        )}
      </p>
      {snapshot ? (
        <>
          <div className="snapshot-metrics" aria-label={`${title} SOL metrics`}>
            {[
              ["Evidence", snapshot.metrics.evidence],
              ["Coherence", snapshot.metrics.coherence],
              ["Contradiction", snapshot.metrics.contradiction],
            ].map(([label, score]) => (
              <div className="snapshot-row" key={label as string}>
                <span>{label}</span>
                <i>
                  <b style={{ width: `${percentage(score as number)}%` }} />
                </i>
                <strong>{(score as number).toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className="model-stats">
            <div className="model-stat">
              <span>Atomic units</span>
              <strong>{snapshot.logon_count}</strong>
            </div>
            <div className="model-stat">
              <span>SOL court</span>
              <strong>{snapshot.verdict}</strong>
            </div>
          </div>
        </>
      ) : (
        <p className="missing-snapshot-copy">
          This packet can be replayed, but metric deltas require an optional
          <code> baseline_evaluation</code> summary.
        </p>
      )}
    </article>
  );
}

function ComparisonDelta({
  baseline,
  candidate,
}: {
  baseline?: BaselineEvaluation;
  candidate: BaselineEvaluation;
}) {
  if (!baseline) {
    return (
      <aside
        className="comparison-delta candidate-only"
        data-testid="comparison-delta"
      >
        <strong>Candidate-only packet</strong>
        <span>
          The candidate evaluation is locally replayed; no baseline delta is
          claimed.
        </span>
      </aside>
    );
  }

  return (
    <aside className="comparison-delta" data-testid="comparison-delta">
      <strong>
        {baseline.verdict} <span aria-hidden="true">→</span>{" "}
        {candidate.verdict}
      </strong>
      <span>
        Evidence{" "}
        {signedDelta(candidate.metrics.evidence - baseline.metrics.evidence)}
      </span>
      <span>
        Coherence{" "}
        {signedDelta(
          candidate.metrics.coherence - baseline.metrics.coherence,
        )}
      </span>
      <span>
        Contradiction{" "}
        {signedDelta(
          candidate.metrics.contradiction - baseline.metrics.contradiction,
        )}
      </span>
      <small>Observable baseline vs locally replayed candidate</small>
    </aside>
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
