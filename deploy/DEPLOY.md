# Déploiement production — Mega simulateur (megasimulateur.org)

Guide opérationnel pour le stack **Docker Compose** sur VPS (ex. Hetzner), **Nginx** sur l’hôte, **Cloudflare** en frontal.

---

## 1. Architecture résumée

| Composant | Rôle |
|-----------|------|
| **Cloudflare** | DNS A → IP du VPS ; SSL/TLS souvent **Flexible** tant que l’origine est en HTTP :80 (évite erreur 521 si pas encore TLS sur le serveur). |
| **Nginx (hôte)** | Écoute **:80**, `proxy_pass` vers **`127.0.0.1:8080`** (conteneur frontend). Fichier type : `deploy/megasimulateur.nginx.conf`. |
| **frontend** (Docker) | Nginx sert le build Vite + équilibre `/api` vers **api1** / **api2**. Publié uniquement en **`127.0.0.1:8080:80`** (pas d’exposition directe sur toutes les interfaces). |
| **api1 / api2** | API .NET 10 ; pas de ports publiés ; migrations SQL au démarrage (dossier `Migrations` copié dans l’image). |
| **db** | PostgreSQL 15 ; **`127.0.0.1:5432:5432`** uniquement — **pas** d’accès Postgres depuis Internet sans tunnel. |
| **redis** | Cache ; non publié. |

Fichier compose : **`docker-compose.deploy.yml`** à la racine du dépôt. Variables : **`/opt/megasimulator/.env`** (exemple de clés dans `deploy/bootstrap-hetzner.sh`).

---

## 2. Variables d’environnement (.env sur le VPS)

À adapter impérativement en production :

- **`JWT__KEY`** — longue clé aléatoire (ex. `openssl rand -base64 48`).
- **`FRONTEND__URL`** — `https://megasimulateur.org` (et `www` si utilisé).
- **`GOOGLE__CLIENTID`** / **`GOOGLE__CLIENTSECRET`** (flux callback si utilisé) / **`GOOGLE__REDIRECT`** — alignés sur la console Google.
- **`VITE_PUBLIC_SITE_URL`** — même origine HTTPS **sans** slash final (sitemap / robots au build frontend).
- **`VITE_GOOGLE_CLIENT_ID`** — passé en **build arg** du service `frontend` (OAuth GSI).

Reconstruire le **frontend** après changement d’une variable `VITE_*` :

```bash
cd /opt/megasimulator
docker compose -f docker-compose.deploy.yml --env-file .env build frontend
docker compose -f docker-compose.deploy.yml --env-file .env up -d frontend
```

Changement **API uniquement** :

```bash
docker compose -f docker-compose.deploy.yml --env-file .env build api1 api2
docker compose -f docker-compose.deploy.yml --env-file .env up -d api1 api2
```

**Sécurité** : remplacer le mot de passe Postgres par défaut du compose (`POSTGRES_PASSWORD` / `CONNECTION_STRINGS__DEFAULT`) en production et garder `.env` hors git.

---

## 3. Mise à jour du code (git sur le VPS)

```bash
cd /opt/megasimulator
git fetch origin
git reset --hard origin/master   # si vous acceptez d’écraser les modifs locales
docker compose -f docker-compose.deploy.yml --env-file .env build --no-cache
docker compose -f docker-compose.deploy.yml --env-file .env up -d
```

Ou cibler `frontend` / `api1` / `api2` comme ci-dessus. Les migrations **\*.sql** dans `src/Infrastructure/Migrations/` sont appliquées au démarrage des conteneurs API (ordre alphabétique des fichiers).

---

## 4. Connexion à la base PostgreSQL (pgAdmin, DBeaver, etc.)

Postgres **n’est pas** exposé sur l’IP publique. Depuis votre PC :

1. **Tunnel SSH** (PowerShell — ne pas utiliser la variable **`$Host`**, elle est réservée ; utiliser par ex. **`$srv`**).

   ```powershell
   $key = "$env:USERPROFILE\.ssh\id_ed25519_hetzner"
   $srv = "root@VOTRE_IP_VPS"
   ssh -i $key -L 5433:127.0.0.1:5432 -N $srv
   ```

   Laisser cette fenêtre ouverte pendant l’utilisation du client SQL.

