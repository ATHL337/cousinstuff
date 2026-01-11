#!/usr/bin/env python3
"""
Assign explicit Vault slots (1..33) to Hugo recipe Markdown files.

Default behavior:
- Reads ./content/recipes/*.md
- Sorts by title (front matter 'title'), then assigns slots 1..N
- Writes/updates 'slot: <n>' in YAML front matter

Usage:
  python scripts/assign_slots.py --content ./content/recipes
"""

import argparse
import re
from pathlib import Path

FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)

def read_front_matter(md: str) -> tuple[str, str]:
    m = FM_RE.match(md)
    if not m:
        raise ValueError("Missing YAML front matter (--- ... ---) at file start")
    fm = m.group(1)
    body = md[m.end():]
    return fm, body

def get_title(fm: str) -> str:
    # title: "..."
    m = re.search(r'^\s*title:\s*["\']?(.*?)["\']?\s*$', fm, re.MULTILINE)
    return (m.group(1).strip() if m else "").lower()

def set_slot(fm: str, slot: int) -> str:
    if re.search(r'^\s*slot:\s*\d+\s*$', fm, re.MULTILINE):
        fm = re.sub(r'^\s*slot:\s*\d+\s*$', f"slot: {slot}", fm, flags=re.MULTILINE)
    else:
        # insert near top, after title if present, else at top
        lines = fm.splitlines()
        out = []
        inserted = False
        for line in lines:
            out.append(line)
            if not inserted and line.strip().startswith("title:"):
                out.append(f"slot: {slot}")
                inserted = True
        if not inserted:
            out = [f"slot: {slot}"] + out
        fm = "\n".join(out)
    return fm

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--content", default="./content/recipes", help="Path to recipes content directory")
    ap.add_argument("--max", type=int, default=33, help="Max slots")
    args = ap.parse_args()

    content = Path(args.content).resolve()
    files = sorted(content.glob("*.md"))

    recipes = []
    for f in files:
        md = f.read_text(encoding="utf-8")
        fm, body = read_front_matter(md)
        title = get_title(fm) or f.stem.lower()
        recipes.append((title, f, fm, body))

    recipes.sort(key=lambda x: x[0])

    if len(recipes) > args.max:
        print(f"WARNING: You have {len(recipes)} recipes, but only {args.max} slots. Only the first {args.max} will be assigned.")
    limit = min(len(recipes), args.max)

    for i in range(limit):
        title, f, fm, body = recipes[i]
        new_fm = set_slot(fm, i + 1)
        out = f"---\n{new_fm}\n---\n{body.lstrip()}"
        f.write_text(out, encoding="utf-8")
        print(f"Assigned slot {i+1:02d} -> {f.name}")

if __name__ == "__main__":
    main()
