# CousinStuff (Hugo + GitHub Pages)

A family-friendly, static recipe site with:
- Search bar (client-side)
- Tag filtering (Hugo taxonomies)
- Print button on each recipe
- Dark mode toggle

## Local dev

1) Install Hugo Extended
2) Run:
   hugo server -D

Open: http://localhost:1313

## Deploy (GitHub Pages)

1) Create a GitHub repo and push this project to `main`
2) In GitHub:
   - Settings → Pages → Build and deployment → Source: GitHub Actions
3) Push to `main` and the workflow will deploy.

## Custom domain

1) GitHub → Settings → Pages → Custom domain (e.g., `cousinstuff.com`)
2) Add DNS records:
   - `A` records for apex to GitHub Pages IPs
   - `CNAME` for `www` to `<your-username>.github.io`
3) GitHub will provision HTTPS.

## Importing from Mealie

See `scripts/mealie_to_hugo.py`.

Recommended approach:
- Export recipes from Mealie as JSON (one file per recipe is easiest).
- Run:
  python scripts/mealie_to_hugo.py --input ./exports --output ./content/recipes

Images:
- For "safe" imports, only use images you own/have rights to.
- Strip EXIF + downsize before committing (example helper in `scripts/sanitize_images.py`).
