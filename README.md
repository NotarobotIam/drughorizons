# DrugHorizons

A clinical research discovery platform with trial exploration, sourced research reporting, and an integrated molecular workspace.

## Run locally

Requirements: Python 3; Node.js 18+ for JavaScript syntax checks. No dependency installation or build step is required.

```sh
npm run dev
```

Open http://localhost:8000. The server serves `dist/` at the origin root; absolute asset paths and page URLs rely on that layout.

```sh
npm run check
```

This checks JavaScript syntax. It does not replace browser interaction testing or verify external APIs.

## Pages

- `/trials/`: body-system discovery, registry search, and on-platform trial details.
- `/reports/`: curated research news with publisher, publication date, and source type.
- `/molecules/`: PubChem name/SMILES lookup, 3D conformers, calculated descriptors, and educational reaction schemes.
- `/saved/`: trials saved in the current browser.
- `/provenance/`: sources, methods, and limitations.
- `/guide/`: illustrated clinical trial phase guide.

The root URL also opens the trial explorer.

## Implementation

The deployable application is in `dist/`: HTML page documents, shared vanilla JavaScript, CSS, and image assets. Despite its conventional name, `dist/` currently contains the editable application source and must be committed. Shared markup is repeated in the page documents; update all affected pages when changing common HTML.

- `app.js`: registry exploration and molecular workspace.
- `trial-details.js`: on-platform trial details, locations, contacts, and posted registry results.
- `news.js`: curated reports and filtering.
- `pages.js`: initialization for each page.
- `theme.js`: system/light/dark preference and keyboard controls.
- `console.css`: shared visual system.

## Data and current limitations

ClinicalTrials.gov records and PubChem properties/conformers are fetched from their public APIs in the visitor's browser. Registry records may lag individual site status. PubChem, 3Dmol.js, and Google Fonts require external network access. A labeled 2D fallback is used when a 3D conformer or renderer is unavailable.

Reports are curated, not automatically ingested. Saved trials and theme preferences use browser-local storage. No accounts or cross-device synchronization are implemented.

Synthesis routes are educational examples, not validated predictions. Missing affinity, pKa, and confidence intervals are not fabricated. Registry-posted results are displayed when available. This is research information, not individual treatment advice.

## Hosting

The existing private Sites deployment remains configured by `.openai/hosting.json`. This GitHub repository provides version control and collaboration; GitHub pushes do not automatically deploy the site. No GitHub Pages or Actions deployment has been enabled.

To host elsewhere, serve the contents of `dist/` at the site root and preserve directory index routing.

## Assets and licensing

The clinical trial phase illustration and Molecular Horizon branding were created for DrugHorizons. External data, reporting, fonts, and rendering libraries remain subject to their respective terms. No open-source license has been selected for this repository.
