const shared = {
  view: 'front-three-quarter',
  width: 600,
  height: 400,
};

export function buildGeometryBaselinePlan() {
  return [
    {
      ...shared,
      id: 'source',
      assetId: 'primary-product',
      model: '/research/assets/upstream/CarConcept.glb',
      variant: 'Carmine Candy',
      mode: 'shaded',
      filename: 'source-overview.png',
    },
    {
      ...shared,
      id: 'sanitized',
      assetId: 'web-product',
      model: '/assets/models/product.glb',
      variant: 'Carmine Candy',
      mode: 'shaded',
      filename: 'sanitized-overview.png',
    },
    {
      ...shared,
      id: 'estuary',
      assetId: 'web-product-estuary',
      model: '/assets/models/product-estuary.glb',
      variant: 'Estuary Enamel',
      mode: 'shaded',
      filename: 'estuary-overview.png',
    },
    {
      ...shared,
      id: 'wireframe-detail',
      assetId: 'web-product-estuary',
      model: '/assets/models/product-estuary.glb',
      variant: 'Estuary Enamel',
      mode: 'wireframe',
      view: 'WheelFrontL',
      filename: 'wireframe-wheel-detail.png',
    },
  ];
}
