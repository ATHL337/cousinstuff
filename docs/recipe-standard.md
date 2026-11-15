# CousinStuff Recipe Standard v2

## Purpose
CousinStuff is a practical family cookbook with a Fallout-inspired visual identity. A dish must be understandable without knowing Fallout; the fictional setting enriches a reliable real-world recipe.

## Source of truth
- Structured front matter `recipeIngredient` and `recipeInstructions` is the canonical data for new or reconciled recipes, social discovery (Recipe JSON-LD), and website widgets.
- Older recipes with both `## Ingredients` and `## Instructions` in the Markdown body continue to render that richer body once. **Do not delete body sections before reconciling them line by line with the structured data.**
- Recipes with only body content still render; missing metadata should not break existing URLs.
- Never assign synthetic RADS votes, force a new Vault slot, invent nutrition, or claim a recipe was tested without a cook.
- Retain established slug, date, and registry slot. Update `lastmod` when changing editorial content.

## Mandatory metadata for new recipes
`title`, `slug`, `date`, `description`, `summary`, `servings`, `prepTime`, `cookTime`, `totalTime`, `category`, `tags`, `image`, `images`, `recipeIngredient`, `recipeInstructions`, `draft`.

### Food category versus fictional collection
- `category`: human-readable **food type**, such as Main Dishes, Soups & Noodles, Soups & Stews, Casseroles & Bakes, Sides & Snacks, Desserts & Treats, Sauces & Bases.
- `collection`: optional storytelling universe/recipe collection, such as Foundation Provisions, Noodle Bar Rations, or Wasteland BBQ.
- `subtitle`: one short flavorful line. Do not substitute a fictional subtitle for a useful food description.
- `tags`: relevant searchable ingredients and occasions. Avoid near-duplicate terms when adding new content.

## Kitchen acceptance checklist
1. Ingredients: exact amounts, units, package sizes where relevant, and preparation state. Check allergen-sensitive options.
2. Equipment: correct pot/pan capacity, oven type, and any practical workarounds.
3. Flow: parallelizable prep, time windows, clear additions and simmer stages, doneness checkpoints.
4. Servings: specify realistic family portions and leftovers, not guesswork. If untested, state estimates.
5. Variation: keep mild family base and separate optional heat or toppings.
6. Storage: cooling timeframe, refrigerator/freezer appropriateness, safe reheating; do not copy generic storage advice blindly.
7. Provenance: identify inspirations, distinguishing real game lore from original fictional storytelling.
8. Media: authentic food photo whenever available, accurately depicting the dish. No identifiable family/child images without explicit authorization.

## Presentation
- Cookbook directory: searchable cards with real image or verified placeholder, clear category, prep/total time, servings and story summary.
- Recipe page: title, concise description, image, Cook/Print actions, one ingredient list, one instruction sequence, optional story/notes.
- In-browser ingredient checkboxes and copy-to-shopping-list are convenience features; they do not write data to a server and reset when the page reloads.
- Print output prioritizes quantities and directions over decorative imagery.
- Light/dark and Vault-Tec/Pip-Boy modes should preserve contrast, keyboard focus and mobile usability.

## Asset rules
- `image` points to a real file under `static/img/recipes/`.
- `images` references a real social image under `static/img/og/recipes/` or reuses the verified hero file. Broken paths are replaced by an existing default placeholder, never an invented hero.
- Separate family memories from public food photography.

## Rollout and verification
1. Before publishing: verify metadata, file paths, unique slugs, and that non-Vault content never displays `VT-??`.
2. Run Hugo for structural validation. Preview desktop/mobile, print, and both color skins when possible.
3. Publish with one review branch and one PR; avoid a branch per recipe.
4. Do not silently rewrite the actual taste/ingredient amounts of existing family favorites. Preserve details until an editorial/cooking review is complete.
5. Document outstanding family cook-tests in recipe notes, not as fabricated pass statuses.

## November 2026 migration notes
- Shared directory now supports category/time filtering, better imagery and search.
- The first full modern example is Vault Noodle Bar Shin Black Ramen.
- Everything Soup is the second reference, using 12 cups of broth with a 2-4 cup optional reserve and PrincessCackles' 16-quart steamer pot, insert removed.
- Older recipes retain their full legacy cooking narratives until properly reconciled.
