"use client";

import { useEffect, useState, useRef } from "react";
import type { NormalizedSolLensPacket } from "../../lib/packet-schema.ts";

type LiveManifold3DPanelProps = {
  packet: NormalizedSolLensPacket;
  onSyncLivePacket: () => Promise<void>;
  isAutoSyncing: boolean;
  onToggleAutoSync: () => void;
  streamUrl?: string;
};

export function LiveManifold3DPanel({
  packet,
  onSyncLivePacket,
  isAutoSyncing,
  onToggleAutoSync,
  streamUrl = "http://localhost:8765",
}: LiveManifold3DPanelProps) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<string>("");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showInvariants, setShowInvariants] = useState<boolean>(false);

  // Poll health endpoint
  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${streamUrl}/api/health`, { method: "GET", mode: "cors" });
        if (res.ok) {
          if (mounted) {
            setOnline(true);
            setLastCheck(new Date().toLocaleTimeString());
          }
        } else {
          if (mounted) setOnline(false);
        }
      } catch {
        if (mounted) setOnline(false);
      }
    };

    checkHealth();
    const interval = window.setInterval(checkHealth, 3000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [streamUrl]);

  const metrics = packet.evaluation.metrics;

  return (
    <div
      className="live-manifold-studio-shell"
      style={{
        width: "100%",
        height: "calc(100vh - 72px)",
        position: "relative",
        background: "#030712",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Floating Glass Control Ribbon */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "8px 20px",
          background: "rgba(10, 18, 31, 0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(151, 178, 203, 0.15)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-block",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: online ? "#10b981" : "#ef4444",
              boxShadow: online ? "0 0 10px #10b981" : "none",
            }}
          />
          <div>
            <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--ink)" }}>
              SOL Kernel: 3D Continuous Riemannian Stream
            </span>
            <span
              style={{
                marginLeft: "8px",
                fontSize: "11px",
                color: online ? "#34d399" : "var(--quiet)",
                fontFamily: "var(--mono)",
              }}
            >
              {online ? `● 20 Hz Live (${streamUrl})` : `OFFLINE · Run: python scripts/run_sol_live_stream.py`}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="secondary-button"
            style={{ fontSize: "11px", padding: "5px 12px", cursor: "pointer" }}
            onClick={() => onSyncLivePacket()}
            disabled={!online}
          >
            Sync Packet to Court ↓
          </button>

          <button
            type="button"
            className={`secondary-button ${isAutoSyncing ? "active" : ""}`}
            style={{
              fontSize: "11px",
              padding: "5px 12px",
              cursor: "pointer",
              background: isAutoSyncing ? "var(--cyan-soft)" : undefined,
              borderColor: isAutoSyncing ? "var(--cyan)" : undefined,
            }}
            onClick={onToggleAutoSync}
            disabled={!online}
          >
            {isAutoSyncing ? "Auto-Sync: ON (1s)" : "Auto-Sync: OFF"}
          </button>

          <button
            type="button"
            className="quiet-button"
            style={{ fontSize: "11px", padding: "5px 10px", cursor: "pointer" }}
            onClick={() => setShowInvariants((v) => !v)}
            title="Toggle Riemannian Invariants HUD"
          >
            {showInvariants ? "Hide Invariants ✕" : "Invariants ℹ"}
          </button>

          <button
            type="button"
            className="quiet-button"
            style={{ fontSize: "11px", padding: "5px 10px", cursor: "pointer" }}
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload 3D Viewport"
          >
            ↺
          </button>

          <a
            href="/studio"
            className="quiet-button"
            style={{
              fontSize: "11px",
              padding: "5px 12px",
              textDecoration: "none",
              color: "var(--cyan)",
              borderColor: "rgba(85, 207, 245, 0.3)",
              background: "rgba(85, 207, 245, 0.08)",
            }}
            title="Open pure, distraction-free spatial studio"
          >
            ⚡ Full Studio View ↗
          </a>
        </div>
      </div>

      {/* Main 3D Viewport or Standby Screen */}
      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        {online === false ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at center, #0b1329 0%, #030712 100%)",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>🌐</div>
            <h2 style={{ fontSize: "20px", color: "var(--ink)", marginBottom: "8px" }}>
              SOL Engine Stream Offline
            </h2>
            <p style={{ maxWidth: "520px", color: "var(--muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
              The 3D WebGL Riemannian deformation stream requires the local simulation server to be running on <code>port 8765</code>.
            </p>
            <div
              style={{
                padding: "12px 24px",
                background: "#050811",
                border: "1px solid var(--line-strong)",
                borderRadius: "6px",
                fontFamily: "var(--mono)",
                fontSize: "13px",
                color: "var(--cyan)",
              }}
            >
              python scripts/run_sol_live_stream.py
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={streamUrl}
            title="SOL Engine 3D Riemannian Manifold"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#030712",
            }}
          />
        )}

        {/* Collapsible Riemannian Invariants Floating Overlay */}
        {showInvariants && (
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              right: "16px",
              zIndex: 30,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
              background: "rgba(10, 18, 31, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(151, 178, 203, 0.25)",
              borderRadius: "10px",
              padding: "12px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ padding: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--quiet)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Metric Definiteness
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#10b981", marginTop: "2px" }}>
                $g_{"{"}ij{"}"} \succ 0$ (Retraction)
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                Log-Euclidean Lie algebra retraction prevents caustics.
              </div>
            </div>

            <div style={{ padding: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--quiet)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Symplectic Navigator
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--cyan)", marginTop: "2px" }}>
                Levi-Civita $\Gamma^k_{"{"}ij{"}"}$
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                Semi-implicit symplectic geodesic integration.
              </div>
            </div>

            <div style={{ padding: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--quiet)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Continuity / Preservation
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--ink)", marginTop: "2px" }}>
                {(metrics.continuity * 100).toFixed(1)}% Geodesic
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                Invariant $\ge 95\%$ geodesic distance preservation.
              </div>
            </div>

            <div style={{ padding: "8px" }}>
              <div style={{ fontSize: "10px", color: "var(--quiet)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Carnot Memory Sink
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--solar-bright)", marginTop: "2px" }}>
                $dE = 2\gamma E_k \Delta t$ Absorbed
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                Autonomous consolidation flush to long-term storage.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
