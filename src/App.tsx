import { lazy, Suspense } from 'react';
import studyData from './generated/study-data.json';

const Configurator = lazy(() => import('./components/Configurator'));

const workPackages = [
  ['01', 'Inspect', 'Verified asset hierarchy, materials, extensions, dimensions, and web risks.'],
  ['02', 'Author', 'Two deterministic material candidates; standalone geometry was not performed.'],
  ['03', 'Render', 'Thirty controlled browser renders with fixed, reproducible settings.'],
  ['04', 'Integrate', 'The selected finish in a tested desktop and mobile browser configurator.'],
];

const renderStudies = [
  {
    title: 'Viewer-light study',
    src: '/assets/renders/estuary-viewer-front-three-quarter.png',
    alt: 'Estuary Enamel under the configurator lighting, front three-quarter view',
  },
  {
    title: 'Neutral-light study',
    src: '/assets/renders/estuary-neutral-front-three-quarter.png',
    alt: 'Estuary Enamel under neutral lighting, front three-quarter view',
  },
  {
    title: 'Material close-ups',
    src: '/assets/renders/estuary-neutral-closeup.png',
    alt: 'Estuary Enamel paint and mirror close-up under neutral lighting',
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
              <strong>Phase 1 complete</strong>
              <p>{studyData.summary.astraRunCount} verified Astra runs · Estuary integrated</p>
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
            <h2 id="output-title">Rendered studies</h2>
            <p>
              The comparison package contains 30 controlled browser renders covering
              two material candidates, two light rigs, exterior views, and close-ups.
            </p>
          </div>
          <div className="render-grid" aria-label="Render study status">
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
                  <p className="eyebrow">Captured and verified</p>
                    <h3>{study.title}</h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
              emblem nodes are removed from the served derivative.
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
              Each run records the exact model, tools, inputs, prompt, elapsed time,
              cost basis, human intervention, outputs, and failure notes.
            </p>
          </div>
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
              <p className="eyebrow">Verified baseline</p>
              <strong>10.19 MB</strong>
              <span>runtime GLB</span>
            </article>
            <article>
              <p className="eyebrow">Scene complexity</p>
              <strong>640k</strong>
              <span>render vertices / pass</span>
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
              Standalone geometry authoring was not performed because Blender was
              unavailable. High-resolution software-renderer capture proved impractical,
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
