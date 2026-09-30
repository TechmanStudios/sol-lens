# SOL Workflow Court implementation backlog

This backlog implements the proposal in [ACTIVATOR-LABS-WORKFLOW-COURT.md](./ACTIVATOR-LABS-WORKFLOW-COURT.md) as a narrow extension of SOL Lens. It deliberately preserves the existing packet validator, Trace Court, proof-packet export, and Manifold Replay boundary.

## Release 0: Contract and fixtures

**Goal:** Prove the complete workflow with deterministic, browser-local fixtures before adding any live adapter.

### P0 — Workflow contract

- [ ] Define `SolWorkflowContractV01` with stable identifiers and a contract version.
- [ ] Capture outcome, trigger, completion condition, approved scope, exclusions, inputs, sources, tools, permissions, output requirements, owner, reviewers, and review date.
- [ ] Model human checkpoints and decision authority explicitly.
- [ ] Model `stop`, `ask`, `escalate`, and fallback conditions as testable rules.
- [ ] Validate contracts strictly and return plain-language field errors.
- [ ] Add normalization only when migration semantics are unambiguous.

### P0 — Workflow Blueprint UI

- [ ] Add a guided form with plain-language prompts from the Activator Labs design stage.
- [ ] Provide one completed teaching workflow and three one-click structural variants.
- [ ] Allow local import/export of the contract.
- [ ] Show approved scope, human authority, and stop conditions in a persistent summary.
- [ ] Require human confirmation of the frozen contract before a case run begins.

### P0 — Representative Case Lab

- [ ] Define `SolWorkflowCaseV01` with case type, condition, required behavior, prohibited behavior, escalation condition, expected evidence, reviewer, and result.
- [ ] Require routine, missing/ambiguous, sensitive/high-consequence, and outside-scope cases.
- [ ] Add optional meaningful-variation, unapproved-tool, conflicting-source, and replay-integrity cases.
- [ ] Freeze expected behavior before importing or revealing candidate results.
- [ ] Ship deterministic teaching fixtures using the production validation and evaluation paths.

### P0 — Boundary event vocabulary

- [ ] Extend the observable packet contract with typed boundary events or an equivalent backward-compatible representation:
  - `ask`
  - `escalate`
  - `human_approval`
  - `fallback`
  - `prohibited_action`
- [ ] Keep boundary events observable; never infer them from hidden reasoning.
- [ ] Preserve lossless export and re-import.
- [ ] Document how a correct refusal, question, or escalation can satisfy a test.

### P0 — Case evaluation

- [ ] Evaluate every case independently before producing an aggregate recommendation.
- [ ] Compare observed events with required and prohibited behavior.
- [ ] Detect missing approvals, missing sources, unapproved tools, unsupported claims, unresolved conflict, and nondeterministic replay.
- [ ] Version the workflow-specific profile and display its thresholds.
- [ ] Prevent claimed packet results from overriding recomputed results.
- [ ] Keep Manifold Replay state unable to change a case or aggregate verdict.

## Release 1: Human decision and proof packet

**Goal:** Make the court usable by someone other than its creator.

### P0 — Activation Proof Packet

- [ ] Define `SolActivationProofPacketV01` containing:
  - workflow contract and contract digest;
  - case definitions and frozen expected behavior;
  - baseline and candidate packet references or embedded approved traces;
  - evaluator profile and version;
  - per-case metrics, exceptions, and verdicts;
  - aggregate recommendation;
  - human reviewer decision and rationale;
  - evidence records, limitations, and next review date.
- [ ] Export and re-import without semantic loss.
- [ ] Produce a stable digest for deterministic replay.
- [ ] Visibly distinguish synthetic fixtures from approved observed runs.

### P0 — Human review gate

- [ ] Require a named decision owner.
- [ ] Present exceptions before the aggregate recommendation.
- [ ] Allow the owner to record Stop, Revise, or Expand with rationale.
- [ ] Require a bounded expansion scope and review date for Expand.
- [ ] Record overrides without rewriting the deterministic court result.

