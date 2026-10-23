import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGeometryBaselinePlan } from './render-plan.mjs';

test('geometry baseline plan balances lineage views and isolates wireframe mode', () => {
  const plan = buildGeometryBaselinePlan();

  assert.equal(plan.length, 4);
  assert.equal(new Set(plan.map(({ filename }) => filename)).size, 4);
  assert.deepEqual(
    plan.map(({ id, assetId, model, variant, mode, view, filename }) => ({
      id,
      assetId,
      model,
      variant,
      mode,
      view,
      filename,
    })),
    [
      {
        id: 'source',
        assetId: 'primary-product',
        model: '/research/assets/upstream/CarConcept.glb',
        variant: 'Carmine Candy',
        mode: 'shaded',
        view: 'front-three-quarter',
        filename: 'source-overview.png',
      },
      {
        id: 'sanitized',
        assetId: 'web-product',
        model: '/assets/models/product.glb',
        variant: 'Carmine Candy',
        mode: 'shaded',
        view: 'front-three-quarter',
        filename: 'sanitized-overview.png',
      },
      {
        id: 'estuary',
        assetId: 'web-product-estuary',
        model: '/assets/models/product-estuary.glb',
        variant: 'Estuary Enamel',
        mode: 'shaded',
        view: 'front-three-quarter',
        filename: 'estuary-overview.png',
      },
      {
        id: 'wireframe-detail',
        assetId: 'web-product-estuary',
        model: '/assets/models/product-estuary.glb',
        variant: 'Estuary Enamel',
        mode: 'wireframe',
        view: 'WheelFrontL',
        filename: 'wireframe-wheel-detail.png',
      },
    ],
  );
  assert(plan.every(({ width, height }) => width === 600 && height === 400));
});
