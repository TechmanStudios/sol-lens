# SOL Lens Phase 2 Build Brief

## Packet-Driven, Scalable Semantic Trace Graph

**Prepared for Codex · July 19, 2026**

Use this document as the authoritative implementation brief. Work autonomously through the build and verification steps, pausing only when a material product decision or missing credential truly blocks progress.

---

## 1. Mission

Upgrade **SOL Lens** from its current fixed ten-Logon demonstration into a packet-driven semantic trace workbench.

The graph must derive its visible atomic units and relationships from the loaded SOL packet rather than from a hard-coded fixture. It must remain legible across small, medium, and large traces while preserving the existing **Cosmic Semantic Lab × Solar Atlas** design language.

The intended user experience is:

1. Open SOL Lens.
2. Choose a built-in teaching packet, load a valid SOL trace or proof packet,
   or use the existing demo.
3. See the atomic-unit count update from the packet.
4. Explore its Logons and typed relationships.
5. Inspect evidence, pressure, governance, coherence, and contradictions.
6. Recompute the SOL verdict locally from observable data.
7. Export a complete proof packet that can be imported again without losing the graph.

This is a developer-tooling and model-migration workbench. It must not claim access to private chain-of-thought or hidden model reasoning.

---

## 2. Existing Product State

Canonical live application:

<https://sol-lens.onrender.com/>

The original ChatGPT Site URL is retained only as a historical Phase 1
checkpoint in `docs/PROVENANCE.md`.

Current stack:

- React 19
- Next.js 16 application structure
- Vinext/Vite deployment target
- OpenAI Sites project with `.openai/hosting.json`
- TypeScript
- Custom SVG graph and custom CSS; no graph visualization framework

Important existing files:

- `app/sol-lens-dashboard.tsx` — dashboard, graph, filters, inspector, and export interaction
- `app/globals.css` — complete visual system and responsive layout
- `lib/sol-engine.ts` — Logon types, ten-node fixture, scoring, court verdict, and proof-packet export
- `tests/sol-engine.test.mjs` — deterministic scoring and proof-contract tests
- `tests/rendered-html.test.mjs` — rendered application smoke test
- `docs/PROVENANCE.md` — pre-existing SOL foundation versus new Build Week work
- `docs/SUBMISSION-CHECKLIST.md` — hackathon packaging checklist

Current limitations to replace:

- The UI is coupled to `demoLogons` and `demoEdges`.
- The header always says `10 atomic units`.
- Logon `x` and `y` coordinates are hand-authored fixture data.
- There is no packet upload, paste, validation, or import error state.
- The v0.1 proof packet exports Logons but not typed edges, so it cannot fully reconstruct the graph.
- There is no pan, zoom, fit-to-view, clustering, or large-trace level of detail.

The existing ten-Logon demo, scoring behavior, visual hierarchy, and public deployment must remain available throughout the migration.

---

## 3. Non-Negotiable Product Principles

### Observable trace only

Treat each Logon as an auditable atomic unit derived from observable inputs, outputs, tool events, evidence references, policy checks, or other user-supplied trace data. Never label the graph as chain-of-thought, hidden reasoning, internal thoughts, or a direct view into model cognition.

### Deterministic evaluation

Uploaded metrics and verdicts are claims to verify, not values to trust. Normalize the packet, recompute SOL metrics from the Logons, and compare any supplied evaluation with the locally recomputed result.

### Packet identity is separate from layout

Canonical packets describe semantic data and typed relationships. Screen coordinates are a view concern and should not be required in an uploaded packet.

### Preserve provenance

Keep the distinction between the pre-existing SOL Engine mathematics and the new SOL Lens application. Do not rewrite foundational SOL formulas merely to simplify the interface.

### Graceful scale

A large trace must become progressively summarized, not progressively unreadable. Never attempt to render thousands of fully labeled SVG nodes at once.

### Backward compatibility

Keep the current demo and import the existing v0.1 proof-packet shape when possible. Normalize all accepted inputs into one internal representation.

