"""Builds the animated README graphics for CodeOrbit.
Style: Let's Cook brand (black / white / crimson #B8002F) + space + Swiss design
(strict grid, flush-left grotesque type, numbered sections, mono labels, clean motion).
All motion respects prefers-reduced-motion.
"""
import base64, random, math, os
from textpath import text

import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)  # .github/readme
RED = '#B8002F'
RED_LIGHT = '#E0234E'  # crimson tuned for small text on black
INK = '#0A0A0B'
WHITE = '#F5F5F4'
GREY = '#8A8A8E'
LINE = '#FFFFFF'

REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}'

# Festive touches for the v0.2.0 launch (Diwali, 8 Nov 2026). After the festival set
# THEME = 'default' and rebuild: every graphic goes back to the everyday look.
# diwali.svg (the dated release note) stays either way.
THEME = os.environ.get('CODEORBIT_THEME', 'diwali')
DIWALI = THEME == 'diwali'
GOLD = '#FFB547'
FEST_CSS = (
    '@keyframes burst{0%{opacity:0;transform:scale(.2)}12%{opacity:.9}60%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.1)}}'
    '.burst{transform-box:fill-box;transform-origin:50% 50%;animation:burst 5.2s cubic-bezier(.15,.7,.2,1) infinite}'
) if DIWALI else ''


def bursts(spec):
    """Minimal firework bursts (Diwali theme only). spec: (x, y, radius, colour, delay)."""
    return ''.join(_burst(*b) for b in spec) if DIWALI else ''


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def stars(n, w, h, seed, avoid=None):
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        r = rnd.choice([0.6, 0.8, 0.8, 1.0, 1.2, 1.6])
        op = rnd.uniform(0.25, 0.9)
        dur = rnd.uniform(2.5, 6)
        delay = -rnd.uniform(0, 6)
        out.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="#fff" opacity="{op:.2f}" '
            f'style="animation:tw {dur:.1f}s ease-in-out {delay:.1f}s infinite"/>'
        )
    return '\n'.join(out)


def swiss_grid(w, h, cols=12, margin=72, op=0.05):
    col_w = (w - 2 * margin) / cols
    lines = [
        f'<line x1="{margin + i * col_w:.1f}" y1="0" x2="{margin + i * col_w:.1f}" y2="{h}" />'
        for i in range(cols + 1)
    ]
    return f'<g stroke="#fff" stroke-width="1" opacity="{op}">{"".join(lines)}</g>'


