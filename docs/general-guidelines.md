# MegaSimulator — General Guidelines & Project Status

_Document interne — usage agent/équipe uniquement_  
_Dernière mise à jour : 2026-04-26 (assurance MVP, référentiel codes postaux La Poste, paie PAS direct, GEO/FAQ et liens externes post-simulation)_

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
| ✅ Migrations 001–011 | Schéma : `users`, `simulations`, `formulas`, `system_info`, … ; **007** hash BCrypt admin ; **008** `contact_requests` ; **009** e-mail admin `@megasimulateur.org` ; **010** suppression tables legacy **`salaires`** et **`simulation_results`** ; **011** table `france_postal_codes` pour le référentiel codes postaux |
| ✅ Tool `ApplyMigrations` | `tools/ApplyMigrations/Program.cs` — applique les migrations SQL au démarrage |
| ✅ Authentification JWT | `AuthController`, `AuthService`, `UserRepository` — login, register, change password |
| ✅ Google OAuth (GSI) | `POST /api/auth/google/token` — ID token vérifié via `tokeninfo` (**pas de secret** pour ce flux). **Secret client** (`GOOGLE:ClientSecret` / `GOOGLE__CLIENTSECRET`) uniquement pour le flux code → `/api/auth/google/callback` |
| ✅ PayrollController | `POST /api/payroll/simulate` (brut→net) et `POST /api/payroll/brut-to-net` |
| ✅ PayrollService | Calcul complet : cotisations salariales/patronales, CSG/CRDS, Agirc-Arrco, APEC cadre, JEI, retenue à la source (PAS), net imposable |
| ✅ PayrollParams (2026) | `src/Application/Params/PayrollParams.cs` + `docs/knowledge-base/params/2026.json` |
| ✅ FormulaService + Repository | Gestion des formules de calcul en base, CRUD |
| ✅ SimulationService | Simulations en `simulations` (payload JSON) ; paie : fusion `results` dans le payload ; **plafond 10 / utilisateur** (purge FIFO dans `SimulationRepository`) — plus de table `simulation_results` |
| ✅ **SavingsService** + **SavingsController** | `POST /api/savings/simulate` ; params `savings` dans `2026.json` / `PayrollParams` ; persistance `type='savings'` si utilisateur connecté |
| ✅ **InsuranceService** + **InsuranceController** | `POST /api/insurance/simulate` ; habitation / auto / moto ; prime indicative, breakdown, warnings réglementaires, persistance `type='insurance'` |
| ✅ **ReferenceController** | `GET /api/reference/postal-codes?q=` ; autocomplete code postal / ville depuis la table `france_postal_codes` chargée en cache |
| ✅ **PostalCodeSeeder** | Importe la base officielle La Poste CSV (`src/Infrastructure/SeedData/france_postal_codes_official.csv`, ~39k lignes) au démarrage si la table est incomplète |
| ✅ **RetirementService** | `src/Application/Services/RetirementService.cs` — calcul CNAV + Agirc-Arrco + décote/surcote + retenue sociale 9.1% ; persiste en `simulations` table avec `type='retirement'` |
| ✅ **IRetirementService** | `src/Application/Interfaces/IRetirementService.cs` — interface avec 5 méthodes |
| ✅ **RetirementController** | `POST /api/retirement/simulate` — extraction userId depuis JWT, même pattern que PayrollController |
| ✅ **LoanService** | `POST /api/loan/simulate` — perso / auto / immo (TVA neuf, PTZ, Action Logement), HCSF et TAEG indicatif ; `type='loan'` |
| ✅ **ContactService** | `POST /api/contact` — persistance `contact_requests`, JWT optionnel pour lier `userid` (pas de fallback `mailto` ; pas de domaine `m-simulator.com`) |
| ✅ **Rate limiting** | `Program.cs` : politiques `contact` (5/min), `auth` (10/min), `simulate` (15/min) — attributs sur auth, contact, simulateurs |
| ✅ Seed admin | Migration 007 : hash BCrypt correct pour `admin/111aaa**` |
| ✅ Tests unitaires | `PayrollServiceTests`, `SimulationServiceTests`, `FormulaServiceTests`, `AuthServiceTests`, `RetirementServiceTests`, `LoanServiceTests` |
| ✅ Tests assurance | `InsuranceServiceTests` couvre habitation, auto, moto et CRM |
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
| ✅ GEO / Answer Engine Optimization | Blocs “Réponses rapides” visibles par simulateur + JSON-LD `FAQPage` pour paie, retraite, prêts, épargne, assurance |
| ✅ Guides publics | Hub `/guides` + articles `Article` JSON-LD ; ajout guide assurance habitation / auto / moto dans le sitemap |

### 2.4 PayrollSimulator — composant avancé