---

## 4. Canonical Packet Contract

Introduce a versioned packet model. Exact naming may be adjusted to fit existing conventions, but preserve the semantics below.

```ts
export type LogonStatus = "supported" | "inferred" | "contradiction";

export type TraceLogon = {
  id: string;
  label: string;
  status: LogonStatus;
  evidence: number;       // normalized 0..1
  rho: number;            // evidence density / continuity field, 0..1
  psi: number;            // governance alignment, 0..1
  pressure: number;       // unresolved semantic pressure, 0..1
  detail: string;
  source: string;
  phase_id?: string;
  group_id?: string;
  timestamp?: string;
  evidence_refs?: string[];
};

export type TraceEdge = {
  id: string;
  from: string;
  to: string;
  status: LogonStatus;
  kind?: "dependency" | "evidence" | "constraint" | "flow" | "feedback";
  weight?: number;
  active?: boolean;
};

export type TraceGroup = {
  id: string;
  label: string;
  logon_ids: string[];
  phase?: string;
};

export type SolLensPacketV02 = {
  schema: "techman.sol-lens.proof-packet/v0.2";
  packet_id: string;
  generated_at: string;
  observable_trace_only: true;
  fixture?: string;
  models?: {
    baseline?: string;
    candidate?: string;
  };
  baseline_evaluation?: {
    label: string;
    logon_count: number;
    metrics: SolMetrics;
    verdict: "PROMOTE" | "HOLD" | "QUARANTINE";
    source?: string;
  };
  logons: TraceLogon[];
  edges: TraceEdge[];
  groups?: TraceGroup[];
  metrics?: SolMetrics;
  verdict?: "PROMOTE" | "HOLD" | "QUARANTINE";
};
```

Implementation rules:

- Do not require `x` or `y` in the canonical packet.
- Generate missing edge IDs deterministically during v0.1 normalization.
- Treat `groups`, model metadata, timestamps, and evidence references as optional.
- Recompute metrics and verdict after import.
- Preserve supplied metrics and verdict only as `claimed_evaluation` for comparison.
- Export v0.2 with Logons, edges, normalized metadata, recomputed evaluation, and scoring-profile version.
- Make an exported packet importable again with no loss of nodes or relationships.

Recommended exported additions:

```ts
evaluation: {
  engine: "SOL Engine";
  scoring_profile: "sol-lens-build-week/v0.1";
  metrics: SolMetrics;
  verdict: "PROMOTE" | "HOLD" | "QUARANTINE";
  claimed_evaluation_match?: boolean;
}
```

---

## 5. Packet Ingestion

Add an **Open packet** control near `Run comparison` and `Load demo`.

Support:

- local `.json` file selection
- drag and drop onto the graph panel
- optional JSON paste drawer if it can be added without compromising the first build slice
- existing demo fixture as a one-click fallback

Validation must check:

- recognized schema or safely migratable v0.1 shape
- nonempty, unique Logon IDs
- valid status values
- finite numeric measures between 0 and 1
- edges whose `from` and `to` IDs exist
- unique edge IDs after normalization
- valid group references
- reasonable file and trace-size limits

Suggested limits for the browser prototype:

- maximum JSON file size: 5 MiB
- maximum accepted Logons: 5,000
- maximum accepted edges: 20,000

On invalid input:

- keep the currently displayed graph unchanged
- show a concise, accessible error panel
- identify the first few actionable validation failures
- never silently discard invalid Logons or edges

On successful input:

- update the graph, count, inspector, metadata, and verdict atomically
- select the first supported entry Logon, or the first Logon if no entry can be identified
- show `Uploaded packet · <filename>` instead of `Demo fixture`
- make it visually clear whether the evaluation was recomputed and whether it matches a supplied verdict

---

## 6. Deterministic Graph Layout

Move layout concerns into a dedicated module such as `lib/graph-layout.ts`.

The same normalized packet must produce the same coordinates every time. Do not use a continuously moving force simulation.

Recommended dependency-free layout approach:

