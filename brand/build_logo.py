"""
KUSP identity generator.

Every KUSP letter is CONSTRUCTED from geometry on a 100-unit cap-height grid (no font is
typeset for the wordmark). Only the descriptor line uses Hanken Grotesk, and it is converted
to outlines so every SVG is self-contained.

Run:  python brand/build_logo.py      -> writes brand/svg/*.svg and brand/logo-review.html
"""
import math
import os
import re

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "svg")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- palette (approved tokens)
IVORY = "#F1ECDF"
INK = "#171614"
BURGUNDY = "#6B1F32"
BURGUNDY_DEEP = "#42111D"
GOLD = "#B99352"
MUTED = "#5D584F"
WHITE = "#FFFFFF"
BLACK = "#000000"

H = 100  # cap height (construction unit)


def f(n):
    return f"{n:.2f}".rstrip("0").rstrip(".")


def rect(x, y, w, h):
    return f"M{f(x)} {f(y)}H{f(x + w)}V{f(y + h)}H{f(x)}Z"


def slab(x0, y0, x1, y1, t):
    """Diagonal stroke with horizontal (cap/baseline-true) cuts; t = horizontal thickness."""
    h = t / 2
    pts = [(x0 - h, y0), (x1 - h, y1), (x1 + h, y1), (x0 + h, y0)]
    # Normalise winding to clockwise (screen coords) so overlapping strokes union under nonzero fill
    area = sum(pts[i][0] * pts[(i + 1) % 4][1] - pts[(i + 1) % 4][0] * pts[i][1] for i in range(4))
    if area < 0:
        pts.reverse()
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z"


# ---------------------------------------------------------------- constructed capitals
def glyph_K(s, W, gap=True, gk=0.46):
    """Stem + floating arm: the arm is held off the stem by a registration gap (identity detail)."""
    t = s * 1.2
    g = s * gk if gap else -s * 0.2
    vx = s + g + t / 2                 # chevron vertex centre, held off the stem by the gap
    vy = 54                            # vertex sits just above optical centre
    # arm and leg share one vertex: a clean detached chevron, no spur
    return rect(0, 0, s, H) + slab(vx, vy, W - t / 2, 0, t) + slab(vx, vy, W - t / 2 + 1.5, H, t)


def glyph_U(s, W):
    ro, ri = W / 2, W / 2 - s
    cy = H - ro
    return (f"M0 0H{f(s)}V{f(cy)}A{f(ri)} {f(ri)} 0 0 0 {f(W - s)} {f(cy)}V0H{f(W)}V{f(cy)}"
            f"A{f(ro)} {f(ro)} 0 0 1 0 {f(cy)}Z")


def glyph_S(s, W):
    Ry = (H + s) / 4
    ry = Ry - s
    Rx, rx = W / 2, W / 2 - s
    cx, c1, c2 = W / 2, Ry, H - Ry
    top = (f"M{f(cx + Rx)} {f(c1)}A{f(Rx)} {f(Ry)} 0 1 0 {f(cx)} {f(c1 + Ry)}L{f(cx)} {f(c1 + ry)}"
           f"A{f(rx)} {f(ry)} 0 1 1 {f(cx + rx)} {f(c1)}Z")
    bot = (f"M{f(cx)} {f(c2 - Ry)}A{f(Rx)} {f(Ry)} 0 1 1 {f(cx - Rx)} {f(c2)}L{f(cx - rx)} {f(c2)}"
           f"A{f(rx)} {f(ry)} 0 1 0 {f(cx)} {f(c2 - ry)}Z")
    return top + bot


def glyph_P(s, W, bowl=0.58):
    R = H * bowl / 2
    r = R - s
    bx = W - R
    outer = f"M0 0H{f(bx)}A{f(R)} {f(R)} 0 0 1 {f(bx)} {f(2 * R)}H{f(s)}V{f(H)}H0Z"
    inner = f"M{f(s)} {f(s)}V{f(2 * R - s)}H{f(bx)}A{f(r)} {f(r)} 0 0 0 {f(bx)} {f(s)}Z"
    return outer + inner


