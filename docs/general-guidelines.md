# MegaSimulator — General Guidelines & Project Status

_Document interne — usage agent/équipe uniquement_  
_Dernière mise à jour : 2026-03-29 (session 2)_

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
| ✅ Avantages en nature | Presets chips : ticket resto, télétravail, téléphone, transports, prime |
| ✅ Résultats KPI | Net mensuel/annuel, cotisations, coût employeur, retenue, frais portage |
| ✅ Breakdown bar | 3 segments animés : Net / Cotisations / Charges patronales |
| ✅ Vue technique JSON | Visible uniquement pour les admins (décode le rôle du JWT) |
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
| ✅ Cartes historique | Date/heure, badge statut coloré, brut→net, retenue, parts afichés par ligne |
| ✅ Header Authorization | `PayrollSimulator.jsx` envoie désormais le token à chaque simulation |
| ✅ `UseAuthentication()` ajouté | **Bug critique corrigé** : le middleware JWT n'était pas dans le pipeline → userId toujours null |
| ✅ Simulations liées à l'user | Toutes nouvelles simulations sauvegardées avec `userid` (plus de NULL) |

### 2.6 Sécurité renforcée

| Fait | Description |
|---|---|
| ✅ IDOR corrigé | `SimulationController` : ownership check avant GET/DELETE/PUT |
| ✅ Tous les endpoints simulation protégés | `[Authorize]` sur toutes les routes sauf `POST /payroll/simulate` (supporte anonyme) |
| ✅ `GET /user/{userId}` restreint | Rôle `admin` requis |
| ✅ `UseAuthentication` + `UseAuthorization` | Ajoutés dans `Program.cs` — sans eux le JWT n'était jamais parsé |

---

## 3. Ce qui reste à faire

### 3.1 Priorité immédiate — Simulateur Retraite (NEXT)

Le simulateur retraite est la prochaine feature à implémenter. L'infrastructure est identique à celle de payroll — suivre le même pattern.

#### 3.1.1 Backend — DTOs et service

**Créer `RetirementRequestDto.cs`** (`src/Application/DTOs/`) :
```csharp
public class RetirementRequestDto {
    public int AgeActuel { get; set; }           // âge actuel
    public int AgeDepart { get; set; } = 64;     // âge de départ souhaité
    public decimal SalaireAnnuelMoyen { get; set; } // SAM (25 meilleures années)
    public int TrimestresValides { get; set; }   // trimestres déjà acquis
    public int TrimestresRequis { get; set; } = 170; // selon génération
    public int PointsComplComplementaires { get; set; } // points Agirc-Arrco
    public string Regime { get; set; } = "general"; // general | fonctionnaire | liberal | artisan
    public decimal? RevenusAnnuelsActuels { get; set; } // pour le calcul prévisif
    public int? AnneeNaissance { get; set; }
}
```

**Créer `RetirementResponseDto.cs`** (`src/Application/DTOs/`) :
```csharp
public class RetirementResponseDto {
    public decimal PensionBaseAnnuelle { get; set; }
    public decimal PensionComplementaireAnnuelle { get; set; }
    public decimal PensionBruteTotaleAnnuelle { get; set; }
    public decimal PensionNetteAnnuelle { get; set; }
    public decimal PensionNetteMensuelle { get; set; }
    public decimal TauxRemplacement { get; set; }     // pension / salaire actuel
    public int TrimestresValides { get; set; }
    public int TrimestresRequis { get; set; }
    public int TrimestresManquants { get; set; }
    public decimal DecotePct { get; set; }
    public decimal SurcotePct { get; set; }
    public decimal Sam { get; set; }
    public decimal ValeurPoint { get; set; }
}
```

**Créer `RetirementService.cs`** (`src/Application/Services/`) :
```csharp
// Formule de base CNAV :
// PensionBase = SAM × 0.50 × (trimValid / trimRequis) × (1 - décote) × (1 + surcote)
// PensionCompl = Points × valeurPoint (1.45 en 2026)
// PensionNette = (Base + Compl) × (1 - 0.091)

// Paramètres 2026 depuis docs/knowledge-base/params/2026.json :
// PASS = 48 060€, taux_plein = 50%, valeur_point = 1.45
// décote = 1.25% / trimestre manquant
// surcote = 1.25% / trimestre excédentaire
// retenue sociale retraite = 9.1%
```

**Créer `IRetirementService.cs`** (`src/Application/Interfaces/`)

**Créer `RetirementController.cs`** (`src/Api/Controllers/`) :
- `POST /api/retirement/simulate` — `[Authorize]` optionnel, même pattern que PayrollController
- Extraire userId du JWT si présent, passer à service pour persistance

