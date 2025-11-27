# Waterfall Chart

This is a standalone React/Vite build of the inspection waterfall chart so it can live on its own public URL. The component code is identical to the in-app version and includes all of the editing/import/export controls.

## Local development

```bash
cd waterfall
npm install
npm run dev
```

## Static build

```bash
npm run build
```

The optimized output will be written to `dist/` and is what we publish to GitHub Pages.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy-waterfall.yml` watches this folder. Whenever you push changes to `main` it will:

1. Install dependencies
2. Run the production build
3. Upload `dist/`
4. Deploy it to GitHub Pages

Once the workflow runs the first time, the site will be served from:

```
https://abromberg.github.io/inspektor-server/
```

If you want to use a different base path, set `VITE_BASE_PATH` before running `npm run build` or update `vite.config.js`.
