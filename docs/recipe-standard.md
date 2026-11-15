# CousinStuff Recipe Standard: P0 Rendering + Photography

## Governing principle

CousinStuff is a family-tested cookbook presented as a Fallout-inspired provision registry. Real quantities, a reproducible kitchen workflow, safety, and serving guidance always outrank flavor text.

## Rendering rules

- Structured Hugo keys `recipeIngredient` and `recipeInstructions` provide the canonical content for newly standardized pages and JSON-LD.
- Newly standardized recipes MUST NOT repeat full Ingredients or Instructions sections in their Markdown body. Use the body for the origin story, shortcuts, variations, storage, family tasting notes, and pairing ideas.
- The shared recipe template temporarily detects legacy pages that contain BOTH `## Ingredients` and `## Instructions` (or `## Directions`) and displays that body instead of duplicating the structured sections. The structured data still drives JSON-LD. During migration reconcile the two sources before removing legacy body sections.
- Missing Vault registry slot must display `CS`, not a fabricated Vault number. In-universe category or subtitle is independent of slot assignment.
- Avoid creating a new URL when standardizing an existing recipe; preserve `slug` and original `date`, set `lastmod` when updated.

## Recipe metadata

Required for new recipes: title, slug, date, description, summary, tags, category, image, images, servings, prepTime, cookTime, totalTime, recipeIngredient, recipeInstructions, draft.

Optional: subtitle, collection, slot (only for actual Vault registry entries), lastmod, provenance / inspiration, tested status.

Categories describe food type (Soups & Noodles, Stews, Casseroles, Desserts); `collection` describes the Fallout flavor (e.g. Noodle Bar Rations, Foundation Provisions).

## Recipe body sections

1. Overview / family story, with factual status for any game-lore invention.
2. Kitchen equipment and measured ingredient swap options.
3. Clear cook checkpoints, only when they ADD to canonical structured instructions.
4. Family customization, including mild main pot and adult bowl-level heat.
5. Storage, leftovers and safe reheating.
6. What we learned from the family test and what remains untested.
7. Serving and pairing suggestions.

All ingredient quantities must have units and preparations. Timing must reconcile with actual prep, simmer, and rest windows.

## Photography

- Recipe hero: authentic photograph of the cooked dish, ideally horizontal 16:9 with subject safely centered. Use a JPG or WebP under about 500 KB where feasible; check actual dimensions and mobile cropping.
- Recipe identity must be grounded in the REAL final plate. Avoid artificial imagery that contradicts the ingredient list.
- Food-only photographs may be used for published recipe images. Images showing identifiable family members require affirmative permission before publication.
- Keep image path `/img/recipes/<slug>.jpg`, and set `images` to the same photo until a custom social crop exists.
- No broken image links: stage the actual asset before changing `image` or `images` in recipe metadata.
- For the November 15 Shin Black ramen photos: use food-only close-up 15485.jpg (prepared locally as `vault-noodle-bar-shin-black-chicken-ramen.jpg`) as the first hero candidate. 15478.jpg can support the recipe later. Do NOT upload the family-table and child photographs without explicit approval.

## Acceptance

- Verify Hugo build and printed recipe.
- Confirm exactly one visible ingredients list and cooking instructions sequence.
- Confirm JSON-LD Recipe data contains current quantities and steps.
- Check hero crop on desktop and mobile, light/dark, Corp/Pip-Boy skins.
- Check family-serving scaling, storage, safety, and step timing.
- No unsolicited GitHub Actions or new branches beyond the review branch.

## Future migration

Convert remaining legacy recipes in small, reviewed batches: compare existing body to the structured arrays, reconcile, then remove duplicate body sections. Template fallback is a bridge, not permission for long-term divergent copies.
