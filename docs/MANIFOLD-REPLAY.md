# Optional Manifold Replay Engine

The Manifold Replay tab is an experimental, deterministic visualization layer for SOL Lens. It projects dynamic density, pressure, mode-shaped conductance, edge flux, and damping across the observable Logon graph already loaded in the workbench.

The replay is telemetry. The Trace Court remains the judge. Replay state never enters court scoring, the `PROMOTE / HOLD / QUARANTINE` verdict, or proof-packet v0.2 export.

> Experimental deterministic graph replay using dynamic density, pressure, mode-shaped conductance, edge flux, and damping. It does not alter the promotion court and does not represent hidden model reasoning.

## Deterministic initialization

The engine sorts Logons and edges by stable ID, filters edges whose endpoints are absent, and sanitizes every numeric input before calculation. Non-finite node values fall back to zero. A non-finite edge weight falls back to the configured default. Internal values are rounded to `1e-9` precision after each step.

For Logon `i`, the replay keeps packet fields separate from dynamic fields:

```text
dynamic rho_i(0) = packet rho_i * backgroundSeed
psi_i            = clamp(packet psi_i, 0, 1)
pressureSeed_i   = clamp(packet pressure_i, 0, 1)
packetRho_i      = clamp(packet rho_i, 0, maxRho)
```

The entry Logon is selected from stable ID order:

1. the first supported Logon with no incoming valid edge;
2. otherwise the first supported Logon;
3. otherwise the first Logon.

The entry receives one initial pulse:

```text
dynamic rho_entry(0) += entryPulse
0 <= dynamic rho_i <= maxRho
```

An empty packet produces a valid zero state. A packet with no edges still runs; its density only damps.

## Replay equations

### Dynamic pressure

Packet pressure is retained as a small, fixed observable forcing term. It is never overwritten.

```text
densityPressure_i =
  log(1 + pressureGain * rho_i)
  / log(1 + pressureGain)

pressure_i = clamp(
  densityPressure_i + pressureSeedGain * pressureSeed_i,
  0,
  1.25
)
```

### Mode-shaped conductance

For a valid edge `e = from -> to`:

```text
meanPsi_e = clamp((psi_from + psi_to) / 2, 0, 1)
modeGate_e = 0.35 + 0.65 * meanPsi_e
```

The MVP uses destination status because that is the observable semantic state activity is entering:

```text
supported     1.00
inferred      0.72
contradiction 0.28
```

```text
conductance_e = clamp(
  (edge.weight ?? defaultEdgeWeight)
  * destinationStatusFactor
  * modeGate_e,
  0,
  2
)
```

Edge kinds remain available for display, but do not invent different physics. `psi` is fixed and there is no learned conductance or reaction-diffusion update.

### Flux and simultaneous density update

Every edge flux is calculated from the same prior node state:

```text
rawFlux_e = conductance_e * (pressure_from - pressure_to)
flux_e = clamp(rawFlux_e, -maxFlux, maxFlux)

delta_from -= dt * flux_e
delta_to   += dt * flux_e
```

Positive flux moves from the declared `from` endpoint to `to`. Negative flux moves in the reverse direction; the UI reverses its arrow. Node `netFlux` uses positive for net incoming activity and negative for net outgoing activity.

After every edge delta has been accumulated, all nodes update together:

```text
rhoNext_i = clamp(
  max(0, rho_i + delta_i) * exp(-damping * dt),
  0,
  maxRho
)
```

Edge transport conserves total density before damping, subject to numerical rounding and safety clamps.

## Metrics

Replay metrics are calculated after every step and are not court metrics.

```text
totalMass   = sum(rho_i)
totalFlux   = sum(abs(flux_e))
maxFlux     = max(abs(flux_e))
activeNodes = count(rho_i >= activeThreshold)
```

Normalized Shannon entropy uses `q_i = rho_i / totalMass`:

```text
entropy = -sum(q_i * log(q_i)) / log(numberOfNodes)
```

Entropy is zero for zero mass, no nodes, or one node, and is clamped to `[0, 1]`.

## Default Build Week profile

| Parameter | Default |
| --- | ---: |
| `dt` | `0.04` |
| `pressureGain` | `3` |
| `pressureSeedGain` | `0.22` |
| `damping` | `0.035` |
| `defaultEdgeWeight` | `0.7` |
| `maxFlux` | `0.35` |
| `backgroundSeed` | `0.12` |
| `entryPulse` | `0.85` |
| `activeThreshold` | `0.05` |
| `maxRho` | `1.5` |

These values match the Build Guide. No tuning changes were required.

## Fixed timestep playback

Rendering uses `requestAnimationFrame`, but physics always advances in exact `0.04`-second steps. An elapsed-time accumulator applies the selected `0.5x`, `1x`, or `2x` playback speed and caps work at eight physics substeps per rendered frame. Large elapsed gaps are clamped to 250 ms.

Playback stops at 300 steps or after maximum absolute flux stays below `0.0001` for 24 consecutive physics updates. “Settled” only describes that numerical threshold. Changing packets recreates the initial state. Leaving the tab unmounts the replay panel and cancels its animation frame.

## Layout versus manifold geometry

The replay reuses SOL Lens's deterministic, cycle-aware `layoutGraph` coordinates. Those coordinates optimize graph readability and stable inspection. They are not physical distances, a Riemannian metric, or a reconstruction of continuous manifold geometry.

The simplified profile borrows vocabulary and discrete pressure/flux structure from the broader SOL mathematical foundation. It does not claim to reproduce the historical SOL Engine runtime or universal equations of state.

## Court isolation and provenance

- Inputs come only from observable packet Logons and edges.
- Replay uses a separate dynamic state and never mutates the normalized packet.
- Replay functions do not import court scoring or proof export.
- Court metrics and verdict are displayed only as a quiet reference.
- Replay results are ephemeral and browser-local.
- Proof-packet v0.2 remains unchanged and excludes replay telemetry.
- The same packet, configuration, and step count produce the same sorted state digest.

## What this replay is not

It is not:

- hidden reasoning reconstruction;
- full continuous manifold integration;
- a replacement for the Trace Court;
- a second promotion verdict;
- a learned simulation;
- proof of semantic causality.

## Limitations and future extension points

This MVP keeps `psi` fixed, uses destination status as a conductance factor, treats graph layout as visual only, and provides no replay export or editable physics sliders. It does not model continuous geometry, learned topology, vorticity, CapLaw, reaction-diffusion modes, GPU acceleration, or comparison between replay runs.

Future versioned profiles could add independently tested edge-kind semantics, richer numerical diagnostics, a worker boundary for much larger validated packets, or optional replay comparisons. Any extension must preserve deterministic packet immutability and the hard separation from Trace Court evaluation.
