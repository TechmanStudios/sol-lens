"use client";

import { useState } from "react";
import {
  packetExamples,
  type PacketExample,
} from "../../lib/example-packets.ts";

const judgeTourSteps = new Map([
  ["linear", "Tour 1"],
  ["tool-fanout", "Tour 2"],
  ["conflict", "Tour 3"],
]);

type PacketLoaderProps = {
  onDemo: () => void;
  onExample: (example: PacketExample) => void;
};

export function PacketLoader({
  onDemo,
  onExample,
}: PacketLoaderProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);

  return (
    <div className="packet-loader">
      <div className="packet-action-row">
        <button
          className="secondary-button"
          type="button"
          aria-expanded={examplesOpen}
          aria-controls="packet-example-drawer"
          onClick={() => setExamplesOpen((open) => !open)}
          data-testid="example-packet-toggle"
        >
          Explore 7 examples
        </button>
        <button className="quiet-button" type="button" onClick={onDemo}>
          Reset demo
        </button>
      </div>
      <p className="packet-tour-hint">
        <strong>Suggested judge tour:</strong> Grounded answer → Tool fan-out →
        Conflicting sources
      </p>

      {examplesOpen && (
        <section
          className="packet-example-drawer"
          id="packet-example-drawer"
          aria-label="Example SOL packets"
        >
          <div className="example-drawer-heading">
            <div>
              <span className="drawer-kicker">No JSON required</span>
              <h2>Choose a graph shape to compare</h2>
            </div>
            <button
              className="quiet-button compact"
              type="button"
              onClick={() => setExamplesOpen(false)}
            >
              Close
            </button>
          </div>
          <p className="example-drawer-copy">
            Each card is a complete, browser-local SOL packet. Loading one
            replays the same evidence, coherence, contradiction, and promotion
            gates against a known-good teaching fixture—no uploads or JSON
            formatting required.
          </p>
          <div className="packet-example-grid">
            {packetExamples.map((example) => (
              <button
                className={`packet-example-card ${judgeTourSteps.has(example.id) ? "tour-stop" : ""}`}
                type="button"
                key={example.id}
                onClick={() => {
                  onExample(example);
                  setExamplesOpen(false);
                }}
                data-testid={`packet-example-${example.id}`}
              >
                <span className="example-card-meta">
                  {judgeTourSteps.has(example.id) && (
                    <span className="tour-step">
                      {judgeTourSteps.get(example.id)}
                    </span>
                  )}
                  <span>{example.scale}</span>
                  <span>{example.packet.logons.length} Logons</span>
                  <span>{example.structure}</span>
                </span>
                <strong>{example.title}</strong>
                <span className="example-card-summary">{example.summary}</span>
                <span className="example-card-action">
                  <i className={`verdict-dot ${example.verdict.toLowerCase()}`} />
                  {example.verdict} preview
                  <b>Load &amp; compare →</b>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
