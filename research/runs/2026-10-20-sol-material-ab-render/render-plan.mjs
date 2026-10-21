import { createHash } from 'node:crypto';

export const candidates = Object.freeze([
  Object.freeze({
    id: 'estuary-enamel-candidate',
    name: 'Estuary Enamel',
    variant: 'Estuary Enamel',
    sha256: 'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f',
    bytes: 10191496,
    url: '/research/runs/2026-10-20-astra-material-estuary-49b949/candidate.glb',
  }),
  Object.freeze({
    id: 'fjord-enamel-candidate',
    name: 'Fjord Enamel',
    variant: 'Fjord Enamel',
    sha256: '1eaba8fe0cbecfcf45a0ec83337979f6db1bb08ad98b6cef8de6d97e9ab790c3',
    bytes: 10191212,
    url: '/research/runs/2026-10-20-astra-material-fjord-ef457b/candidate.glb',
  }),
]);

export const exteriorViews = Object.freeze([
  'front-three-quarter',
  'side',
  'rear-three-quarter',
]);

export const secondaryPaintSurfaces = Object.freeze([
  'BodyRoofPanel',
  'BodyPanelsColor2',
  'BodyHoodTopgrill',
  'BodyDoorRColor2',
  'BodyDoorRHandle02',
  'BodyDoorRMirrorColor2',
  'BodyDoorLColor2',
  'BodyDoorLHandle02',
  'BodyDoorLMirrorColor2',
]);

const blindProtocol = 'material-ab-v1:hash-pinned:fixed-camera-light-exposure-tone-map';

export function assignBlindLabels(input) {
  return input
    .map((candidate) => ({
      ...candidate,
      score: createHash('sha256')
        .update(`${blindProtocol}\0${candidate.sha256}`)
        .digest('hex'),
    }))
    .sort((left, right) => left.score.localeCompare(right.score))
    .map(({ score: _score, ...candidate }, index) => ({
      label: String.fromCharCode(65 + index),
      ...candidate,
    }));
}

export function buildRenderPlan(input = candidates) {
  return assignBlindLabels(input).flatMap((candidate) => {
    const exterior = ['viewer', 'neutral'].flatMap((lighting) =>
      exteriorViews.map((view) => ({
        label: candidate.label,
        candidate,
        kind: 'exterior',
        lighting,
        view,
        filename: `${candidate.label}--${lighting}--${view}.png`,
      })),
    );
    const closeups = secondaryPaintSurfaces.map((view, index) => ({
      label: candidate.label,
      candidate,
      kind: 'closeup',
      lighting: 'neutral',
      view,
      filename: `${candidate.label}--neutral--closeup-${String(index + 1).padStart(2, '0')}.png`,
    }));
    return [...exterior, ...closeups];
  });
}