# ---------------------------------------------------------------- HERO
def hero():
    W, H = 1280, 640
    cx, cy = 985, 318
    mark = b64(os.path.join(HERE, 'lc-mark-dark.png'))
    p = []
    p.append(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="CodeOrbit by Let's Cook: track what you learn in coding. Skills, study time, projects and goals in one place. Free, private, no sign-up.">
<style>
@keyframes tw{{0%,100%{{opacity:.15}}50%{{opacity:.95}}}}
@keyframes spin{{to{{transform:rotate(360deg)}}}}
.o{{transform-origin:{cx}px {cy}px}}
.o1{{animation:spin 14s linear infinite}}
.o2{{animation:spin 22s linear infinite reverse}}
.o3{{animation:spin 34s linear infinite}}
.o4{{animation:spin 52s linear infinite reverse}}
{FEST_CSS}
{REDUCED}
</style>
<defs>
  <clipPath id="card"><rect width="{W}" height="{H}" rx="28"/></clipPath>
  <radialGradient id="glow" cx="{cx}" cy="{cy}" r="320" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="{RED}" stop-opacity=".28"/>
    <stop offset=".45" stop-color="{RED}" stop-opacity=".06"/>
    <stop offset="1" stop-color="{RED}" stop-opacity="0"/>
  </radialGradient>
</defs>
<g clip-path="url(#card)">
<rect width="{W}" height="{H}" fill="{INK}"/>
<rect width="{W}" height="{H}" fill="url(#glow)"/>
{swiss_grid(W, H)}
{stars(110, W, H, 7)}
{bursts([(650, 232, 36, GOLD, 0), (1214, 92, 28, RED_LIGHT, 1.7), (690, 520, 22, WHITE, 3.1)])}
''')
    # ---- orbit system (right)
    radii = [86, 136, 186, 236]
    labels = ['SKILLS', 'SESSIONS', 'PROJECTS', 'GOALS']
    for i, r in enumerate(radii):
        dash = ' stroke-dasharray="2 7"' if i == 2 else ''
        col = RED_LIGHT if i == 2 else LINE
        op = '.55' if i == 2 else '.2'
        p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{col}" stroke-opacity="{op}" stroke-width="1.2"{dash}/>')
    # orbit labels (static, Swiss mono tags at 12 o'clock)
    for r, lab in zip(radii, labels):
        t, w = text(lab, 'mono', 10.5, cx, cy - r - 7, 0.14, GREY, anchor='middle')
        p.append(f'<rect x="{cx - w / 2 - 6:.1f}" y="{cy - r - 18:.1f}" width="{w + 12:.1f}" height="15" fill="{INK}"/>')
        p.append(t)
    # planets
    planets = [
        (radii[0], 30, 7, WHITE, 'o1'),
        (radii[1], 200, 9, RED_LIGHT, 'o2'),
        (radii[2], 115, 6, WHITE, 'o3'),
        (radii[2], 295, 4, GREY, 'o3'),
        (radii[3], 250, 10, GOLD if DIWALI else WHITE, 'o4'),
    ]
    for r, ang, size, col, cls in planets:
        a = math.radians(ang)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        ring = (
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{size + 6}" fill="none" stroke="{col}" stroke-opacity=".35"/>'
            if size >= 9
            else ''
        )
        p.append(f'<g class="o {cls}"><circle cx="{x:.1f}" cy="{y:.1f}" r="{size}" fill="{col}"/>{ring}</g>')
    # core: LC mark on a dark disc
    mw, mh = 120, 75
    p.append(f'<circle cx="{cx}" cy="{cy}" r="56" fill="{INK}" stroke="{LINE}" stroke-opacity=".12"/>')
    p.append(
        f'<image x="{cx - mw / 2}" y="{cy - mh / 2 - 2}" width="{mw}" height="{mh}" '
        f'href="data:image/png;base64,{mark}" xlink:href="data:image/png;base64,{mark}"/>'
    )

    # ---- typography (left, flush-left on the grid)
    X = 72
    lbl, w1 = text("LET'S COOK", 'mono', 13, X + 18, 92, 0.18, WHITE)
    p.append(f'<g class="f1"><rect x="{X}" y="81" width="10" height="10" fill="{RED}"/>{lbl}')
    sep, w2 = text('/  OPEN SOURCE  /  N° 001', 'mono', 13, X + 18 + w1 + 16, 92, 0.18, GREY)
    if DIWALI:
        fest, _ = text('/  DIWALI 2026', 'mono', 13, X + 18 + w1 + 16 + w2 + 16, 92, 0.18, GOLD)
        sep += fest
    p.append(sep + '</g>')

    t1, _ = text('Code', 'black', 168, X - 6, 268, -0.045, WHITE, cls='r1')
    t2, _ = text('Orbit', 'black', 168, X - 6, 410, -0.045, RED_LIGHT, cls='r2')
    p.append(t1)
    p.append(t2)
    p.append(f'<rect class="rule" x="{X}" y="448" width="112" height="6" fill="{RED}"/>')

    s1, _ = text('Track what you learn in coding.', 'bold', 30, X, 506, -0.01, WHITE, cls='r3')
    s2, _ = text('Skills, study time, projects and goals. One place.', 'medium', 21, X, 542, 0, GREY, cls='r4')
    p.append(s1)
    p.append(s2)

    # bottom meta row
    meta = ['v0.2.0', 'FREE', 'PRIVATE', 'NO SIGN-UP', 'OPEN SOURCE']
    x = X
    row = ['<g class="f1">']
    for i, m in enumerate(meta):
        t, w = text(m, 'mono', 12.5, x, 596, 0.16, WHITE if i == 0 else GREY)
        row.append(t)
        x += w + 14
        if i < len(meta) - 1:
            row.append(f'<circle cx="{x - 1}" cy="{591.5}" r="2.2" fill="{RED}"/>')
            x += 14
    row.append('</g>')
    p.append(''.join(row))
    tag, _ = text('CODERE · AEDIFICARE · VINCERE', 'mono', 11, W - 72, 596, 0.2, GREY, anchor='end', cls='f1')
    p.append(tag)
    p.append('</g></svg>')
    open(f'{OUT}/hero.svg', 'w').write('\n'.join(p))


# ---------------------------------------------------------------- DIVIDER
def divider():
    W, H = 1280, 40
    ticks = ''.join(
        f'<line x1="{72 + i * (W - 144) / 12:.1f}" y1="15" x2="{72 + i * (W - 144) / 12:.1f}" y2="25"/>'
        for i in range(13)
    )
    if DIWALI:
        dot = (f'<g class="dot"><circle cx="72" cy="20" r="12" fill="{GOLD}" fill-opacity=".18" class="halo"/>'
               f'<path d="M72 6 C 77.5 12, 78.5 17, 72 22 C 65.5 17, 66.5 12, 72 6 Z" fill="{GOLD}"/>'
               f'<path d="M72 13 C 74.5 16, 74.5 19, 72 21 C 69.5 19, 69.5 16, 72 13 Z" fill="#FFF1D6"/></g>')
    else:
        dot = (f'<g class="dot"><circle cx="72" cy="20" r="11" fill="none" stroke="{RED}" stroke-opacity=".6" class="halo"/>'
               f'<circle cx="72" cy="20" r="5" fill="{RED}"/></g>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" aria-hidden="true">
<style>
@keyframes travel{{from{{transform:translateX(0)}}to{{transform:translateX({W - 144}px)}}}}
@keyframes blink{{0%,100%{{opacity:.35}}50%{{opacity:1}}}}
.dot{{animation:travel 9s cubic-bezier(.65,0,.35,1) infinite alternate}}
.halo{{animation:blink 2.2s ease-in-out infinite}}
{REDUCED}
</style>
<g stroke="#8A8A8E" stroke-opacity=".55" stroke-width="1"><line x1="72" y1="20" x2="{W - 72}" y2="20"/>{ticks}</g>
{dot}
</svg>'''
    open(f'{OUT}/divider.svg', 'w').write(svg)


# ---------------------------------------------------------------- HOW IT WORKS
def how():
    W, H = 1280, 610
    p = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="How CodeOrbit works. 1: You add skills, study sessions, projects and goals. 2: CodeOrbit turns them into a 0 to 100 progress score, charts and badges. 3: Everything is saved in your own browser. No server, no account. Clearing browser data deletes it, so download a backup in Settings.">
<style>
@keyframes tw{{0%,100%{{opacity:.15}}50%{{opacity:.9}}}}
@keyframes flow{{to{{stroke-dashoffset:-24}}}}
@keyframes hop{{0%{{transform:translateX(0);opacity:0}}15%{{opacity:1}}85%{{opacity:1}}100%{{transform:translateX(var(--d));opacity:0}}}}
.flow{{stroke-dasharray:6 6;animation:flow 1.2s linear infinite}}
.hop{{animation:hop 2.4s cubic-bezier(.65,0,.35,1) infinite}}
{FEST_CSS}
{REDUCED}
</style>
<defs><clipPath id="card"><rect width="{W}" height="{H}" rx="28"/></clipPath></defs>
<g clip-path="url(#card)">
<rect width="{W}" height="{H}" fill="{INK}"/>
{swiss_grid(W, H)}
{stars(55, W, H, 21)}
{bursts([(1150, 92, 32, GOLD, 0.6), (1040, 62, 18, RED_LIGHT, 2.6)])}
''']
    X = 72
    lbl, w1 = text('HOW IT WORKS', 'mono', 13, X + 18, 84, 0.18, WHITE)
    p.append(f'<rect x="{X}" y="73" width="10" height="10" fill="{RED}"/>{lbl}')
    h, _ = text('Your data never leaves your browser.', 'xbold', 44, X - 2, 146, -0.025, WHITE)
    p.append(h)

    col_w = (W - 144) / 3
    steps = [
        ('01', 'YOU', ['Add skills, log study', 'sessions, projects', 'and goals.']),
        ('02', 'CODEORBIT', ['Turns them into a 0–100', 'progress score, charts', 'and badges.']),
        ('03', 'YOUR BROWSER', ['Saves everything on your', 'own computer. No server,', 'no account, no analytics.']),
    ]
    top = 210
    for i, (num, title, lines) in enumerate(steps):
        x0 = X + i * col_w
        g = [f'<g class="c{i + 1}">']
        g.append(f'<rect x="{x0:.1f}" y="{top}" width="{col_w - 40:.1f}" height="2" fill="{RED if i == 2 else "#3A3A3E"}"/>')
        n, _ = text(num, 'black', 72, x0 - 3, top + 92, -0.04, RED_LIGHT)
        g.append(n)
        t, _ = text(title, 'mono', 14, x0, top + 132, 0.18, WHITE)
        g.append(t)
        for j, ln in enumerate(lines):
            tl, _ = text(ln, 'medium', 22, x0, top + 172 + j * 31, 0, '#C9C9CC')
            g.append(tl)
        g.append('</g>')
        p.append(''.join(g))
        if i < 2:
            ax0 = x0 + col_w - 150
            ax1 = x0 + col_w - 60
            ay = top + 66
            p.append(
                f'<line class="flow" x1="{ax0:.1f}" y1="{ay}" x2="{ax1:.1f}" y2="{ay}" stroke="{GREY}" stroke-width="1.5"/>'
                f'<path d="M{ax1 - 8:.1f} {ay - 6} L{ax1 + 2:.1f} {ay} L{ax1 - 8:.1f} {ay + 6}" fill="none" stroke="{GREY}" stroke-width="1.5"/>'
                f'<circle class="hop" style="--d:{ax1 - ax0 - 6:.0f}px;animation-delay:{i * 1.2}s" cx="{ax0:.1f}" cy="{ay}" r="4" fill="{RED_LIGHT}"/>'
            )
    # warning strip
    sy = H - 58
    p.append(f'<rect x="{X}" y="{sy - 40}" width="{W - 144}" height="1" fill="#2A2A2E"/>')
    p.append(f'<path d="M{X} {sy + 6} L{X + 9} {sy - 10} L{X + 18} {sy + 6} Z" fill="{RED}"/>')
    wt, ww = text('Clearing your browser data deletes it.', 'bold', 18, X + 32, sy + 4, 0, WHITE)
    p.append(wt)
    wt2, _ = text('Back up any time: Settings → Your data → Download backup.', 'medium', 18, X + 32 + ww + 10, sy + 4, 0, GREY)
    p.append(wt2)
    p.append('</g></svg>')
    open(f'{OUT}/how-it-works.svg', 'w').write('\n'.join(p))



def footer():
    W, H = 1280, 380
    mark = b64(os.path.join(HERE, 'lc-mark-dark.png'))
    p = [f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Built by Let's Cook, The Foundry. Codere, Aedificare, Vincere: Code. Build. Win.">
<style>
@keyframes tw{{0%,100%{{opacity:.15}}50%{{opacity:.9}}}}
@keyframes spin{{to{{transform:rotate(360deg)}}}}
.ring{{transform-origin:1060px 190px;animation:spin 30s linear infinite}}
{FEST_CSS}
{REDUCED}
</style>
<defs><clipPath id="card"><rect width="{W}" height="{H}" rx="28"/></clipPath></defs>
<g clip-path="url(#card)">
<rect width="{W}" height="{H}" fill="{INK}"/>
{swiss_grid(W, H)}
{stars(45, W, H, 99)}
{bursts([(1210, 78, 26, GOLD, 0.9), (880, 70, 18, RED_LIGHT, 2.9)])}
''']
    X = 72
    lbl, w = text('BUILT BY', 'mono', 13, X + 18, 84, 0.18, GREY)
    p.append(f'<rect x="{X}" y="73" width="10" height="10" fill="{RED}"/>{lbl}')
    lc, w2 = text("LET'S COOK — THE FOUNDRY", 'mono', 13, X + 18 + w + 12, 84, 0.18, WHITE)
    p.append(lc)
    words = [('Code.', WHITE, 'w1'), ('Build.', WHITE, 'w2'), ('Win.', RED_LIGHT, 'w3')]
    x = X - 4
    for word, col, cls in words:
        t, ww = text(word, 'black', 96, x, 210, -0.04, col, cls=cls)
        p.append(t)
        x += ww + 28
    latin, _ = text('CODERE  ·  AEDIFICARE  ·  VINCERE', 'mono', 14, X, 262, 0.22, GREY)
    p.append(latin)
    s, _ = text('A national tech community. CodeOrbit is one of its open-source projects.', 'medium', 20, X, 316, 0, '#C9C9CC')
    p.append(s)
    if DIWALI:
        hd, _ = text('HAPPY DIWALI  ·  v0.2.0 RELEASED 8 NOVEMBER 2026', 'mono', 12.5, X, 352, 0.18, GOLD)
        p.append(hd)
    # mark with orbit ring
    cx, cy = 1060, 190
    p.append(f'<circle cx="{cx}" cy="{cy}" r="118" fill="none" stroke="#fff" stroke-opacity=".14"/>')
    p.append(f'<g class="ring"><circle cx="{cx + 118}" cy="{cy}" r="6" fill="{RED_LIGHT}"/></g>')
    p.append(f'<circle cx="{cx}" cy="{cy}" r="82" fill="none" stroke="{RED_LIGHT}" stroke-opacity=".5" stroke-dasharray="2 7"/>')
    mw, mh = 150, 94
    p.append(f'<image x="{cx - mw / 2}" y="{cy - mh / 2}" width="{mw}" height="{mh}" href="data:image/png;base64,{mark}" xlink:href="data:image/png;base64,{mark}"/>')
    p.append('</g></svg>')
    open(f'{OUT}/footer.svg', 'w').write('\n'.join(p))



