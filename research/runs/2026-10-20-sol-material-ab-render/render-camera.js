export function closeupCameraSpec(name, center, size) {
  const radius = Math.max(Math.hypot(...size) / 2, 0.06);
  const fov = 28;
  const rawDistance = (radius / Math.tan((fov * Math.PI) / 360)) * 1.45;
  const isSideSurface = /Door|Mirror/.test(name);
  const side = Math.sign(center[0]) || 1;
  const direction = isSideSurface ? [side, 0.25, 0.1] : [0.8, 0.8, 1];
  const minimum = /Mirror/.test(name) ? 1.2 : 1;
  return {
    direction,
    distance: Math.min(3.2, Math.max(minimum, rawDistance)),
    fov,
  };
}