| Fait | Description |
|---|---|
| ✅ StatusPicker 4 statuts | Non-cadre / Cadre / Freelance / Portage salarial — cartes visuelles 2×2 |
| ✅ Sous-formulaire Freelance | Type structure ME/EURL/SASU, CA annuel HT, estimation brut équivalent |
| ✅ Sous-formulaire Portage | CA mensuel HT, slider frais portage (3–20%), société de portage, frais pro |
| ✅ Mode fiscal simplifié | Retenue à la source directe uniquement ; plus de parts, situation familiale ou enfants dans l’UI |
| ✅ PAS responsive au brut | Le taux par défaut se met à jour automatiquement selon le brut annuel saisi, puis reste ajustable directement en `%` |
| ✅ Slider + input retenue PAS | Range 0–55% et champ numérique `%`; le frontend envoie `Parts: 0` pour annuler le fallback quotient familial |
| ✅ Lien externe post-résultat | Après calcul, carte “next step” vers un acteur externe pertinent, clairement indiquée comme lien externe non sponsorisé |
| ✅ Avantages en nature | Presets chips : ticket resto, télétravail, téléphone, transports, prime |
| ✅ Résultats KPI | Net mensuel/annuel, cotisations, coût employeur, retenue, frais portage ; montants arrondis à 2 décimales |
| ✅ Breakdown bar | 3 segments animés : Net / Cotisations / Charges patronales |
| ✅ Pas de bloc JSON « technique » admin | Ancienne vue debug retirée du simulateur paie |
| ✅ Compat backend parts | `PayrollRequestDto.Parts` reste `decimal` pour compatibilité API, mais l’UI paie utilise désormais `Parts: 0` |
| ✅ PAS quotient familial backend | `ComputePasTaux()` existe encore pour clients API historiques ; le produit front privilégie la retenue directe |
| ✅ Revenus annexes calcul | `brut = req.Brut + req.RevenusAnnexes + req.Primes` dans `PayrollService` |
| ✅ Focus input corrigé | `EuroInput` déplacé au niveau module (non plus dans le composant) — évite les remounts |

### 2.5 Historique des simulations

| Fait | Description |
|---|---|
| ✅ `SimulationHistory.jsx` | Page Historique dans la sidebar, appelle `GET /api/simulation/mine` |
| ✅ `GET /api/simulation/mine` | Endpoint sécurisé `[Authorize]`, userId depuis JWT (pas URL) — empêche IDOR |
| ✅ Suppression simulation | `DELETE /api/simulation/{id}` avec vérification owner avant suppression |
| ✅ Cartes historique | **Paie** : brut→net, retenue ; **Retraite** : année naissance, SAM, pension nette mensuelle ; **Prêts** ; **Épargne** ; **Assurance** : produit, formule, prime mensuelle/annuelle |
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
| ✅ `RetirementService` | Décote/surcote (1,25 %/trim.), pension CNAV, Agirc-Arrco **valeur point 1,4386 €** (officiel nov. 2025), prélèvement **9,1 %** (ordre de grandeur plafond), trimestres post-LFSS 2026 dans le code |
| ✅ Décote plafonnée | Max 25% (20 trimestres manquants) |
| ✅ Surcote | +1.25%/trimestre supplémentaire, facteur trimestres plafonné à 1 |
| ✅ Persistance | Simulation sauvegardée en table `simulations` avec `type='retirement'`, `userId` depuis JWT |
| ✅ `RetirementController` | `POST /api/retirement/simulate` — `[AllowAnonymous]` ; userId si JWT présent (sinon simulation anonyme non liée) |
| ✅ `RetirementSimulator.jsx` | Formulaire : année naissance (auto-remplit trimestres requis), chips âge départ, SAM, barre progression trimestres, points Agirc-Arrco, revenus actuels optionnels |
| ✅ KPI cards | Pension mensuelle nette (principal), pension annuelle nette, taux de remplacement |
| ✅ Breakdown panel | Base CNAV + complémentaire + brute totale ; panel trimestres (décote/surcote/manquants en couleur) |
| ✅ Warning V1 | Message d'avertissement régimes spéciaux non couverts |
| ✅ Home.jsx wired | Tab `retirement` renderise `<RetirementSimulator>` — plus de "coming soon" |
| ✅ xUnit `RetirementServiceTests` | `GetTrimestresRequis` (générations dont 1964→170, 1965→171, 1966+→172, aligné `retirement.md` et au fallback backend), âge légal, décote/surcote, simulate, objectif — tous verts |
| ✅ Anti-race Calculer | `RetirementSimulator` : compteur de requête + `normalizeRetirementResponse` (camelCase / PascalCase) pour éviter qu’une réponse lente écrase la dernière saisie |

### 2.8 SavingsSimulator — MVP ✅

| Fait | Description |
|---|---|
| ✅ Tab **Épargne** | `Home.jsx` — pas de badge « Bientôt » ; route / SEO alignés avec les autres simulateurs |
| ✅ Leviers indicatifs | Montants affichés depuis presets front (`DEFAULT_SWITCH_PRESETS`) pour cohérence avec la copie produit (ex. Navigo→vélo **~60 €/mois**) même si l’API a des params en retard |
| ✅ Résultats | Sections lisibles : objectif indexé, effort mensuel, écart vs épargne actuelle, écart après leviers |
| ✅ `SavingsService` | Formules objectif indexé, versement requis, écart ; labels leviers côté API + fichier params |