# ---------------------------------------------------------------- DIWALI RELEASE NOTE
# v0.2.0 was released on Diwali (8 Nov 2026). A dated release note, so it stays true after the festival.
def _lamp(cx,y,sc):
    # A clay diya (terracotta, painted dots) resting on a wooden plank that runs off the right edge.
    p=[]
    # curved wooden bracket under the plank, sweeping down to the wall (the right edge)
    p.append('<path d="M-98 60 L 190 46 L 190 222 C 150 200, 110 168, 66 146 C 20 124, -40 104, -72 86 C -86 78, -94 70, -98 60 Z" fill="url(#woodBracket)"/>')
    p.append('<path d="M190 222 C 150 200, 110 168, 66 146 C 20 124, -40 104, -72 86 C -86 78, -94 70, -98 60" fill="none" stroke="#E0A06A" stroke-opacity=".55" stroke-width="1.6"/>')
    for (o,dy) in [(.32,22),(.26,48),(.22,80),(.18,112)]:
        p.append(f'<path d="M{-60+dy*1.6:.0f} {72+dy*0.55:.0f} C 40 {80+dy*0.7:.0f}, 120 {70+dy*0.9:.0f}, 190 {66+dy:.0f}" fill="none" stroke="#2E170A" stroke-opacity="{o}" stroke-width="1.1"/>')
    p.append('<path d="M-130 0 L 190 -16 L 190 16 L -100 30 Z" fill="url(#woodTop)"/>')
    p.append('<path d="M-100 30 L 190 16 L 190 48 L -100 62 Z" fill="url(#woodFront)"/>')
    p.append('<path d="M-130 0 L -100 30 L -100 62 L -130 32 Z" fill="#4E2A12"/>')
    p.append('<path d="M-130 0 L 190 -16" stroke="#E8B27A" stroke-opacity=".55" stroke-width="1.2"/>')
    p.append('<path d="M-100 30 L 190 16" stroke="#F0C28E" stroke-opacity=".7" stroke-width="1.4"/>')
    for (y1,y2,o) in [(6,-8,.35),(13,0,.3),(20,7,.25)]:
        p.append(f'<path d="M-112 {y1} C -40 {y1-3}, 60 {y2+4}, 190 {y2}" fill="none" stroke="#6B3A18" stroke-opacity="{o}" stroke-width="1.1"/>')
    for (y1,y2,o) in [(40,26,.35),(50,36,.28)]:
        p.append(f'<path d="M-100 {y1} C -20 {y1-2}, 80 {y2+3}, 190 {y2}" fill="none" stroke="#2E170A" stroke-opacity="{o}" stroke-width="1.1"/>')
    p.append('<ellipse cx="60" cy="0" rx="9" ry="2.6" fill="none" stroke="#6B3A18" stroke-opacity=".4" stroke-width="1"/>')
    p.append('<ellipse cx="-6" cy="15" rx="70" ry="7" fill="#1A0A03" opacity=".55"/>')
    p.append('<ellipse cx="-20" cy="8" rx="80" ry="12" fill="#FFB547" opacity=".10"/>')
    p.append('<g transform="translate(0 -18)">')
    p.append('<path d="M60 0 C 58 26, 22 34, -14 32 C -40 30, -58 18, -66 4 L -88 -8 C -78 -10, -70 -6, -62 -2 Z" fill="url(#clay)"/>')
    p.append('<path d="M60 0 C 58 26, 22 34, -14 32 C -40 30, -58 18, -66 4" fill="none" stroke="#3B1205" stroke-opacity=".45" stroke-width="2"/>')
    p.append('<ellipse cx="0" cy="0" rx="61" ry="8.5" fill="#D9774A"/>')
    p.append('<ellipse cx="0" cy="0.6" rx="56" ry="6.6" fill="url(#oil)"/>')
    p.append('<path d="M-56 -1 Q 0 -9 56 -1" fill="none" stroke="#F3A77A" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>')
    for i,(dx,dy) in enumerate([(-38,14),(-22,19),(-6,21),(10,21),(26,18),(42,13)]):
        col = "#FFE7A6" if i%2==0 else "#FFFFFF"
        p.append(f'<circle cx="{dx}" cy="{dy}" r="2.2" fill="{col}" opacity=".9"/>')
    p.append('<path d="M-44 23 Q -2 31 44 21" fill="none" stroke="#FFE7A6" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="1 4" stroke-linecap="round"/>')
    p.append('<path d="M-80 -8 L -74 -16" stroke="#2A1206" stroke-width="2.6" stroke-linecap="round"/>')
    p.append('<circle class="halo" cx="-73" cy="-44" r="120" fill="url(#lglow)"/>')
    p.append('<g class="flame"><path d="M-73 -78 C -62 -60, -60 -40, -66 -26 C -69 -19, -77 -19, -80 -26 C -86 -40, -84 -60, -73 -78 Z" fill="url(#fOuter)"/>'
             '<path d="M-73 -62 C -66 -50, -65 -36, -69 -28 C -71 -24, -75 -24, -77 -28 C -81 -36, -80 -50, -73 -62 Z" fill="#FFD36B"/>'
             '<path d="M-73 -48 C -69 -40, -69 -32, -71 -28 C -72 -26.5, -74 -26.5, -75 -28 C -77 -32, -77 -40, -73 -48 Z" fill="#FFF8E6"/>'
             '<ellipse cx="-73" cy="-22" rx="4" ry="3" fill="#6E8BFF" opacity=".55"/></g>')
    p.append('</g>')
    return f'<g transform="translate({cx} {y}) scale({sc})">{"".join(p)}</g>'

