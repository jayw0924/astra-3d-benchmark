import unittest
from pathlib import Path
from PIL import Image
from composite import composite, fit_background, validate

HERE = Path(__file__).parent
class CompositeTests(unittest.TestCase):
    def setUp(self):
        self.source = Image.open(HERE/'source.png').convert('RGB')
        self.mask = Image.open(HERE/'mask.png').convert('L')
    def test_source_background_identity(self):
        result = composite(self.source, self.mask, self.source)
        self.assertEqual(result.tobytes(), self.source.tobytes())
    def test_native_guard(self):
        with self.assertRaises(ValueError): validate(self.source.crop((0,0,849,778)), self.mask)
    def test_mask_guard(self):
        with self.assertRaises(ValueError): validate(self.source, self.mask.crop((0,0,849,778)))
    def test_qwen_mismatch_stops(self):
        # A size-only technical fixture, not a purported generated image.
        with self.assertRaises(ValueError): fit_background(Image.new('RGB',(864,768)), 'strict')
    def test_background_only_explicit_cover(self):
        bg, transform = fit_background(self.source.crop((0,0,800,700)), 'cover')
        self.assertEqual(bg.size,(850,778))
        self.assertEqual(transform['policy'],'cover')
        self.assertEqual(self.source.size,(850,778))
    def test_actual_mask_protects_pixels(self):
        # Source background itself only; never use a fabricated generation.
        result = composite(self.source,self.mask,self.source)
        a,b,m = self.source.load(),result.load(),self.mask.load()
        self.assertTrue(all(a[x,y]==b[x,y] for y in range(778) for x in range(850) if m[x,y]==255))
if __name__ == '__main__': unittest.main()
