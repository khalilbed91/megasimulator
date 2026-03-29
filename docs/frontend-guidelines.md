# Frontend — Guidelines techniques

_Dernière mise à jour : 2026-03-29_

---

## 1. Stack technique

| Élément | Version | Notes |
|---|---|---|
| React | 18.2 | Hooks uniquement, pas de class components |
| Vite | 5.4 | Dev server port 5173, proxy `/api` → `http://localhost:5000` |
| Bootstrap CSS | 5.3.2 (CDN) | CSS uniquement — pas de JS Bootstrap |
| Bootstrap Icons | 1.10.5 (CDN) | Utilisé pour quelques icônes statiques |
| Inter | Google Fonts | Police principale UI |

---

## 2. Architecture des fichiers

```
src/Frontend/
  index.html                  ← Root HTML (charset UTF-8 obligatoire)
  vite.config.js              ← Proxy /api → backend
  src/
    App.jsx                   ← Router racine, dark/lang toggle, localStorage
    Home.jsx                  ← Shell: sidebar 230px + top-bar + page-body
    PayrollSimulator.jsx      ← Simulateur de paie (composant principal)
    Login.jsx                 ← Page auth split-screen
    Signup.jsx                ← Page inscription
    Account.jsx               ← Page profil utilisateur
    Contact.jsx               ← Page contact
    Logo.jsx                  ← Composant logo centralisé
    styles.css                ← Design system global (tokens CSS + composants)
    login.css                 ← Styles spécifiques à la page auth
```

---

## 3. Design system

Se référer à `docs/brand-guidelines.md` pour la palette, tokens et règles visuelles complètes.

**Principe clé :** toutes les couleurs passent par les variables CSS (`--accent`, `--card`, etc.) — jamais de hex hardcodé dans les composants JSX.

---

## 4. App.jsx — Router et état global

- États gérés : `view` (login/signup/home), `token` (JWT string ou null), `dark` (boolean), `lang` ('fr'|'en')
- Persistance : `localStorage` clés `msim_token`, `msim_dark`, `msim_lang`
- `controls-bar` (position fixed top-right) : toggle dark mode (icône lune/soleil) + toggle langue (drapeaux FR/EN SVG)
- Passer `lang` en prop à tous les composants enfants

---

## 5. Home.jsx — Shell principal

- Sidebar fixe 230px avec sections de navigation labelisées :
  - *Simulations* : Simulateur de paie, Retraite (à venir), Prêts (à venir)
  - *Utilisateur* : Mon compte, Contact
- `tab-bar` pour les sous-onglets du simulateur
- Affichage conditionnel des pages via `activePage` interne
- Pages "coming soon" pour retraite et prêts : afficher un état vide avec message

---

## 6. PayrollSimulator.jsx — Composant principal

### 6.1 Structure

Layout en deux panneaux (`sim-shell` : grille `1fr 400px`) :
- **Panneau gauche** : formulaire de saisie (`.sim-form-card`)
- **Panneau droit** : résultats (`.sim-result-card`, sticky)

### 6.2 Statuts disponibles (StatusPicker)

4 cartes visuelles dans une grille 2×2 :

| Valeur | Label FR | Détails |
|---|---|---|
| `non-cadre` | Non-cadre | Salarié régime général |
| `cadre` | Cadre | Statut cadre AGIRC |
| `freelance` | Freelance | Sous-formulaire : type structure (ME/EURL/SASU) + CA annuel HT |
| `portage` | Portage salarial | Sous-formulaire : CA mensuel HT + slider frais portage (3–20%) |

### 6.3 Calcul du brut effectif (frontend)

Le frontend calcule un `brutAnnuel` équivalent avant d'appeler l'API :

```js
// Freelance ME (micro-social services 22%)
brutAnn = caAnnuel * (1 - 0.22)

// Freelance EURL (TNS ~40% charges)
brutAnn = caAnnuel * 0.60

// Freelance SASU (charges président ~45%)
brutAnn = caAnnuel * 0.55

// Portage salarial
// Déduction frais portage + approx charges salarié
brutAnn = (caMensuel * 12) * (1 - portagePercent/100) * 0.78
```

### 6.4 Mode fiscal (FiscalToggle)

Toggle exclusif **Foyer fiscal** ↔ **Retenue à la source** :
- **Foyer fiscal** : sélecteur de parts (chips 1/1.5/2/2.5/3/3.5/4/5) + auto-suggestion basée sur situation familiale + enfants
- **Retenue à la source** : slider 0–55% + badge de suggestion auto (barème PAS 2026) cliquable

**Barème PAS 2026 (suggestion auto) :**

| Net annuel estimé | Taux suggéré |
|---|---|
| ≤ 14 490 € | 0% |
| ≤ 21 917 € | 2% |
| ≤ 31 425 € | 7.5% |
| ≤ 58 360 € | 14% |
| ≤ 80 669 € | 22% |
| ≤ 177 106 € | 30% |
| > 177 106 € | 41% |

### 6.5 Payload API

```json
POST /api/payroll/simulate
{
  "Brut": <brutAnn/12>,
  "BrutAnnuel": <brutAnn>,
  "Statut": "non-cadre|cadre",
  "Parts": <number>,
  "RevenusAnnexes": <number>,
  "Primes": <number>,
  "RetenuePct": <0-55>,
  "FreelanceType": "me|eurl|sasu|null",
  "PortagePercent": <number|null>,
  "CaAnnuel": <number|null>,
  "CaMensuel": <number|null>
}
```

