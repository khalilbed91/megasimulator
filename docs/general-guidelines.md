# MegaSimulator — General Guidelines & Project Status

_Document interne — usage agent/équipe uniquement_  
_Dernière mise à jour : 2026-04-02 (marque violet/magenta, thème clair, Historique/Compte invité, docs & skill alignés)_

---

## 1. Vue d'ensemble du projet

**MegaSimulator** est une application web de simulation financière (paie, retraite, prêts, assurance, épargne) à destination des particuliers et professionnels français. Elle expose une API REST .NET et un frontend React.

**Objectif final :** permettre à n'importe quel utilisateur de simuler en quelques secondes son salaire net à partir d'un brut, sa future pension, le coût d'un prêt, ou ses charges freelance — avec une interface moderne, précise et multilingue.

**Stack technologique :**
- Backend : .NET 10, ASP.NET Core, Dapper, PostgreSQL, BCrypt.Net-Next, JWT
- Frontend : React 18.2, Vite 5.4, Bootstrap 5.3 CSS (CDN), variables CSS custom
- Infra : Docker Compose (PostgreSQL + migration tool), déploiement local sur port 5000 (API) et 5173 (frontend)

---

## 2. Ce qui a été fait

### 2.1 Infrastructure & Backend

| Fait | Description |
|---|---|
| ✅ Solution .NET multi-projets | Api / Application / Domain / Infrastructure — architecture clean |
| ✅ PostgreSQL via Docker Compose | DB `simulator`, user `simu`, migrations versionnées dans `src/Infrastructure/Migrations/` |
| ✅ Migrations 001–010 | Schéma : `users`, `simulations`, `formulas`, `system_info`, … ; **007** hash BCrypt admin ; **008** `contact_requests` ; **009** e-mail admin `@megasimulateur.org` ; **010** suppression tables legacy **`salaires`** et **`simulation_results`** (inutilisées par le produit — résultats paie dans `simulations.payload`) |
| ✅ Tool `ApplyMigrations` | `tools/ApplyMigrations/Program.cs` — applique les migrations SQL au démarrage |
| ✅ Authentification JWT | `AuthController`, `AuthService`, `UserRepository` — login, register, change password |
| ✅ Google OAuth (GSI) | `POST /api/auth/google/token` — ID token vérifié via `tokeninfo` (**pas de secret** pour ce flux). **Secret client** (`GOOGLE:ClientSecret` / `GOOGLE__CLIENTSECRET`) uniquement pour le flux code → `/api/auth/google/callback` |
| ✅ PayrollController | `POST /api/payroll/simulate` (brut→net) et `POST /api/payroll/brut-to-net` |
| ✅ PayrollService | Calcul complet : cotisations salariales/patronales, CSG/CRDS, Agirc-Arrco, APEC cadre, JEI, retenue à la source (PAS), net imposable |
| ✅ PayrollParams (2026) | `src/Application/Params/PayrollParams.cs` + `docs/knowledge-base/params/2026.json` |
| ✅ FormulaService + Repository | Gestion des formules de calcul en base, CRUD |
| ✅ SimulationService | Simulations en `simulations` (payload JSON) ; paie : fusion `results` dans le payload ; **plafond 10 / utilisateur** (purge FIFO dans `SimulationRepository`) — plus de table `simulation_results` |
| ✅ **SavingsService** + **SavingsController** | `POST /api/savings/simulate` ; params `savings` dans `2026.json` / `PayrollParams` ; persistance `type='savings'` si utilisateur connecté |
| ✅ **RetirementService** | `src/Application/Services/RetirementService.cs` — calcul CNAV + Agirc-Arrco + décote/surcote + retenue sociale 9.1% ; persiste en `simulations` table avec `type='retirement'` |
| ✅ **IRetirementService** | `src/Application/Interfaces/IRetirementService.cs` — interface avec 5 méthodes |
| ✅ **RetirementController** | `POST /api/retirement/simulate` — extraction userId depuis JWT, même pattern que PayrollController |
| ✅ **LoanService** | `POST /api/loan/simulate` — perso / auto / immo (TVA neuf, PTZ, Action Logement), HCSF et TAEG indicatif ; `type='loan'` |
| ✅ **ContactService** | `POST /api/contact` — persistance `contact_requests`, JWT optionnel pour lier `userid` (pas de fallback `mailto` ; pas de domaine `m-simulator.com`) |
| ✅ **Rate limiting** | `Program.cs` : politiques `contact` (5/min), `auth` (10/min), `simulate` (15/min) — attributs sur auth, contact, simulateurs |
| ✅ Seed admin | Migration 007 : hash BCrypt correct pour `admin/111aaa**` |
| ✅ Tests unitaires | `PayrollServiceTests`, `SimulationServiceTests`, `FormulaServiceTests`, `AuthServiceTests`, `RetirementServiceTests`, `LoanServiceTests` |
| ✅ Tests d'intégration | Dossier `tests/MegaSimulator.Tests/Integration/` — base posée |
| ✅ **Déploiement VPS** | `docker-compose.deploy.yml` + `deploy/DEPLOY.md` (Nginx, Cloudflare, tunnel SSH Postgres, `git reset --hard` sur le serveur si besoin) |

