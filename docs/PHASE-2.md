# SOL Lens Phase 2

Phase 2 turns the original ten-Logon demonstration into a packet-driven,
browser-local semantic trace workbench while preserving the original SOL
scoring profile and visual language.

## Packet contract

Accepted packets normalize to
`techman.sol-lens.proof-packet/v0.2`. The canonical graph contains semantic
Logons and typed edges; it does not contain screen coordinates.

The importer accepts the original v0.1 proof-packet shape when it can migrate
it safely. Missing v0.1 edge IDs are generated deterministically. Imported
metrics and verdicts are retained as claims, then compared with a fresh local
SOL Engine evaluation.

Browser prototype limits are deliberately explicit:

- 5 MiB JSON
- 5,000 Logons
- 20,000 edges

Invalid packets never replace the currently displayed graph.

## Deterministic layout and scale

`lib/graph-layout.ts` separates view coordinates from packet identity. It
finds strongly connected components, condenses feedback cycles, assigns
longest-path layers, performs fixed barycentric ordering passes, and places
nodes without a moving force simulation.

The display mode is selected from the normalized Logon count:

- detail: 1–40
- exploration: 41–200
- overview: more than 200

Overview mode prefers supplied groups, `group_id`, and `phase_id`. When
metadata is absent, SOL Lens creates stable structural groups from layout depth
ranges. It never derives semantic group names from Logon text. The overview is
capped at 36 visible supernodes; opening one shows its focused subgraph while
the metric cards continue to represent the complete trace.

## Interaction

Users can:

- choose a local JSON file
- drop JSON onto the graph
- paste JSON into the built-in drawer
- reload the canonical ten-Logon demo
- filter supported, inferred, and contradictory units
- select Logons by mouse, touch, Enter, or Space
- zoom around the pointer, pan the background, fit, or reset
- open overview groups and press Escape to return
- export a complete v0.2 packet and import it again

Every state continues to say that SOL Lens evaluates observable traces only.
Uploaded packets are never described as live model captures.

## Deterministic fixtures

Browser and test fixtures are generated from
`scripts/generate-phase2-fixtures.mjs`:

- `public/fixtures/valid-24.json`
- `public/fixtures/exploration-120.json`
- `public/fixtures/overview-500.json`
- `public/fixtures/invalid-duplicate-id.json`
- `public/fixtures/legacy-v0.1.json`

## Validation

Run with Node.js 22.13 or newer:

```bash
npm run lint
npm test
npm run build
```

The unit suite covers schema failures, v0.1 normalization, stable edge IDs,
feedback cycles, deterministic layout, scale thresholds, structural grouping,
claimed evaluation comparison, scoring independence from layout, and
export/import round trips.

## Deliberate boundaries

Phase 2 remains credential-free and browser-local. It does not add an OpenAI
API call, authentication, persistence, collaborative accounts, a database, or
hidden-reasoning claims. Those are separate product decisions and are not
required to load, inspect, replay, and export a complete observable SOL packet.