### 6.6 Résultats affichés (KPI cards)

- Net mensuel (vert) / Net annuel (teal) / Cotisations sociales (orange) / Coût employeur (indigo)
- Carte retenue à la source (rouge) si mode retenue et taux > 0
- Carte frais portage (orange) si statut portage
- Barre de répartition : Net / Cotisations / Charges patronales

---

## 7. Login.jsx — Auth split-screen

- Panneau gauche (420px) : fond dégradé sombre, orbes lumineux, 3 cartes stat
- Panneau droit : formulaire centré, inputs décorés icônes, bouton OAuth Google
- Responsive : panneau gauche masqué sous 860px
- Styles dans `login.css`

---

## 8. Sécurité / Auth

- Token JWT stocké dans `localStorage` (clé `msim_token`) — **temporaire, acceptable pour MVP**
- **À migrer** vers cookie `HttpOnly; Secure; SameSite=Strict` côté serveur (voir `AuthController.cs`)
- Décodage JWT côté client pour vérifier le rôle admin (composant `isAdmin()` dans `PayrollSimulator.jsx`)
- Ne jamais exposer les erreurs techniques brutes à l'utilisateur

---

## 9. Internationalisation

- Objet de traductions `T` en haut de chaque composant majeur (fr/en)
- La langue est transmise via la prop `lang` depuis `App.jsx`
- Fichiers JSX doivent être encodés **UTF-8 sans BOM**
- ⚠️ Ne jamais utiliser `Set-Content` PowerShell sans `-Encoding UTF8NoBOM` — risque de double-encodage des caractères accentués

---

## 10. Checklist avant commit

- [ ] Build Vite propre : `npm run build` → `✔ 39 modules transformed`
- [ ] Pas de caractères corrompus (`Ã`, `â€`) dans les fichiers JSX/CSS
- [ ] Linting OK (pas d'erreurs ESLint critiques)
- [ ] Responsive testé (mobile < 860px)
- [ ] Dark mode fonctionnel
- [ ] API proxy vérifié (`/api` → port 5000)


But: résumer les décisions récentes et fournir des consignes exploitables pour les développeurs frontend.

1. Objectif
- Fournir une expérience de connexion claire, accessible et sécurisée.
- Prioriser la lisibilité, l'alignement visuel et la sécurité du token.

2. Structure visuelle
- Layout centré sur desktop: logo + titre + description au-dessus d'une carte contenant le formulaire.
- Carte (`.login-card .card`) : largeur large (≈840px desktop), réduit sur mobile (<=1024px).
- Champs de saisie: labels visibles au-dessus (alignement gauche dans la zone du formulaire), inputs full-width à l'intérieur de la carte.
- Boutons alignés horizontalement (primary + OAuth). Utiliser des états `:disabled` et indicateurs de chargement.

3. Icône / Logo
- Utiliser un pictogramme clair représentant un wallet avec un billet sortant. SVG inline dans `Login.jsx` pour contrôle style et couleurs.
- Règles de style: coin/agrafe dorée (#f59e0b), corps sombre (#0b1220), fond en dégradé rappelant la marque.
- `role="img"` et `aria-label` sur SVG.

4. Accessibilité
- Labels visibles et utilisables par les lecteurs d'écran.
- Inputs: `name`, `aria-label`, `autoComplete` correct (`username`, `current-password`).
- Erreurs: utiliser `role="alert"` et `aria-live="polite"` pour les messages d'erreur.
- Eviter les commentaires HTML dans JSX; utiliser commentaires JS (`{/* ... */}`).

5. Validation & messages
- Validation client-side: email regex minimal si l'entrée contient `@`, password min 8 caractères.
- N'afficher que des messages utilisateurs lisibles — ne pas exposer d'erreurs techniques brutes.
- Backend doit renvoyer des codes HTTP explicites (400 / 401) et un payload { error: "user-friendly message" }.

6. Sécurité / Auth
- Éviter `localStorage` pour tokens sensibles (vulnérable XSS). Préférer cookie `Set-Cookie; HttpOnly; Secure; SameSite=Strict` émis par le serveur.
- Si token stocké côté client temporairement pour implémentation rapide, utiliser `sessionStorage` et documenter le risque en README.
- Si cookies cross-site nécessaires, configurer `credentials: 'include'` côté fetch et CORS côté serveur.

7. Responsive & mobile
- Sur mobile, réduire padding et largeur, inputs en 100% de la carte.
- Prévoir comportement vertical pour boutons et éléments accessibles au toucher.

8. Consignes d'implémentation
- Fichier principal: `src/Frontend/src/Login.jsx` — conserver logique d'état (username/password/loading/error) et séparations claires.
- Styles centrés dans `src/Frontend/src/login.css` ; utiliser variables CSS pour couleurs (`--accent`, `--card`).
- Tests: ajouter unit tests pour validation (email/password) et tests d'intégration pour le flux login (si possible dans `tests/Integration`).

9. Checklist avant merge
- Linting OK, pas d'erreurs JSX, tests unitaires passés.
- Comportement OAuth testé (redirection / popup selon implémentation back).
- Vérifier absence d'erreurs de build (`vite`) et vérifier rendu mobile.

---
Notes rapides:
- Si vous souhaitez migrer vers cookie HttpOnly, je peux proposer le patch backend minimal (.NET Api `AuthController`) pour renvoyer le cookie après authentification.
- Pour modifications visuelles supplémentaires, documenter les couleurs et espacement dans `docs/brand-guidelines.md`.