### 2.2 Sécurité & Auth

| Fait | Description |
|---|---|
| ✅ BCrypt re-hash robust | Migration 007 : hash correct généré par `BCrypt.HashPassword("111aaa**", 12)` — hash placeholder de la migration 004 **ne fonctionnait pas** |
| ✅ JWT key length guard | Clé JWT < 32 octets → dérivation SHA256 automatique pour éviter IDX10720 |
| ✅ Rôles JWT | Claim `roles: ['admin']` émis et vérifié côté frontend pour la vue technique |
| ✅ Google OAuth GSI | Même `GOOGLE__CLIENTID` côté API et `VITE_GOOGLE_CLIENT_ID` côté front ; `VerifyIdTokenAsync` contrôle le champ `aud` |
| ✅ Login email ou username | `UserRepository.GetByUsernameAsync` : `username = @Login OR email` (+ priorité ligne avec mot de passe si doublon email) |
| ✅ Admin au démarrage | `Program.cs` : création / réparation ligne `admin` si absente ou mauvais username sur l’UUID seed |
| ⚠️ Token dans localStorage | Acceptable en MVP — **à migrer vers cookie HttpOnly** |

### 2.3 Frontend — UI/UX

| Fait | Description |
|---|---|
| ✅ Design system | Tokens CSS **clair uniquement** (lavande / violet / magenta), sidebar 230px, top-bar, KPI, breakdown, tab bar — **plus** de thème sombre (`msim_dark` retiré) |
| ✅ Internationalisation FR/EN | Objet `T` dans chaque composant, prop `lang` depuis `App.jsx` ; barre de contrôle **langue uniquement** |
| ✅ Sidebar navigation | **Historique**, **Mon compte**, **Contact** visibles pour **tous** ; invité → **Se connecter** ; connecté → bloc profil + déconnexion |
| ✅ Login / Signup | Split-screen **clair** ; `Logo` **brand-mark.png** (transparent), centré au-dessus du titre sur le panneau marque |
| ✅ Account / Contact / Historique invité | `.page-panel-card` ; message **« Vous n’êtes pas connecté. »** + **Se connecter** / **Créer un compte** — **même UX** pour **Mon compte** et **Historique** |
| ✅ JWT stocké | `localStorage` `msim_token` avec **trim** et rejet des chaînes vides (`readStoredToken` dans `App.jsx`) |
| ✅ Mode invité | Simulateurs + contact + vues Historique/Compte en **gate** (pas de redirection forcée vers la paie) |
| ✅ Logo & favicon | `public/brand-mark.png`, `Logo.jsx`, `SeoHead` / `index.html` |
| ✅ Footer site | Une ligne © + liens légaux ; layout sticky en bas sur pages courtes |

### 2.4 PayrollSimulator — composant avancé

