const base = '/assets/study/ai-imagery/';
function ImageCard({ file, alt, title, width = 850, height = 778 }: { file: string; alt: string; title: string; width?: number; height?: number }) {
  return <figure className="render-card"><a href={base + file}><img src={base + file} alt={alt} width={width} height={height} loading="lazy" /></a><figcaption className="render-card-body"><strong>{title}</strong><a href={base + file} download>Native PNG ↗</a></figcaption></figure>;
}
export default function ImageryFollowons() {
  return <div id="ai-followons" className="imagery-followons">
    <p className="eyebrow">Decision · editorial image, not a new 3D asset</p>
    <h3>Four follow-ons completed</h3>
    <p>Use the location image for an expressive editorial presentation; use the protected composite when retaining source pixels matters. Neither improves the current GLB. One received output per condition; the protected condition includes a separately approved deterministic shadow pass, not another cloud generation.</p>
    <div role="group" aria-label="Location interpretation and original source" className="followon-group location-result">
      <h3>Featured result · a car in context</h3>
      <p>Jay: “love the last one!” — visual approval, not technical fidelity. Qwen Image 2.1 reinterprets the original side view at dusk outside a modern concrete-and-glass building on dry pavement. This is generative interpretation, not a location photograph or faithful product evidence.</p>
      <div className="render-grid ai-imagery-pair">
        <ImageCard file="followons/location.png" alt="Location interpretation · Qwen seed 42" title="Qwen location · seed 42 · 864×768" width={864} height={768} />
        <ImageCard file="after-Carmine-side.png" alt="Location original side source" title="Actual original side input · 850×778" />
      </div>
      <p>The quieter architecture, warm interior light and pavement give the car a convincing setting. The broad side silhouette survives, but wheels, tread, glazing and reflections are reconstructed. Rear-tire white writing is unverified. No obvious hood emblem is visible in this view; absence of invented marks is not certified. Native aspect ratios differ; no product resizing or pixel alignment is claimed.</p>
    </div>
    <div role="group" aria-label="Protected product comparison" className="followon-group">
      <h3>Protected product · retain design, repair contact</h3>
      <div className="render-grid protected-comparison">
        <ImageCard file="followons/protected-source.png" alt="Protected original front source" title="Actual front source · 850×778" />
        <ImageCard file="followons/composite-02.png" alt="Approved protected composite 02" title="02 · source pixels + contact shadow" />
        <ImageCard file="followons/composite-01.png" alt="Protected composite 01 without contact shadow" title="01 · learning trail: floating cutout" />
      </div>
      <p>Jay approved 02: “i agree, this looks great”. Source RGB is preserved inside the binary renderer-derived mask, not entire-vehicle truth, subpixel proof, relighting or geometric certification. The original glass and mirror reflections remain frozen in the old studio; source-backdrop spill is retained at edges.</p>
      <details><summary>Empty plate, deterministic composite and shadow repair</summary>
        <p>All 107,603 protected raster pixels remain unchanged, including 106,452 core and 1,151 partial-coverage boundary pixels.</p>
        <p>Comfy Cloud generated one empty Qwen studio plate (864×768, seed 42). The empty image was the intended intermediate. Sol’s local compositor copied source RGB at identical integer coordinates over a background-only cover fit: 876×778, crop [13,0,863,778], LANCZOS rounding recorded. The product was never resized or feathered.</p>
        <p>01 preserved the car but excluded the floor/contact shadow and looked detached. For 02, the actual unchanged Three.js ShadowMaterial caster map was retained; a transparent black alpha layer, not an opaque floor image, supplied contact. Exactly 11,502 exposed shadow pixels changed versus 01; none changed outside that support or inside protection. The original shadow is not physically relit for the new plate. Diagnostic rerender differed from the immutable source at 16 protected pixels (maximum channel delta 51); original RGB was restored last.</p>
        <p>Actual front-three-quarter masking replaced the protocol’s planned side source; the side experiment was not silently relabelled. Cloud generation and deterministic local compositing are separate methods. The capture’s alpha:true instrumentation was disposable, not a viewer change.</p>
        <div className="render-grid ai-imagery-pair"><ImageCard file="followons/empty-plate.png" alt="Actual generated empty studio plate" title="Qwen empty plate · 864×768" width={864} height={768} /><ImageCard file="followons/protection-mask.png" alt="Binary renderer product protection mask" title="White = preserve source; floor excluded" /><ImageCard file="followons/shadow-layer.png" alt="Actual transparent black shadow layer" title="Actual ShadowMaterial alpha · native" /></div>
      </details>
    </div>
    <div role="group" aria-label="Second model comparison" className="followon-group">
      <h3>Flux Kontext Pro · photographic gain, identity failure</h3>
      <div className="render-grid ai-imagery-pair"><ImageCard file="after-Carmine-side.png" alt="Flux original side source" title="Same original side input · 850×778" /><ImageCard file="followons/flux.png" alt="Flux Kontext Pro raw interpretation" title="Flux Kontext Pro · 1104×944" width={1104} height={944} /></div>
      <p>The studio treatment is persuasive, but Flux changed the side view to front three-quarter, redesigned headlights, nose and intakes, and added an invented hood emblem. Jay was impressed and identified the emblem; this is a faithful-product failure, not an accepted redesign. The emblem’s identity is unverified and the raw image is not retouched. No endorsement or marks-rights clearance is claimed.</p>
      <details><summary>Second-model settings and limits</summary><p>Recorded FluxKontextProImageNode: seed 42, guidance 3, steps 50, prompt_upsampling false. Requested aspect 850:778, actual output 1104×944. Different workflow/sizing and service semantics prevent a strict model-only causal comparison; equal numeric seeds do not couple randomness.</p></details>
    </div>
    <div role="group" aria-label="Original-seed repeatability" className="followon-group">
      <h3>Repeatability · identical pixels, fresh sampling unknown</h3>
      <div className="render-grid ai-imagery-pair"><ImageCard file="Qwen_image_2.1_00001.png" alt="Original Qwen seed result for repeat comparison" title="First output · seed 891836227295375" width={864} height={768} /><ImageCard file="followons/repeat.png" alt="Original-seed repeated Qwen output" title="Received repeat · same seed · 864×768" width={864} height={768} /></div>
      <p>Received pixels match the first output. Without executed/cached-node job history, fresh sampling versus Comfy cache reuse is unknown; this does not prove deterministic fresh computation.</p>
      <details><summary>Repeat pixel measurements &amp; graph identity</summary><p>0 changed RGB pixels; decoded RGBA is identical. Maximum channel delta and mean absolute channel difference are both 0; no difference bounding box. The complete submitted execution graph is identical. PNG file hashes differ because editor workflow metadata changed.</p></details>
    </div>
    <details className="followon-group"><summary>Follow-on provenance, workflows and retained failures</summary>
      <p>Sol coordinated prompts, local compositing and documentation; Jay operated and reviewed the Comfy Cloud UI. Qwen and Flux generated pixels, not Astra. Native PNGs, separate API/editor graphs, inputs, masks, shadow layers, scripts, telemetry, comparisons, receipts and approval records are archived in research/runs/2026-10-28-sol-imagery-followons. Metadata was reviewed before public copying; no obvious private credentials identified, not a privacy or rights certification. Executable research recipes are not served as public downloads.</p>
      <p>Qwen location/plate use seed 42, 25 steps, CFG 1, Euler/simple, denoise 1, prompt refinement off; repeat uses original seed 891836227295375. Complete graphs remain the setting authority. Registration is retrospective; ledger timestamps describe registration only, not cloud generation. Job IDs, cloud runtime, charges and failed-job billing remain unknown. Recorded metadata is not independently authenticated execution history.</p>
      <p>Failures remain evidence: earlier reported os.memfd_create cloud error, 01’s floating contact, local missing-browser capture retry and missing-numpy assembly failure, plus Flux’s invented emblem and camera/design drift. None is erased by visual approval. The historical protocol is unchanged; completed conditions and deviations are recorded in the new status addendum. Case 02 still has zero actual runs: Blender-first work remains pending.</p>
    </details>
  </div>;
}