#### 3.1.2 Base de données

Aucune migration nécessaire — utiliser la table `simulations` existante avec `type = 'retirement'`. Le payload JSON contiendra Request + Response.

#### 3.1.3 Frontend — `RetirementSimulator.jsx`

Même structure et pattern que `PayrollSimulator.jsx` :
- Layout `sim-shell` (grille 2 colonnes : formulaire + résultats)
- Formulaire d'entrée (panneau gauche) :
  - Âge actuel + âge de départ souhaité (sliders)
  - Salaire annuel moyen (brut, input €)
  - Trimestres validés (input numérique ou slider 0–200)
  - Trimestres requis (pré-rempli selon génération, modifiable)
  - Points Agirc-Arrco accumulés (input)
  - Régime (selector : général / fonctionnaire / libéral / artisan)
  - Revenus annuels actuels (pour calcul taux de remplacement)
- Résultats KPI (panneau droit sticky) :
  - Pension nette mensuelle (carte principale, vert)
  - Pension brute totale annuelle
  - Taux de remplacement (%)
  - Détail : Base CNAV + Complémentaire Agirc-Arrco
  - Décote ou surcote appliquée
  - Trimestres manquants / excédentaires

Appel API :
```js
POST /api/retirement/simulate
Authorization: Bearer <token>
Content-Type: application/json
{ AgeActuel, AgeDepart, SalaireAnnuelMoyen, TrimestresValides, ... }
```

#### 3.1.4 Wiring dans Home.jsx

- Remplacer le bloc "Coming soon" pour `tab === 'retirement'` par `<RetirementSimulator lang={lang} onLangChange={onLangChange} />`
- Importer `RetirementSimulator` depuis `./RetirementSimulator`
- Supprimer le badge "Bientôt" sur l'item sidebar Retraite

### 3.2 Priorité haute

| # | Tâche | Contexte |
|---|---|---|
| P1 | **Migration vers cookie HttpOnly** | Sécuriser le token JWT (actuellement `localStorage`, vulnérable XSS). Patch `AuthController` : `Response.Cookies.Append(...)` + CORS `credentials: 'include'` |
| P2 | **Simulateur Prêts** | Même pattern que Retraite. Règles dans `docs/knowledge-base/loans.md`. DTOs : `LoanRequestDto` (montant, durée, taux, type), `LoanResponseDto` (mensualité, coût total, TAEG) |
| P3 | **Tests E2E retraite** | Après implémentation : tests `RetirementServiceTests.cs` avec cas de décote/plein/surcote |

### 3.3 Priorité moyenne

| # | Tâche | Contexte |
|---|---|---|
| M1 | **Calcul freelance côté backend** | Actuellement estimé côté frontend — enrichir `PayrollService` avec logique ME/EURL/SASU |
| M2 | **Affinage charges portage** | Intégrer la réserve congés (10%) et frais pro dans le calcul backend |
| M3 | **Paramètres annuels versionnés** | Mécanisme de sélection de l'année de calcul (2025/2026/2027) |
| M4 | **Export PDF** | Bulletin de simulation exportable |
| M5 | **Tests unitaires manquants** | Cas freelance ME/EURL/SASU dans `PayrollServiceTests` ; `RetirementServiceTests` complets |

### 3.4 Priorité basse

| # | Tâche | Contexte |
|---|---|---|
| L1 | **Simulateur épargne** | Règles dans `docs/knowledge-base/savings.md` |
| L2 | **Simulateur assurance** | Règles dans `docs/knowledge-base/insurance.md` |
| L3 | **Dashboard analytics admin** | Vue admin : simulations, utilisateurs, distributions |
| L4 | **Google OAuth opérationnel** | Credentials Google + test callback |

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
| 2026-03-29 | Parts fiscales crash | `Parts: int` → crash JSON sur valeurs 1.5/2.5. Fix : `decimal Parts = 1m`. `ComputePasTaux()` ajouté. |
| 2026-03-29 | IDOR SimulationController | `GET /user/{userId}` sans auth → n'importe qui pouvait lire les simus d'autrui. Fix : `[Authorize]` + ownership check + endpoint `/mine` |
| 2026-03-29 | UseAuthentication manquant | **Bug critique** : `app.UseAuthentication()` et `app.UseAuthorization()` absents de `Program.cs` → JWT jamais parsé → `userId` toujours null → toutes les simulations sauvegardées sans propriétaire. Fix : 2 lignes dans `Program.cs` |
| 2026-03-29 | Authorization header manquant | `PayrollSimulator.jsx` appelait `/api/payroll/simulate` sans header Bearer → backend recevait aucun token. Fix : ajout du header dans `simulate()` |

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
