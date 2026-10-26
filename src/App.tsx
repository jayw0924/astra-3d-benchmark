import { lazy, Suspense } from 'react';
import studyData from './generated/study-data.json';

const Configurator = lazy(() => import('./components/Configurator'));

const workPackages = [
  ['01', 'Inspect', 'Verified asset hierarchy, materials, extensions, dimensions, and web risks.'],
  ['02', 'Author', 'Two material candidates and a corrected Safe geometry derivative; failures retained.'],
  ['03', 'Render', 'Thirty controlled browser renders with fixed, reproducible settings.'],
  ['04', 'Integrate', 'The accepted Safe model in a tested desktop and mobile browser configurator.'],
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
        <a className="wordmark" href="#top" aria-label="Astra 3D benchmark home">
          A3D / 01
        </a>
        <nav aria-label="Study navigation">
          <a href="#geometry">Geometry</a>
          <a href="#configurator">Configurator</a>
          <a href="#methods">Methods</a>
          <a href="#evidence">Evidence</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">AI-assisted 3D workflow study · Case 01</p>
            <h1 id="hero-title">Astra 3D benchmark</h1>
            <p className="lede">
              A transparent experiment in product visualization: source a real asset,
              direct an AI-assisted 3D workflow, ship an interactive result, and keep
              the failures visible.
            </p>
          </div>
          <aside className="study-status" aria-label="Study status">
            <span className="status-dot" aria-hidden="true" />
            <div>
              <strong>Safe result integrated locally</strong>
              <p>{studyData.summary.astraRunCount} verified Astra runs · Safe geometry integrated</p>
            </div>
          </aside>
          <div className="hero-object" aria-label="Selected benchmark object">
            <span>Primary subject</span>
            <strong>CarConcept</strong>
            <small>CC BY 4.0 · Khronos sample asset</small>
          </div>
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
            <p className="eyebrow">Current viewer · refined lighting</p>
            <h2 id="current-preview-title">Refined viewer preview</h2>
            <p>Existing Sol Chromium capture at native 850×778; not a controlled before/after comparison.
              Source: 2026-10-26-sol-lighting-integration. Safe GLB and materials are unchanged.</p>
          </div>
          <article className="render-card">
            <img src="/assets/viewer/refined-estuary-native.png" alt="Current refined viewer: Estuary Enamel" width="850" height="778" loading="lazy" />
            <div className="render-card-body"><p>Sol-authored lighting and capture; sourced CarConcept, Astra Estuary material and Safe geometry credits retained.</p></div>
          </article>
        </section>

        <section id="safe-result" className="geometry-section" aria-labelledby="safe-title">
          <div className="section-heading">
            <p className="eyebrow">Decision · Accepted and integrated locally</p>
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
          <ol className="method-list">
            {workPackages.map(([number, title, copy]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
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
        <span>Astra 3D benchmark · Research build</span>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}