| Fait | Description |
|---|---|
| ✅ StatusPicker 4 statuts | Non-cadre / Cadre / Freelance / Portage salarial — cartes visuelles 2×2 |
| ✅ Sous-formulaire Freelance | Type structure ME/EURL/SASU, CA annuel HT, estimation brut équivalent |
| ✅ Sous-formulaire Portage | CA mensuel HT, slider frais portage (3–20%), société de portage, frais pro |
| ✅ Toggle fiscal exclusif | Foyer fiscal (parts) ↔ Retenue à la source — ne peuvent pas coexister |
| ✅ Sélecteur de parts | Chips 1/1.5/2/2.5/3/3.5/4/5, auto-suggestion basée sur situation familiale + enfants |
| ✅ Slider retenue PAS | Range 0–55%, badge suggestion auto (barème PAS 2026), cliquable |
| ✅ Situation familiale | Célibataire/Marié/Divorcé/Veuf + nombre d'enfants → parts suggérées |
| ✅ Avantages en nature | Presets chips : ticket resto, télétravail, téléphone, transports, prime |
| ✅ Résultats KPI | Net mensuel/annuel, cotisations, coût employeur, retenue, frais portage |
| ✅ Breakdown bar | 3 segments animés : Net / Cotisations / Charges patronales |
| ✅ Pas de bloc JSON « technique » admin | Ancienne vue debug retirée du simulateur paie |
| ✅ Parts fiscales (int→decimal) | Bug crash corrigé : `Parts` était `int`, valeurs 1.5/2.5 causaient 400 |
| ✅ PAS quotient familial | `ComputePasTaux()` barème 2026 basé sur `netAnnuel / parts` |
| ✅ Revenus annexes calcul | `brut = req.Brut + req.RevenusAnnexes + req.Primes` dans `PayrollService` |
| ✅ Focus input corrigé | `EuroInput` déplacé au niveau module (non plus dans le composant) — évite les remounts |

### 2.5 Historique des simulations

| Fait | Description |
|---|---|
| ✅ `SimulationHistory.jsx` | Page Historique dans la sidebar, appelle `GET /api/simulation/mine` |
| ✅ `GET /api/simulation/mine` | Endpoint sécurisé `[Authorize]`, userId depuis JWT (pas URL) — empêche IDOR |
| ✅ Suppression simulation | `DELETE /api/simulation/{id}` avec vérification owner avant suppression |
| ✅ Cartes historique | **Paie** : brut→net, retenue, parts ; **Retraite** : année naissance, SAM, pension nette mensuelle, etc. ; **Épargne** : objectif, effort mensuel ; autres `type` → ligne générique |
| ✅ Header Authorization | `PayrollSimulator.jsx` envoie désormais le token à chaque simulation |
| ✅ `UseAuthentication()` ajouté | **Bug critique corrigé** : le middleware JWT n'était pas dans le pipeline → userId toujours null |
| ✅ Simulations liées à l'user | Toutes nouvelles simulations sauvegardées avec `userid` (plus de NULL) |

### 2.6 Sécurité renforcée

| Fait | Description |
|---|---|
| ✅ IDOR corrigé | `SimulationController` : ownership check avant GET/DELETE/PUT |
| ✅ Tous les endpoints simulation protégés | `[Authorize]` sur toutes les routes sauf `POST /payroll/simulate` (supporte anonyme) |
| ✅ `UserController` | `[Authorize]` classe ; lecture/modif/suppression du profil : propriétaire ou `admin` ; `GetByUsername` / `Create` : `admin` uniquement |
| ✅ `UseAuthentication` + `UseAuthorization` | Ajoutés dans `Program.cs` — sans eux le JWT n'était jamais parsé |
| ✅ Quotas requêtes | `AddRateLimiter` + `UseRateLimiter` — réduit abus brute-force / spam sur auth, contact, simulations |

### 2.7 RetirementSimulator — implémenté ✅

| Fait | Description |
|---|---|
| ✅ `RetirementRequestDto` | `AnneeNaissance`, `AgeDepart`, `SalaireAnnuelMoyen`, `TrimestresValides/Requis`, `PointsComplementaires`, `Regime`, `RevenusAnnuelsActuels` |
| ✅ `RetirementResponseDto` | `PensionBaseAnnuelle`, `PensionComplementaireAnnuelle`, `PensionBruteTotaleAnnuelle`, `PensionNetteAnnuelle`, `PensionNetteMensuelle`, `TauxRemplacement`, `DecotePct`, `SurcotePct`, `TrimestresManquants` |
| ✅ `RetirementService` | Calcul complet : décote/surcote (1.25%/trimestre), facteur trimestres, pension CNAV, Agirc-Arrco (valeur point 1.45), retenue sociale 9.1%, taux de remplacement |
| ✅ Décote plafonnée | Max 25% (20 trimestres manquants) |
| ✅ Surcote | +1.25%/trimestre supplémentaire, facteur trimestres plafonné à 1 |
| ✅ Persistance | Simulation sauvegardée en table `simulations` avec `type='retirement'`, `userId` depuis JWT |
| ✅ `RetirementController` | `POST /api/retirement/simulate` — `[AllowAnonymous]` ; userId si JWT présent (sinon simulation anonyme non liée) |
| ✅ `RetirementSimulator.jsx` | Formulaire : année naissance (auto-remplit trimestres requis), chips âge départ, SAM, barre progression trimestres, points Agirc-Arrco, revenus actuels optionnels |
| ✅ KPI cards | Pension mensuelle nette (principal), pension annuelle nette, taux de remplacement |
| ✅ Breakdown panel | Base CNAV + complémentaire + brute totale ; panel trimestres (décote/surcote/manquants en couleur) |
| ✅ Warning V1 | Message d'avertissement régimes spéciaux non couverts |
| ✅ Home.jsx wired | Tab `retirement` renderise `<RetirementSimulator>` — plus de "coming soon" |
| ✅ 23 xUnit tests | `GetTrimestresRequis` (8 théories), `GetAgeLegal` (4), décote (3), surcote (2), simulate (6) — tous verts |
| ✅ Anti-race Calculer | `RetirementSimulator` : compteur de requête + `normalizeRetirementResponse` (camelCase / PascalCase) pour éviter qu’une réponse lente écrase la dernière saisie |

