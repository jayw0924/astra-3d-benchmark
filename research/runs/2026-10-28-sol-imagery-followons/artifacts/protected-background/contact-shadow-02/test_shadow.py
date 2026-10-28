import unittest
from PIL import Image
from shadow import blend_shadow, protected_composite

class ShadowBlendTests(unittest.TestCase):
    def test_black_alpha_darkens_only_by_declared_alpha(self):
        bg=Image.new('RGB',(2,1),(200,180,160))
        layer=Image.new('RGBA',(2,1),(0,0,0,0));layer.putpixel((1,0),(0,0,0,51))
        out=blend_shadow(bg,layer)
        self.assertEqual(list(out.get_flattened_data()),[(200,180,160),(160,144,128)])

    def test_source_copy_is_last_even_at_binary_boundaries(self):
        source=Image.new('RGB',(3,1),(231,12,17))
        mask=Image.new('L',(3,1));mask.putdata([255,0,255])
        bg=Image.new('RGB',(3,1),(200,180,160))
        layer=Image.new('RGBA',(3,1),(0,0,0,51))
        out=protected_composite(source,mask,bg,layer)
        self.assertEqual(list(out.get_flattened_data()),[(231,12,17),(160,144,128),(231,12,17)])

if __name__=='__main__': unittest.main()