### 2.9 InsuranceSimulator — MVP ✅

| Fait | Description |
|---|---|
| ✅ Tab **Assurance** | `Home.jsx` + routes SEO ; page dédiée au simulateur habitation / auto / moto |
| ✅ API assurance | `InsuranceController` + `InsuranceService` + DTOs dédiés ; sauvegarde en `simulations` avec `type='insurance'` |
| ✅ Habitation simplifiée | Saisie orientée utilisateur : code postal, surface, formule, franchise ; capital mobilier / objets de valeur sont des hypothèses internes, pas des champs obligatoires |
| ✅ Auto / moto | Formules tiers / étendu / tous risques, franchise, valeur véhicule, usage, stationnement, conducteur, CRM, sinistres |
| ✅ Référentiel codes postaux | Table `france_postal_codes` + seed CSV officiel La Poste + cache mémoire ; exemples validés : `924` → Courbevoie, `95130` → Franconville / Le Plessis-Bouchard |
| ✅ Historique | `SimulationHistory.jsx` affiche les simulations assurance avec produit, couverture et prime |
| ✅ Lien externe post-résultat | Assurance : lien vers comparateur externe selon produit (habitation / auto / moto), sans transmission de données utilisateur |
| ✅ Tests | `InsuranceServiceTests` couvre CRM et simulations habitation / auto / moto |

### 2.10 GEO & maillage externe — MVP ✅

| Fait | Description |
|---|---|
| ✅ FAQ visibles par simulateur | `GeoFaqBlock.jsx` + `geoFaq.js` : réponses courtes, structurées, adaptées aux moteurs de réponse IA |
| ✅ `FAQPage` JSON-LD | `SeoHead.jsx` injecte les questions/réponses des simulateurs dans le structured data |
| ✅ Guide assurance | `/guides/assurance-habitation-auto-moto-2026` ajouté dans `guidePaths.js`, sitemap et `GuideHub` |
| ✅ `Article` JSON-LD assurance | `SeoHeadGuide.jsx` relie l’article assurance au simulateur assurance |
| ✅ Liens post-simulation | `ExternalNextStep.jsx` affiché dans résultats assurance, retraite et crédit |
| ✅ Liens officiels / externes | Retraite → `info-retraite.fr`; crédit → Crédit Agricole (non sponsorisé); assurance → LesFurets (non sponsorisé) |

---

## 3. Ce qui reste à faire

### 3.1 Priorité haute

| # | Tâche | Contexte |
|---|---|---|
| P1 | **Migration vers cookie HttpOnly** | Sécuriser le token JWT (actuellement `localStorage`, vulnérable XSS). Patch `AuthController` : `Response.Cookies.Append(...)` + CORS `credentials: 'include'` |
| P2 | **Simulateur Prêts** | ✅ MVP livré. Suite : TAEG réglementaire fin vs approx, usure Banque de France trimestrielle externalisée (`params` ou config) |
| P3 | **Tests E2E** | `LoanServiceTests.cs` + `RetirementServiceTests.cs` côté unitaires ; tests Postman / E2E auth & parcours encore optionnels |

### 3.1 bis Audit simulateurs retraite & prêts (2026-04-03)

- **Retraite** : valeur du point **1,4386 €** (Agirc-Arrco officiel) ; trimestres **1964→170**, **1965→171**, **1966+→172** (reprise LFSS 2026 / presse — **à valider au JORF** ; naissance au **1er trimestre 1965** : 170 en droit, non distingué dans l’UI). Prélèvement **9,1 %** = plafond type, pas le barème CSG par RFR. Voir `retirement.md` §1, §2, §10.
- **Prêts** : seuils d’**usure Banque de France** avril 2026 (4,00 / 4,48 / 5,19 % immo par durée ; 8,61 % conso &gt;6 k€) dans `LoanService` ; TAEG toujours **approximatif**. Voir `loans.md` §12 et `params/2026.json`.

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
| L2 | **Simulateur assurance** | ✅ MVP livré. Suite : enrichir taxes/frais, options garanties, exports et éventuelle tarification par données statistiques réelles |
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

- **Lire les skills Cursor pertinentes** avant ops / déploiement / DB : `.cursor/skills/megasimulator-dev-stack/SKILL.md` (ports 5000/5173, proxy, deploy, tunnel Postgres, quotas, paie PAS direct, référentiel postal).
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
| 2026-04-26 | Assurance + postal + paie PAS | Simulateur assurance habitation/auto/moto livré ; référentiel codes postaux La Poste importé en DB/cache ; paie simplifiée vers retenue à la source directe responsive au brut annuel. |
| 2026-04-26 | GEO + liens externes | Ajout FAQ visibles + `FAQPage` JSON-LD ; guide assurance public ; cartes post-résultat vers portail retraite officiel, comparateur assurance et banque externe. |

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
