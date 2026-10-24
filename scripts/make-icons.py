"""Regenerates the PWA icons in pwa/icons (run: python3 scripts/make-icons.py). Needs Pillow."""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'pwa', 'icons')
TOP, BOTTOM = (132, 144, 232), (84, 98, 200)  # around the app accent #6C79DB
SS = 4  # supersampling factor for smooth edges


def render(size, scale):
    """Full-bleed square (iOS/Android round the corners). `scale` shrinks the artwork for maskable icons."""
    s = size * SS
    img = Image.new('RGB', (s, s))
    px = ImageDraw.Draw(img)
    for y in range(s):
        t = y / (s - 1)
        px.line([(0, y), (s, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    d = ImageDraw.Draw(img)
    c = s / 2
    unit = s * scale

    def circle(r, **kw):
        d.ellipse([c - r, c - r, c + r, c + r], **kw)

    circle(unit * 0.31, outline='white', width=round(unit * 0.095))      # lens ring
    circle(unit * 0.115, fill='white')                                   # centre
    circle(unit * 0.05, fill=tuple(round(v) for v in (108, 121, 219)))   # pupil
    return img.resize((size, size), Image.LANCZOS)


for name, size, scale in [
    ('icon-192.png', 192, 1.0),
    ('icon-512.png', 512, 1.0),
    ('icon-maskable-512.png', 512, 0.8),
    ('apple-touch-icon.png', 180, 1.0),
]:
    render(size, scale).save(os.path.join(OUT, name))
    print('wrote', name)
