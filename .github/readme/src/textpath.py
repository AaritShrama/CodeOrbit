"""Turn text into SVG path data (with real kerning) so the README graphics look
identical on every computer, without depending on installed fonts."""
import re
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

import os
# Folder with the font files (see README.md in this folder)
F = os.environ.get('CODEORBIT_FONTS', os.path.join(os.path.dirname(__file__), 'fonts'))
FONTS = {
    'black': f'{F}/Inter_900Black.ttf',
    'xbold': f'{F}/Inter_800ExtraBold.ttf',
    'bold': f'{F}/Inter_700Bold.ttf',
    'medium': f'{F}/Inter_500Medium.ttf',
    'regular': f'{F}/Inter_400Regular.ttf',
    'mono': f'{F}/JetBrainsMono_500Medium.ttf',
}
_cache = {}


def _load(name):
    if name not in _cache:
        path = FONTS[name]
        blob = hb.Blob.from_file_path(path)
        face = hb.Face(blob)
        font = hb.Font(face)
        tt = TTFont(path)
        _cache[name] = (font, tt, tt['head'].unitsPerEm, tt.getGlyphSet(), tt.getGlyphOrder())
    return _cache[name]


def text_path(text, font='bold', size=32, x=0, y=0, tracking=0.0):
    """Return (path_d, width). x,y = left baseline. tracking in em (e.g. 0.12)."""
    hbfont, tt, upem, gset, order = _load(font)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True, 'liga': True})
    scale = size / upem
    pen_x = 0.0
    parts = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        gname = order[info.codepoint]
        svgpen = SVGPathPen(gset)
        tpen = TransformPen(
            svgpen,
            (scale, 0, 0, -scale, x + (pen_x + pos.x_offset) * scale, y - pos.y_offset * scale),
        )
        gset[gname].draw(tpen)
        d = re.sub(r'-?\d+\.\d+', lambda m: ('%.1f' % float(m.group())).rstrip('0').rstrip('.'), svgpen.getCommands())
        if d:
            parts.append(d)
        pen_x += pos.x_advance + tracking * upem
    width = (pen_x - tracking * upem) * scale
    return ' '.join(parts), width


def text(t, font='bold', size=32, x=0, y=0, tracking=0.0, fill='#fff', cls='', anchor='start', extra=''):
    """SVG <path> element for a line of text. anchor: start|middle|end."""
    _, w = text_path(t, font, size, 0, 0, tracking)
    if anchor == 'middle':
        x -= w / 2
    elif anchor == 'end':
        x -= w
    d, _ = text_path(t, font, size, x, y, tracking)
    c = f' class="{cls}"' if cls else ''
    return f'<path{c} fill="{fill}" d="{d}"{extra}><title>{t}</title></path>', w