LAMP_DEFS = (
 '<linearGradient id="woodTop" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#C98B4E"/><stop offset=".6" stop-color="#A9693A"/><stop offset="1" stop-color="#8A5128"/></linearGradient>'
 '<linearGradient id="woodBracket" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6E3C1C"/><stop offset=".5" stop-color="#5A3016"/><stop offset="1" stop-color="#3A1E0C"/></linearGradient>'
 '<linearGradient id="woodFront" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7E4622"/><stop offset="1" stop-color="#4A2611"/></linearGradient>'
 '<linearGradient id="brass" x1="0" x2="1" y1="0" y2="0">'
 '<stop offset="0" stop-color="#5A3B0C"/><stop offset=".22" stop-color="#B8862B"/><stop offset=".42" stop-color="#F2D27A"/>'
 '<stop offset=".5" stop-color="#FFF0B8"/><stop offset=".62" stop-color="#D9A93F"/><stop offset=".85" stop-color="#8A6118"/><stop offset="1" stop-color="#4A300A"/></linearGradient>'
 '<linearGradient id="brassTop" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8A6118"/><stop offset="1" stop-color="#E9C36A"/></linearGradient>'
 '<linearGradient id="clay" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C9623A"/><stop offset=".55" stop-color="#A2441F"/><stop offset="1" stop-color="#5E220C"/></linearGradient>'
 '<radialGradient id="oil" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="#8A5A1C"/><stop offset=".5" stop-color="#4A2A0C"/><stop offset="1" stop-color="#241205"/></radialGradient>'
 '<linearGradient id="fOuter" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF7A1A" stop-opacity=".2"/><stop offset=".35" stop-color="#FF8A1F"/><stop offset="1" stop-color="#FFB547"/></linearGradient>'
 '<radialGradient id="lglow"><stop offset="0" stop-color="#FFB547" stop-opacity=".55"/><stop offset=".3" stop-color="#FF8A3D" stop-opacity=".18"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient>'
)


