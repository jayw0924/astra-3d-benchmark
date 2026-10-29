import { lazy, Suspense } from 'react';
import studyData from './generated/study-data.json';
import ImageryFollowons from './components/ImageryFollowons';

const Configurator = lazy(() => import('./components/Configurator'));

const workflowStages = [
  {
    title: 'Intake & sanitize',
    flow: 'Licensed CarConcept → pinned source, inspected baseline and mark-node-removed web GLB.',
    roles: 'glTF inspection and sanitize scripts; Sol baseline setup; Astra asset inspection. Original asset authors retain credit.',
    status: 'Performed · reproducible derivative, not legal certification.',
    href: '#geometry', evidence: 'Source lineage',
  },
  {
    title: 'Material authoring',
    flow: 'Sanitized GLB → Estuary and Fjord material candidates; Estuary selected by blind review.',
    roles: 'Local glTF material/variant editing; Astra authoring; Sol controlled browser renders; Jay preference review.',
    status: 'Performed · 30 historical comparison renders; no physical-material accuracy claim.',
    href: '#output-title', evidence: 'Material comparison',
  },
  {
    title: 'Geometry optimization',
    flow: 'Estuary control → rejected Safe attempts → accepted FINAL Safe GLB.',
    roles: 'Pinned non-Blender optimization toolchain; Astra direction; Sol fixed-view comparison, acceptance review and integration.',
    status: 'Published in the viewer · fixed-view acceptance, not measured runtime speedup.',
    href: '#safe-result', evidence: 'Accepted Safe geometry',
  },
  {
    title: 'Lighting & grounding',
    flow: 'Accepted Safe GLB → refined browser lighting and corrected tire/ground contact; model/material bytes unchanged.',
    roles: 'Three.js viewer, browser capture harness and tire-vertex receiver calculation; Sol authoring; Jay subjective review.',
    status: 'Published in the viewer · bundled presentation interventions, not isolated causal tests.',
    href: '#configurator', evidence: 'Live viewer',
  },
  {
    title: 'AI imagery',
    flow: 'Original Carmine viewer captures → three side-seed and two angle interpretations; GLB unchanged.',
    roles: 'Comfy Cloud / Qwen Image 2.1 template; Qwen generation; Sol guidance/review; Jay UI execution.',
    status: 'Bounded comparison complete · fidelity unproven; cloud runtime/cost unknown.',
    href: '#image-workflow-title', evidence: 'Image workflow & limits',
  },
  {
    title: 'Completed image follow-ons',
    flow: 'Original viewer sources → protected background/composite, original-seed repeat, Flux Kontext Pro and Qwen location results. Case 02: Blender-first, asset pending.',
    roles: 'Comfy Cloud Qwen/Flux pixels; Sol coordination and deterministic local shadow composite; Jay UI operation and visual review. Engine streaming is deferred.',
    status: 'Four follow-ons completed · visual approval is not fidelity certification; Case 02 not performed.',
    href: '#ai-followons', evidence: 'Completed conditions & limits',
  },
];

const renderStudies = [
  {
    title: 'Historical viewer-light study',
    src: '/assets/renders/estuary-viewer-front-three-quarter.png',
    alt: 'Historical Estuary Enamel under the configurator lighting (original rig), front three-quarter view',
  },
  {
    title: 'Neutral-light study',
    src: '/assets/renders/estuary-neutral-front-three-quarter.png',
    alt: 'Historical Estuary Enamel under neutral lighting, front three-quarter view',
  },
  {
    title: 'Material close-ups',
    src: '/assets/renders/estuary-neutral-closeup.png',
    alt: 'Historical Estuary Enamel paint and mirror close-up under neutral lighting',
  },
] as const;

const geometryStudies = [
  {
    title: 'Raw licensed source',
    detail: 'Upstream Carmine Candy before this project removed mark-bearing geometry.',
    src: '/assets/study/geometry/source-overview.png',
    alt: 'Raw licensed CarConcept source in Carmine Candy, front three-quarter view',
  },
  {
    title: 'Sanitized web baseline',
    detail: 'Plate and steering-emblem nodes physically removed; supplied geometry retained.',
    src: '/assets/study/geometry/sanitized-overview.png',
    alt: 'Sanitized CarConcept web baseline in Carmine Candy, front three-quarter view',
  },
  {
    title: 'Selected control',
    detail: 'The immutable historical Estuary control for the scored optimization experiment.',
    src: '/assets/study/geometry/estuary-overview.png',
    alt: 'Integrated Estuary geometry control, front three-quarter view',
  },
  {
    title: 'Topology detail',
    detail: 'Isolated front wheel, rim, brake, and tire triangulation at the same output size.',
    src: '/assets/study/geometry/wireframe-wheel-detail.png',
    alt: 'Front wheel topology detail rendered as a dark green wireframe',
  },
] as const;

