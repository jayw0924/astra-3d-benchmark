"""Native black shadow alpha on fitted plate, then immutable source protection."""
from PIL import Image

def blend_shadow(background, layer):
    if background.size != layer.size or layer.mode != 'RGBA':
        raise ValueError('Native matching RGBA shadow required')
    if any(r or g or b for r,g,b,a in layer.get_flattened_data()):
        raise ValueError('Shadow-only layer must be black; not an RGB floor patch')
    return Image.alpha_composite(background.convert('RGBA'),layer).convert('RGB')

def protected_composite(source, mask, background, layer):
    if source.size != mask.size or source.size != background.size or mask.mode != 'L':
        raise ValueError('Native matching source/mask/plate required')
    if set(mask.get_flattened_data()) - {0,255}:
        raise ValueError('Protection must be binary, never feathered')
    return Image.composite(source,blend_shadow(background,layer),mask)