def _burst(x, y, R, color, delay, rays=14):
    g = []
    for i in range(rays):
        a = math.radians(i * 360 / rays + 7)
        c, s_ = math.cos(a), math.sin(a)
        r0, r1 = R * 0.34, R * (0.86 if i % 2 else 1.0)
        g.append(f'<line x1="{x + c * r0:.1f}" y1="{y + s_ * r0:.1f}" x2="{x + c * r1:.1f}" y2="{y + s_ * r1:.1f}" stroke="{color}" stroke-width="1.4" stroke-linecap="round"/>')
        g.append(f'<circle cx="{x + c * (r1 + R * .1):.1f}" cy="{y + s_ * (r1 + R * .1):.1f}" r="{1.5 if i % 2 else 2}" fill="{color}"/>')
    return f'<g class="burst" style="animation-delay:{delay}s">{"".join(g)}</g>'


def diwali():
    W, H = 1280, 320
    p = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Released on Diwali. CodeOrbit v0.2.0, 8 November 2026. Happy Diwali from Let's Cook: may your code compile and your lamps stay lit.">
<style>
@keyframes tw{{0%,100%{{opacity:.15}}50%{{opacity:.9}}}}
@keyframes flick{{0%,100%{{transform:scale(1,1) rotate(0deg)}}30%{{transform:scale(.93,1.07) rotate(-2deg)}}60%{{transform:scale(1.05,.95) rotate(1.5deg)}}80%{{transform:scale(.97,1.03) rotate(-1deg)}}}}
@keyframes breathe{{0%,100%{{opacity:.55;transform:scale(.92)}}50%{{opacity:1;transform:scale(1.06)}}}}
@keyframes burst{{0%{{opacity:0;transform:scale(.2)}}12%{{opacity:.9}}60%{{opacity:.8;transform:scale(1)}}100%{{opacity:0;transform:scale(1.1)}}}}
.flame{{transform-box:fill-box;transform-origin:50% 100%;animation:flick 1.7s ease-in-out infinite}}
.halo{{transform-box:fill-box;transform-origin:50% 50%;animation:breathe 3.6s ease-in-out infinite}}
.burst{{transform-box:fill-box;transform-origin:50% 50%;animation:burst 5.2s cubic-bezier(.15,.7,.2,1) infinite}}
{REDUCED}
</style>
<defs><clipPath id="card"><rect width="{W}" height="{H}" rx="28"/></clipPath>{LAMP_DEFS}</defs>
<g clip-path="url(#card)">
<rect width="{W}" height="{H}" fill="{INK}"/>
{swiss_grid(W, H)}
{stars(40, W, H, 2026)}
''']
    p.append(_burst(860, 74, 30, '#FFB547', 0))
    p.append(_burst(1215, 58, 24, RED_LIGHT, 1.8))
    p.append(_burst(905, 262, 18, '#F5F5F4', 3.2))
    X = 72
    lbl, w = text('N° 002 — RELEASE NOTE', 'mono', 13, X + 18, 84, 0.18, GREY)
    p.append(f'<rect x="{X}" y="73" width="10" height="10" fill="{RED}"/>{lbl}')
    t, tw_ = text('Released on Diwali', 'black', 72, X - 3, 168, -0.045, WHITE)
    p.append(t)
    dot, _ = text('.', 'black', 72, X - 11 + tw_, 168, -0.045, RED_LIGHT)
    p.append(dot)
    sub, _ = text('CodeOrbit v0.2.0  ·  8 November 2026  ·  Open source, MIT', 'medium', 22, X, 218, 0, '#C9C9CC')
    p.append(sub)
    wish, _ = text("Happy Diwali from Let's Cook. May your code compile and your lamps stay lit.", 'regular', 18, X, 258, 0, GREY)
    p.append(wish)
    p.append(_lamp(1120, 178, 0.85))
    p.append('</g></svg>')
    open(f'{OUT}/diwali.svg', 'w').write('\n'.join(p))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    hero()
    divider()
    how()
    footer()
    diwali()
    for f in ['hero.svg', 'divider.svg', 'how-it-works.svg', 'footer.svg', 'diwali.svg']:
        print(f, os.path.getsize(f'{OUT}/{f}') // 1024, 'KB')
