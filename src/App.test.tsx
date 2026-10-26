import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('distinguishes current refined preview from historical evidence and discloses lighting authorship', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Historical material comparison' })).toBeVisible();
    const preview = screen.getByRole('img', { name: 'Current refined viewer: Estuary Enamel' });
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
