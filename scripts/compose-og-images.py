#!/usr/bin/env python3
"""
Compose Open Graph (1200x630) social-share images for OTP + Orger.

Outputs:
  OTP (orgtp.com — this Fastify app):
    - public/images/og-meet-radar.png  (Radar mascot, OTP navy+gold)
    - public/images/og-otp-home.png    (Orgy mascot,  OTP navy+gold)
    - public/images/og-coach.png       (Coach mascot, OTP navy+gold)

  Orger (orger.ai — Next.js app at /Users/dsteel/orger-next):
    - app/opengraph-image.png          (Orgy v2 mascot, Swamp Palette + dotted grid)
    - app/twitter-image.png            (same)

Run from anywhere — paths are absolute. After running, redeploy orger-next
to pick up the new Orger OG.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OTP_ROOT = Path("/Users/dsteel/otp-platform")
ORGER_NEXT_ROOT = Path("/Users/dsteel/orger-next")

OUT_OTP = OTP_ROOT / "public" / "images"
OUT_ORGER_APP = ORGER_NEXT_ROOT / "app"
OUT_OTP.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def make_radial_bg(color_center, color_edge, cx_pct, cy_pct, scale=1.4):
    bg = Image.new("RGB", (W, H), color_edge)
    cx, cy = int(W * cx_pct), int(H * cy_pct)
    max_r = int(((W**2 + H**2) ** 0.5) * scale / 2)
    overlay = Image.new("RGB", (W, H), color_center)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    steps = 64
    for i in range(steps, 0, -1):
        r = int(max_r * i / steps)
        alpha = int(255 * (1 - i / steps) ** 1.6)
        md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(22))
    bg.paste(overlay, (0, 0), mask)
    return bg


def add_dotted_grid(img, dot_color, spacing=24, radius=1, alpha=70):
    """Orger's signature dotted grid background pattern."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(spacing // 2, H, spacing):
        for x in range(spacing // 2, W, spacing):
            od.ellipse([x - radius, y - radius, x + radius, y + radius],
                       fill=dot_color + (alpha,))
    img.paste(overlay, (0, 0), overlay)


def add_noise_dots(img, color, count=80, alpha=22):
    import random
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    rng = random.Random(42)
    for _ in range(count):
        x = rng.randint(0, W)
        y = rng.randint(0, H)
        r = rng.randint(1, 3)
        od.ellipse([x - r, y - r, x + r, y + r], fill=color + (alpha,))
    img.paste(overlay, (0, 0), overlay)


def fit_mascot(path, target_h):
    m = Image.open(path).convert("RGBA")
    ratio = target_h / m.height
    return m.resize((int(m.width * ratio), target_h), Image.LANCZOS)


def add_mascot_glow(canvas, mascot, pos, glow_color, glow_alpha=140, blur=55):
    gw, gh = int(mascot.width * 1.25), int(mascot.height * 1.25)
    glow_layer = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.ellipse([gw * 0.1, gh * 0.1, gw * 0.9, gh * 0.9],
               fill=glow_color + (glow_alpha,))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(blur))
    gx = pos[0] - (gw - mascot.width) // 2
    gy = pos[1] - (gh - mascot.height) // 2
    canvas.paste(glow_layer, (gx, gy), glow_layer)


# ────────────────────────────────────────────────────────────────────────────
# OTP brand (orgtp.com): dark navy + gold accents
# ────────────────────────────────────────────────────────────────────────────
def compose_otp(mascot_path, eyebrow, lines, footer, output_path,
                glow_color=(212, 173, 50)):
    canvas = make_radial_bg((22, 32, 58), (8, 12, 28), cx_pct=0.82, cy_pct=0.28, scale=1.5)
    canvas = canvas.convert("RGBA")
    add_noise_dots(canvas, (255, 215, 100), count=60, alpha=18)

    mascot = fit_mascot(mascot_path, target_h=500)
    mx, my = 60, (H - mascot.height) // 2
    add_mascot_glow(canvas, mascot, (mx, my), glow_color=glow_color, glow_alpha=110)
    canvas.paste(mascot, (mx, my), mascot)

    text_x = mx + mascot.width + 50
    text_y = 120

    d = ImageDraw.Draw(canvas)

    # OTP wordmark
    f_brand = ImageFont.truetype(FONT_BOLD, 32)
    d.text((text_x, text_y), "OTP", font=f_brand, fill=(212, 173, 50, 255))
    text_y += 48

    # Eyebrow
    f_eb = ImageFont.truetype(FONT_REG, 16)
    d.text((text_x, text_y), eyebrow, font=f_eb, fill=(245, 200, 77, 220))
    text_y += 52

    # Headline lines
    for line, sz in lines:
        f = ImageFont.truetype(FONT_BOLD, sz)
        d.text((text_x, text_y), line, font=f, fill=(255, 255, 255, 255))
        text_y += int(sz * 1.08)

    # Footer
    f_foot = ImageFont.truetype(FONT_REG, 20)
    d.text((text_x, H - 80), footer, font=f_foot, fill=(245, 200, 77, 230))

    canvas.convert("RGB").save(output_path, "PNG", optimize=True)
    print(f"  wrote {output_path}  ({output_path.stat().st_size // 1024} KB)")


