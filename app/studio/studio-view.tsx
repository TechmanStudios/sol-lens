"use client";

import { useEffect, useState, useRef } from "react";

export default function StudioView() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const streamUrl = "http://localhost:8765";

  // Health check polling
  useEffect(() => {
    let mounted = true;
    const check = async () => {
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

    check();
    const interval = window.setInterval(check, 3000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const triggerGate = async (gate: string) => {
    try {
      const res = await fetch(`${streamUrl}/api/logic?gate=${gate}&a=1.0&b=1.0`);
      if (res.ok) {
        const data = await res.json();
        const readout = Object.entries(data.binary_outputs || {})
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");
        showToast(`${gate} Result: ${readout} (${data.absorbed_energy} J absorbed)`);
      }
    } catch {
      showToast(`Failed to evaluate ${gate} gate`);
    }
  };

  const showToast = (msg: string) => {
    setSyncToast(msg);
    window.setTimeout(() => setSyncToast(null), 3200);
  };

  const syncToCourt = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${streamUrl}/api/packet/live`);
      if (res.ok) {
        showToast("Live Riemannian packet synced to memory");
      } else {
        showToast("Could not retrieve packet");
      }
    } catch {
      showToast("Sync failed - server unreachable");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#030712",
        color: "#f3f4f6",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Floating Top Navigation Header */}
      {!zenMode && (
        <header
          style={{
            position: "absolute",
            top: "16px",
            left: "20px",
            right: "20px",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
          }}
        >
          {/* Brand & Mode Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#94a3b8",
                textDecoration: "none",
                padding: "5px 12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              }}
            >
              ← Trace Court
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #f59e0b 0%, #d97706 60%, transparent 100%)",
                  boxShadow: "0 0 12px rgba(245, 158, 11, 0.6)",
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em", color: "#f8fafc" }}>
                SOL Studio
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  background: online ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: online ? "#34d399" : "#f87171",
                  border: online ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)",
                }}
              >
                {online ? "20 Hz LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Quick Logic Gate Bar (Vector 2) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 8px",
              background: "rgba(2, 6, 23, 0.6)",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginRight: "4px",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Vector 2:
            </span>
            <button
              type="button"
              onClick={() => triggerGate("XOR")}
              disabled={!online}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                color: online ? "#f59e0b" : "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: online ? "pointer" : "default",
              }}
              title="Test non-linear destructive collision"
            >
              XOR
            </button>
            <button
              type="button"
              onClick={() => triggerGate("AND")}
              disabled={!online}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                color: online ? "#38bdf8" : "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: online ? "pointer" : "default",
              }}
              title="Test constructive lensing"
            >
              AND
            </button>
            <button
              type="button"
              onClick={() => triggerGate("HALF_ADDER")}
              disabled={!online}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                color: online ? "#a855f7" : "#64748b",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: online ? "pointer" : "default",
              }}
              title="Test dual sum/carry routing"
            >
              Half-Adder
            </button>
          </div>

          {/* Right Action Island */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={syncToCourt}
              disabled={!online || isSyncing}
              style={{
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 500,
                padding: "5px 12px",
                borderRadius: "8px",
                cursor: online ? "pointer" : "default",
                transition: "all 0.15s ease",
              }}
            >
              {isSyncing ? "Syncing…" : "Sync to Court ↓"}
            </button>

            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "12px",
                padding: "5px 10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              title="Reload WebGL Canvas"
            >
              ↺
            </button>

            <button
              type="button"
              onClick={() => setZenMode(true)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#94a3b8",
                fontSize: "12px",
                padding: "5px 12px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              title="Hide top navigation for pure 3D immersion"
            >
              Zen Mode ⛶
            </button>
          </div>
        </header>
      )}

      {/* Floating Exit Zen Mode Button */}
      {zenMode && (
        <button
          type="button"
          onClick={() => setZenMode(false)}
          style={{
            position: "absolute",
            top: "16px",
            right: "20px",
            zIndex: 40,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#94a3b8",
            fontSize: "12px",
            padding: "6px 14px",
            borderRadius: "9999px",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          Exit Zen Mode ✕
        </button>
      )}

      {/* Toast Notification */}
      {syncToast && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            color: "#f8fafc",
            fontSize: "12px",
            fontFamily: "ui-monospace, monospace",
            padding: "8px 18px",
            borderRadius: "9999px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          }}
        >
          {syncToast}
        </div>
      )}

      {/* Main Full-Viewport 3D Canvas / Offline Screen */}
      <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
        {online === false ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              textAlign: "center",
              background: "radial-gradient(circle at center, #0b1329 0%, #030712 100%)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "20px",
              }}
            >
              ⚡
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#f8fafc", marginBottom: "8px" }}>
              SOL Simulation Engine Standby
            </h1>
            <p style={{ maxWidth: "480px", fontSize: "14px", color: "#94a3b8", lineHeight: 1.6, marginBottom: "24px" }}>
              The 3D Continuous Riemannian stream runs on a local high-performance simulation server.
              Launch the engine in your terminal to start real-time telemetry:
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 20px",
                background: "#020617",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "10px",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: "13px",
                color: "#38bdf8",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              }}
            >
              <span>python scripts/run_sol_live_stream.py</span>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={`${streamUrl}/`}
            title="SOL Studio — 3D Riemannian Manifold"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#030712",
            }}
          />
        )}
      </div>
    </div>
  );
}