### 2.8 SavingsSimulator — MVP ✅

| Fait | Description |
|---|---|
| ✅ Tab **Épargne** | `Home.jsx` — pas de badge « Bientôt » ; route / SEO alignés avec les autres simulateurs |
| ✅ Leviers indicatifs | Montants affichés depuis presets front (`DEFAULT_SWITCH_PRESETS`) pour cohérence avec la copie produit (ex. Navigo→vélo **~60 €/mois**) même si l’API a des params en retard |
| ✅ Résultats | Sections lisibles : objectif indexé, effort mensuel, écart vs épargne actuelle, écart après leviers |
| ✅ `SavingsService` | Formules objectif indexé, versement requis, écart ; labels leviers côté API + fichier params |

---

## 3. Ce qui reste à faire

### 3.1 Priorité haute

| # | Tâche | Contexte |
|---|---|---|
| P1 | **Migration vers cookie HttpOnly** | Sécuriser le token JWT (actuellement `localStorage`, vulnérable XSS). Patch `AuthController` : `Response.Cookies.Append(...)` + CORS `credentials: 'include'` |
| P2 | **Simulateur Prêts** | ✅ MVP : `POST /api/loan/simulate`, `LoanSimulator.jsx` (immo + PTZ/TVA/PAL, auto, perso). Affinage TAEG / usure par échéance : à poursuivre |
| P3 | **Tests E2E** | Tests `LoanServiceTests.cs`, tests Postman pour les endpoints auth/payroll/retirement |

### 3.2 Priorité moyenne

| # | Tâche | Contexte |
|---|---|---|
| M1 | **Calcul freelance côté backend** | Actuellement estimé côté frontend — enrichir `PayrollService` avec logique ME/EURL/SASU |
| M2 | **Affinage charges portage** | Intégrer la réserve congés (10%) et frais pro dans le calcul backend |
| M3 | **Paramètres annuels versionnés** | Mécanisme de sélection de l'année de calcul (2025/2026/2027) |
| M4 | **Export PDF** | Bulletin de simulation exportable |
| M5 | **Tests unitaires manquants** | Cas freelance ME/EURL/SASU dans `PayrollServiceTests` ; tests intégration auth/google |

### 3.3 Priorité basse

| # | Tâche | Contexte |
|---|---|---|
| L1 | **Simulateur épargne** | ✅ MVP livré (`SavingsSimulator.jsx`, API) — règles / paramètres : `docs/knowledge-base/savings.md` + `params/2026.json` → affinages UX ou formules si besoin |
| L2 | **Simulateur assurance** | Règles dans `docs/knowledge-base/insurance.md` |
| L3 | **Dashboard analytics admin** | Vue admin : simulations, utilisateurs, distributions |
| L4 | **Google Cloud — origines JS** | `http://localhost:5173` et si besoin `http://127.0.0.1:5173` ; client type **Application Web** ; voir README section dépannage `401 invalid_client` |

---

## 4. Architecture et conventions

### 4.1 Backend (.NET)

- **Clean Architecture** : Domain → Application → Infrastructure → Api
- Interfaces dans `Application/Interfaces/` et `Domain/Interfaces/`
- DTOs dans `Application/DTOs/`
- Pas de logique métier dans les contrôleurs : déléguer aux services
- Migrations SQL numérotées (`001_...sql`, …) dans `src/Infrastructure/Migrations/` — rejouées au **démarrage API** (`Program.cs` boucle SQL + `MigrationRunner`) et via `tools/ApplyMigrations` si utilisé