GLYPHS = {"K": glyph_K, "U": glyph_U, "S": glyph_S, "P": glyph_P}


def word(s, widths, gaps, gapK=True):
    """Returns (path_d, total_width, letter_boxes). gaps = optical spacing after K, U, S."""
    x = 0
    parts, boxes = [], []
    for i, ch in enumerate("KUSP"):
        W = widths[ch]
        d = glyph_K(s, W, gapK) if ch == "K" else GLYPHS[ch](s, W)
        parts.append(f'<path transform="translate({f(x)} 0)" d="{d}"/>')
        boxes.append((x, W))
        x += W + (gaps[i] if i < 3 else 0)
    return "".join(parts), x, boxes


# ---------------------------------------------------------------- outlined descriptor (Hanken Grotesk 600)
def load_hanken():
    import glob
    cands = sorted(glob.glob(os.path.join(ROOT, "..", ".next", "static", "media", "*.woff2")))
    best = None
    for c in cands:
        t = TTFont(c)
        if "Hanken" in (t["name"].getDebugName(1) or "") and "fvar" in t:
            if best is None or len(t.getGlyphOrder()) > len(best.getGlyphOrder()):
                best = t
    if best is None:
        raise SystemExit("Hanken Grotesk woff2 not found in .next/static/media — run `npm run build` first.")
    return instancer.instantiateVariableFont(best, {"wght": 600})


HANKEN = load_hanken()
CMAP = HANKEN.getBestCmap()
GSET = HANKEN.getGlyphSet()
UPM = HANKEN["head"].unitsPerEm
CAPH = HANKEN["OS/2"].sCapHeight or 700


def outline_text(text, cap, tracking_em):
    """Outline uppercase text at a given cap height (units) with letter-spacing. Returns (d, width)."""
    sc = cap / CAPH
    x = 0.0
    ds = []
    for ch in text:
        gname = CMAP.get(ord(ch))
        if gname is None:
            continue
        adv = GSET[gname].width
        if ch != " ":
            pen = SVGPathPen(GSET)
            tp = TransformPen(pen, (sc, 0, 0, -sc, x, cap))
            GSET[gname].draw(tp)
            ds.append(pen.getCommands())
        x += adv * sc + tracking_em * cap / 0.7
    return "".join(ds), x - tracking_em * cap / 0.7


# ---------------------------------------------------------------- CONCEPT A — DATUM (recommended)
A_S = 14
A_W = {"K": 74, "U": 76, "S": 70, "P": 68}
A_GAPS = [40, 46, 48]  # optical: K's open diagonal needs less, S/P need more
A_WORD, A_WIDTH, A_BOXES = word(A_S, A_W, A_GAPS)
DATUM_Y, DATUM_T = 118, 6


def datum(width, color, tick=True):
    d = rect(0, DATUM_Y, width, DATUM_T)
    if tick:
        d += rect(0, DATUM_Y - 9, DATUM_T, DATUM_T + 18)          # benchmark tick, left
        d += rect(width - 3, DATUM_Y - 4.5, 3, DATUM_T + 9)       # registration tick, right
    return f'<path fill="{color}" d="{d}"/>'


DESC1, DESC1_W = outline_text("KRISHVI UNIFIED", 15, 0.16)
DESC2, DESC2_W = outline_text("SOLUTIONS PARTNERS", 15, 0.16)


def svg(w, h, body, title, bg=None, pad=0):
    bgr = f'<rect width="{f(w + 2 * pad)}" height="{f(h + 2 * pad)}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(-pad)} {f(-pad)} {f(w + 2 * pad)} {f(h + 2 * pad)}" '
            f'role="img" aria-labelledby="t"><title id="t">{title}</title>'
            + (f'<g transform="translate({f(-pad)} {f(-pad)})">{bgr}</g>' if bg else "") + body + "</svg>")


def wordmark_A(word_color, datum_color, tick=True):
    body = f'<g fill="{word_color}">{A_WORD}</g>' + datum(A_WIDTH, datum_color, tick)
    return body, A_WIDTH, DATUM_Y + DATUM_T + 9


