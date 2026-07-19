import assert from "node:assert/strict";
import test from "node:test";

import {
  courtVerdict,
  createProofPacket,
  demoLogons,
  scoreLogons,
} from "../lib/sol-engine.ts";

test("scores the checked-in trace deterministically", () => {
  const metrics = scoreLogons(demoLogons);

  assert.equal(metrics.evidence.toFixed(2), "0.91");
  assert.equal(metrics.coherence.toFixed(2), "0.88");
  assert.equal(metrics.contradiction.toFixed(2), "0.07");
  assert.equal(courtVerdict(metrics), "PROMOTE");
});

test("quarantines a trace with weak coherence", () => {
  assert.equal(
    courtVerdict({
      evidence: 0.91,
      coherence: 0.65,
      contradiction: 0.02,
      continuity: 0.8,
      authority: 0.9,
      faithfulness: 0.7,
    }),
    "QUARANTINE",
  );
});

test("proof packet preserves the observable trace contract", () => {
  const metrics = scoreLogons(demoLogons);
  const packet = createProofPacket(demoLogons, metrics);

  assert.equal(packet.schema, "techman.sol-lens.proof-packet/v0.1");
  assert.equal(packet.observable_trace_only, true);
  assert.equal(packet.verdict, "PROMOTE");
  assert.equal(packet.logons.length, demoLogons.length);
  assert.deepEqual(Object.keys(packet.logons[0]), [
    "id",
    "label",
    "status",
    "evidence",
    "rho",
    "psi",
    "pressure",
    "detail",
    "source",
  ]);
});
