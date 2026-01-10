#!/usr/bin/env python3
"""Sanitize recipe images for safe hosting.

- Strips metadata (EXIF)
- Converts to JPEG (optional)
- Resizes to a max dimension (default 1600px)

Usage:
  python scripts/sanitize_images.py --input ./raw_images --output ./static/images/recipes

Requires: Pillow
  pip install pillow
"""

import argparse
from pathlib import Path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument("--max", type=int, default=1600, help="max width/height")
    args = ap.parse_args()

    try:
        from PIL import Image
    except Exception as e:
        raise SystemExit("Pillow not installed. Run: pip install pillow") from e

    inp = Path(args.input).resolve()
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)

    exts = {".jpg", ".jpeg", ".png", ".webp"}
    count = 0
    for p in inp.rglob("*"):
        if p.suffix.lower() not in exts:
            continue
        im = Image.open(p)
        im = im.convert("RGB")  # drop alpha + metadata path
        im.thumbnail((args.max, args.max))
        dest = out / (p.stem + ".jpg")
        im.save(dest, "JPEG", quality=85, optimize=True, progressive=True)
        count += 1

    print(f"Sanitized {count} image(s) into {out}")

if __name__ == "__main__":
    main()