def primary_A(word_color, datum_color, desc_color, rule_color):
    body, w, h = wordmark_A(word_color, datum_color)
    gx = w + 40
    rule = f'<path fill="{rule_color}" d="{rect(gx, 0, 1.5, H)}"/>'
    dx = gx + 34
    desc = (f'<g fill="{desc_color}"><path transform="translate({f(dx)} {f(H / 2 - 15 - 9)})" d="{DESC1}"/>'
            f'<path transform="translate({f(dx)} {f(H / 2 + 9)})" d="{DESC2}"/></g>')
    total_w = dx + max(DESC1_W, DESC2_W)
    return body + rule + desc, total_w, h


def mark_A(tile, glyph, bar, size=120, simplified=False):
    """Compact mark: constructed K on a square tile, held by the datum."""
    if simplified:  # favicon ≤32px: heavier, larger K filling the tile; solid datum, no ticks
        s, W = 26, 82
        kd = glyph_K(s, W, gap=False)   # connected K: the detached chevron does not survive below ~40px
        k_scale = 0.74
        kx = (size - W * k_scale) / 2
        ky = 10
        bar_d = rect(kx, ky + H * k_scale + 10, W * k_scale, 12)
    else:
        s, W = 15, 74
        kd = glyph_K(s, W, gap=True)
        k_scale = 0.56
        kx = (size - W * k_scale) / 2
        ky = 22
        by = ky + H * k_scale + 10
        bar_d = rect(kx, by, W * k_scale, 4.5) + rect(kx, by - 6, 4.5, 16.5)
    body = (f'<rect width="{size}" height="{size}" fill="{tile}"/>'
            f'<path fill="{glyph}" transform="translate({f(kx)} {f(ky)}) scale({k_scale})" d="{kd}"/>'
            f'<path fill="{bar}" d="{bar_d}"/>')
    return body, size, size


# ---------------------------------------------------------------- CONCEPT B — REGISTRATION
B_S = 8.5
B_W = {"K": 70, "U": 72, "S": 66, "P": 64}
B_WORD, B_WIDTH, _ = word(B_S, B_W, [54, 58, 60], gapK=False)


def reg_mark(cx, cy, r, color, accent):
    cross = (rect(cx - 2, cy - r - 16, 4, 2 * r + 32) + rect(cx - r - 16, cy - 2, 2 * r + 32, 4))
    ring = (f"M{f(cx + r)} {f(cy)}A{f(r)} {f(r)} 0 1 0 {f(cx - r)} {f(cy)}A{f(r)} {f(r)} 0 1 0 {f(cx + r)} {f(cy)}Z"
            f"M{f(cx + r - 6)} {f(cy)}A{f(r - 6)} {f(r - 6)} 0 1 1 {f(cx - r + 6)} {f(cy)}A{f(r - 6)} {f(r - 6)} 0 1 1 {f(cx + r - 6)} {f(cy)}Z")
    return (f'<path fill="{color}" fill-rule="evenodd" d="{ring}"/><path fill="{color}" d="{cross}"/>'
            f'<rect x="{f(cx - 8)}" y="{f(cy - 8)}" width="16" height="16" fill="{accent}"/>')


def concept_B(color, accent):
    mark = reg_mark(50, 50, 38, color, accent)
    body = mark + f'<g fill="{color}" transform="translate(150 0)">{B_WORD}</g>'
    return body, 150 + B_WIDTH, H + 16


