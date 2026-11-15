#!/usr/bin/env python3
"""Read-only audit of CousinStuff Hugo recipes. Stdlib only; no GitHub Actions required.

Usage:
    python scripts/audit_recipes.py
    python scripts/audit_recipes.py --root F:\Sites\cousinstuff

Exits nonzero only on errors that can break the cookbook. Legacy body duplicates
and intentionally generic image placeholders are reported as editorial warnings.
"""
from __future__ import annotations

import argparse
import re
from collections import Counter
from pathlib import Path

REQUIRED = (
    "title", "slug", "date", "description", "summary", "tags", "category",
    "servings", "prepTime", "cookTime", "totalTime", "image", "images",
    "recipeIngredient", "recipeInstructions",
)
FOOD_CATEGORIES = {
    "Main Dishes", "Soups & Noodles", "Soups & Stews", "Casseroles & Bakes",
    "Sides & Snacks", "Desserts & Treats", "Sauces & Bases",
}
FRONT = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.S)
FIELD = re.compile(r"^([A-Za-z][A-Za-z0-9_]*):[ \t]*(.*)$", re.M)


def cleaned(value: str) -> str:
    return value.strip().strip("'\"")


def get_list(front: str, key: str) -> list[str]:
    """Read simple front-matter YAML arrays (both indented and old left-aligned)."""
    lines = front.splitlines()
    start = next((i for i, v in enumerate(lines) if v.startswith(key + ":")), None)
    if start is None:
        return []
    inline = lines[start].partition(":")[2].strip()
    if inline.startswith("[") and inline.endswith("]"):
        return [cleaned(x) for x in inline[1:-1].split(",") if x.strip()]
    result = []
    for line in lines[start + 1:]:
        if re.match(r"^\s*-\s+", line):
            result.append(cleaned(re.sub(r"^\s*-\s+", "", line)))
        else:
            break
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    root = args.root.resolve()
    folder = root / "content" / "recipes"
    if not folder.is_dir():
        parser.error("Missing content/recipes in " + str(root))

    files = sorted(folder.glob("*.md"))
    errors, warnings, slugs, slots = [], [], [], []
    for file in files:
        text = file.read_text(encoding="utf-8")
        m = FRONT.match(text)
        if not m:
            errors.append(f"{file.name}: missing --- front matter")
            continue
        fm, body = m.group(1), text[m.end():]
        fields = dict(FIELD.findall(fm))
        for key in REQUIRED:
            if key not in fields:
                errors.append(f"{file.name}: missing {key}")
        slug = cleaned(fields.get("slug", ""))
        if slug:
            slugs.append(slug)
        category = cleaned(fields.get("category", ""))
        if category and category not in FOOD_CATEGORIES:
            warnings.append(f"{file.name}: nonstandard category {category!r}")
        for key in ("recipeIngredient", "recipeInstructions"):
            if key in fields and not get_list(fm, key):
                errors.append(f"{file.name}: empty {key}")
        images = [cleaned(fields.get("image", ""))] + get_list(fm, "images")
        for image in images:
            if not image.startswith("/img/") or ".." in image.split("/"):
                errors.append(f"{file.name}: invalid image path {image!r}")
                continue
            if not (root / "static" / image.lstrip("/")).is_file():
                errors.append(f"{file.name}: missing image asset {image}")
        if cleaned(fields.get("image", "")) == "/img/recipes/default.png":
            warnings.append(f"{file.name}: hero photo still uses site placeholder")
        if re.search(r"(?im)^##\s*Ingredients\s*$", body) and re.search(
            r"(?im)^##\s*(?:Instructions|Directions)\s*$", body
        ):
            warnings.append(f"{file.name}: legacy body directions; reconcile before migrating")
        slot = cleaned(fields.get("slot", ""))
        if slot and slot.lower() not in ("null", "none"):
            try:
                slots.append(int(slot))
            except ValueError:
                errors.append(f"{file.name}: invalid slot {slot!r}")

    for slug, number in Counter(slugs).items():
        if number > 1:
            errors.append(f"duplicate recipe slug: {slug}")
    for slot, number in Counter(slots).items():
        if number > 1:
            errors.append(f"duplicate Vault slot: {slot}")

    print(f"CousinStuff: {len(files)} Markdown recipes | "
          f"{len(errors)} errors | {len(warnings)} editorial warnings")
    for message in errors:
        print("ERROR:", message)
    for message in warnings:
        print("NOTE: ", message)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
