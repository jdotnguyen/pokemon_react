"""Regenerates the PWA icons and favicon in pwa/icons (run: python3 scripts/make-icons.py). Needs Pillow.

Home-screen icons: a Pokéball on the app's accent gradient (full-bleed square; iOS/Android round the
corners). Favicon: the Pokéball alone on a transparent background, plus an SVG version for crisp tabs.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'pwa', 'icons')
TOP, BOTTOM = (132, 144, 232), (84, 98, 200)  # around the app accent #6C79DB
RED, WHITE, INK = (238, 75, 75), (255, 255, 255), (31, 42, 55)  # #EE4B4B, white, #1F2A37
SS = 4  # supersampling factor for smooth edges


def pokeball(d, cx, cy, r):
    """Draw a Pokéball of outer radius r (outline included) centred on (cx, cy)."""
    line = r * 0.15
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=INK)                    # outline
    ri = r - line
    d.pieslice([cx - ri, cy - ri, cx + ri, cy + ri], 180, 360, fill=RED)     # top half
    d.pieslice([cx - ri, cy - ri, cx + ri, cy + ri], 0, 180, fill=WHITE)     # bottom half
    d.rectangle([cx - r, cy - line / 2, cx + r, cy + line / 2], fill=INK)    # band
    d.ellipse([cx - r * 0.33, cy - r * 0.33, cx + r * 0.33, cy + r * 0.33], fill=INK)
    d.ellipse([cx - r * 0.19, cy - r * 0.19, cx + r * 0.19, cy + r * 0.19], fill=WHITE)


def app_icon(size, scale):
    """`scale` shrinks the artwork for maskable icons (Android crops to a circle)."""
    s = size * SS
    img = Image.new('RGB', (s, s))
    d = ImageDraw.Draw(img)
    for y in range(s):
        t = y / (s - 1)
        d.line([(0, y), (s, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    pokeball(d, s / 2, s / 2, s * scale * 0.34)
    return img.resize((size, size), Image.LANCZOS)


def favicon(size):
    s = size * SS
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    pokeball(ImageDraw.Draw(img), s / 2, s / 2, s / 2 - SS)
    return img.resize((size, size), Image.LANCZOS)


SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 4a46 46 0 0 1 46 46H4A46 46 0 0 1 50 4z" fill="#EE4B4B"/>
  <path d="M4 50h92a46 46 0 0 1-92 0z" fill="#fff"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#1F2A37" stroke-width="7"/>
  <path d="M4 50h92" stroke="#1F2A37" stroke-width="7"/>
  <circle cx="50" cy="50" r="15" fill="#1F2A37"/>
  <circle cx="50" cy="50" r="8.5" fill="#fff"/>
</svg>
'''

if __name__ == '__main__':
    for name, size, scale in [
        ('icon-192.png', 192, 1.0),
        ('icon-512.png', 512, 1.0),
        ('icon-maskable-512.png', 512, 0.8),
        ('apple-touch-icon.png', 180, 1.0),
    ]:
        app_icon(size, scale).save(os.path.join(OUT, name))
        print('wrote', name)
    favicon(196).save(os.path.join(OUT, 'favicon.png'))
    print('wrote favicon.png')
    with open(os.path.join(OUT, 'favicon.svg'), 'w') as f:
        f.write(SVG)
    print('wrote favicon.svg')