# ---------------------------------------------------------------- CONCEPT C — PARCEL GRID
def concept_C(frame, letter, parcel, parcel_letter):
    cell, gut, k = 100, 10, 0.62
    s, Wd = 16, {"K": 74, "U": 76, "S": 70, "P": 68}
    out = [f'<rect x="0.75" y="0.75" width="{2 * cell + gut - 1.5}" height="{2 * cell + gut - 1.5}" fill="none" stroke="{frame}" stroke-width="1.5"/>']
    cells = [("K", 0, 0), ("U", 1, 0), ("S", 0, 1), ("P", 1, 1)]
    for ch, cxi, cyi in cells:
        x0, y0 = cxi * (cell + gut), cyi * (cell + gut)
        W = Wd[ch]
        d = glyph_K(s, W, True) if ch == "K" else GLYPHS[ch](s, W)
        gx = x0 + (cell - W * k) / 2
        gy = y0 + (cell - H * k) / 2
        fill = letter
        if ch == "P":
            out.append(f'<rect x="{x0 + 6}" y="{y0 + 6}" width="{cell - 12}" height="{cell - 12}" fill="{parcel}"/>')
            fill = parcel_letter
        out.append(f'<path fill="{fill}" transform="translate({f(gx)} {f(gy)}) scale({k})" d="{d}"/>')
    # street gutters marked as dashed centrelines
    mid = cell + gut / 2
    out.append(f'<path d="M{mid} 8V{2 * cell + gut - 8}M8 {mid}H{2 * cell + gut - 8}" stroke="{frame}" stroke-width="1" stroke-dasharray="4 4" fill="none"/>')
    return "".join(out), 2 * cell + gut, 2 * cell + gut


