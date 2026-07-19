import assert from "node:assert/strict";
import test from "node:test";

import {
  findStronglyConnectedComponents,
  fitTransform,
  layoutGraph,
  scaleModeForCount,
} from "../lib/graph-layout.ts";
import { buildOverviewGraph } from "../lib/graph-groups.ts";
import { normalizePacket } from "../lib/packet-schema.ts";
import { scoreLogons } from "../lib/sol-engine.ts";
import {
  disconnectedPacket,
  explorationPacket,
  feedbackPacket,
  oneLogonPacket,
  overview500Packet,
  overviewPacket,
} from "./fixtures/packets.mjs";

const requirePacket = (value) => {
  const result = normalizePacket(value);
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join(" "));
  return result.packet;
};

test("lays out one-node and disconnected packets with finite bounds", () => {
  for (const fixture of [oneLogonPacket, disconnectedPacket]) {
    const packet = requirePacket(fixture);
    const layout = layoutGraph(packet.logons, packet.edges);
    assert.equal(layout.nodes.length, packet.logons.length);
    assert.ok(layout.bounds.width > 0);
    assert.ok(layout.bounds.height > 0);
    for (const node of layout.nodes) {
      assert.ok(Number.isFinite(node.x));
      assert.ok(Number.isFinite(node.y));
    }
  }
});

test("produces byte-for-byte deterministic layout output", () => {
  const packet = requirePacket(explorationPacket);
  const first = layoutGraph(packet.logons, packet.edges);
  const second = layoutGraph(packet.logons, packet.edges);
  assert.deepEqual(first, second);
});

test("condenses feedback cycles instead of crashing or inventing depth", () => {
  const packet = requirePacket(feedbackPacket);
  const components = findStronglyConnectedComponents(
    packet.logons,
    packet.edges,
  );
  const layout = layoutGraph(packet.logons, packet.edges);

  assert.ok(components.some((component) => component.length > 1));
  assert.ok(layout.nodes.some((node) => node.cyclic));
  assert.equal(layout.nodes.length, packet.logons.length);
});

test("uses the specified detail, exploration, and overview thresholds", () => {
  assert.equal(scaleModeForCount(1), "detail");
  assert.equal(scaleModeForCount(40), "detail");
  assert.equal(scaleModeForCount(41), "exploration");
  assert.equal(scaleModeForCount(200), "exploration");
  assert.equal(scaleModeForCount(201), "overview");
});

test("creates stable, capped structural overview groups", () => {
  const packet = requirePacket(overviewPacket);
  const fullLayout = layoutGraph(packet.logons, packet.edges);
  const first = buildOverviewGraph(packet, fullLayout);
  const second = buildOverviewGraph(packet, fullLayout);
  const groupedIds = first.groups.flatMap((group) => group.logon_ids);

  assert.deepEqual(first, second);
  assert.ok(first.groups.length <= 36);
  assert.equal(groupedIds.length, packet.logons.length);
  assert.equal(new Set(groupedIds).size, packet.logons.length);
});

test("prefers supplied groups for a 500-Logon overview", () => {
  const packet = requirePacket(overview500Packet);
  const overview = buildOverviewGraph(packet);

  assert.equal(packet.logons.length, 500);
  assert.equal(overview.groups.length, 20);
  assert.ok(overview.groups.every((group) => group.source === "packet"));
  assert.ok(overview.groups.every((group) => group.logon_ids.length === 25));
  assert.ok(new Set(overview.groups.map((group) => group.y)).size > 1);
  assert.ok(overview.layout.bounds.width < 1_200);
  assert.ok(fitTransform(overview.layout.bounds).scale > 0.7);
});

test("keeps scoring independent from layout and display mode", () => {
  const packet = requirePacket(explorationPacket);
  const layout = layoutGraph(packet.logons, packet.edges);
  assert.deepEqual(scoreLogons(layout.nodes), packet.evaluation.metrics);

  const transform = fitTransform(layout.bounds);
  assert.ok(transform.scale >= 0.18);
  assert.ok(transform.scale <= 1.35);
  assert.ok(Number.isFinite(transform.x));
  assert.ok(Number.isFinite(transform.y));
});