### 4.2 Frontend (React)

- **Routage & SEO** : `react-router-dom` (URLs dédiées par simulateur), `react-helmet-async` (title, meta, canonical, OG, JSON-LD). Voir `docs/frontend-guidelines.md` § 2.1 et `src/Frontend/src/seo/`.
- Pas de class components — hooks uniquement
- Props `lang` transmise de `App.jsx` vers tous les enfants
- Objet de traductions `T` en haut de chaque composant (FR/EN)
- Variables CSS pour toutes les couleurs — cf. `styles.css`
- Encodage fichiers : **UTF-8 sans BOM** — ne jamais utiliser `Set-Content` PowerShell sans `-Encoding UTF8NoBOM`
- Build de validation : `npm run build` dans `src/Frontend/`

### 4.3 Conventions git

- Pas de `bin/` ni `obj/` en commit (`.gitignore` mis à jour)
- Messages de commit : format `[domaine]: description courte` (ex: `Frontend: améliore PayrollSimulator`)
- Toujours tester le build avant de pousser

### 4.4 Agent / IA — conduite sur ce dépôt

- **Lire les skills Cursor pertinentes** avant ops / déploiement / DB : `.cursor/skills/megasimulator-dev-stack/SKILL.md` (ports 5000/5173, proxy, deploy, tunnel Postgres, quotas, PAS/Parts).
- **Recherche web / fetch URL** : l’agent **peut** les utiliser pour infos à jour (réglementation, paquets, etc.) mais **doit demander l’accord explicite** à l’utilisateur **avant** (voir `.cursor/skills/web-search-ask-first/SKILL.md`).
- Si l’utilisateur refuse ou ne répond pas : s’en tenir au dépôt, à `docs/general-guidelines.md`, `deploy/DEPLOY.md` et au code.
- **Périmètre des changements** : modifier uniquement ce qui est demandé ; pas de refactor « bonus » ni fichiers markdown non sollicités.
- **Qualité** : `dotnet build` / `dotnet test` (projet tests) et `npm run build` (frontend) avant push quand le changement touche le code ; migration SQL nouvelle = fichier `0NN_*.sql` dans `Migrations/`.

---

## 5. Accès et configuration

| Élément | Valeur |
|---|---|
| API URL (local) | `http://localhost:5000` |
| Frontend URL (local) | `http://localhost:5173` (voir `vite.config.js`) |
| DB | `Host=localhost:5432; Database=simulator; Username=simu; Password=111aaa**` |
| Admin login | username: `admin` / password: `111aaa**` |
| JWT key (local) | Défini dans `src/Api/Properties/launchSettings.json` (`JWT__KEY`) |
| Google Client ID | `874107145454-8vao5905rvg7v56h6rustrk3dbbbul62.apps.googleusercontent.com` |

### 5.1 Démarrer le stack en local

Deux terminaux depuis la racine du dépôt :

```powershell
# Terminal 1 — API (profil avec Postgres + JWT + Google ID dans launchSettings)
dotnet run --project src/Api/Api.csproj --launch-profile LocalWithDeps
```

```powershell
# Terminal 2 — Frontend (proxy `/api` → :5000)
Set-Location src/Frontend; npm run dev
```

- App UI : **http://localhost:5173/**  
- API : **http://localhost:5000** (Swagger si `ENABLE_SWAGGER=true`)

Prérequis : PostgreSQL accessible avec la chaîne de connexion du profil `LocalWithDeps`.

---

## 6. Post-mortems et décisions clés

