---
name: megasimulator-dev-stack
description: >-
  MegaSimulator: run API + Vite locally, launch profile, rate limits, payroll PAS/Parts,
  simulation history cap (10), savings API, DB without salaires/simulation_results (migration 010),
  contact API (no mailto fallback), production deploy
  (Docker Compose, Nginx, Cloudflare), PostgreSQL via SSH tunnel + pgAdmin, admin email domain.
  Use for dev servers, prod deploy, DB access, OAuth, and ops debugging.
---

# MegaSimulator — stack local & production

## Démarrage local

Deux processus (racine du dépôt) :

1. **API** (port 5000, Postgres via profil) :

   ```powershell
   dotnet run --project src/Api/Api.csproj --launch-profile LocalWithDeps
   ```

2. **Frontend** (5173, proxy `/api` → 5000) :

   ```powershell
   Set-Location src/Frontend; npm run dev
   ```

- UI : `http://localhost:5173/`. Ne pas compter sur l’API seule pour les XHR du front sans CORS/proxy.
- Prérequis : PostgreSQL joignable (`launchSettings.json`).

## Production — où lire la doc

- **Guide complet** : **`deploy/DEPLOY.md`** (architecture, `.env`, `docker compose`, Nginx, Cloudflare, pièges, admin).
- **Checklist courte** : **`docs/planning/2026-03-31-deployment-and-domain.md`**.

Synthèse : `docker-compose.deploy.yml` sur le VPS (`/opt/megasimulator`), fichier **`.env`** pour secrets ; Nginx sur l’hôte en **HTTP :80** → **127.0.0.1:8080** (conteneur frontend) ; Postgres publié seulement en **127.0.0.1:5432** sur le VPS.

**CI/CD GitHub** : `.github/workflows/ci-cd.yml` (Actions) — tests .NET + build Vite, images **GHCR** sur push, déploiement SSH si secrets `DEPLOY_*` configurés ; détail dans **`deploy/DEPLOY.md` § 7**.

### Mise à jour sur le VPS

```bash
cd /opt/megasimulator
git fetch origin && git reset --hard origin/master
docker compose -f docker-compose.deploy.yml --env-file .env build api1 api2 frontend
docker compose -f docker-compose.deploy.yml --env-file .env up -d
```

Adapter les services ciblés. Toute variable **`VITE_*`** impose un **rebuild du frontend**.

### PostgreSQL depuis votre PC (pgAdmin)

1. Tunnel SSH (PowerShell : **ne pas** nommer une variable `$Host`) :

   ```powershell
   $key = "$env:USERPROFILE\.ssh\id_ed25519_hetzner"
   $srv = "root@IP_DU_VPS"
   ssh -i $key -L 5433:127.0.0.1:5432 -N $srv
   ```

2. Client SQL : **127.0.0.1**, port **5433**, DB **`simulator`**, user **`simu`**, mot de passe selon compose / `.env`.

Sans tunnel, **127.0.0.1** = machine locale, pas le serveur.

## Données & contact

- **Historique** : **10** simulations max / utilisateur (`SimulationRepository.MaxSimulationsPerUser`). Stockage = table **`simulations`** (payload JSON). Les tables **`salaires`** et **`simulation_results`** ont été **supprimées** (migration **010**) — pas d’API salaires historiques ; résultats paie enrichis restent dans `payload`.
- **Épargne** : `POST /api/savings/simulate` — params section `savings` dans `docs/knowledge-base/params/2026.json` et `PayrollParams.Savings`.
- **Contact** : `POST /api/contact` uniquement — **pas** de `mailto` de secours ; pas de domaine **`m-simulator.com`** dans l’app.
- **Admin seed** : e-mail **`admin@megasimulateur.org`** (migration **009** + `Program.cs`).

## Sécurité API

- Rate limiting (`Program.cs`) : `contact` 5/min, `auth` 10/min, `simulate` 15/min.
- **UserController** : JWT ; pas d’IDOR sur profil.

## Piège paie / tests

- `PayrollRequestDto.Parts` **défaut = 1**. Si `RetenuePct` = 0 et `Parts` > 0, le **PAS** s’applique sur le net.
- Pour un net sans PAS : **`Parts = 0`** ou retenue explicite.

## SEO (frontend)

- Routes : **`src/Frontend/src/seo/paths.js`**. Build : **`VITE_PUBLIC_SITE_URL`** → `sitemap.xml` / `robots.txt` (`vite.config.js`).

## Recherche web

- Avant web search / fetch URL : skill **`web-search-ask-first`** et § 4.4 de `docs/general-guidelines.md`.
