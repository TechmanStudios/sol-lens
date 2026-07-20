import assert from "node:assert/strict";
import test from "node:test";

import { packetExamples } from "../lib/example-packets.ts";
import {
  DEFAULT_MANIFOLD_REPLAY_CONFIG,
  createInitialReplayState,
  replayFluxEndpoints,
  replayStateDigest,
  runManifoldReplay,
  stepManifoldReplay,
} from "../lib/manifold-replay.ts";
import { normalizePacket } from "../lib/packet-schema.ts";
import { courtVerdict, scoreLogons } from "../lib/sol-engine.ts";
import { disconnectedPacket, makeTracePacket } from "./fixtures/packets.mjs";

const normalized = (packet) => {
  const result = normalizePacket(packet);
  assert.equal(result.ok, true, result.ok ? "" : result.errors.join("\n"));
  return result.packet;
};

const representativePacket = packetExamples[1].packet;

test("replay is deterministic and produces an identical stable digest", () => {
  const first = runManifoldReplay(representativePacket, 120);
  const second = runManifoldReplay(representativePacket, 120);
  assert.equal(replayStateDigest(first), replayStateDigest(second));
  assert.deepEqual(first.nodes, second.nodes);
  assert.deepEqual(first.edges, second.edges);
  assert.deepEqual(first.metrics, second.metrics);
});

test("replay never mutates the normalized packet", () => {
  const before = structuredClone(representativePacket);
  const initial = createInitialReplayState(representativePacket);
  stepManifoldReplay(representativePacket, initial);
  runManifoldReplay(representativePacket, 30);
  assert.deepEqual(representativePacket, before);
});

test("all replay state remains finite and bounded", () => {
  const state = runManifoldReplay(representativePacket, 300);
  for (const node of state.nodes) {
    assert.ok(Number.isFinite(node.rho));
    assert.ok(Number.isFinite(node.pressure));
    assert.ok(Number.isFinite(node.netFlux));
    assert.ok(node.rho >= 0);
    assert.ok(node.rho <= DEFAULT_MANIFOLD_REPLAY_CONFIG.maxRho);
  }
  for (const edge of state.edges) {
    assert.ok(Number.isFinite(edge.flux));
    assert.ok(Number.isFinite(edge.conductance));
    assert.ok(Math.abs(edge.flux) <= DEFAULT_MANIFOLD_REPLAY_CONFIG.maxFlux);
    assert.ok(edge.conductance >= 0 && edge.conductance <= 2);
  }
  for (const value of Object.values(state.metrics)) {
    assert.ok(Number.isFinite(value));
  }
});

test("non-finite packet numerics fall back to safe finite values", () => {
  const malformed = structuredClone(representativePacket);
  malformed.logons[0].rho = Number.NaN;
  malformed.logons[0].psi = Number.POSITIVE_INFINITY;
  malformed.logons[0].pressure = Number.NEGATIVE_INFINITY;
  malformed.edges[0].weight = Number.NaN;
  const state = runManifoldReplay(malformed, 12);
  assert.ok(
    state.nodes.every((node) =>
      [node.rho, node.pressure, node.psi, node.pressureSeed, node.netFlux]
        .every(Number.isFinite),
    ),
  );
  assert.ok(
    state.edges.every((edge) =>
      [edge.flux, edge.conductance].every(Number.isFinite),
    ),
  );
  assert.ok(Object.values(state.metrics).every(Number.isFinite));
});

test("damping does not increase mass after the initial pulse", () => {
  let state = createInitialReplayState(representativePacket);
  let previousMass = state.metrics.totalMass;
  for (let index = 0; index < 100; index += 1) {
    state = stepManifoldReplay(representativePacket, state);
    assert.ok(state.metrics.totalMass <= previousMass + 1e-8);
    previousMass = state.metrics.totalMass;
  }
});

test("equal pressure produces zero edge flux", () => {
  const fixture = makeTracePacket(2);
  fixture.logons = fixture.logons.map((node) => ({
    ...node,
    rho: 0.4,
    psi: 0.8,
    pressure: 0.2,
  }));
  const packet = normalized(fixture);
  const initial = createInitialReplayState(packet);
  const equalized = {
    ...initial,
    nodes: initial.nodes.map((node) => ({ ...node, rho: 0.4 })),
  };
  const stepped = stepManifoldReplay(packet, equalized, { damping: 0 });
  assert.ok(Math.abs(stepped.edges[0].flux) <= 1e-9);
});