# ────────────────────────────────────────────────────────────────────────────
# Orger brand (orger.ai): Swamp Palette + dotted grid + Orgy
# ────────────────────────────────────────────────────────────────────────────
def compose_orger(output_paths):
    # Dark swamp background — almost flat, very subtle radial
    canvas = make_radial_bg((26, 43, 32), (15, 27, 20),
                            cx_pct=0.78, cy_pct=0.30, scale=1.4)
    canvas = canvas.convert("RGBA")

    # Orger's signature dotted grid (cream-ish dots at low alpha)
    add_dotted_grid(canvas, dot_color=(180, 196, 187), spacing=28, radius=1, alpha=55)

    # Orgy v2 mascot — left-centered, the protagonist
    mascot = fit_mascot(ORGER_NEXT_ROOT / "public" / "orgy-v2.png", target_h=520)
    mx, my = 60, (H - mascot.height) // 2
    add_mascot_glow(canvas, mascot, (mx, my),
                    glow_color=(166, 226, 46), glow_alpha=130, blur=65)
    canvas.paste(mascot, (mx, my), mascot)

    text_x = mx + mascot.width + 50
    text_y = 130

    d = ImageDraw.Draw(canvas)

    # "Coming soon" pill (matches site)
    pill_text = "● COMING SOON"
    f_pill = ImageFont.truetype(FONT_BOLD, 16)
    pill_bbox = d.textbbox((0, 0), pill_text, font=f_pill)
    pill_w = pill_bbox[2] - pill_bbox[0] + 28
    pill_h = 32
    pill_x, pill_y = text_x, text_y
    d.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                        radius=16, fill=(26, 43, 32, 255),
                        outline=(166, 226, 46, 180), width=1)
    d.text((pill_x + 14, pill_y + 8), pill_text,
           font=f_pill, fill=(166, 226, 46, 255))
    text_y += pill_h + 28

    # Orger wordmark
    f_brand = ImageFont.truetype(FONT_BOLD, 36)
    d.text((text_x, text_y), "Orger", font=f_brand, fill=(244, 241, 234, 255))
    text_y += 60

    # Headline — uses the actual site h1
    headline_lines = [
        ("Your org chart,", 58),
        ("with agents.", 58),
    ]
    for line, sz in headline_lines:
        f = ImageFont.truetype(FONT_BOLD, sz)
        d.text((text_x, text_y), line, font=f, fill=(244, 241, 234, 255))
        text_y += int(sz * 1.04)

    text_y += 14

    # Subhead — muted moss
    f_sub = ImageFont.truetype(FONT_REG, 18)
    sub_lines = [
        "Drag and drop the humans you have.",
        "Get grounded recommendations for the",
        "AI agents you should build.",
    ]
    for line in sub_lines:
        d.text((text_x, text_y), line, font=f_sub, fill=(184, 196, 187, 240))
        text_y += 24

    # Footer
    f_foot = ImageFont.truetype(FONT_BOLD, 20)
    d.text((text_x, H - 80), "orger.ai", font=f_foot,
           fill=(166, 226, 46, 255))

    # Save to all requested output paths
    rgb = canvas.convert("RGB")
    for p in output_paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        rgb.save(p, "PNG", optimize=True)
        print(f"  wrote {p}  ({p.stat().st_size // 1024} KB)")


def main():
    print("Composing OG images...\n")

    # ─── OTP family ──────────────────────────────────────────
    compose_otp(
        mascot_path=OTP_ROOT / "public" / "images" / "radar-mascot.png",
        eyebrow="ORGANIZATION TRANSPORT PROTOCOL",
        lines=[("Every tool you need", 56),
               ("to run your Meetings+", 56)],
        footer="Free during Beta · orgtp.com/meet-radar",
        output_path=OUT_OTP / "og-meet-radar.png",
    )
    compose_otp(
        mascot_path=OTP_ROOT / "public" / "images" / "orgy-mascot.png",
        eyebrow="ORGANIZATION TRANSPORT PROTOCOL",
        lines=[("The operating platform", 48),
               ("for leadership teams.", 48),
               ("Free in Beta.", 48)],
        footer="orgtp.com",
        output_path=OUT_OTP / "og-otp-home.png",
        glow_color=(166, 226, 46),  # Orgy is green — lime glow matches
    )
    compose_otp(
        mascot_path=OTP_ROOT / "public" / "images" / "coach-mascot.png",
        eyebrow="FOR EOS COACHES + IMPLEMENTERS",
        lines=[("Bring your clients", 52),
               ("onto OTP. Free.", 52)],
        footer="Founding 25 cohort · orgtp.com/coach",
        output_path=OUT_OTP / "og-coach.png",
        glow_color=(239, 68, 68),  # Coach has red — warm red glow
    )

    # ─── Orger ──────────────────────────────────────────────
    compose_orger(output_paths=[
        OUT_ORGER_APP / "opengraph-image.png",
        OUT_ORGER_APP / "twitter-image.png",
    ])

    print("\nDone.")


if __name__ == "__main__":
    main()
