import assert from "node:assert/strict";
import test from "node:test";

import { demoPacket, demoPacketInput } from "../lib/demo-packet.ts";
import {
  MAX_PACKET_BYTES,
  PACKET_SCHEMA_V02,
  createProofPacket,
  normalizePacket,
  parsePacketJson,
} from "../lib/packet-schema.ts";
import {
  duplicateIdPacket,
  legacyV01Packet,
  missingTargetPacket,
  outOfRangePacket,
  valid24Packet,
} from "./fixtures/packets.mjs";

const requirePacket = (result) => {
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join(" "));
  return result.packet;
};

test("the checked-in demo is canonical and layout-free", () => {
  assert.equal(demoPacket.schema, PACKET_SCHEMA_V02);
  assert.equal(demoPacket.logons.length, 10);
  assert.equal(demoPacket.edges.length, 14);
  assert.equal("x" in demoPacket.logons[0], false);
  assert.equal("y" in demoPacket.logons[0], false);
  assert.equal(demoPacketInput.observable_trace_only, true);
  assert.equal(demoPacket.evaluation.verdict, "PROMOTE");
});

test("validates duplicate IDs, missing targets, and out-of-range measures", () => {
  const duplicate = normalizePacket(duplicateIdPacket);
  const missing = normalizePacket(missingTargetPacket);
  const range = normalizePacket(outOfRangePacket);

  assert.equal(duplicate.ok, false);
  assert.match(duplicate.errors.join(" "), /duplicates Logon ID/);
  assert.equal(missing.ok, false);
  assert.match(missing.errors.join(" "), /references missing Logon/);
  assert.equal(range.ok, false);
  assert.match(range.errors.join(" "), /between 0 and 1/);
});

test("normalizes v0.1 packets and generates stable unique edge IDs", () => {
  const first = requirePacket(normalizePacket(legacyV01Packet));
  const second = requirePacket(normalizePacket(legacyV01Packet));

  assert.equal(first.schema, PACKET_SCHEMA_V02);
  assert.equal(first.packet_id, second.packet_id);
  assert.deepEqual(
    first.edges.map((edge) => edge.id),
    second.edges.map((edge) => edge.id),
  );
  assert.equal(new Set(first.edges.map((edge) => edge.id)).size, 2);
  assert.equal(first.evaluation.claimed_evaluation_match, false);
  assert.equal(first.claimed_evaluation.verdict, "QUARANTINE");
});

test("recomputes supplied evaluation claims instead of trusting them", () => {
  const packet = structuredClone(valid24Packet);
  packet.metrics = {
    evidence: 0,
    coherence: 0,
    contradiction: 1,
    continuity: 0,
    authority: 0,
    faithfulness: 0,
  };
  packet.verdict = "QUARANTINE";

  const normalized = requirePacket(normalizePacket(packet));
  assert.notEqual(normalized.evaluation.metrics.evidence, 0);
  assert.equal(normalized.evaluation.claimed_evaluation_match, false);
  assert.equal(normalized.claimed_evaluation.verdict, "QUARANTINE");
});

test("exports and reimports v0.2 without losing graph or evaluation", () => {
  const normalized = requirePacket(normalizePacket(valid24Packet));
  const exported = createProofPacket(
    normalized,
    "2026-07-19T13:00:00.000Z",
  );
  const replay = requirePacket(normalizePacket(exported));

  assert.equal(exported.schema, PACKET_SCHEMA_V02);
  assert.equal(exported.edges.length, normalized.edges.length);
  assert.deepEqual(
    replay.logons.map((logon) => logon.id),
    normalized.logons.map((logon) => logon.id),
  );
  assert.deepEqual(replay.edges, normalized.edges);
  assert.deepEqual(replay.evaluation.metrics, normalized.evaluation.metrics);
  assert.equal(replay.evaluation.verdict, normalized.evaluation.verdict);
  assert.equal(replay.evaluation.claimed_evaluation_match, true);
});

test("returns useful JSON and browser-size errors", () => {
  const invalid = parsePacketJson("{ definitely not json");
  const oversized = parsePacketJson("x".repeat(MAX_PACKET_BYTES + 1));

  assert.equal(invalid.ok, false);
  assert.match(invalid.errors[0], /not valid JSON/);
  assert.equal(oversized.ok, false);
  assert.match(oversized.errors[0], /5 MiB/);
});
