import test from 'node:test';
import assert from 'node:assert/strict';
import { closeupCameraSpec } from './render-camera.js';

test('side close-up camera stays outside the surface using its actual world-space side', () => {
  const leftNamedButPositiveX = closeupCameraSpec(
    'BodyDoorLHandle02',
    [1.2, 0.7, 0.1],
    [0.08, 0.04, 0.12],
  );
  assert(leftNamedButPositiveX.direction[0] > 0);
  assert(leftNamedButPositiveX.distance >= 1);

  const rightNamedButNegativeX = closeupCameraSpec(
    'BodyDoorRMirrorColor2',
    [-1.1, 0.9, 0.2],
    [0.2, 0.2, 0.25],
  );
  assert(rightNamedButNegativeX.direction[0] < 0);
  assert(rightNamedButNegativeX.distance >= 1.2);
});

test('large secondary surfaces remain close enough to read as details', () => {
  const spec = closeupCameraSpec('BodyPanelsColor2', [0, 0.6, 0], [2.5, 1, 4]);
  assert(spec.distance <= 3.2);
  assert.equal(spec.fov, 28);
});