1. Build adjacency and reverse-adjacency maps.
2. Find strongly connected components so feedback loops are preserved rather than treated as errors.
3. Condense components into a directed acyclic graph.
4. Assign layers by longest-path depth from entry components.
5. Apply a small, fixed number of barycentric ordering passes to reduce crossings.
6. Place ordinary nodes in horizontal layers with deterministic spacing.
7. Place nodes inside a multi-node cyclic component in a compact ring or local column.
8. Compute graph bounds and an initial fit-to-view transform.

If a small, established layout dependency is clearly safer than implementing the above, document the tradeoff before adding it. Do not replace the custom graph with a visually generic graph framework.

Layout output should be a separate view model:

```ts
type PositionedLogon = TraceLogon & {
  x: number;
  y: number;
  layer: number;
  cyclic?: boolean;
};
```

Do not mutate the normalized packet to attach coordinates.

---

## 7. Scale Modes

Choose the mode automatically from the normalized Logon count.

### Detail mode: 1–40 Logons

- render every node, edge, label, and Logon ID
- preserve the current visual density and inspector behavior
- filters dim unrelated states without destroying graph context

### Exploration mode: 41–200 Logons

- render every node and edge
- hide secondary labels until hover, focus, selection, or sufficient zoom
- support pan, zoom, reset, and fit-to-view
- emphasize the selected node and its immediate predecessors/successors
- keep the inspector visible

### Overview mode: more than 200 Logons

- render group or phase supernodes instead of every fully labeled Logon
- prefer packet-provided `group_id`, `phase_id`, or `groups`
- if grouping metadata is absent, create deterministic structural groups from connected component and depth ranges; do not invent semantic labels from node text
- show counts and aggregate status on each supernode
- allow a user to open one group as a focused subgraph
- cap the overview to a practical number of visible supernodes
- retain full-trace SOL evaluation even while the graph is summarized

The toolbar must always show the actual total, for example:

```text
Observable trace · 487 atomic units · 18 groups visible
```

---

## 8. Navigation and Interaction

Add restrained controls that match the existing panel styling:

- `−` zoom out
- current zoom percentage
- `+` zoom in
- `Fit graph`
- `Reset view`
- overview/detail breadcrumb when inspecting a group

Interaction requirements:

- mouse wheel or trackpad zoom centered on the pointer
- drag background to pan
- clicking a Logon opens the inspector
- Enter or Space selects a focused Logon
- Escape exits a focused group or returns to overview
- visible focus states
- minimum touch target of approximately 40 CSS pixels for controls
- mobile tap behavior without requiring hover

Keep all pan and zoom transforms in the graph viewport layer. Metric calculations must not rerun merely because the user pans or zooms.

---

## 9. UI Copy and State Changes

Replace hard-coded count copy with packet-derived copy.

Examples:

```text
Observable trace · 10 atomic units
Observable trace · 83 atomic units
Observable trace · 731 atomic units · 24 groups visible
```

Keep these states visually distinct:

- `Demo fixture`
- `Uploaded packet`
- `Live capture` reserved for a future credentialed GPT-5.6 integration

Do not label an uploaded fixture as a live GPT-5.6 run.

Preserve:

- the main headline and editorial typography
- cyan supported paths
- solar-amber inferred paths
- coral contradiction paths
- restrained navy panels and hairline borders
- model comparison cards
- SOL metric cards and promotion court
- the note `Observable traces only · no hidden reasoning claims`

The graph should feel more capable, not more crowded.

---

## 10. Suggested Code Organization

Refactor deliberately rather than accumulating more logic in the dashboard component.

Suggested modules:

```text
lib/
  sol-engine.ts            scoring and court behavior
  packet-schema.ts         packet types, validation, and normalization
  graph-layout.ts          deterministic layout and bounds
  graph-groups.ts          overview-mode structural grouping
  demo-packet.ts           existing demo represented as canonical v0.2

app/
  sol-lens-dashboard.tsx   composition and top-level state
  components/
    packet-loader.tsx
    semantic-graph.tsx
    graph-controls.tsx
    logon-inspector.tsx
    evaluation-cards.tsx
```

