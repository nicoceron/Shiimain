# Shiimain

Territory intelligence demo for La Guajira. Shiimain combines public territorial, municipal, contractual, documentary, and delivery-visibility signals so teams can prioritize analysis with traceable evidence.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL and use `#/demo` for the intelligence dashboard.

## Build

```bash
npm run build
npm run preview
```

## Demo Scope

- Territory-first prioritization for Wayuu territories and La Guajira municipalities.
- Public-source evidence from SIWayuu/DANE, SECOP, UNGRD, municipal response layers, document extraction, and delivery-visibility datasets.
- Contract and invoice fields are shown only as public context signals, not workflow actions.
- Missing or weak evidence is displayed as an intelligence gap; the demo does not infer facts that the source data cannot support.

## Data

Static JSON files in `src/data/` were adapted from the reference `hunger-response-os` project and are imported directly by the Vite app. The dashboard is fully client-side: no backend, auth, writes, or operational routing.
