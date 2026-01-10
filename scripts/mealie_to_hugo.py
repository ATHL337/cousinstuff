#!/usr/bin/env python3
"""Convert Mealie recipe JSON exports into Hugo Markdown pages.

Usage:
  python scripts/mealie_to_hugo.py --input ./exports --output ./content/recipes

Notes:
- Accepts a directory of JSON files OR a single JSON file.
- Does NOT download images from Mealie automatically. If your export includes image files,
  place them under `static/images/recipes/` and set front matter `image` paths accordingly.
"""

import argparse
import json
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s-]+", "-", s)
    return s.strip("-")

def clean(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()

def parse_groups(recipe: dict):
    groups = defaultdict(list)
    for ing in recipe.get("recipe_ingredient", []):
        title = clean(ing.get("title")) or "Ingredients"
        disp = clean(ing.get("display")) or ""
        if disp:
            groups[title].append(disp)
    return groups

def parse_instructions(recipe: dict):
    steps = []
    for s in recipe.get("recipe_instructions", []):
        summary = clean(s.get("summary")) or ""
        text = (s.get("text") or "").strip()
        text = text.strip()
        if not text and not summary:
            continue
        steps.append((summary, text))
    return steps

def parse_notes(recipe: dict):
    notes = []
    for n in recipe.get("notes", []):
        t = clean(n.get("title")) or "Notes"
        txt = (n.get("text") or "").strip()
        if txt:
            notes.append((t, txt))
    return notes

def to_markdown(recipe: dict) -> str:
    title = recipe.get("name") or "Untitled Recipe"
    slug = recipe.get("slug") or slugify(title)
    date_added = recipe.get("date_added") or ""
    try:
        date_iso = datetime.fromisoformat(date_added).date().isoformat() if date_added else ""
    except Exception:
        date_iso = ""

    fm = {
        "title": title,
        "slug": slug,
        "date": date_iso or datetime.utcnow().date().isoformat(),
        "servings": int(recipe.get("recipe_servings") or 0) or None,
        "prepTime": clean(recipe.get("prep_time")),
        "totalTime": clean(recipe.get("total_time")),
        "tags": recipe.get("tags") or [],
        # "image": "/images/recipes/<filename>.jpg",  # optional
        "description": clean(recipe.get("description")),
    }

    # Build YAML front matter
    lines = ["---"]
    for k, v in fm.items():
        if v is None:
            continue
        if isinstance(v, list):
            lines.append(f"{k}: {v}")
        else:
            lines.append(f"{k}: {json.dumps(v)}" if isinstance(v, str) else f"{k}: {v}")
    lines.append("---\n")

    groups = parse_groups(recipe)
    steps = parse_instructions(recipe)
    notes = parse_notes(recipe)

    # Content
    if groups:
        for group, items in groups.items():
            lines.append(f"## {group}\n")
            for it in items:
                lines.append(f"- {it}")
            lines.append("")

    if steps:
        lines.append("## Instructions\n")
        for summary, text in steps:
            if summary:
                lines.append(f"### {summary}")
            if text:
                # Keep formatting; ensure list markers remain intact
                lines.append(text.rstrip())
            lines.append("")

    if notes:
        for t, txt in notes:
            lines.append(f"## {t}\n")
            lines.append(txt.rstrip())
            lines.append("")

    return "\n".join(lines).strip() + "\n"

def iter_json_files(inp: Path):
    if inp.is_file() and inp.suffix.lower() == ".json":
        yield inp
        return
    if inp.is_dir():
        for p in sorted(inp.rglob("*.json")):
            yield p

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="JSON file or directory of JSON files")
    ap.add_argument("--output", required=True, help="Output directory (e.g., content/recipes)")
    args = ap.parse_args()

    inp = Path(args.input).expanduser().resolve()
    out = Path(args.output).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)

    count = 0
    for jf in iter_json_files(inp):
        data = json.loads(jf.read_text(encoding="utf-8"))
        slug = data.get("slug") or slugify(data.get("name") or jf.stem)
        md = to_markdown(data)
        (out / f"{slug}.md").write_text(md, encoding="utf-8")
        count += 1

    print(f"Wrote {count} recipe(s) to {out}")

if __name__ == "__main__":
    main()