This is guidance, not a requirement to create unnecessary abstraction. Keep related code together when a separate component would only add indirection.

---

## 11. Tests and Fixtures

Add deterministic fixtures for:

- one Logon
- the existing ten-Logon demo
- a disconnected graph
- a graph containing a feedback cycle
- a 50-Logon exploration trace
- a 250-Logon overview trace
- invalid duplicate IDs
- an edge with a missing target
- out-of-range measures
- a v0.1 packet that requires normalization

Unit-test:

- packet validation and useful errors
- v0.1 to v0.2 normalization
- unique deterministic edge IDs
- deterministic layout output
- cycle handling
- scale-mode thresholds
- structural grouping stability
- scoring remains independent of coordinates and display mode
- claimed versus recomputed verdict comparison
- export/import round trip

Interaction verification:

- upload a valid packet and confirm the dynamic count
- upload an invalid packet and confirm the existing graph remains intact
- filter statuses
- select Logons by mouse and keyboard
- pan, zoom, fit, and reset
- enter and exit an overview group
- reload the demo fixture
- download and re-import the proof packet

Required final commands:

```bash
npm run lint
npm test
npm run build
```

Inspect the local preview at desktop and narrow widths. Confirm there are no application console errors. Browser-extension errors are not application failures.

---

## 12. Acceptance Criteria

The phase is complete only when all of the following are true:

- [ ] No visible count is hard-coded to ten.
- [ ] The demo is represented by the same canonical packet shape as uploaded traces.
- [ ] A valid packet with 24 Logons displays `24 atomic units` and all relationships.
- [ ] A 120-Logon packet enters exploration mode with usable pan and zoom.
- [ ] A 500-Logon packet enters overview mode without rendering 500 full labels.
- [ ] Feedback cycles render deterministically and do not crash layout.
- [ ] Invalid packets do not replace the current graph.
- [ ] Supplied metrics are recomputed and compared rather than blindly trusted.
- [ ] The v0.2 export includes typed edges.
- [ ] Export followed by import preserves node IDs, edges, evaluation, and verdict.
- [ ] The existing ten-node demo still looks at least as polished as the live reference.
- [ ] Keyboard selection and graph controls are accessible.
- [ ] Lint, tests, and the production build pass.
- [ ] Documentation and provenance reflect the new packet-driven capability.

---

## 13. Work Sequence for Codex

1. Inspect repository instructions, `.openai/hosting.json`, Git status, and the existing dashboard before editing.
2. Preserve unrelated user changes and do not create a second Sites project.
3. Convert the current demo into the canonical packet shape while keeping behavior visually identical.
4. Implement schema validation and v0.1 normalization with tests.
5. Implement deterministic layout with small fixtures and cycle tests.
6. Refactor the graph to consume the normalized packet and show a dynamic count.
7. Add upload, drag-and-drop, error handling, and provenance state.
8. Add pan, zoom, fit, and reset.
9. Implement exploration and overview modes.
10. Complete round-trip export, large fixtures, accessibility checks, and documentation.
11. Run lint, tests, production build, and browser QA.
12. If this is the Sites checkout, checkpoint only after a coherent visible slice and reuse the existing project ID.

Report back with:

- what was implemented
- meaningful design or schema decisions
- test and build results
- any intentionally deferred behavior
- the verified preview or deployment URL when applicable

---

## 14. Explicit Non-Goals for This Phase

Do not expand this task into:

- a live OpenAI API integration without a securely configured credential
- inferred or reconstructed chain-of-thought
- changes to the foundational SOL mathematics without separate justification
- collaborative accounts, authentication, or packet persistence
- database storage
- editing or deleting the existing public site before a replacement checkpoint succeeds
- a wholesale visual redesign

The goal is one strong extension: **any valid SOL packet should be able to drive a legible, auditable, scalable semantic trace graph.**