# ---------------------------------------------------------------- write files
def write(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf8") as fh:
        fh.write(content)
    return content


files = {}
PAD = 0
# Primary lockups
b, w, h = primary_A(INK, BURGUNDY, MUTED, BURGUNDY)
files["kusp-primary-dark.svg"] = write("kusp-primary-dark.svg", svg(w, h, b, "KUSP — Krishvi Unified Solutions Partners"))
b, w, h = primary_A(IVORY, GOLD, "#CFC8B8", GOLD)
files["kusp-primary-light.svg"] = write("kusp-primary-light.svg", svg(w, h, b, "KUSP — Krishvi Unified Solutions Partners"))
b, w, h = primary_A(BURGUNDY, BURGUNDY, BURGUNDY, BURGUNDY)
files["kusp-primary-burgundy.svg"] = write("kusp-primary-burgundy.svg", svg(w, h, b, "KUSP — Krishvi Unified Solutions Partners"))
b, w, h = primary_A(BLACK, BLACK, BLACK, BLACK)
files["kusp-primary-mono-black.svg"] = write("kusp-primary-mono-black.svg", svg(w, h, b, "KUSP — Krishvi Unified Solutions Partners"))
b, w, h = primary_A(WHITE, WHITE, WHITE, WHITE)
files["kusp-primary-mono-white.svg"] = write("kusp-primary-mono-white.svg", svg(w, h, b, "KUSP — Krishvi Unified Solutions Partners"))
# Wordmark-only
for name, wc, dc in [("dark", INK, BURGUNDY), ("light", IVORY, GOLD), ("burgundy", BURGUNDY, BURGUNDY), ("mono-black", BLACK, BLACK), ("mono-white", WHITE, WHITE)]:
    b, w, h = wordmark_A(wc, dc)
    files[f"kusp-wordmark-{name}.svg"] = write(f"kusp-wordmark-{name}.svg", svg(w, h, b, "KUSP"))
# Compact marks
for name, tile, glyph, bar in [("burgundy", BURGUNDY, IVORY, IVORY), ("ivory", IVORY, INK, BURGUNDY), ("ink", INK, IVORY, GOLD), ("mono-black", BLACK, WHITE, WHITE), ("mono-white", WHITE, BLACK, BLACK)]:
    b, w, h = mark_A(tile, glyph, bar)
    files[f"kusp-mark-{name}.svg"] = write(f"kusp-mark-{name}.svg", svg(w, h, b, "KUSP"))
b, w, h = mark_A(BURGUNDY, IVORY, IVORY, simplified=True)
files["kusp-favicon.svg"] = write("kusp-favicon.svg", svg(w, h, b, "KUSP"))
# Concepts B and C (exploration only)
b, w, h = concept_B(INK, BURGUNDY)
files["concept-b-registration.svg"] = write("concept-b-registration.svg", svg(w, h, b, "KUSP concept B"))
b, w, h = concept_C(INK, INK, BURGUNDY, IVORY)
files["concept-c-parcel.svg"] = write("concept-c-parcel.svg", svg(w, h, b, "KUSP concept C"))


# ---------------------------------------------------------------- construction + guidance diagrams
def construction():
    body, w, h = wordmark_A(INK, BURGUNDY)
    grid = []
    for y, lab in [(0, "CAP 100"), (H, "BASELINE 0"), (54, "K VERTEX 54"), (DATUM_Y, "DATUM 118")]:
        grid.append(f'<path d="M-30 {y}H{w + 30}" stroke="{GOLD}" stroke-width="0.6" stroke-dasharray="3 3"/>')
        grid.append(f'<text x="{w + 36}" y="{y + 3}" font-size="7" fill="{MUTED}" font-family="Hanken Grotesk, Arial">{lab}</text>')
    for x, W in A_BOXES:
        grid.append(f'<rect x="{x}" y="0" width="{W}" height="{H}" fill="none" stroke="{BURGUNDY}" stroke-width="0.6" opacity=".5"/>')
        grid.append(f'<text x="{x + W / 2}" y="-10" font-size="7" text-anchor="middle" fill="{MUTED}" font-family="Hanken Grotesk, Arial">{W}</text>')
    for i, (x, W) in enumerate(A_BOXES[:-1]):
        gx = x + W
        grid.append(f'<text x="{gx + A_GAPS[i] / 2}" y="{H + 34}" font-size="7" text-anchor="middle" fill="{BURGUNDY}" font-family="Hanken Grotesk, Arial">{A_GAPS[i]}</text>')
    grid.append(f'<text x="{A_S / 2}" y="{H + 48}" font-size="7" text-anchor="middle" fill="{BURGUNDY}" font-family="Hanken Grotesk, Arial">stroke {A_S}</text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -24 {w + 140} {h + 70}">{"".join(grid)}<g opacity=".92">{body}</g></svg>'


def clearspace():
    b, w, h = primary_A(INK, BURGUNDY, MUTED, BURGUNDY)
    c = 50  # clear space = half cap height on every side
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-c - 20} {-c - 20} {w + 2 * c + 40} {h + 2 * c + 40}">'
            f'<rect x="{-c}" y="{-c}" width="{w + 2 * c}" height="{h + 2 * c}" fill="none" stroke="{BURGUNDY}" stroke-width="1" stroke-dasharray="5 4"/>'
            f'<rect x="{-c}" y="{-c}" width="{c}" height="{c}" fill="{BURGUNDY}" opacity=".12"/>'
            f'<text x="{-c / 2}" y="{-c / 2 + 3}" font-size="9" text-anchor="middle" fill="{BURGUNDY}" font-family="Hanken Grotesk, Arial">½ H</text>'
            f'{b}</svg>')


# ---------------------------------------------------------------- review sheet
def inline(name):
    return re.sub(r"<title[^>]*>.*?</title>", "", files[name])


def tile(name, bg, label, h=90, w="auto"):
    return (f'<figure class="tile" style="background:{bg}"><div class="art" style="height:{h}px">{inline(name)}</div>'
            f'<figcaption>{label}</figcaption></figure>')


fav_sizes = "".join(
    f'<div class="fav"><div style="width:{s}px;height:{s}px">{inline("kusp-favicon.svg" if s <= 32 else "kusp-mark-burgundy.svg")}</div><span>{s}px</span></div>'
    for s in (16, 24, 32, 48, 64, 180)
)

