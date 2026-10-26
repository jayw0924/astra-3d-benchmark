# Grounding checkpoint finalized locally

## Decision and boundary

Jay’s exact statement **“yes tires feel planted”**, recorded at 2026-10-26T20:20:38Z, approves tire grounding only. The unchanged `../2026-10-26-sol-ground-contact/user-approval.json` explicitly denies publication authorization. No commit, push, deploy, new captures, material/lighting tuning or Blender installation in this finalization.

The receiver-only implementation is already present in three source/test paths. This finalizer did not change those bytes. Baseline is `ffe0a56982a0bb22c34d705b1c00f0a62d147a0f`; before/after source SHA-256 pins are `bef1520d13da50bd367c9b2108a3f067e878cf3b322442018e9a7af7eb5fd5d4` / `8943174891711038f08a0f1fbf659fb491b8ea126551d84a8ae0a162e6acafdb`. Receiver Y changed from -0.003 to 0.1585579729696714; tread clearance is 0.0005–0.0019612652344922 scene units. Model/material/environment/light/shadow parameters were not changed. Accepted Safe GLB remains 9,239,404 bytes / SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`.

## Evidence, supersession and limitations

- Historical ground notes and follow-up notes are preserved byte-for-byte and copied here before status qualification. Their “approval pending” statements describe the earlier state; current subjective approval is established only by the later user-approval.json, not by rewriting them.
- Original 65 ground files / 14 PNGs and 55 follow-up files (54 inventory entries plus the inventory file itself) are immutable. Follow-up comprises **12 native evidence PNGs / six desktop pairs**, plus six diagnostic PNGs and six presentation JPEGs; derivatives are not extra captures.
- The original two-byte `before-captures.json` remains `[]`; desktop-before telemetry and exact historical camera equality are not reconstructed. New six-pair runtime camera/model/material/shadow/renderer equalities are retained in existing logs/JSON, not newly rendered here.
- Carmine side has two interior-body changed pixels, max delta 39; front views have one each, delta 2. Cause remains unknown; no floor-only pixel claim. Upper-image regions are not floor segmentation.
- Original mobile evidence crops the car; no new mobile recapture, physical-device certification, exhaustive interaction matrix or production-GPU claim.
- Ground run dates/elapsedSeconds intentionally cover only the actual logged follow-up capture interval, not all implementation/diagnosis. Material record dates cover retrospective registration only because original execution times are unavailable. Finalization timings/logs measure only this finalizer’s commands and observed wall interval. All billing amounts remain null.
- Material preparation is registered as partial/read-only. Static findings are not a new material-quality verdict. Proposed matrices and candidates remain unperformed; Blender unavailable during original inspection, not installed or rechecked as an incidental action.

## Public projection and release boundary

Three Sol records are added: ground-contact, material-diagnosis and ground-finalization. Images are registered with mixed sourced/derivative provenance; Sol work remains non-Astra baseline. No new verified Astra sessions are claimed. Public methods describe grounding approval and limitations. The existing native preview and all approved lighting images retain exact bytes; preview title/alt/manifest now explicitly say **pre-ground correction**. The interactive viewer has the corrected receiver, while the retained preview does not. Generated projection is rebuilt by the existing script.

Verification command results live in separate execution JSON/logs and `integrity.json`. Release tests abort model requests and only check public copy/dimensions/licenses and text; they do not re-exercise the costly historical WebGL capture writer. Existing ground runtime evidence is inspected, not relabeled as rerun. File-tool standalone E2E TypeScript diagnostics are pre-existing default-compiler/dependency context; repository build and Playwright results are authoritative for those respective checks. Vite may retain its existing chunk-size advisory.

Ready only for parent review and separately authorized staging/commit/push after final checks pass. No publication permission inferred from local preparation. Preserve the parent’s untracked frozen checkpoint and approval record in any intended release set.

## Executed checks

- Unit: 39 passing tests in six files; scripts: 30 passing; render-plan: six passing. Public-copy regression observed red before edits; its first green attempt found both Methods and ledger approval text, so the assertion was scoped to Methods and the full unit run passed.
- Repository lint and strict research validation passed: **20 assets / 30 runs**, with **seven verified Astra runs** unchanged by these three Sol registrations.
- Strict build and app-only public build passed. The existing Vite large-chunk advisory remains.
- Lightweight release E2E: two passing desktop/mobile cases against development delivery, then two passing against built production delivery. Public preview exact hash, native dimensions, CSS aspect ratio and served license bytes passed; no new image capture or historical capture writer ran.
- Production HTTP check matched accepted Safe GLB bytes/hash; all **18 public files** were emitted byte-for-byte.
- Read-only evidence revalidation passed across **1,755 baseline files**, including all original 65 ground files, 14 historical PNGs and all 55 follow-up files. Six-pair actual telemetry and native pixel metrics were recomputed without rewriting their reports or derivatives.
- Filename/schema/limited-signature privacy scan found no candidates; 167 public command-ledger rows were allowlisted by keys. This is a bounded check, not comprehensive security certification. Final verification logs carry their own later timestamps and measured command runtimes.
