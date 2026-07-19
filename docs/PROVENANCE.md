# SOL Lens provenance and research lineage

This document makes the Build Week extension boundary explicit and gives reviewers a direct trail to the mathematics, experiments, tests, and artifacts behind the SOL Engine.

## Pre-existing SOL Engine foundation

Before OpenAI Build Week, the project already contained the **SOL Engine** concept, mathematical work, experimental code, research data, and test infrastructure. That prior work includes:

- a semantic manifold represented continuously and as a graph
- node state such as density/mass (`rho`), pressure (`p`), and belief or mode fields (`psi`)
- edge flux (`j`), conservation, diffusion, damping, feedback, and routing
- attractor/basin memory, metastability, temporal readout, semantic control, and experimental governance
- the idea of atomic semantic units called Logons

No claim is made that this foundation was created during the hackathon window.

## Primary foundation sources

| Evidence | What it contains |
| --- | --- |
| [SOL Engine repository](https://github.com/TechmanStudios/sol) | Public source, history, tools, experiments, tests, data, and proof packets |
| [Conceptual specification](https://github.com/TechmanStudios/sol/blob/main/README_SOL.md) | Semantic graph domain model, runtime, memory, tools, current status, and known gaps |
| [Mathematical foundation v2](https://github.com/TechmanStudios/sol/blob/main/solMath_v2.tex) | Riemannian semantic state; continuity, momentum, and reaction-diffusion equations; graph incidence matrix, Laplacian, and edge-flux discretization |
| [Master research chronicle](https://github.com/TechmanStudios/sol/blob/main/SOL_Master_Chronicle.md) | Phase-by-phase protocols, measurements, interpretations, uncertainties, locked findings, and falsification work |
| [Engine tests](https://github.com/TechmanStudios/sol/tree/main/tests) | Manifold/telemetry, research ledger, memory, orchestration, adaptive simulation, trust, and regression coverage |
| [Experiment ledger](https://github.com/TechmanStudios/sol/blob/main/tools/analysis/experiment_ledger.py) | Run-bundle ingestion and derived research indexing |
| [Proof-packet ledger](https://github.com/TechmanStudios/sol/blob/main/solKnowledge/proof_packets/LEDGER.md) | Consolidated, auditable findings |

Representative experiment reports include the [adaptive handshake](https://github.com/TechmanStudios/sol/blob/main/data/adaptive_handshake/report.md), [emergent cognition](https://github.com/TechmanStudios/sol/blob/main/data/emergent_cognition/report.md), [phonon speed limit](https://github.com/TechmanStudios/sol/blob/main/data/phonon_speed_limit/report.md), and [phonon multiplexing](https://github.com/TechmanStudios/sol/blob/main/data/phonon_multiplexing/report.md) investigations.

## What SOL Lens reuses—and what it does not

SOL Lens reuses the SOL vocabulary and the high-level idea that semantic structure can be represented as measurable node state plus typed graph relationships. It carries `rho`, `psi`, pressure, status, evidence, and edge type in a portable observable packet.

The Lens browser evaluator is intentionally narrower than the research engine. Its `sol-lens-build-week/v0.1` profile computes deterministic aggregate scores and a promotion gate from the packet fields. It does not solve the full manifold equations, reproduce the original experimental runtime, or turn an analogy into a validated physical claim. The original mathematics, simulations, experiment reports, and tests remain in the original SOL repository linked above.

## New Build Week work

Development of **SOL Lens** began July 18, 2026 as a new application of that foundation to GPT-5.6 agent migration. The following work is new:

- Developer Tools product concept: a semantic trace and migration workbench
- GPT-5.5 baseline versus GPT-5.6 candidate workflow
- observable-trace-only product contract
- typed Logon graph and deterministic promotion court
- JSON proof-packet v0.1/v0.2 normalization and export
- interactive filtering, selection, pan, zoom, grouping, and scale modes
- five beginner-friendly example packets spanning linear, branching, feedback, conflict, and grouped-overview structures
- responsive Vinext/React application and visual system
- SOL Lens-specific documentation, tests, and deployments

## Checkpoints

### First visual checkpoint

- Date: July 18, 2026
- Commit: `89f16a46511bc04b1634be7a350edacc3b87ff34`
- Scope: first working semantic migration dashboard
- Historical deployment: <https://sol-lens.techman-stud-2096.chatgpt.site>

### Packet-driven extension

- Date: July 19, 2026
- Commit: `c390ef9` (implementation checkpoint before the example-gallery extension)
- Scope: canonical v0.2 packet ingestion, v0.1 migration, strict validation, deterministic cycle-aware layout, scalable graph modes, pan and zoom, overview grouping, local evaluation comparison, and lossless graph export

### Canonical live application

- Deployment: <https://sol-lens.onrender.com/>
- Status: Render is the canonical public URL; the earlier ChatGPT Site remains historical provenance only

## Verification boundary

SOL Lens has a separate deterministic test suite for its packet contract and product behavior: validation failures, v0.1 normalization, edge identity, cycle-aware layout, scale thresholds, structural grouping, scoring, claimed-evaluation comparison, example packet replay, rendered application copy, and export/import round trips.

The original SOL repository has its own `pytest` infrastructure and experimental protocol. Its chronicle explicitly separates operator-visible observations, measured telemetry, and interpretation; preserves baseline-restore and UI-neutral harness rules; and distinguishes stronger findings from active hypotheses. Reviewers can inspect that evidence directly through the source links above.

## Development assistance

The new SOL Lens application was designed and implemented collaboratively with OpenAI Codex and the GPT-5.6 family. The application code, visual system, scoring fixture, testing, and documentation were produced during the Build Week extension window.

## Evidence policy

SOL Lens evaluates observable inputs and outputs only. It does not claim access to private chain-of-thought or hidden model reasoning. A production integration should retain raw observable events or stable references to them, version its scoring profile, validate thresholds against representative evals, and preserve the model identifier returned by the API.