html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KUSP Logo System</title>
<style>
:root{{--ivory:{IVORY};--ink:{INK};--burgundy:{BURGUNDY};--gold:{GOLD};--muted:{MUTED};--line:rgba(23,22,20,.18)}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--ivory);color:var(--ink);font:15px/1.55 "Hanken Grotesk",Arial,sans-serif}}
header,section{{padding:56px 4.5vw;border-bottom:1px solid var(--line)}}
h1,h2{{font-family:"Libre Caslon Text",Georgia,serif;font-weight:400;letter-spacing:-.03em;margin:0 0 12px}} h1{{font-size:2.8rem}} h2{{font-size:2rem}}
h3{{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--burgundy);margin:28px 0 10px}}
.eyebrow{{font-size:.64rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--burgundy)}}
.lead{{max-width:760px;color:var(--muted)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}
.tile{{margin:0;padding:34px 30px 16px;border:1px solid var(--line)}} .tile .art{{display:flex;align-items:center}} .tile svg{{height:100%;width:auto;max-width:100%}}
.tile figcaption{{margin-top:18px;font-size:.66rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}}
.tile[style*="#171614"] figcaption,.tile[style*="#6B1F32"] figcaption,.tile[style*="#000"] figcaption{{color:#CFC8B8}}
.concept{{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:center;padding:28px 0;border-top:1px solid var(--line)}}
.concept .stage{{padding:44px;border:1px solid var(--line);background:#F6F2E8;display:flex;justify-content:center}} .concept .stage svg{{max-height:150px;width:auto;max-width:100%}}
.rec{{display:inline-block;margin-left:8px;padding:3px 8px;border:1px solid var(--burgundy);color:var(--burgundy);font-size:.6rem;font-weight:700;letter-spacing:.12em;vertical-align:middle}}
.diagram{{border:1px solid var(--line);background:#F6F2E8;padding:24px}} .diagram svg{{width:100%;height:auto}}
.favs{{display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap}} .fav{{text-align:center;font-size:.62rem;color:var(--muted);font-weight:700;letter-spacing:.1em}} .fav div svg{{width:100%;height:100%;display:block}}
.sizes{{display:flex;align-items:flex-end;gap:36px;flex-wrap:wrap}} .sizes div{{font-size:.62rem;color:var(--muted);font-weight:700;letter-spacing:.1em}} .sizes svg{{display:block;margin-bottom:8px}}
table{{border-collapse:collapse;width:100%;font-size:.88rem}} th,td{{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}} th{{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}}
code{{font-size:.82rem}}
@media (max-width:800px){{.concept{{grid-template-columns:1fr}}}}
</style></head><body>
<header><p class="eyebrow">KUSP / Identity / For approval — not deployed</p><h1>Logo system</h1>
<p class="lead">Every KUSP capital is constructed from geometry on a 100-unit cap-height grid — not typeset. The descriptor uses Hanken Grotesk 600, converted to outlines. All files are self-contained SVG in <code>brand/svg/</code>.</p></header>

<section><p class="eyebrow">01 / Three directions</p><h2>Concept directions</h2>
<div class="concept"><div class="stage">{inline("kusp-primary-dark.svg")}</div>
<div><h3>A — Datum <span class="rec">RECOMMENDED</span></h3><p>Constructed architectural capitals at a 14-unit stroke with optical spacing (40 / 46 / 48). The K's arm is held off its stem by a small <em>registration gap</em> — the single identity detail. A burgundy datum carries the word, with a benchmark tick at its origin and a registration tick at its end: the language of survey, section and planning sheet. Calm at any size; reads as institutional, not tech.</p></div></div>
<div class="concept"><div class="stage">{inline("concept-b-registration.svg")}</div>
<div><h3>B — Registration</h3><p>Lighter constructed capitals (8.5 stroke, wider tracking) paired with a printer’s / survey registration mark holding a burgundy decision square. Precise and technical, but the symbol is a familiar device and pulls the identity toward “engineering firm”; at small sizes it competes with the word.</p></div></div>
<div class="concept"><div class="stage">{inline("concept-c-parcel.svg")}</div>
<div><h3>C — Parcel grid</h3><p>KUSP arranged as four parcels on a plan, with street centrelines in the gutters and one burgundy “decision parcel”. Strong as a square avatar, but it is a monogram block rather than a wordmark, reads less clearly as a name, and edges toward decorative.</p></div></div>
</section>

<section><p class="eyebrow">02 / Recommended system</p><h2>A — Datum</h2>
<h3>Primary horizontal lockup</h3>
<div class="grid">{tile("kusp-primary-dark.svg", IVORY, "Dark version — for ivory / light grounds", 80)}{tile("kusp-primary-light.svg", INK, "Light version — for near-black grounds (gold datum)", 80)}</div>
<h3>Wordmark only</h3>
<div class="grid">{tile("kusp-wordmark-dark.svg", IVORY, "Wordmark — dark", 70)}{tile("kusp-wordmark-light.svg", INK, "Wordmark — light", 70)}{tile("kusp-wordmark-burgundy.svg", "#F6F2E8", "Wordmark — brand burgundy", 70)}</div>
<h3>Monochrome</h3>
<div class="grid">{tile("kusp-primary-mono-black.svg", WHITE, "Mono black", 70)}{tile("kusp-primary-mono-white.svg", BLACK, "Mono white", 70)}{tile("kusp-wordmark-mono-black.svg", WHITE, "Wordmark mono black", 60)}{tile("kusp-wordmark-mono-white.svg", BLACK, "Wordmark mono white", 60)}</div>
<h3>Compact mark</h3>
<div class="grid">{tile("kusp-mark-burgundy.svg", "#F6F2E8", "Primary mark — burgundy tile", 110)}{tile("kusp-mark-ivory.svg", "#E3DCCB", "Ivory tile", 110)}{tile("kusp-mark-ink.svg", "#F6F2E8", "Near-black tile, gold datum", 110)}{tile("kusp-mark-mono-black.svg", WHITE, "Mono", 110)}</div>
<h3>Favicon / small UI — actual pixel sizes</h3>
<div class="favs">{fav_sizes}</div>
<p class="lead" style="margin-top:14px">≤32px uses the simplified favicon: a connected, heavier K (26 stroke) filling the tile, solid datum, ticks removed. 48px and above use the full mark.</p>
</section>

<section><p class="eyebrow">03 / Construction</p><h2>SVG-ready geometry</h2>
<div class="diagram">{construction()}</div>
<table style="margin-top:18px"><tr><th>Element</th><th>Specification (units, cap height = 100)</th></tr>
<tr><td>Stroke</td><td>14 (stems, bowls, S spine). Diagonal arms 16.8 measured horizontally, cut true to cap and baseline.</td></tr>
<tr><td>Widths</td><td>K 74 · U 76 · S 70 · P 68</td></tr>
<tr><td>Spacing</td><td>K–U 40 · U–S 46 · S–P 48 (optical, not uniform tracking)</td></tr>
<tr><td>K detail</td><td>Arm and leg meet at one chevron vertex (y 54), held 6.4 units off the stem (0.46 × stroke) — the registration gap. Favicon (≤ 47 px) uses a connected K, stroke 26, because the gap cannot be resolved at that size.</td></tr>
<tr><td>S</td><td>Two elliptical bowls (Rx 35 / Ry 28.5) sharing one 14-unit spine at 43–57; terminals cut horizontally.</td></tr>
<tr><td>P</td><td>Bowl 58 high (radius 29 outer / 15 inner).</td></tr>
<tr><td>Datum</td><td>6-unit rule at 118 (18 below baseline), full word width; benchmark tick 6 × 24 at origin; registration tick 3 × 15 at end.</td></tr>
<tr><td>Descriptor</td><td>Hanken Grotesk 600, cap 15, tracking 0.16 em, two lines, outlined; separated by a 1.5-unit rule 40 units from the word.</td></tr>
</table></section>

<section><p class="eyebrow">04 / Usage</p><h2>Clear space &amp; minimum size</h2>
<div class="grid" style="grid-template-columns:1.4fr 1fr;align-items:start"><div class="diagram">{clearspace()}</div>
<div><h3>Clear space</h3><p>Keep a clear zone of <strong>½ H</strong> (half the cap height of KUSP) on all sides of every lockup. For the compact mark, the tile edge is the boundary; keep ⅛ of the tile width clear around it.</p>
<h3>Minimum sizes</h3>
<table><tr><th>Asset</th><th>Digital</th><th>Print</th></tr>
<tr><td>Primary lockup (with descriptor)</td><td>280 px wide</td><td>70 mm wide</td></tr>
<tr><td>Wordmark only</td><td>96 px wide</td><td>24 mm wide</td></tr>
<tr><td>Compact mark (full, with ticks)</td><td>48 px</td><td>12 mm</td></tr>
<tr><td>Favicon (simplified)</td><td>16 px</td><td>—</td></tr></table>
<p class="lead" style="margin-top:12px">Below 280 px, drop the descriptor and use the wordmark. Below 96 px, use the compact mark (simplified favicon under 48 px). Descriptor cap height at 280 px is 5.4 px.</p></div></div>
<h3>Rendered at minimum sizes</h3>
<div class="sizes"><div><div style="width:280px">{inline("kusp-primary-dark.svg")}</div>280 px primary</div><div><div style="width:96px">{inline("kusp-wordmark-dark.svg")}</div>96 px wordmark</div><div><div style="width:48px;height:48px">{inline("kusp-mark-burgundy.svg")}</div>48 px mark</div><div><div style="width:32px;height:32px">{inline("kusp-favicon.svg")}</div>32 px favicon</div><div><div style="width:16px;height:16px">{inline("kusp-favicon.svg")}</div>16 px favicon</div></div>
<h3>Colour</h3>
<table><tr><th>Version</th><th>Word</th><th>Datum / rule</th><th>Descriptor</th><th>Ground</th></tr>
<tr><td>Dark (primary)</td><td>Near black {INK}</td><td>Burgundy {BURGUNDY}</td><td>{MUTED}</td><td>Ivory {IVORY}, paper, white</td></tr>
<tr><td>Light</td><td>Ivory {IVORY}</td><td>Gold {GOLD} (burgundy disappears on near-black)</td><td>#CFC8B8</td><td>Near black {INK}</td></tr>
<tr><td>Brand burgundy</td><td>Burgundy</td><td>Burgundy</td><td>Burgundy</td><td>Ivory / paper only</td></tr>
<tr><td>Mono</td><td colspan="3">All black or all white</td><td>Single-colour print, embossing, fax/stamps</td></tr></table>
<h3>Usage matrix (frozen)</h3>
<table><tr><th>Context</th><th>Asset</th><th>Condition</th></tr>
<tr><td>Site header, desktop</td><td>Primary lockup (dark or light by section tone)</td><td>Viewport &gt; 1100 px; lockup rendered ≥ 280 px wide</td></tr>
<tr><td>Site header, tablet / mobile</td><td>Wordmark only</td><td>Viewport ≤ 1100 px; ≥ 96 px wide (≈ 120 px in header)</td></tr>
<tr><td>Footer</td><td>Primary lockup</td><td>≥ 280 px wide; wordmark ≥ 96 px on narrow screens</td></tr>
<tr><td>Favicon / tab</td><td>kusp-favicon.svg (connected K)</td><td>16 – 47 px</td></tr>
<tr><td>App icon / social avatar</td><td>kusp-mark-burgundy.svg</td><td>≥ 48 px; 180 px for home-screen icons</td></tr>
<tr><td>Near-black sections</td><td>Light version (ivory word, gold datum)</td><td>Gold stays at the 6-unit datum only</td></tr>
<tr><td>Single-colour use</td><td>Mono black / mono white</td><td>Print, stamps, embossing, partner pages</td></tr></table>
<h3>Do not</h3><p class="lead">Retype KUSP in a font · close the K registration gap · re-space the letters · stretch, outline, shadow or add gradients · place gold as the word colour · use burgundy on near-black · remove the datum from the primary lockup.</p>
</section></body></html>"""

with open(os.path.join(ROOT, "logo-review.html"), "w", encoding="utf8") as fh:
    fh.write(html)
print("wrote", len(files), "svg files + logo-review.html;", f"wordmark width {A_WIDTH}, descriptor {DESC1_W:.0f}/{DESC2_W:.0f}")
