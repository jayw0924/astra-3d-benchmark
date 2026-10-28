import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('publishes the actual rear workflow screenshot with native same-origin access', () => {
    render(<App />);
    const workflow = screen.getByRole('group', { name: 'How the image was made' });
    const image = within(workflow).getByRole('img', { name: 'Actual Comfy Cloud rear three-quarter workflow: load image, Qwen edit, save and compare' });
    const path = '/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png';
    expect(image).toHaveAttribute('src', path);
    expect(image).toHaveAttribute('width', '2400');
    expect(image).toHaveAttribute('height', '1200');
    expect(image.closest('a')).toHaveAttribute('href', path);
    expect(within(workflow).getByText(/small node text.*retained machine-readable graphs/i)).toBeVisible();
    expect(within(workflow).getByText(/screenshot credit:.*ComfyUI interface.*not.*rights certification/i)).toBeVisible();
    expect(within(workflow).getByRole('link', { name: 'Open native workflow screenshot (2400 × 1200)' })).toHaveAttribute('href', path);
    expect(within(workflow).getByText(/overview, not proof of precise settings or every run/i)).toBeVisible();
  });
  it('indexes six study stages with inputs, tools, roles, status and real evidence anchors', () => {
    render(<App />);
    const index = screen.getByRole('group', { name: 'Study-wide workflow index' });
    const stages = within(index).getAllByRole('listitem');
    expect(stages).toHaveLength(6);
    expect(stages.map((stage) => within(stage).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Intake & sanitize', 'Material authoring', 'Geometry optimization', 'Lighting & grounding', 'AI imagery', 'Completed image follow-ons',
    ]);
    for (const stage of stages) {
      for (const label of ['Input → output', 'Tools & roles', 'Status']) {
        expect(within(stage).getByText(label, { exact: true })).toBeInTheDocument();
      }
      for (const link of within(stage).getAllByRole('link')) {
        const href = link.getAttribute('href')!;
        expect(href.startsWith('#')).toBe(true);
        expect(document.getElementById(href.slice(1))).not.toBeNull();
      }
    }
    expect(stages[4]).toHaveTextContent('Qwen generation; Sol guidance/review; Jay UI execution');
    expect(stages[5]).toHaveTextContent('Four follow-ons completed');
    expect(stages[5]).toHaveTextContent('Case 02: Blender-first');
  });
  it('explains the adapted image workflow before technical details without claiming original model authorship', () => {
    render(<App />);
    const workflow = screen.getByRole('group', { name: 'How the image was made' });
    expect(within(workflow).getByText(/one existing image-edit template/i)).toBeVisible();
    expect(within(workflow).getByText(/single original viewer image/i)).toBeVisible();
    expect(within(workflow).getByText(/prompt refinement off/i)).toBeVisible();
    expect(within(workflow).getByText(/not five independently designed workflows/i)).toBeVisible();
    expect(within(workflow).getByRole('link', { name: 'Comfy-Org workflow templates' })).toHaveAttribute('href', 'https://github.com/Comfy-Org/workflow_templates');
    expect(within(workflow).getByText(/Qwen team.*not this project/i)).toBeVisible();
    const details = screen.getByText('Technical settings, cloud failure and provenance limits');
    expect(workflow.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it('separates the complete bounded Qwen comparison from 3D results', () => {
    render(<App />);
    const section = screen.getByRole('region', { name: 'AI-enhanced imagery' });
    expect(within(section).getByRole('img', { name: 'Original Carmine viewer input' })).toHaveAttribute('src', '/assets/study/ai-imagery/after-Carmine-side.png');
    expect(within(section).getByRole('img', { name: 'First Qwen Image 2.1 interpretation' })).toHaveAttribute('src', '/assets/study/ai-imagery/Qwen_image_2.1_00001.png');
    expect(within(section).getByText(/not mesh or material improvement/)).toBeVisible();
    expect(within(within(section).getByRole('group', { name: 'Side-view seed variation' })).getAllByRole('img')).toHaveLength(4);
    const angles = within(section).getByRole('group', { name: 'Two-angle comparison' });
    expect(within(angles).getAllByRole('img')).toHaveLength(4);
    for (const angle of ['Front', 'Rear']) {
      expect(within(angles).getByRole('img', { name: `${angle} three-quarter source` })).toHaveAttribute('width', '850');
      expect(within(angles).getByRole('img', { name: `${angle} three-quarter Qwen interpretation · seed 42` })).toHaveAttribute('width', '864');
    }
    expect(within(angles).getByText(/not evidence of coherent 3D/)).toBeVisible();
    expect(within(angles).getByText(/The four follow-on conditions are now completed/)).toBeVisible();
    expect(within(section).getByRole('img', { name: 'Qwen interpretation · seed 42' })).toHaveAttribute('src', '/assets/study/ai-imagery/Qwen_image_2.1_seed42.png');
    expect(within(section).getByRole('img', { name: 'Qwen interpretation · seed 12345' })).toHaveAttribute('src', '/assets/study/ai-imagery/Qwen_image_2.1_seed12345.png');
    expect(within(section).getByText(/Two additional successful outputs/)).toBeVisible();
    expect(within(section).getByText(/No winner has been selected/)).toBeVisible();
    expect(within(section).getByRole('heading', { name: 'First interpretation · seed 891836227295375 · 864×768' })).toBeVisible();
    expect(within(section).getByText(/Qwen Image 2.1 image generation; Sol prompt and guidance; Jay/)).toBeVisible();
    expect(within(section).getByText(/not an aligned pixel comparison/)).toBeVisible();
  });
  it('distinguishes current refined preview from historical evidence and discloses lighting authorship', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Historical material comparison' })).toBeVisible();
    const preview = screen.getByRole('img', { name: 'Pre-ground-correction refined viewer: Estuary Enamel' });
    expect(preview).toHaveAttribute('src', '/assets/viewer/refined-estuary-native.png');
    expect(preview).toHaveAttribute('width', '850');
    expect(preview).toHaveAttribute('height', '778');
    expect(screen.getByText(/not a controlled before\/after comparison/i)).toBeVisible();
    expect(screen.getByText(/72 initial lighting captures, 32 refinement captures, and 16 paired comparisons/)).toBeVisible();
    expect(screen.getByText(/Jay.*subjective approval/)).toBeVisible();
    expect(screen.getByText(/unavailable.*not reconstructed/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'CC BY 4.0 license' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect(screen.getByRole('link', { name: 'Basis Universal Apache 2.0 license' })).toHaveAttribute('href', '/licenses/Basis-Universal-APACHE-2.0.txt');
    expect(screen.getByRole('link', { name: 'Basis Universal NOTICE' })).toHaveAttribute('href', '/licenses/Basis-Universal-NOTICE.md');
    expect(screen.queryByText(/Each run records the exact model/)).not.toBeInTheDocument();
  });
  it('qualifies the retained preview and reports grounding-only approval', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: 'Pre-ground-correction refined viewer: Estuary Enamel' })).toBeVisible();
    expect(screen.getByText(/This retained preview predates the ground-contact correction/)).toBeVisible();
    expect(within(screen.getByRole('region', { name: 'Methods' })).getByText(/yes tires feel planted/)).toBeVisible();
    expect(screen.getByText(/Historical desktop-before telemetry remains unavailable/)).toBeVisible();
  });
  it('publishes the accepted Safe result with fixed-view limits and historical control', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Accepted Safe geometry' })).toBeVisible();
    expect(screen.getByText(/9.34% smaller payload/)).toBeVisible();
    expect(screen.getByText(/183,117 triangles/)).toBeVisible();
    expect(screen.getByText(/144,888 distinct POSITION/)).toBeVisible();
    expect(screen.getByText(/549,351 submitted triangle indices/)).toBeVisible();
    expect(screen.getByText(/Historical control — not the current runtime/)).toBeVisible();
    expect(screen.getByText(/No runtime speedup is established/)).toBeVisible();
    for (const stage of ['Before: control', 'First attempt: rejected', 'Final: accepted']) {
      expect(screen.getByRole('img', { name: stage })).toBeInTheDocument();
    }
  });
  it('presents outputs, methods, evidence, and deferred streaming honestly', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Astra 3D benchmark/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /real-time configurator/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /methods/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what failed/i })).toBeInTheDocument();
    expect(screen.getByText(/Deferred — not implemented/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: /credits/i })).toBeInTheDocument();
  });

  it('presents the completed Estuary integration instead of pending placeholders', () => {
    render(<App />);

    expect(screen.getByText('Safe result integrated locally')).toBeVisible();
    expect(screen.getByText(/\d+ verified Astra runs · Safe geometry integrated/i)).toBeVisible();
    expect(screen.getByText(/30 controlled browser renders/i)).toBeVisible();
    expect(screen.getByText(/three supplied finishes plus Estuary Enamel/i)).toBeVisible();
    expect(screen.getByText(/standalone geometry authoring was not performed/i)).toBeVisible();
    expect(screen.queryByText(/production runs pending/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awaiting verified run/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no Astra production run has been conducted/i)).not.toBeInTheDocument();
  });

  it('shows the selected Estuary render studies as real images', () => {
    render(<App />);

    expect(screen.getByRole('img', { name: /Estuary Enamel under the configurator lighting/i }))
      .toHaveAttribute('src', '/assets/renders/estuary-viewer-front-three-quarter.png');
    expect(screen.getByRole('img', { name: /Estuary Enamel under neutral lighting/i }))
      .toHaveAttribute('src', '/assets/renders/estuary-neutral-front-three-quarter.png');
    expect(screen.getByRole('img', { name: /Estuary Enamel paint and mirror close-up/i }))
      .toHaveAttribute('src', '/assets/renders/estuary-neutral-closeup.png');
  });

  it('publishes the source lineage and exact geometry baseline', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Geometry baseline' })).toBeVisible();
    expect(screen.getByText(/213,195 triangles/i)).toBeVisible();
    expect(screen.getByText(/162,646 distinct position accessor entries/i)).toBeVisible();
    expect(screen.getByText(/639,585 submitted triangle indices/i)).toBeVisible();
    expect(screen.getByText('107 primitives')).toBeVisible();
    expect(screen.getByText(/named, separable parts/i)).toBeVisible();
    expect(screen.queryByText(/render vertices/i)).not.toBeInTheDocument();

    expect(screen.getByRole('img', { name: /raw licensed CarConcept source/i }))
      .toHaveAttribute('src', '/assets/study/geometry/source-overview.png');
    expect(screen.getByRole('img', { name: /sanitized CarConcept web baseline/i }))
      .toHaveAttribute('src', '/assets/study/geometry/sanitized-overview.png');
    expect(screen.getByRole('img', { name: /integrated Estuary geometry control/i }))
      .toHaveAttribute('src', '/assets/study/geometry/estuary-overview.png');
    expect(screen.getByRole('img', { name: /front wheel topology detail/i }))
      .toHaveAttribute('src', '/assets/study/geometry/wireframe-wheel-detail.png');
  });
});
