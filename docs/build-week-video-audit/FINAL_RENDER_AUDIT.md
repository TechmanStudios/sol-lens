# SOL Lens final render compliance re-audit

Audited candidate: `C:\sol\deliverables\sol-lens-avatar-demo-compliance-v2\SOL-Lens-Build-Week-Compliant-Demo.mp4`

Audit date: 2026-07-20

## Verdict

**Not submission ready until the manual delivery items are completed.** The corrected video itself passes the measurable runtime, media, narration-content, caption, product-evidence, Codex-story, GPT-5.6-boundary, and provenance checks. Public YouTube delivery, the Devpost video field, `/feedback`, avatar-rights confirmation, and a human listen-through remain unverified and mandatory before a compliant submission can be claimed.

## Final media evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Runtime below 3:00 | PASS | Actual MP4 duration `00:02:50.27` |
| Target pacing window | PASS | Manifest `170.26` seconds; actual container `170.27` seconds |
| Resolution and frame rate | PASS | H.264 High, `1920x1080`, square pixels, `30 fps` |
| Narrated audio | PASS (technical) | AAC-LC, 48 kHz stereo, 150 kb/s; mean `-19.9 dB`, peak `-4.3 dB` |
| Human audio review | UNVERIFIED | Entrant must listen from beginning to end and confirm pronunciation/pacing |
| English captions | PASS | Embedded default English `mov_text` track plus sidecar SRT |
| Caption fidelity | PASS | 24 cues; normalized SRT text exactly matches all nine timeline text fields (2,502 characters) |
| Final video hash | PASS | SHA-256 `645C97210C38189387282FFBA8CFC3427A1DA9843684C21A58197B772F142B3F` |

## Mandatory-content matrix

| Requirement | Final status | Render/repository evidence |
| --- | --- | --- |
| Clearly show the working project | PASS | Cursor and click-ring cues connect the example gallery, grounded trace, conflict result, proof/replay state, and final outcome using genuine application captures. |
| Explain what was built | PASS | Product, audience, deterministic court, teaching gallery, proof export, and Manifold Replay are named and shown. |
| Explain Codex use | PASS | The narration names the validator, layout, fixtures, replay engine, and 37-test suite, then explains the JSON-first onboarding iteration and court/replay boundary decision. |
| Explain GPT-5.6 use | PASS | The narration and evidence panel state that GPT-5.6 powered the Codex build loop using the guide, repository, failures, and UI feedback to produce patches, tests, and revisions. |
| Truthful GPT runtime boundary | PASS | Narration, evidence panel, and README state that GPT-5.6 is build-time here and that the browser evaluator makes no live GPT call. |
| Distinguish pre-existing and Build Week work | PASS | Earlier SOL Engine research is identified as the foundation; SOL Lens workbench, court, gallery, and replay module are identified as Build Week additions. |
| Public YouTube video | UNVERIFIED | Manual upload and signed-out access check required. |
| Devpost video field | UNVERIFIED | Manual entry required. |
| Public repository and license | PASS | `https://github.com/TechmanStudios/sol-lens` and Apache-2.0 `LICENSE`. |
| README Codex/GPT documentation | PASS | `README.md` contains the collaboration, retained decisions, iteration, contribution, and deterministic runtime boundary. |
| `/feedback` session ID | UNVERIFIED | Manual Codex feedback flow required. |
| Media rights | PASS | No music or stock footage; entrant confirmed ownership of or permission to use the user-supplied avatar on 2026-07-20. |

## Synthetic voice result

The final render uses Microsoft `en-US-AndrewMultilingualNeural` at `+8%` rate and `+1Hz` pitch. Microsoft Andrew HD is installed for Windows Narrator but is not exposed to the legacy `System.Speech` WAV exporter used by the first cut. The v2 package records the exportable Microsoft Andrew provider and exact voice identifier instead of mislabeling the file as a local Narrator capture.

AI-generated voice is allowed by the official FAQ. The final human listen-through remains necessary because automated inspection can measure duration, streams, peaks, and caption fidelity but cannot certify subjective clarity or pronunciation.

## Caption-refined YouTube copy

The dedicated upload copy is `SOL-Lens-Build-Week-YouTube-Upload.mp4`. It retains the `2:50.27` runtime and bit-identical AAC narration while replacing the large optional subtitle display with 57 compact burned-in cues. The style uses Segoe UI at 25px, a maximum of two lines, an actual maximum of eight words, and a minimum dwell time of 1.819 seconds. The upload MP4 contains only video and audio streams, preventing a second oversized subtitle layer.

YouTube upload SHA-256: `E3E304DA34651B336C628AA3FB22A5814AA9CDE5F75902B0AF60E3E47D92C400`.

## Repository validation

- `npm run lint`: PASS
- `npm test`: PASS — 37 passed, 0 failed
- `npm run validate:artifact`: PASS
- Build: PASS — bounded Vinext production build and Sites artifact validation

## Judging-readiness re-score

| Dimension | Initial | Final | Rationale |
| --- | ---: | ---: | --- |
| Technical implementation | 2.0/5 | 4.5/5 | Deterministic product path, authentic commit/test evidence, and an explicit model/runtime boundary are now shown. |
| Design | 4.0/5 | 4.5/5 | Smaller avatar, cursor/click cues, concise titles, readable evidence cards, and captions improve clarity. |
| Potential impact | 3.0/5 | 4.0/5 | Engineering teams and the migration-decision use case are explicit. |
| Quality of idea | 4.0/5 | 4.5/5 | The portable-evidence story and the distinction between court and replay are now central. |

## Remaining manual blockers

1. Listen to the final MP4 from beginning to end and verify Andrew's pronunciation of SOL, Logon, Codex, GPT-5.6, PROMOTE, HOLD, and QUARANTINE.
2. Upload the caption-refined YouTube copy to YouTube as **Public** and verify it in a signed-out browser.
3. Add the public YouTube URL to the dedicated Devpost video field.
4. Run `/feedback` in the primary Codex build task and add the resulting session ID.
5. Verify the live app, public repository, YouTube video, team/eligibility fields, and submission fields before the deadline.

## Source of truth

The [Official Rules](https://openai.devpost.com/rules), [official FAQ](https://openai.devpost.com/details/faqs), and [Hackathon Website](https://openai.devpost.com/) override this audit and any generated checklist.
