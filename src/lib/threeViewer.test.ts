import {
  BoxGeometry,
  GridHelper,
  Group,
  Mesh,
  MeshStandardMaterial,
  Texture,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeObject } from './threeViewer';

describe('disposeObject', () => {
  it('disposes attached and detached materials with their textures exactly once', () => {
    const sharedTexture = new Texture();
    const attachedMaterial = new MeshStandardMaterial({ map: sharedTexture });
    const detachedVariant = new MeshStandardMaterial({ normalMap: sharedTexture });
    const geometry = new BoxGeometry();
    const root = new Group();
    root.add(new Mesh(geometry, attachedMaterial));
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const attachedDispose = vi.spyOn(attachedMaterial, 'dispose');
    const detachedDispose = vi.spyOn(detachedVariant, 'dispose');
    const textureDispose = vi.spyOn(sharedTexture, 'dispose');

    disposeObject(root, [detachedVariant]);

    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(attachedDispose).toHaveBeenCalledOnce();
    expect(detachedDispose).toHaveBeenCalledOnce();
    expect(textureDispose).toHaveBeenCalledOnce();
  });

  it('disposes non-mesh viewer helpers such as the grid', () => {
    const root = new Group();
    const grid = new GridHelper();
    root.add(grid);
    const geometryDispose = vi.spyOn(grid.geometry, 'dispose');
    const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
    const materialDisposals = materials.map((material) => vi.spyOn(material, 'dispose'));

    disposeObject(root);

    expect(geometryDispose).toHaveBeenCalledOnce();
    for (const dispose of materialDisposals) expect(dispose).toHaveBeenCalledOnce();
  });
});
