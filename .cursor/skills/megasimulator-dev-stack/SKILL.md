---
name: megasimulator-dev-stack
description: >-
  MegaSimulator: run API + Vite locally, launch profile, rate-limit policies,
  payroll PAS/default Parts gotcha, contact endpoint, and deployment checklist pointer.
  Use when starting dev servers, debugging local setup, or preparing prod/domain work.
---

# MegaSimulator — stack local & rappels ops

## Démarrage rapide

Deux processus en parallèle (racine du dépôt `MegaSimulator`) :

1. **API** (port 5000, profil avec Postgres + secrets locaux) :

   ```powershell
   dotnet run --project src/Api/Api.csproj --launch-profile LocalWithDeps
   ```

2. **Frontend** (port 5173, proxy `/api` → localhost:5000) :

   ```powershell
   Set-Location src/Frontend; npm run dev
   ```

- Ouvrir l’UI : `http://localhost:5173/` (ne pas tester l’API seule sur :5000 pour les appels XHR du front sans CORS/proxy adapté).
- Prérequis : PostgreSQL joignable avec la connection string du profil (`launchSettings.json`).

## Données & historique

- **Simulations sauvegardées** : au plus **10** par compte utilisateur (les plus anciennes supprimées quand une nouvelle est enregistrée ou à l’ouverture de l’historique) — voir `SimulationRepository.MaxSimulationsPerUser`.

## Sécurité API (rappel)

- **Rate limiting** (`Program.cs`) : `contact` 5 req/min, `auth` 10/min, `simulate` 15/min — endpoints marqués `EnableRateLimiting(...)`.
- **UserController** : JWT requis ; un utilisateur ne modifie que son profil sauf rôle `admin`.
- **Contact** : `POST /api/contact`, anonyme autorisé, taille requête limitée, persistance table `contact_requests`.

## Piège métier — paie / tests

- `PayrollRequestDto.Parts` **défaut = 1**. Dans `PayrollService.Simulate`, si `RetenuePct` est 0 et `Parts > 0`, le barème **PAS** est appliqué sur le net — le net baisse fortement vs. un simple brut×(1−cotisations).
- Pour des tests ou scénarios « net sans PAS », utiliser **`Parts = 0`** ou une retenue explicite selon le besoin.

## SEO (frontend)

- Routes FR canoniques : **`src/Frontend/src/seo/paths.js`** (ex. `/simulateur-paie-brut-net`). Build : **`VITE_PUBLIC_SITE_URL`** pour `dist/sitemap.xml` + `robots.txt` (`vite.config.js` plugin).
- Hébergement SPA : **`vercel.json`** ou **`public/_redirects`** (Netlify).

## Déploiement & domaine (bientôt)

- Checklist et tâches « partager avec des ami·e·s testeurs » : **`docs/planning/2026-03-31-deployment-and-domain.md`**
- Toujours aligner `FRONTEND__URL`, CORS, et origines Google OAuth sur l’URL publique.

## Recherche web

- Avant recherche web ou fetch URL pour réglementation à jour : respecter la skill **`web-search-ask-first`** et § 4.4 de `docs/general-guidelines.md`.