test("destination status shapes conductance supported above inferred above contradiction", () => {
  const base = makeTracePacket(4);
  base.logons = base.logons.map((node, index) => ({
    ...node,
    status: index === 1 ? "supported" : index === 2 ? "inferred" : index === 3 ? "contradiction" : "supported",
    psi: 0.8,
  }));
  base.edges = [
    { id: "ES", from: "N0001", to: "N0002", status: "supported", weight: 1 },
    { id: "EI", from: "N0001", to: "N0003", status: "inferred", weight: 1 },
    { id: "EC", from: "N0001", to: "N0004", status: "contradiction", weight: 1 },
  ];
  const state = createInitialReplayState(normalized(base));
  const byId = new Map(state.edges.map((edge) => [edge.id, edge]));
  assert.ok(byId.get("ES").conductance > byId.get("EI").conductance);
  assert.ok(byId.get("EI").conductance > byId.get("EC").conductance);
});

test("packet and edge input ordering do not change replay output", () => {
  const shuffled = {
    ...representativePacket,
    logons: [...representativePacket.logons].reverse(),
    edges: [...representativePacket.edges].reverse(),
  };
  assert.equal(
    replayStateDigest(runManifoldReplay(representativePacket, 80)),
    replayStateDigest(runManifoldReplay(shuffled, 80)),
  );
});

test("replay is isolated from court metrics and verdict", () => {
  const metricsBefore = scoreLogons(representativePacket.logons);
  const verdictBefore = courtVerdict(metricsBefore);
  runManifoldReplay(representativePacket, 300);
  const metricsAfter = scoreLogons(representativePacket.logons);
  assert.deepEqual(metricsAfter, metricsBefore);
  assert.equal(courtVerdict(metricsAfter), verdictBefore);
});

test("edge movement conserves mass before damping", () => {
  const initial = createInitialReplayState(representativePacket, { damping: 0 });
  const stepped = stepManifoldReplay(representativePacket, initial, { damping: 0 });
  assert.ok(Math.abs(stepped.metrics.totalMass - initial.metrics.totalMass) <= 1e-8);
});

test("negative flux reverses rendered direction", () => {
  const base = makeTracePacket(2);
  base.logons = base.logons.map((node, index) => ({
    ...node,
    rho: index === 0 ? 0 : 1,
    pressure: index === 0 ? 0 : 1,
  }));
  const packet = normalized(base);
  const initial = createInitialReplayState(packet, {
    backgroundSeed: 1,
    entryPulse: 0,
  });
  const stepped = stepManifoldReplay(packet, initial, {
    backgroundSeed: 1,
    entryPulse: 0,
    damping: 0,
  });
  assert.ok(stepped.edges[0].flux < 0);
  assert.deepEqual(replayFluxEndpoints(stepped.edges[0]), {
    from: stepped.edges[0].to,
    to: stepped.edges[0].from,
  });
});

test("empty and invalid-edge packets return valid safe state", () => {
  const empty = {
    ...representativePacket,
    packet_id: "empty",
    logons: [],
    edges: [],
  };
  const emptyState = runManifoldReplay(empty, 4);
  assert.equal(emptyState.nodes.length, 0);
  assert.equal(emptyState.edges.length, 0);
  assert.deepEqual(emptyState.metrics, {
    totalMass: 0,
    entropy: 0,
    totalFlux: 0,
    maxFlux: 0,
    activeNodes: 0,
  });

  const invalidEdge = {
    ...representativePacket,
    edges: [
      ...representativePacket.edges,
      { id: "invalid", from: "missing", to: "also-missing", status: "supported" },
    ],
  };
  const safeState = createInitialReplayState(invalidEdge);
  assert.equal(safeState.edges.length, representativePacket.edges.length);
});

test("a no-edge packet only damps and reports zero flux", () => {
  const packet = normalized(disconnectedPacket);
  const initial = createInitialReplayState(packet);
  const stepped = stepManifoldReplay(packet, initial);
  assert.ok(stepped.metrics.totalMass < initial.metrics.totalMass);
  assert.equal(stepped.metrics.totalFlux, 0);
  assert.equal(stepped.metrics.maxFlux, 0);
});

test("the 300-Logon curated packet completes a finite smoke run", () => {
  const packet = packetExamples.at(-1).packet;
  const state = runManifoldReplay(packet, 20);
  assert.equal(state.nodes.length, 300);
  assert.equal(
    state.edges.length,
    packet.edges.filter(
      (edge) =>
        packet.logons.some((node) => node.id === edge.from) &&
        packet.logons.some((node) => node.id === edge.to),
    ).length,
  );
  assert.ok(Object.values(state.metrics).every(Number.isFinite));
});

test("run rejects invalid step counts", () => {
  assert.throws(() => runManifoldReplay(representativePacket, -1), RangeError);
  assert.throws(() => runManifoldReplay(representativePacket, 1.5), RangeError);
});
