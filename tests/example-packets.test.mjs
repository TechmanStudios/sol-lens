import assert from "node:assert/strict";
import test from "node:test";

import { packetExamples } from "../lib/example-packets.ts";
import { createProofPacket, normalizePacket } from "../lib/packet-schema.ts";

test("ships five valid examples from small detail to grouped overview", () => {
  assert.deepEqual(
    packetExamples.map((example) => example.packet.logons.length),
    [6, 10, 48, 120, 300],
  );
  assert.equal(new Set(packetExamples.map((example) => example.id)).size, 5);
  assert.equal(packetExamples.at(-1).packet.groups.length, 12);
  assert.equal(packetExamples.at(-1).verdict, "PROMOTE");
});

test("examples cover linear, branching, feedback, conflict, and overview structures", () => {
  const [linear, branching, feedback, conflict, program] = packetExamples;

  assert.equal(linear.packet.edges.length, linear.packet.logons.length - 1);
  assert.ok(branching.packet.edges.length > branching.packet.logons.length);
  assert.ok(feedback.packet.edges.some((edge) => edge.kind === "feedback"));
  assert.equal(conflict.verdict, "QUARANTINE");
  assert.ok(
    conflict.packet.logons.filter((logon) => logon.status === "contradiction")
      .length > 24,
  );
  assert.equal(program.packet.logons.length > 200, true);
});

test("every example survives proof export and local replay", () => {
  for (const example of packetExamples) {
    const exported = createProofPacket(
      example.packet,
      "2026-07-19T17:00:00.000Z",
    );
    const replay = normalizePacket(exported);

    assert.equal(replay.ok, true, replay.ok ? "" : replay.errors.join(" "));
    assert.equal(replay.packet.packet_id, example.packet.packet_id);
    assert.equal(replay.packet.logons.length, example.packet.logons.length);
    assert.equal(replay.packet.evaluation.verdict, example.verdict);
    assert.equal(replay.packet.evaluation.claimed_evaluation_match, true);
  }
});