| Date | Sujet | Résumé |
|---|---|---|
| 2026-03-28 | Auth BCrypt + JWT | Hash vide en base pour admin → UPDATE manuel ; clé JWT trop courte → dérivation SHA256. Voir `docs/../memories/repo/authentication-postmortem.md` |
| 2026-03-28 | Payroll iterative | Paramètres `Jei` manquants, tests dupliqués, hash seed mismatch. Voir `memories/repo/20260328-iterative-testing-postmortem.md` |
| 2026-03-29 | Encodage UTF-8 | `Set-Content` PowerShell double-encode les accents → utiliser `[System.IO.File]::WriteAllText` avec `UTF8Encoding $false` |
| 2026-03-29 | Parts fiscales crash | `Parts: int` → crash JSON sur valeurs 1.5/2.5. Fix : `decimal Parts = 1m`. `ComputePasTaux()` ajouté. |
| 2026-03-29 | IDOR SimulationController | `GET /user/{userId}` sans auth → n'importe qui pouvait lire les simus d'autrui. Fix : `[Authorize]` + ownership check + endpoint `/mine` |
| 2026-03-29 | UseAuthentication manquant | **Bug critique** : `app.UseAuthentication()` et `app.UseAuthorization()` absents de `Program.cs` → JWT jamais parsé → `userId` toujours null → toutes les simulations sauvegardées sans propriétaire. Fix : 2 lignes dans `Program.cs` |
| 2026-03-29 | Authorization header manquant | `PayrollSimulator.jsx` appelait `/api/payroll/simulate` sans header Bearer → backend recevait aucun token. Fix : ajout du header dans `simulate()` |
| 2026-03-29 | BCrypt hash admin invalide | Migration 004 contenait un hash placeholder qui ne correspondait pas à `111aaa**` → toute tentative de login échouait avec 401. Fix : migration 007 avec hash `BCrypt.HashPassword("111aaa**", 12)` généré par un projet .NET de test |
| 2026-03-29 | Google OAuth — passage en GSI | L'ancien flow OAuth redirect nécessitait un client secret. Passage au flow Google Identity Services (GSI) : le frontend charge `accounts.google.com/gsi/client`, obtient un ID token signé par Google, et le soumet à `POST /api/auth/google/token`. Le backend valide via `tokeninfo` (pas de secret). Nouveau : `VerifyIdTokenAsync` dans `GoogleAuthClient`, endpoint `POST /api/auth/google/token` dans `AuthController`. |
| 2026-03-29 | BCrypt hash admin invalide | Migration 004 contenait un hash placeholder qui ne correspondait pas à `111aaa**` → toute tentative de login échouait avec 401. Fix : migration 007 avec hash `BCrypt.HashPassword("111aaa**", 12)` généré par un projet .NET de test |
| 2026-03-29 | Google OAuth — passage en GSI | L'ancien flow OAuth redirect nécessitait un client secret. Passage au flow Google Identity Services (GSI) : le frontend charge `accounts.google.com/gsi/client`, obtient un ID token signé par Google, et le soumet à `POST /api/auth/google/token`. Le backend valide via `tokeninfo` (pas de secret). Nouveau : `VerifyIdTokenAsync` dans `GoogleAuthClient`, endpoint `POST /api/auth/google/token` dans `AuthController`. |
| 2026-03-30 | Payroll test vs PAS | `Simulate_PersistsSimulationAndReturnsResponse` attendait 2349 € sans retenue ; défaut `Parts = 1` déclenchait le barème PAS sur le net → ~2172 €. Correction test : `Parts = 0` pour isoler le chemin brut→net simple. |
| 2026-03-30 | Contact + rate limit + UserController | Formulaire contact persisté (`008_add_contact_requests`), quotas API, endpoints utilisateur réservés au propriétaire ou admin. |
| 2026-04-01 | DB legacy + épargne UI | Migration **010** : drop `salaires`, `simulation_results` ; retrait API Salaire* et persistance redondante ; simulateur épargne (leviers ~60 € Navigo→vélo, mise en page résultats) ; retraite : garde anti-course requêtes + normalisation JSON. |
| 2026-04-02 | Marque & UX | Monogramme PNG transparent ; palette violet→magenta ; thème clair unique ; formulaires (focus, 44px) ; Historique invité = gate identique à Mon compte ; docs `brand-guidelines` / `frontend-guidelines` mises à jour. |

---

## 7. Références

- `.cursor/skills/web-search-ask-first/SKILL.md` — Recherche web : demander confirmation d’abord
- `.cursor/skills/megasimulator-dev-stack/SKILL.md` — Lancer le stack local, rappels sécurité / quotas / Pièges paie
- `docs/brand-guidelines.md` — Charte graphique complète
- `docs/frontend-guidelines.md` — Guidelines techniques frontend
- `docs/knowledge-base/payroll.md` — Règles métier paie 2026
- `docs/knowledge-base/params/2026.json` — Paramètres officiels 2026
- `docs/knowledge-base/retirement.md` — Règles retraite
- `docs/knowledge-base/loans.md` — Règles prêts
- `docs/knowledge-base/savings.md` — Règles épargne
- `docs/knowledge-base/insurance.md` — Règles assurance
- `docs/planning/2026-03-31-deployment-and-domain.md` — Déploiement, domaine, tests externes
