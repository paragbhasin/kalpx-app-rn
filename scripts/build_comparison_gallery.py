#!/usr/bin/env python3
"""
build_comparison_gallery.py — generate side-by-side web vs RN comparison HTML.

Reads web reference PNGs from ~/kalpx-frontend/tests/e2e/screenshots/matrix/
and RN captures from ~/kalpx-app-rn/screenshots/persona_*/, lays them out
in a 2-column gallery (web left / RN right) with labels.

Output: ~/kalpx-app-rn/screenshots/comparison.html
"""
from __future__ import annotations

import html
from pathlib import Path

WEB_DIR = Path.home() / "kalpx-frontend" / "tests" / "e2e" / "screenshots" / "matrix"
RN_DIR = Path.home() / "kalpx-app-rn" / "screenshots"
OUT = RN_DIR / "comparison.html"

# Map web reference → RN persona + stage
# Each tuple: (section_title, web_filename, rn_persona_dir, rn_stage_name_prefix)
MAPPING = [
    # Day 7 Engaged — 4 stages (intro → grid → mirror → decision)
    ("Day 7 · Engaged · 1. Intro", "CP7.E.01.png", "verify_full_flow", "02_intro_loaded"),
    ("Day 7 · Engaged · 2. Journey Grid", "CP7.E.02.png", "verify_full_flow", "03_grid_real"),
    ("Day 7 · Engaged · 3. Continuity Mirror", "CP7.E.03.png", "persona_day7_high", "03_mirror"),
    ("Day 7 · Engaged · 4. Your path continues", "CP7.E.06.png", "verify_full_flow", "04_mirror_correct"),
    # Day 7 Medium
    ("Day 7 · Medium · Mirror", "CP7.L.03.png", "persona_day7_medium", "03_mirror"),
    # Day 7 Low
    ("Day 7 · Low · Mirror", "CP7.L.03.png", "persona_day7_low", "03_mirror"),
    # Day 7 Near-zero → lighten
    ("Day 7 · Near-zero · Path lightened", "CP7.N.03.png", "persona_day7_nearzero", "04_decision"),
    # Day 14 variants
    ("Day 14 · Mastered · Intro", "CP14.E.01.png", "persona_day14_mastered", "02_intro"),
    ("Day 14 · Mastered · Mirror", "CP14.E.03.png", "persona_day14_mastered", "03_mirror"),
    ("Day 14 · Mastered · Choose Next Step", "CP14.E.06.png", "persona_day14_mastered", "06_decision_screen"),
    ("Day 14 · Medium · Mirror", "CP14.L.03.png", "persona_day14_medium", "03_mirror"),
    ("Day 14 · Low · Mirror", "CP14.L.03.png", "persona_day14_low", "03_mirror"),
    # Welcome Back
    ("Welcome Back", "WB.01.png", "persona_welcomeback", "01_home"),
]


def find_latest(dir_path: Path, prefix: str) -> Path | None:
    """Return the latest .png in dir_path whose stem starts with prefix."""
    if not dir_path.is_dir():
        return None
    matches = sorted(
        [p for p in dir_path.glob("*.png") if p.stem.startswith(prefix)],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return matches[0] if matches else None


def relpath(target: Path, start: Path) -> str:
    """Python 3.10+ Path.relative_to supports walk_up in 3.12, fall back."""
    import os

    return os.path.relpath(target, start).replace(os.sep, "/")


def main() -> None:
    sections: list[str] = []
    for title, web_file, rn_persona_dir, rn_prefix in MAPPING:
        web_path = WEB_DIR / web_file
        rn_dir = RN_DIR / rn_persona_dir
        rn_path = find_latest(rn_dir, rn_prefix)

        web_ok = web_path.exists()
        rn_ok = rn_path is not None and rn_path.exists()

        web_src = relpath(web_path, RN_DIR) if web_ok else ""
        rn_src = relpath(rn_path, RN_DIR) if rn_ok else ""

        sections.append(
            f"""
<section>
  <h2>{html.escape(title)}</h2>
  <div class="pair">
    <figure>
      <div class="label web">WEB MOBILE · 390×844</div>
      {('<img src="' + html.escape(web_src) + '" loading="lazy">') if web_ok else '<div class="missing">web reference missing</div>'}
      <figcaption>{html.escape(web_file)}</figcaption>
    </figure>
    <figure>
      <div class="label rn">RN · emulator 1080×2400</div>
      {('<img src="' + html.escape(rn_src) + '" loading="lazy">') if rn_ok else '<div class="missing">RN capture missing</div>'}
      <figcaption>{html.escape(rn_path.name) if rn_ok else ''}</figcaption>
    </figure>
  </div>
</section>
"""
        )

    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>KalpX Web vs RN — Checkpoint Comparison</title>
<style>
  body {{
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    background: #1a1410;
    color: #fdfaf3;
    margin: 0;
    padding: 32px 24px 64px;
  }}
  h1 {{ font-size: 28px; margin: 0 0 8px; color: #e8c060; letter-spacing: 0.3px; }}
  p.subtitle {{ color: #8c7355; margin: 0 0 32px; font-size: 14px; }}
  section {{
    margin: 48px 0;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(201, 168, 76, 0.15);
  }}
  h2 {{
    font-size: 20px;
    color: #e8c060;
    margin: 0 0 18px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }}
  .pair {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }}
  figure {{
    background: #2a1e14;
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 14px;
    padding: 12px;
    margin: 0;
  }}
  img {{
    width: 100%;
    border-radius: 8px;
    display: block;
  }}
  .label {{
    font-size: 10px;
    font-weight: 600;
    color: #8c7355;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }}
  .label.web {{ color: #7fb069; }}
  .label.rn  {{ color: #d9a557; }}
  .missing {{
    padding: 120px 20px;
    text-align: center;
    color: #6a4d28;
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    font-size: 13px;
    font-style: italic;
  }}
  figcaption {{
    font-size: 11px;
    color: #6a4d28;
    padding-top: 8px;
    word-break: break-all;
  }}
  @media (max-width: 900px) {{
    .pair {{ grid-template-columns: 1fr; }}
  }}
</style>
</head>
<body>
<h1>KalpX Checkpoint — Web Mobile vs RN</h1>
<p class="subtitle">Left: web (kalpx-frontend Playwright @ 390×844). Right: React Native (Pixel 7 emulator @ 1080×2400). Personas seeded via <code>seed_test_journey --engagement {{high|medium|low|near_zero|mastered}}</code> with real JourneyActivity rows so checkpoint metrics reflect actual engagement.</p>
{"".join(sections)}
</body>
</html>
"""
    OUT.write_text(doc)
    print(f"Wrote {OUT}")
    print(f"Open in browser: open {OUT}")


if __name__ == "__main__":
    main()
