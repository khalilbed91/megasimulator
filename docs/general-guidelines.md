# MegaSimulator — General Guidelines & Project Status

_Document interne — usage agent/équipe uniquement_  
_Dernière mise à jour : 2026-03-29_

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
| ✅ Migrations 001–006 | Création tables `users`, `salaires`, `simulations`, `formulas` ; ajout credentials admin ; nullable userId sur simulations |
| ✅ Tool `ApplyMigrations` | `tools/ApplyMigrations/Program.cs` — applique les migrations SQL au démarrage |
| ✅ Authentification JWT | `AuthController`, `AuthService`, `UserRepository` — login, register, change password |
| ✅ Google OAuth (partiel) | `IGoogleAuthClient` interface définie, endpoint `/api/auth/google` présent — **non testé en prod** |
| ✅ PayrollController | `POST /api/payroll/simulate` (brut→net) et `POST /api/payroll/brut-to-net` |
| ✅ PayrollService | Calcul complet : cotisations salariales/patronales, CSG/CRDS, Agirc-Arrco, APEC cadre, JEI, retenue à la source (PAS), net imposable |
| ✅ PayrollParams (2026) | `src/Application/Params/PayrollParams.cs` + `docs/knowledge-base/params/2026.json` |
| ✅ FormulaService + Repository | Gestion des formules de calcul en base, CRUD |
| ✅ SalaireService | Historique des salaires par utilisateur |
| ✅ SimulationService | Persistance des simulations en base avec payload et résultats |
| ✅ Seed admin | Utilisateur `admin` / `111aaa**` assuré par re-hash BCrypt au démarrage si hash vide |
| ✅ Tests unitaires | `PayrollServiceTests`, `SalaireServiceTests`, `SimulationServiceTests`, `FormulaServiceTests`, `AuthServiceTests` |
| ✅ Tests d'intégration | Dossier `tests/MegaSimulator.Tests/Integration/` — base posée |

### 2.2 Sécurité & Auth

| Fait | Description |
|---|---|
| ✅ BCrypt re-hash robust | Si le hash en base ne vérifie pas au démarrage, re-hash automatique |
| ✅ JWT key length guard | Clé JWT < 32 octets → dérivation SHA256 automatique pour éviter IDX10720 |
| ✅ Rôles JWT | Claim `roles: ['admin']` émis et vérifié côté frontend pour la vue technique |
| ⚠️ Token dans localStorage | Acceptable en MVP — **à migrer vers cookie HttpOnly** |

### 2.3 Frontend — UI/UX

| Fait | Description |
|---|---|
| ✅ Design system complet | CSS variables, dark mode, sidebar 230px, top-bar, KPI cards, breakdown bar, tab bar |
| ✅ Dark mode | Toggle lune/soleil, persisté en `localStorage`, toutes les variables surchargées |
| ✅ Internationalisation FR/EN | Objet `T` dans chaque composant, prop `lang` depuis App.jsx |
| ✅ Sidebar navigation | Sections « Simulations » et « Utilisateur », indicateur actif, info utilisateur + déconnexion |
| ✅ Login split-screen | Panneau marque gauche + panneau formulaire droit, responsive (masqué < 860px) |
| ✅ Signup | Même pattern que Login |
| ✅ Account page | Profil utilisateur avec token info |
| ✅ Logo centralisé | `Logo.jsx` — composant partagé |

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
| ✅ Résultats KPI | Net mensuel/annuel, cotisations, coût employeur, retenue, frais portage |
| ✅ Breakdown bar | 3 segments animés : Net / Cotisations / Charges patronales |
| ✅ Vue technique JSON | Visible uniquement pour les admins (décode le rôle du JWT) |

---

## 3. Ce qui reste à faire

### 3.1 Priorité haute

| # | Tâche | Contexte |
|---|---|---|
| P1 | **Migration vers cookie HttpOnly** | Sécuriser le token JWT (actuellement `localStorage`, vulnérable XSS). Patch `AuthController` : `Response.Cookies.Append(...)` + CORS `credentials: 'include'` |
| P2 | **Simulateurs Retraite & Prêts** | Pages affichant "coming soon" dans la sidebar — formulaires + calculs à implémenter. Règles métier dans `docs/knowledge-base/retirement.md` et `loans.md` |
| P3 | **Persistance des simulations payroll** | Appeler `SimulationService.SaveAsync()` après chaque simulation réussie — lier à l'utilisateur connecté si token présent |
| P4 | **Tests d'intégration E2E** | Flux complet : login → simulation → vérification résultat en base. Candidats : `tests/MegaSimulator.Tests/Integration/` |
| P5 | **Google OAuth opérationnel** | Obtenir credentials Google, tester le callback, stocker l'utilisateur OAuth en base |