### P1 — Court workspace

- [ ] Add a case matrix showing expected behavior, observed behavior, result, and reviewer.
- [ ] Link every metric and exception to the supporting Logons.
- [ ] Provide filters for boundary events, contradictions, missing evidence, and overrides.
- [ ] Add a compact current-process versus candidate-process comparison.
- [ ] Make the complete flow keyboard accessible and responsive.

## Release 2: Evidence and operational learning

**Goal:** Support the Activator Labs Operationalize stage without overstating early results.

### P1 — Evidence ledger

- [ ] Define evidence categories: adoption, efficiency, quality, safe operation, and team outcome.
- [ ] Define evidence status: measured, observed, reported, estimated, planned, and unknown.
- [ ] Record signal, baseline/comparison, population, period, source/method, limitations, and alternative explanations.
- [ ] Keep evidence claims append-only or explicitly revision-tracked.
- [ ] Generate a review summary that separates supported claims from hypotheses.

### P1 — Pilot dashboard

- [ ] Show repeat use, review cycle time, pass/correction rate, boundary-control performance, and overrides.
- [ ] Avoid annualized or projected claims unless visibly labeled with assumptions.
- [ ] Trigger the scheduled Stop/Revise/Expand review after ten courts or two weeks for the first pilot.
- [ ] Export a concise Activation Challenge narrative from recorded evidence.

### P2 — Observable run adapters

- [ ] Specify a provider-neutral event adapter interface.
- [ ] Prototype an OpenAI Responses or Codex adapter using only observable requests, responses, tool events, citations, errors, and approvals.
- [ ] Preserve returned model identifiers and stable source references.
- [ ] Redact or reject disallowed sensitive data before packet creation.
- [ ] Keep adapter output non-authoritative until validated by the existing packet and court paths.

## Suggested code shape

```text
app/
  workflow-court/
    page.tsx
  components/
    workflow-blueprint.tsx
    workflow-case-lab.tsx
    workflow-court-review.tsx
    evidence-ledger.tsx
lib/
  workflow-contract.ts
  workflow-cases.ts
  workflow-court.ts
  activation-proof-packet.ts
  evidence-ledger.ts
tests/
  workflow-contract.test.mjs
  workflow-cases.test.mjs
  workflow-court.test.mjs
  activation-proof-packet.test.mjs
  evidence-ledger.test.mjs
```

The final file placement should follow the current application architecture discovered during implementation; this tree expresses ownership boundaries rather than prescribing component internals.

## Definition of done for the first useful version

- [ ] A new user can complete the teaching workflow without writing JSON.
- [ ] The four required case classes are present and their expected behavior is frozen before results are shown.
- [ ] Correct asking, escalation, refusal, fallback, and approval behavior are evaluated explicitly.
- [ ] Prohibited actions and missing approvals cannot receive a promotion recommendation.
- [ ] The same contract, packets, cases, and evaluator version reproduce the same digest and verdicts.
- [ ] An Activation Proof Packet survives export and re-import without losing the contract, graph, cases, results, or human decision.
- [ ] A second person can repeat the workflow using only the product guidance.
- [ ] Synthetic fixtures are clearly labeled and no hidden-reasoning claim appears in product copy or exports.
- [ ] Existing SOL Lens packet, scoring, example, graph, export, and replay tests continue to pass.

## Explicit non-goals for the first useful version

- Automatic production deployment or rollback
- Autonomous external side effects
- Enterprise identity, permissions, or policy administration
- A universal risk score for every workflow
- Automatic inference of workflow requirements from traces
- Inspection or reconstruction of private chain-of-thought
- Replacement of accountable human approval

## Implementation sequence

1. Contract schema and tests
2. Four deterministic case fixtures
3. Boundary event representation and tests
4. Case evaluator and verdict mapping
5. Workflow Blueprint and Case Lab UI
6. Activation Proof Packet round trip
7. Human decision gate
8. Evidence ledger and pilot measures
9. Observable run adapter only after the local path is stable