2. Dans pgAdmin (ou autre) : **Host** `127.0.0.1`, **Port** `5433` (évite le conflit avec un Postgres local sur 5432).

3. **Base** `simulator`, **utilisateur** `simu`, **mot de passe** celui du compose / `.env` (défaut historique dans le fichier compose : voir `docker-compose.deploy.yml`).

**Attention** : `127.0.0.1` dans le client SQL désigne **votre machine** ; sans tunnel actif, vous ne touchez pas au VPS.

---

## 5. Compte admin applicatif

- Utilisateur **`admin`**, mot de passe de développement documenté dans le dépôt (migrations / `Program.cs`).
- E-mail en base pour ce compte : **`admin@megasimulateur.org`** (identifiant de profil, **pas** une boîte garantie). **Aucun** `support@m-simulator.com` ou domaine `m-simulator.com` n’est utilisé dans l’app.

---

## 6. Pièges déjà rencontrés

- **401 Google / invalid_client** : origines JavaScript + redirect URI dans Google Cloud ; `VITE_GOOGLE_CLIENT_ID` et `GOOGLE__CLIENTID` cohérents ; rebuild frontend.
- **Payroll JSON vide / 500** : migrations absentes de l’image Docker → le `Dockerfile` API doit **COPY** le dossier `Migrations`.
- **Portage / coût employeur** : le brut équivalent portage est borné pour que `coût employeur` ne dépasse pas l’enveloppe CA − frais (voir `PayrollSimulator.jsx`, `EMPLOYER_COST_FACTOR`).
- **Historique** : max **10** simulations par utilisateur (`SimulationRepository.MaxSimulationsPerUser`).

---

## 7. GitHub Actions (CI / CD)

Workflow : **`.github/workflows/ci-cd.yml`**. Onglet **Actions** du dépôt : exécutions sur **push** / **pull request** vers `master` ou `main`, et **Run workflow** manuel.

| Étape | Contenu |
|--------|---------|
| **test** | `dotnet restore` / `build` / `test` sur `tests/MegaSimulator.Tests/MegaSimulator.Tests.csproj` ; puis `npm ci` + `npm run build` dans `src/Frontend`. |
| **docker** (push sur `master`/`main` uniquement) | Images poussées vers **GHCR** : `ghcr.io/<owner>/<repo en minuscules>/api` et `/frontend`, tags `latest` et SHA du commit. |
| **deploy** (push sur `master`/`main`) | SSH vers le VPS : `git pull` dans `/opt/megasimulator`, puis `docker compose -f docker-compose.deploy.yml` **build** + **up** (comme la mise à jour manuelle). |

**Secrets** (Settings → Secrets and variables → Actions) : `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (clé privée SSH). Sans eux, le job **deploy** échoue ; **test** et **docker** peuvent quand même passer.

**Variables** optionnelles (même page → **Variables**) : `VITE_PUBLIC_SITE_URL`, `VITE_GOOGLE_CLIENT_ID` — alignées sur la prod pour le build frontend dans le CI et les **build-args** de l’image Docker (sinon valeur par défaut / vide selon le workflow).

**Environnement** `production` : utilisé pour le job deploy (règles de protection / reviewers possibles dans Settings → Environments).

Les images GHCR servent de **traçabilité** ; le script sur le VPS reconstruit encore depuis le code cloné (comme documenté au § 3). Pour ne tirer que des images pré-buildées, il faudrait adapter le compose.

---

## 8. Fichiers utiles

- `deploy/bootstrap-hetzner.sh` — bootstrap type Ubuntu (Docker, Nginx, premier `compose up`).
- `deploy/megasimulateur.nginx.conf` — site Nginx à copier vers `/etc/nginx/sites-available/` (symlink `sites-enabled`), puis `nginx -t` && `systemctl reload nginx`.

Pour le contexte produit et checklist haut niveau : **`docs/planning/2026-03-31-deployment-and-domain.md`**.