export default function App() {
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="AI-assisted 3D Workflow Lab home">
          3D Workflow Lab / 01
        </a>
        <nav aria-label="Study navigation">
          <a href="#geometry">Geometry</a>
          <a href="#configurator">Configurator</a>
          <a href="#ai-imagery">AI imagery</a>
          <a href="#workflow-index-title">Workflows</a>
          <a href="#methods">Methods</a>
          <a href="#evidence">Evidence</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Case 01 · CarConcept</p>
            <h1 id="hero-title">AI-assisted 3D Workflow Lab</h1>
            <p className="hero-subtitle">Materials, optimization &amp; imagery</p>
            <p className="lede">
              A transparent experiment in product visualization: source a real asset,
              direct an AI-assisted 3D workflow, ship an interactive result, and keep
              the failures visible.
            </p>
          </div>
          <aside className="study-status" aria-label="Study status">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>Safe result published in the viewer</strong>
              <p>{studyData.summary.astraRunCount} verified Astra runs · Safe geometry integrated</p>
            </div>
          </aside>
          <div className="hero-object" aria-label="Selected benchmark object">
            <span>Primary subject</span>
            <strong>CarConcept</strong>
            <small>CC BY 4.0 · Khronos sample asset</small>
          </div>
        </section>

        <section className="current-findings" aria-labelledby="findings-title">
          <div className="section-heading">
            <p className="eyebrow">Current findings · start here</p>
            <h2 id="findings-title">What we learned</h2>
          </div>
          <div className="findings-grid">
            <article><h3>Keep the Safe geometry</h3><p>A modest 9.34% smaller GLB passed fixed-view acceptance — not measured runtime speedup or arbitrary-view certification.</p><a href="#safe-result">Accepted result &amp; comparison →</a></article>
            <article><h3>Use AI images for interpretation</h3><p>More photographic presentation, not product fidelity: wheels, trim and even marks can be invented. The GLB is unchanged.</p><a href="#ai-followons">Current images &amp; original sources →</a></article>
            <article><h3>Protect pixels when design matters</h3><p>The approved composite preserves source RGB only inside a renderer-derived mask. Frozen reflections and edge spill remain; this is not whole-vehicle truth or relighting.</p><a href="#ai-followons">Protected comparison &amp; limits →</a></article>
          </div>
          <p className="findings-credit">Astra authored Estuary materials and directed Safe optimization; Sol authored viewer presentation, comparisons and local compositing; Jay operated and reviewed the cloud UI. Qwen and Flux generated image pixels. Costs and fresh-sampling versus cache reuse remain unknown.</p>
          <div className="findings-links"><a href="#configurator">Open the viewer →</a><a href="#workflow-index-title">Explore workflows →</a><a href="#evidence">Read the evidence →</a></div>
        </section>

        <section className="output-overview" aria-labelledby="output-title">
          <div className="section-heading">
            <p className="eyebrow">Output 01</p>
            <h2 id="output-title">Historical material comparison</h2>
            <p>
              The historical material comparison package contains 30 controlled browser renders covering
              two material candidates, two light rigs, exterior views, and close-ups.
            </p>
          </div>
          <div className="render-grid historical-material-evidence" aria-label="Historical material comparison renders">
            {renderStudies.map((study, index) => (
              <article className="render-card" key={study.title}>
                <img
                  src={study.src}
                  alt={study.alt}
                  width="600"
                  height="400"
                  loading="lazy"
                />
                <div className="render-card-body">
                  <span>0{index + 1}</span>
                  <div>
                  <p className="eyebrow">Historical material evidence · original rig</p>
                    <h3>{study.title}</h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="output-overview current-viewer-preview" aria-labelledby="current-preview-title">
          <div className="section-heading">
            <p className="eyebrow">Retained preview · pre-ground correction</p>
            <h2 id="current-preview-title">Refined viewer preview</h2>
            <p>Existing Sol Chromium capture at native 850×778; not a controlled before/after comparison.
              Source: 2026-10-26-sol-lighting-integration. Safe GLB and materials are unchanged.
              This retained preview predates the ground-contact correction; the interactive viewer below includes it.</p>
          </div>
          <article className="render-card">
            <img src="/assets/viewer/refined-estuary-native.png" alt="Pre-ground-correction refined viewer: Estuary Enamel" width="850" height="778" loading="lazy" />
            <div className="render-card-body"><p>Sol-authored lighting and capture; sourced CarConcept, Astra Estuary material and Safe geometry credits retained.</p></div>
          </article>
        </section>

        <section id="ai-imagery" className="output-overview ai-imagery" aria-labelledby="ai-imagery-title">
          <div className="section-heading">
            <p className="eyebrow">Case 01 · Separate interpretive experiment</p>
            <h2 id="ai-imagery-title">AI-enhanced imagery</h2>
            <p>Qwen Image 2.1 image generation; Sol prompt and guidance; Jay Comfy Cloud UI execution and review.
              This is generative image editing, not mesh or material improvement. The accepted 3D model is unchanged.</p>
          </div>
          <ImageryFollowons />
          <h3>Historical comparison · retained original evidence</h3>
          <h3>Side-view seed variation</h3>
          <div role="group" aria-label="Side-view seed variation" className="render-grid ai-imagery-pair">
            <article className="render-card">
              <img src="/assets/study/ai-imagery/after-Carmine-side.png" alt="Original Carmine viewer input" width="850" height="778" loading="lazy" />
              <div className="render-card-body"><h3>Original viewer input · 850×778</h3></div>
            </article>
            <article className="render-card">
              <img src="/assets/study/ai-imagery/Qwen_image_2.1_00001.png" alt="First Qwen Image 2.1 interpretation" width="864" height="768" loading="lazy" />
              <div className="render-card-body"><h3>First interpretation · seed 891836227295375 · 864×768</h3></div>
            </article>
            <article className="render-card">
              <img src="/assets/study/ai-imagery/Qwen_image_2.1_seed42.png" alt="Qwen interpretation · seed 42" width="864" height="768" loading="lazy" />
              <div className="render-card-body"><h3>Second interpretation · seed 42 · 864×768</h3><p>Invented door handle, more angular body treatment and reconstructed grain.</p><a href="/assets/study/ai-imagery/Qwen_image_2.1_seed42.png" download>Download seed 42 PNG</a></div>
            </article>
            <article className="render-card">
              <img src="/assets/study/ai-imagery/Qwen_image_2.1_seed12345.png" alt="Qwen interpretation · seed 12345" width="864" height="768" loading="lazy" />
              <div className="render-card-body"><h3>Third interpretation · seed 12345 · 864×768</h3><p>Apparent perspective, roof and framing drift; wheel details reconstructed.</p><a href="/assets/study/ai-imagery/Qwen_image_2.1_seed12345.png" download>Download seed 12345 PNG</a></div>
            </article>
          </div>
          <p className="geometry-note">Exact native PNG copies displayed responsively; not an aligned pixel comparison.
            The studio floor, contact shadow and reflections read more photographically, but wheel spokes/tread,
            lower trim, seams and surface grain are reconstructed. Faithful product imagery is not established.</p>
          <p className="geometry-note">Two additional successful outputs complete the bounded comparison; one reported cloud failure
            before the successful seed-42 retry is retained. No winner has been selected by Jay.
            Jay approved the first image for report inclusion, not blanket design fidelity. No more generation is authorized.</p>
          <div className="image-workflow" role="group" aria-labelledby="image-workflow-title">
            <h3 id="image-workflow-title">How the image was made</h3>
            <p>In Comfy Cloud (ComfyUI), we adapted one existing image-edit template, “Image Edit (Qwen Image 2.1)”,
              rather than building an image model or a new generation pipeline.</p>
            <ol>
              <li>Load a single original viewer image as the edit target; no generated result is fed into the next condition.</li>
              <li>Apply Sol’s studio-photo instruction with prompt refinement off, then generate with Qwen Image 2.1.</li>
              <li>Save the native PNG and compare it with the source. Jay operated the UI and reviewed the images;
                Sol supplied prompt guidance and documented the comparison.</li>
            </ol>
            <p>The same template was adapted for three side-view seeds and two seed-42 camera-angle inputs:
              not five independently designed workflows. The prompt and effective sampling settings stayed matched;
              the seed or source view changed. These are independent image edits, not a shared 3D reconstruction.</p>
            <figure className="workflow-screenshot">
              <a href="/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png">
                <img src="/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png"
                  alt="Actual Comfy Cloud rear three-quarter workflow: load image, Qwen edit, save and compare"
                  width="2400" height="1200" loading="lazy" />
              </a>
              <figcaption>Actual rear three-quarter Comfy Cloud session using the adapted Qwen Image 2.1 template:
                Load Image → Image Edit → Save Image (Advanced) → Compare Images, with template notes.
                This is an illustrative overview, not proof of precise settings or every run.
                Small node text is not a substitute for retained machine-readable graphs and settings in the research records.{' '}
                Screenshot credit: Jay’s actual session, ComfyUI interface; Sol coordinated the adaptation and publication.
                Publication approval is not independent privacy or rights certification.{' '}
                <a href="/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png">Open native workflow screenshot (2400 × 1200)</a>
              </figcaption>
            </figure>
            <p>Upstream credit: <a href="https://github.com/Comfy-Org/workflow_templates">Comfy-Org workflow templates</a>
              {' '}for the template family and <a href="https://huggingface.co/Comfy-Org/Qwen-Image-2.1">Qwen Image 2.1 model distribution</a>.
              The Qwen team developed the image model, not this project. This adaptation is not Astra-authored image generation.</p>
          </div>
          <details className="geometry-note">
            <summary>Technical settings, cloud failure and provenance limits</summary>
            <p>Embedded submitted graphs share the same original input reference and matching is_changed token, effective prompt,
              models and sampling settings: 25 steps, CFG 1, Euler/simple, denoise 1; prompt refinement is off.
              Differences are the sampler seed and the inactive text-enhancer seed, not a different prompt or model.
              Editor exports also change post-run seed control from randomize to fixed, layout and input/link ordering;
              this is not a claim that all workflow bytes differ only by seed.
              Diffusion: qwen_image_2.1_int8_convrot.safetensors; encoder: qwen3vl_8b_int8_convrot.safetensors;
              VAE: qwen_image_2.1_vae_bf16.safetensors.</p>
            <p>The reported KSampler failure was AttributeError: module &apos;os&apos; has no attribute &apos;memfd_create&apos;,
              a cloud runtime boundary, not evidence that seed 42 is invalid. The retry produced an image;
              the root cause and any service fix remain unverified. Three successful PNGs plus one reported failure
              imply four attempted jobs from the user sequence, not authenticated cloud history.
              Job IDs, actual cloud runtime and cost, including the failed attempt, are unknown and not reconstructed.</p>
            <p>Embedded settings corroborate the supervised input flow, not independent cloud-upload authentication,
              billing history or exact reproducibility. The ledger interval denotes first retrospective registration only.
              All three look more photographic but reconstruct product details; this small sample does not establish reliability.
              Original workflow exports remain in the research archive; no separate public workflow download is added
              because editor graphs include cloud-specific metadata. The native PNGs retain their reviewed embedded graphs.</p>
          </details>
          <div role="group" aria-label="Two-angle comparison">
            <h3>Two-angle comparison · seed 42</h3>
            <p>Fresh current-app Carmine sources with corrected grounding: front and rear three-quarter views.
              Qwen generation, Sol coordination and review, Jay manual cloud execution. Source camera telemetry is retained;
              generated perspective is not geometrically certified.</p>
            <div className="render-grid ai-imagery-pair">
              {(['front', 'rear'] as const).map((angle) => {
                const label = angle === 'front' ? 'Front' : 'Rear';
                return [
                  <article className="render-card" key={`${angle}-source`}>
                    <img src={`/assets/study/ai-imagery/angles/${angle}-source.png`} alt={`${label} three-quarter source`} width="850" height="778" loading="lazy" />
                    <div className="render-card-body"><h4>{label} source · 850×778</h4><a href={`/assets/study/ai-imagery/angles/${angle}-source.png`} download>Download {angle} source PNG</a></div>
                  </article>,
                  <article className="render-card" key={`${angle}-generated`}>
                    <img src={`/assets/study/ai-imagery/angles/${angle}-generated-seed42.png`} alt={`${label} three-quarter Qwen interpretation · seed 42`} width="864" height="768" loading="lazy" />
                    <div className="render-card-body"><h4>{label} interpretation · seed 42 · 864×768</h4><a href={`/assets/study/ai-imagery/angles/${angle}-generated-seed42.png`} download>Download {angle} interpretation PNG</a></div>
                  </article>,
                ];
              })}
            </div>
            <p>Native aspect ratios differ; these are separate source/output pairs, not pixel-aligned overlays.
              Studio floor, glass and body response look more photographic, but wheels, tread and product details are reconstructed.
              These independent edits are not evidence of coherent 3D or improved GLB geometry/materials. No angle winner is attributed to Jay.</p>
            <details className="technical-details"><summary>Angle settings &amp; source verification</summary>
            <p>Embedded graphs match the side seed-42 effective prompt, models, 25 steps, CFG 1, Euler/simple and denoise 1,
              with refinement off; LoadImage filename and change token differ. Tokens match measured local source hashes;
              cloud filenames do not. This corroborates the supervised input flow, not independently authenticated uploads.
              Cloud job IDs, actual generation time, cost and performance remain unknown.</p>
            </details>
            <p>The four follow-on conditions are now completed; see <a href="#ai-followons">completed conditions and limits</a>.
              No new generation was performed during report finalization.</p>
          </div>
          <p className="geometry-note">Source CarConcept credits: Unity Fan, DGG and Eric Chadwick; historical Astra-directed
            Safe geometry and Sol viewer capture retained. Inherited CC BY 4.0 source attribution applies; the generated image is a disclosed interpretation.</p>
        </section>

        <section id="safe-result" className="geometry-section" aria-labelledby="safe-title">
          <div className="section-heading">
            <p className="eyebrow">Decision · Accepted and published in the viewer</p>
            <h2 id="safe-title">Accepted Safe geometry</h2>
            <p>
              9.34% smaller payload: 9,239,404 bytes versus the 10,191,496-byte control.
              The FINAL candidate passed 108 fixed-view cases and 64 ordered material
              transitions. Earlier attempts were rejected for visible surface and seam defects.
            </p>
          </div>
          <div className="geometry-metrics" aria-label="Current Safe model geometry metrics">
            <article><strong>183,117 triangles</strong><span>complete model topology</span></article>
            <article><strong>144,888 distinct POSITION accessor entries</strong><span>static source-data count</span></article>
            <article><strong>549,351 submitted triangle indices</strong><span>static count per complete pass</span></article>
            <article><strong>107 primitives retained</strong><span>not measured draw calls</span></article>
          </div>
          <p className="geometry-note">
            Fixed-view acceptance only; no arbitrary-view or real-device quality claim.
            No runtime speedup is established; first-correct-frame timing is unavailable.
            Optimization is evidence-verified Astra-directed work; comparison captures,
            acceptance review, and local integration are Sol-authored.
          </p>
          <div className="render-grid safe-evidence" aria-label="Safe geometry comparison previews">
            {([
              ['before', 'Before: control'],
              ['first-attempt', 'First attempt: rejected'],
              ['final', 'Final: accepted'],
            ] as const).map(([file, label]) => (
              <article className="render-card" key={file}>
                <img src={`/assets/study/safe-final/${file}.png`} alt={label} width="600" height="400" loading="lazy" />
                <div className="render-card-body"><h3>{label}</h3></div>
              </article>
            ))}
          </div>
          <p className="geometry-note">
            Exact research PNG copies: Estuary front three-quarter shaded view under the
            frozen comparison rig, not new runtime screenshots. This preview does not
            reveal every rejected defect. Before/final: 2026-10-22-sol-safe-final-comparison;
            first attempt: 2026-10-21-sol-safe-webgl-comparison. Source and derivative
            attribution remains the CarConcept credit below.
          </p>
        </section>

        <section id="geometry" className="geometry-section" aria-labelledby="geometry-title">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Historical control — not the current runtime</p>
              <h2 id="geometry-title">Geometry baseline</h2>
            </div>
            <p>
              CarConcept was selected for named, separable parts, material variants,
              embedded KTX2 textures, and enough real product complexity to expose
              browser trade-offs. Its CC BY 4.0 package also carries a separate marks
              notice, so the public derivative removes the plate and steering emblem.
            </p>
          </div>

          <div className="geometry-lineage" aria-label="Asset geometry lineage">
            {geometryStudies.map((study, index) => (
              <article className="geometry-card" key={study.title}>
                <img
                  src={study.src}
                  alt={study.alt}
                  width="600"
                  height="400"
                  loading="lazy"
                />
                <div>
                  <span>0{index + 1}</span>
                  <h3>{study.title}</h3>
                  <p>{study.detail}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="geometry-metrics" aria-label="Historical control geometry metrics">
            <article>
              <strong>213,195 triangles</strong>
              <span>complete model topology</span>
            </article>
            <article>
              <strong>162,646 distinct POSITION accessor entries</strong>
              <span>static source-data count, not a GPU upload measurement</span>
            </article>
            <article>
              <strong>639,585 submitted triangle indices</strong>
              <span>static index count per complete pass, not vertex-shader work</span>
            </article>
            <article>
              <strong>107 primitives</strong>
              <span>static draw-submission proxy</span>
            </article>
          </div>
          <p className="geometry-note">
            Historical control: 10,191,496 bytes, 99 nodes, 95 meshes, 30 materials,
            and 14 embedded KTX2 images. Primitive count is not a measured draw-call
            count, and software-renderer timing is not production-GPU performance.
          </p>
        </section>

        <section id="configurator" className="configurator-section" aria-labelledby="configurator-title">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Output 02</p>
              <h2 id="configurator-title">Real-time configurator</h2>
            </div>
            <p>
              Three supplied finishes plus Estuary Enamel, a controlled wheel finish,
              and an inspectable WebGL2 implementation. Trademark-bearing plate and
              emblem nodes are removed from the served derivative. The current viewer uses
              the refined Sol-authored lighting rig on the unchanged accepted Safe GLB.
            </p>
          </div>
          <Suspense fallback={<p role="status">Preparing 3D configurator…</p>}>
            <Configurator />
          </Suspense>
        </section>

        <section id="methods" className="methods-section" aria-labelledby="methods-title">
          <div className="section-heading">
            <p className="eyebrow">How the study works</p>
            <h2 id="methods-title">Methods</h2>
            <p>
              Run records retain available model, tool, input, prompt, intervention,
              output and failure evidence; missing fields are explicitly qualified.
            </p>
          </div>
          <p>Sol (gpt-6.1-sol), not Astra, authored the lighting study and integration:
            72 initial lighting captures, 32 refinement captures, and 16 paired comparisons.
            Procedural studio reflections, direct-light rebalance and grounding are bundled presentation interventions,
            not isolated single-variable causal tests.
            Jay gave subjective approval of the refined lighting checkpoint, not technical or legal certification.
            The accepted Safe GLB and materials remain unchanged.
            Full active timing and billing cost are unavailable and not reconstructed.
            Run IDs: 2026-10-23-sol-viewer-lighting, 2026-10-23-sol-viewer-lighting-refinement,
            2026-10-26-sol-lighting-integration.</p>
          <p>Sol subsequently corrected the shadow receiver using precise transformed tire vertices,
            preserving the GLB, materials, illumination and shadow settings.
            Six new desktop pairs (12 native captures) retain actual camera/model/material telemetry in both arms.
            Jay approved grounding only: “yes tires feel planted”; this is not publication authorization.
            Historical desktop-before telemetry remains unavailable; mobile framing is cropped and sparse off-receiver pixel differences remain unexplained.
            Run: 2026-10-26-sol-ground-contact. Material diagnosis remains read-only; comparisons and candidates are pending.</p>
          <div className="workflow-index" role="group" aria-labelledby="workflow-index-title">
            <h3 id="workflow-index-title">Study-wide workflow index</h3>
            <p>Six stages, not six generation workflows. Expand a stage for inputs, tools and roles;
              the linked evidence and run log retain the detailed record.</p>
            <ol>
              {workflowStages.map((stage, index) => (
                <li key={stage.title}>
                  <div className="workflow-stage-heading"><span>0{index + 1}</span><h3>{stage.title}</h3></div>
                  <div className="workflow-stage-body">
                    <p><strong>Status</strong>{stage.status}</p>
                    <details>
                      <summary>Input, output, tools & roles</summary>
                      <dl>
                        <div><dt>Input → output</dt><dd>{stage.flow}</dd></div>
                        <div><dt>Tools & roles</dt><dd>{stage.roles}</dd></div>
                      </dl>
                    </details>
                    <a href={stage.href}>{stage.evidence} →</a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="provenance-key" aria-label="Provenance categories">
            <h3>Four provenance lanes</h3>
            <p><strong>Sourced baseline</strong> — licensed external inputs.</p>
            <p><strong>Non-Astra baseline</strong> — setup work authored by humans or other assistants.</p>
            <p><strong>Astra-authored</strong> — work made directly through Astra and local tools.</p>
            <p><strong>Astra-orchestrated external</strong> — specialist generation called or directed by Astra.</p>
          </div>
        </section>

        <section id="evidence" className="evidence-section" aria-labelledby="evidence-title">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Research record</p>
              <h2 id="evidence-title">Evidence before conclusions</h2>
            </div>
            <p>
              The website attributes output to Astra only when persisted private session
              evidence verifies the model, provider, and billing provider. Sol-authored
              setup, rendering, review, and integration remain separately attributed.
            </p>
          </div>
          <div className="evidence-grid">
            <article>
              <p className="eyebrow">Accepted Safe runtime</p>
              <strong>9.24 MB</strong>
              <span>runtime GLB</span>
            </article>
            <article>
              <p className="eyebrow">Scene complexity</p>
              <strong>549,351</strong>
              <span>submitted triangle indices / pass</span>
            </article>
            <article>
              <p className="eyebrow">Configurations</p>
              <strong>4</strong>
              <span>three supplied + Estuary</span>
            </article>
            <article>
              <p className="eyebrow">Recorded runs</p>
              <strong>{studyData.summary.astraRunCount}</strong>
              <span>Astra runs so far</span>
            </article>
          </div>

          <div className="failure-panel">
            <p className="eyebrow">Required disclosure</p>
            <h2>What failed</h2>
            <p>
              Phase 1 standalone geometry authoring was not performed because Blender was
              unavailable; later Safe geometry optimization used a pinned non-Blender toolchain.
              Initial Safe attempts failed visual review before the FINAL repair was accepted.
              High-resolution software-renderer capture proved impractical,
              and several close-ups required documented camera repair. Runtime timing is
              diagnostic only and is not presented as production-GPU performance.
            </p>
          </div>

          <div className="run-log" aria-labelledby="run-log-title">
            <p className="eyebrow">Machine-validated ledger</p>
            <h2 id="run-log-title">Run log</h2>
            {studyData.runs.map((run) => (
              <article key={run.id}>
                <div>
                  <span className={`outcome outcome-${run.outcome}`}>
                    {run.outcome.replaceAll('_', ' ')}
                  </span>
                  <h3>{run.title}</h3>
                </div>
                <p>{run.publicSummary}</p>
                <dl>
                  <div><dt>Model</dt><dd>{run.model}</dd></div>
                  <div><dt>Intervention</dt><dd>Level {run.interventionLevel}</dd></div>
                  <div><dt>Package</dt><dd>{run.workPackage}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="streaming-section" aria-labelledby="streaming-title">
          <div>
            <p className="eyebrow">Output 03 · Future track</p>
            <h2 id="streaming-title">Streamed engine configurator</h2>
          </div>
          <div className="deferred-card">
            <span>Deferred — not implemented</span>
            <p>
              Unity or Unreal streaming will be considered only when a measured browser
              limitation, target concurrency, budget, and operating plan are explicit.
            </p>
          </div>
        </section>

        <section className="credits-section" aria-labelledby="credits-title">
          <p className="eyebrow">Attribution</p>
          <h2 id="credits-title">Credits</h2>
          <p>
            Original public-domain concept model by Unity Fan; DGG is credited in the
            upstream metadata; glTF conversion, material work, and optimization by Eric
            Chadwick. The supplied CarConcept package is licensed CC BY 4.0, excluding
            logos and trademarks. No endorsement is implied.
          </p>
          <p>Project derivatives remove mark-bearing nodes; Astra authored Estuary Enamel and directed Safe geometry optimization.
            Sol authored comparison captures, refined lighting, public preview copying and integration.
            These model-derived images retain the source attribution and license; no legal certification is claimed.</p>
          <p><a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 license</a>{' · '}
            <a href="/licenses/Basis-Universal-APACHE-2.0.txt">Basis Universal Apache 2.0 license</a>{' · '}
            <a href="/licenses/Basis-Universal-NOTICE.md">Basis Universal NOTICE</a></p>
          <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept">
            View the immutable upstream source
          </a>
        </section>
      </main>

      <footer>
        <span>AI-assisted 3D Workflow Lab · Research build</span>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}
