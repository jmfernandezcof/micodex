# Micodex — Saceruela Mushroom Days

Offline-first web app (PWA) built for the **Jornadas Micológicas de Saceruela** (27-28 Nov 2026), a village mushroom festival in Spain. Audience: older people and kids, many with poor mobile coverage in the field.

**Live:** https://setas.nomadprompters.es (Spanish)

## What it does

- **Catalogue** of 200 local species, each with a licensed photo, look-alikes and season months.
- **Micodex**: collect the mushrooms you find with your own photos, with guided identification that always suggests ("you think it is…") and never gives a verdict.
- **Collectable gnomes** and achievements to keep kids engaged on the walk.
- Works fully offline once installed.

## Safety rules (hard requirements)

- The app **never says whether a mushroom can be eaten**. There is no edibility field in the data, and no text mentions cooking or recipes.
- Fixed banner on every species card: *"This app never says whether a mushroom can be eaten. Always ask a mycologist."*
- Deadly species carry a red **DEADLY** strip, also shown on the cards of the species they are confused with.
- A build-time test (`scripts/palabras-prohibidas.mjs`) fails the build if forbidden words appear (scientific names exempted).
- Every species card was reviewed by a mycologist before release.

## Privacy

- No backend: photos and the collection live only on the phone (IndexedDB).
- Photos are resized and re-encoded in a canvas before saving, which strips EXIF and GPS data.
- No cookies, analytics, CDNs or third-party fonts. Strict CSP (`default-src 'self'`), no inline scripts.

## Stack

Vite · Preact · vite-plugin-pwa (Workbox) · idb. Pinned dependency versions.

```bash
npm ci
npm run dev      # local dev server
npm test         # catalogue, achievements and safety tests
npm run build
```

## Credits

Species photos come from free-licence sources (CC BY / CC BY-SA and similar); author, licence and link for each photo are listed in `contenido/catalogo.csv` and on the in-app credits page. Photos were resized and converted to WebP. Gnome illustrations were made with AI assistance from an original design.

Built by [Nomad Prompters](https://nomadprompters.es).
