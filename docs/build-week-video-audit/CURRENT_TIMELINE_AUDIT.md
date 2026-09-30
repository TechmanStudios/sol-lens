# Current SOL Lens video timeline audit

Current encoded runtime: **2:52.68**. The compositor gives each scene 0.36 seconds of lead-in and approximately 0.54 seconds of trailing pad.

| Start | End | Duration | Visual | Narration purpose | Requirement served | Keep, cut, or revise |
|---:|---:|---:|---|---|---|---|
| 0:00.000 | 0:19.744 | 19.744s | Opening still, slow zoom, avatar right | Migration problem and product question | What was built; impact | Revise to 15s and name audience. |
| 0:19.744 | 0:41.669 | 21.925s | Same opening still, avatar left | SOL identity and earlier research | Pre-existing/new boundary | Compress; retain accurate boundary. |
| 0:41.669 | 1:03.979 | 22.310s | Gallery still | Example breadth and deterministic fixtures | Working project/onboarding | Add visible Explore click and card selection. |
| 1:03.979 | 1:27.225 | 23.246s | Grounded graph still | Explain Logons, metrics, and court | Core workflow | Add visible load/result transition. |
| 1:27.225 | 1:45.924 | 18.699s | Conflict verdict still | Demonstrate failure and QUARANTINE | Value and impact | Keep; show action-to-result transition. |
| 1:45.924 | 2:00.435 | 14.511s | Same conflict still | Explain proof packet | Concrete output | Compress; visibly point to export. |
| 2:00.435 | 2:08.088 | 7.653s | Manifold Step 0 still | Introduce replay question | Novel idea | Keep as transition. |
| 2:08.088 | 2:29.900 | 21.812s | Manifold Step 3 still | Explain deterministic dynamics and court boundary | Technical implementation | Show three Step clicks and telemetry change. |
| 2:29.900 | 2:52.625 | 22.725s | Manifold reset still | Generic Build Week/Codex/GPT claim and close | Tool-use requirement | Replace with Codex/GPT evidence and a shorter impact close. |

## Pacing findings

- Spoken source: **396 words**.
- At 135 wpm: **2:56** before pauses/transitions.
- At 145 wpm: **2:44** before pauses/transitions.
- At 155 wpm: **2:33** before pauses/transitions.
- Actual David Desktop render: **2:52.68**, including 8.1 seconds of scene padding.
- The current script cannot simply append compliance language. Low-value origin and feature-list words must be traded for specific Codex/GPT evidence while holding roughly 375-400 words.
- The static captures keep text sharp, but the lack of visible input/action/result motion weakens compliance and makes multiple 20-second scenes feel longer than they are.
- The avatar covers part of the gallery/promote card, reference comparison, Manifold inspector, and graph area in sampled frames. It should be reduced and positioned per shot.

## Comparison with the recommended structure

| Recommended block | Current allocation | Finding |
|---|---:|---|
| 0:00-0:15 Hook/problem | 0:00-0:19.7 | Slightly long; audience not explicit. |
| 0:15-0:35 Product/audience/delta | 0:19.7-0:41.7 | Delta is strong; audience remains vague. |
| 0:35-1:45 Working demo | 0:41.7-2:00.4 | Plenty of time, but still images do not clearly show actions. |
| 1:45-2:20 Codex build story | None | Mandatory gap. |
| 2:20-2:40 GPT-5.6 and differentiation | Generic 2:29.9-2:52.6 line | Mandatory gap and runtime/build-time ambiguity. |
| 2:40-2:55 Impact close | Last sentence only | Strong phrase, but not tied to named user outcome. |

## Required restructuring

1. Keep the hook and provenance boundary within 35 seconds.
2. Use approximately 70 seconds for visible product actions and results.
3. Use approximately 35 seconds for repository-grounded Codex workflow, decision, and iteration.
4. Use approximately 20 seconds for the truthful GPT-5.6 build-time role and deterministic runtime boundary.
5. Close in 12-15 seconds on the working product and user outcome.
