# SOL Lens Build Week video compliance audit

Audit date: **July 20, 2026**  
Audited video: `C:\sol\deliverables\sol-lens-avatar-demo\SOL-Lens-Manifold-Replay-Demo.mp4`  
Official sources re-opened during this audit: [Official Rules](https://openai.devpost.com/rules), [FAQ](https://openai.devpost.com/details/faqs), and [Hackathon page](https://openai.devpost.com/).

## Executive verdict

**Not submission ready.** The current cut is safely below three minutes, has English synthetic narration and captions, accurately describes the deterministic SOL Lens features, and distinguishes earlier SOL research from the Build Week application. However, the video does not yet satisfy the strongest reading of three mandatory requirements: it uses animated still captures instead of a visibly interactive working-product journey; it only names Codex without explaining a concrete workflow, retained decision, or iteration; and it only names GPT-5.6 without explaining its actual role. The repository confirms that GPT-5.6 is not a runtime evaluator in the submitted browser build and that a credentialed Responses API validation remains pending.

## Phase 1 asset inventory

| Asset | Path | Purpose | Current status | Duration or word count |
|---|---|---|---|---:|
| Canonical narration | `docs/DEMO-NARRATION.md` | Timed screen-action and voice script | Modified locally; not committed | 396 spoken words |
| Current rendered video | `C:\sol\deliverables\sol-lens-avatar-demo\SOL-Lens-Manifold-Replay-Demo.mp4` | Intended Devpost demo | Valid H.264/AAC/English-caption MP4 | 2:52.68 |
| Caption sidecar | `C:\sol\deliverables\sol-lens-avatar-demo\SOL-Lens-Manifold-Replay-Demo.en.srt` | English accessibility captions | 25 cues; matches timeline text | 396 words |
| Timeline | `C:\sol\deliverables\sol-lens-avatar-demo\production\timeline.json` | Scene, capture, and narration mapping | Nine still-image scenes | 172.625-second estimate |
| Narration generator | `C:\sol\deliverables\sol-lens-avatar-demo\generate-narration.ps1` | Generates segmented WAV narration | Uses Microsoft David Desktop | Nine WAVs |
| Video compositor | `C:\sol\deliverables\sol-lens-avatar-demo\render-video.py` | Zooms stills, overlays avatar/title, joins audio/video, emits captions | Reproducible; no live screen recording | Nine segments |
| Avatar source | `C:\sol\deliverables\sol-lens-avatar-demo\production\avatar.png` | Digital presenter | User-supplied transparent PNG; rights not documented | 97x177 source |
| Live UI captures | `C:\sol\deliverables\sol-lens-avatar-demo\production\captures\` | Real Render deployment states | Nine screenshots, not motion capture | 1920x1080 |
| Validation frames | `C:\sol\deliverables\sol-lens-avatar-demo\production\validation\` | Visual spot checks | Five frames reviewed | 1920x1080 |
| Render manifest | `C:\sol\deliverables\sol-lens-avatar-demo\render-manifest.json` | Encoding summary | Matches media metadata | 2:52.625 listed |
| Provenance | `docs/PROVENANCE.md` | Earlier SOL vs Build Week boundary | Strong and specific | N/A |
| Submission checklist | `docs/SUBMISSION-CHECKLIST.md` | Remaining Devpost actions | YouTube, GPT-5.6 validation, `/feedback` remain open | N/A |
| Repository history | Git commits `89f16a4`, `6c2a3d0`, `c390ef9`, `e7d5200`, `23181d8`, `0e9e0d5` | Dated Build Week implementation evidence | Strong | July 18-20, 2026 |

The final MP4 was independently inspected through Windows media metadata: 1920x1080, 29.99 fps, 140 kbps audio, 501 kbps total bitrate, and 2:52 displayed length. Source WAV peaks are below full scale (0.9494-0.9727), so no source clipping was detected. The audio was not independently transcribed by speech recognition; the generator, timeline, WAV durations, and SRT were cross-checked instead. A human listening review is still required.

## Phase 2 mandatory requirement matrix

| Requirement | Status | Exact evidence | Timestamp or file location | Risk | Required correction |
|---|---|---|---|---|---|
| A. Less than three minutes | PASS | Encoded duration is 2:52.68 | MP4 metadata; `render-manifest.json` | Low | Preserve a 2:50-2:55 final target. |
| B. Public YouTube submission | UNVERIFIED | Repository checklist still leaves public YouTube upload open | `docs/SUBMISSION-CHECKLIST.md:21` | Blocking submission action | Upload final cut as Public and enter that URL in Devpost's video field; website embed is supplemental only. |
| C. Clear working-project demo | PARTIAL | All product states are genuine Render captures, but compositor loops still PNGs with zoom and avatar movement; no cursor action or continuous UI transition is shown | `render-video.py`; 0:00-2:30 | High / blocking video correction | Show visible selection, load, comparison result, conflict result, Manifold Step actions, and unchanged verdict using cursor/action transitions or genuine screen motion. |
| D. Understandable voiceover | PARTIAL | English TTS exists throughout; WAV peaks are not clipped; 25 caption cues exist. Human intelligibility and final pronunciation were not reviewed. Avatar covers parts of UI in sampled frames | Audio folder; SRT; validation frames | Medium | Use requested Andrew HD voice, reduce/reposition avatar around metrics, proof download, and inspector; listen to the full render and proofread captions. |
| E. Explain what was built | PARTIAL | Problem, Logons, scores, verdicts, export, and replay are explained. Primary audience is only implied as teams; concrete workflow actions are not visibly demonstrated | 0:00-2:30; timeline segments 1-8 | Medium | Explicitly name engineering teams evaluating agent migrations and connect each visible action to its result. |
| F. Specific Codex usage | FAIL | Only the closing line says the product was built “with GPT-5.6 and Codex.” No workflow, retained decision, correction, or resulting product change is described | 2:30-2:52; `docs/DEMO-NARRATION.md:67` | Blocking | Add concrete repository-grounded Codex work, the one-click-fixture iteration, the decision to separate replay from the court, and authentic commit/test evidence. |
| G. Specific GPT-5.6 use | FAIL | Video only names GPT-5.6. Code search finds no runtime Responses API integration; README calls the adapter future work and checklist says credentialed validation is pending | `README.md:148,187`; video 2:30-2:52 | Blocking / eligibility risk | Truthfully state that GPT-5.6 powered the Codex build workflow, what context it received and outputs it produced, and that the submitted runtime is deterministic. Complete and document the required GPT-5.6 evidence before submission. |
| H. English requirement | PASS | Narration and complete SRT are English | All segments; `.en.srt` | Low | Preserve English captions. |
| I. Third-party IP | UNVERIFIED | No music or stock footage is used; Apache-2.0 repository license exists. Avatar was supplied by entrant but ownership/license is not documented. Segoe UI is rasterized by the local compositor | `LICENSE`; compositor inputs; avatar hash | Blocking manual representation | Entrant must confirm avatar ownership/permission and review any marks shown in brief factual development evidence. Do not add music. |
| J. Narration/visual accuracy | PARTIAL | Metrics, verdicts, replay boundary, and Build Week provenance match repository evidence. The video implies actions through before/after stills rather than showing those actions | Timeline, captures, provenance, replay code | Medium | Add visible action-to-result transitions and keep the build-time/runtime GPT distinction explicit. |
| Public repository and licensing | PASS | Public GitHub origin and Apache-2.0 `LICENSE` present | `origin`; `LICENSE` | Low | Confirm public access from a signed-out browser before submission. |
| `/feedback` session evidence | UNVERIFIED | Checklist still open; no session ID tracked in repository | `docs/SUBMISSION-CHECKLIST.md:24` | Blocking submission action | Run `/feedback` in the primary build thread and enter the returned ID in Devpost. |

## Claim-evidence audit

| Narrated claim | Supporting visual | Code or artifact evidence | Accurate? | Revision needed |
|---|---|---|---|---|
| SOL Lens compares observable agent activity | Opening dashboard and graph | `app/sol-lens-workbench.tsx`, packet schema, scoring engine | Yes | Add explicit audience. |
| Seven examples run through the real path | Gallery capture | `lib/example-packets.ts`; example tests | Yes | Show one visible click/load transition. |
| Trace Court scores evidence, coherence, and contradiction | Grounded graph and metric cards | `lib/sol-engine.ts` | Yes | Keep. |
| Conflict moves the candidate to QUARANTINE at 0.24 contradiction | Conflict capture | Deterministic fixture and scoring tests | Yes | Keep; show load/result transition. |
| Proof packets are versioned and independently replayable | Download link is visible | `lib/packet-schema.ts`; export/re-import tests | Yes | Show the cursor on the download control; downloading may remain optional. |
| Manifold Step updates density, pressure, conductance, and flux | Step 0 and Step 3 captures | `lib/manifold-replay.ts`; 236-line replay test addition | Yes | Show visible Step clicks and before/after telemetry. |
| Replay never changes the court verdict | QUARANTINE reference remains visible | Replay state is separate from packet and court | Yes | Keep prominently. |
| Built with GPT-5.6 and Codex | No development artifact appears | Codex-authored commits and Build Week history support Codex; runtime GPT integration does not exist | Incomplete | Replace generic claim with precise build-time workflow and boundary. |
| “Visible, deterministic, reviewable” | Final replay frame | Deterministic tests and export design support the wording | Yes | Tie it to a specific user outcome. |

## Phase 3 pre-existing project and Build Week delta

Submission period began **July 13, 2026 at 9:00 a.m. Pacific**. The pre-existing SOL repository files date from at least June 5 in the inspected workspace. The first SOL Lens application commits are dated July 18, inside the submission window.

| Feature or component | Existed before Build Week? | New or extended during Build Week | Evidence | Should appear in video? |
|---|---:|---|---|---:|
| SOL Engine mathematics, experiments, Logon vocabulary | Yes | Used as foundation, not claimed as new | Root SOL workspace; `docs/PROVENANCE.md` | Briefly |
| SOL Lens product and visual workbench | No evidence before window | New July 18 | `89f16a4` | Yes |
| Build Week provenance and scoring tests | No | New July 18 | `6c2a3d0` | Briefly |
| v0.2 packet validator and deterministic graph layout | No | New/extended July 19 | `c390ef9` | Yes |
| Curated one-click teaching fixtures | No | New July 19 after judge-flow iteration | `e7d5200`, `23181d8` | Yes |
| Manifold Replay engine and controls | SOL math existed; Lens replay did not | New July 20 | `0e9e0d5`, +2,147/-6 | Yes |
| Current avatar video pipeline | No | New July 20 | Deliverable timestamps and scripts | Optional |

Recommended accurate delta line:

> SOL Lens builds on earlier SOL Engine research; during Build Week, I used Codex powered by GPT-5.6 to turn that foundation into this runnable packet workbench, deterministic court, teaching fixtures, replay module, and tested judge experience.

## Phase 4 judging-strength scores for the current video

| Criterion | Score | Evidence in current video | Missing proof | Highest-impact improvement |
|---|---:|---|---|---|
| Technological Implementation | 2/5 | Working non-trivial graph, court, export, and replay states | No specific Codex/GPT workflow, test evidence, iteration, or live action | Add authentic commit/test insert and precise build story. |
| Design | 4/5 | Coherent visual system, strong information hierarchy, curated onboarding, captions | Avatar obscures some controls/cards; static presentation weakens usability proof | Reduce/move avatar and show the interaction path. |
| Potential Impact | 3/5 | Credible migration problem and clear QUARANTINE example | Audience and workflow outcome are implied rather than explicit | Name engineering teams and finish with the decision benefit. |
| Quality of the Idea | 4/5 | Deterministic evidence graph, court, proof packet, and separate experimental replay are distinctive | Difference from generic graph tools is not stated directly | Say that the verdict is replayable evidence, not a chat answer or decorative graph. |

## Prioritized issues

### Blocking

1. Add specific Codex workflow, retained decision, iteration/correction, and resulting product change to the narration.
2. Explain GPT-5.6's truthful role and resolve/document the remaining eligibility evidence risk; do not imply a runtime model call.
3. Replace the static-state montage with a visibly interactive action-to-result journey.
4. Complete public YouTube, Devpost video field, and `/feedback` manual actions.
5. Confirm the entrant owns or is authorized to use the avatar.

### High impact

- Use the requested Andrew Natural HD voice and perform a full human listening review.
- Show authentic Build Week evidence: dated commits, the one-click-fixture iteration, and 37-test validation.
- Keep the product visually dominant and move the avatar away from verdicts, telemetry, and controls.

### Recommended

- Explicitly name engineering teams evaluating agent migrations.
- State that GPT-5.6 was used at build time through Codex and the submitted runtime is deterministic/browser-local.
- Proofread generated captions after final timing.

### Optional polish

- Add restrained cursor easing and click rings.
- Use a short terminal-style evidence insert rather than a long Codex-interface recording.
- Avoid background music to keep licensing and voice clarity simple.

## Source-of-truth note

The Official Rules and Hackathon Website override this audit, the source prompt, plugins, and all AI-generated guidance.