### 3.2 Priorité moyenne

| # | Tâche | Contexte |
|---|---|---|
| M1 | **Historique des simulations** | Page frontend listant les simulations passées de l'utilisateur (table `simulations` déjà créée) |
| M2 | **Calcul freelance côté backend** | Actuellement estimé côté frontend — enrichir `PayrollService` avec logique ME/EURL/SASU pour plus de précision |
| M3 | **Affinage charges portage** | Intégrer la réserve congés (10%) et frais pro dans le calcul backend |
| M4 | **Paramètres annuels versionnés** | Mécanisme de sélection de l'année de calcul (2025/2026/2027) — déjà prévu dans `PayrollParams` |
| M5 | **Export PDF / impression** | Bulletin de simulation exportable, design propre |
| M6 | **Tests unitaires manquants** | Couvrir les cas freelance ME/EURL/SASU dans `PayrollServiceTests` ; tester les suggestions retenue PAS |

### 3.3 Priorité basse / nice-to-have

| # | Tâche | Contexte |
|---|---|---|
| L1 | **Simulateur épargne** | Règles dans `docs/knowledge-base/savings.md` |
| L2 | **Simulateur assurance** | Règles dans `docs/knowledge-base/insurance.md` |
| L3 | **Dashboard analytics admin** | Vue admin : nombre de simulations, utilisateurs actifs, distributions de revenus |
| L4 | **Notifications & alertes** | Ex: "N'oubliez pas de déclarer vos revenus avant le XX mai" |
| L5 | **Tests de charge** | Limiter et mesurer la performance du `PayrollService` sur gros volumes |

---

## 4. Architecture et conventions

### 4.1 Backend (.NET)

- **Clean Architecture** : Domain → Application → Infrastructure → Api
- Interfaces dans `Application/Interfaces/` et `Domain/Interfaces/`
- DTOs dans `Application/DTOs/`
- Pas de logique métier dans les contrôleurs : déléguer aux services
- Migrations SQL numérotées (`001_...sql`) appliquées par `tools/ApplyMigrations`

### 4.2 Frontend (React)

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

---

## 5. Accès et configuration

| Élément | Valeur |
|---|---|
| API URL (local) | `http://localhost:5000` |
| Frontend URL (local) | `http://localhost:5173` |
| DB | `Host=localhost:5432; Database=simulator; Username=simu; Password=111aaa**` |
| Admin login | username: `admin` / password: `111aaa**` |
| JWT key (local) | Défini dans `src/Api/Properties/launchSettings.json` (`JWT__KEY`) |

---

## 6. Post-mortems et décisions clés

| Date | Sujet | Résumé |
|---|---|---|
| 2026-03-28 | Auth BCrypt + JWT | Hash vide en base pour admin → UPDATE manuel ; clé JWT trop courte → dérivation SHA256. Voir `docs/../memories/repo/authentication-postmortem.md` |
| 2026-03-28 | Payroll iterative | Paramètres `Jei` manquants, tests dupliqués, hash seed mismatch. Voir `memories/repo/20260328-iterative-testing-postmortem.md` |
| 2026-03-29 | Encodage UTF-8 | `Set-Content` PowerShell double-encode les accents → utiliser `[System.IO.File]::WriteAllText` avec `UTF8Encoding $false` |

---

## 7. Références

- `docs/brand-guidelines.md` — Charte graphique complète
- `docs/frontend-guidelines.md` — Guidelines techniques frontend
- `docs/knowledge-base/payroll.md` — Règles métier paie 2026
- `docs/knowledge-base/params/2026.json` — Paramètres officiels 2026
- `docs/knowledge-base/retirement.md` — Règles retraite
- `docs/knowledge-base/loans.md` — Règles prêts
- `docs/knowledge-base/savings.md` — Règles épargne
- `docs/knowledge-base/insurance.md` — Règles assurance
