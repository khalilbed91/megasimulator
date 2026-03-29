**MegaSimulator — Brand Guidelines**

_Dernière mise à jour : 2026-03-29_

---

## 1. Identité visuelle

### Palette de couleurs

| Rôle | Token CSS | Valeur (light) | Valeur (dark) |
|---|---|---|---|
| Accent principal (Teal) | `--accent` | `#0ea5a4` | `#2dd4bf` |
| Indigo (cadre / exécutif) | `--indigo` | `#6366f1` | idem |
| Succès | `--success` | `#10b981` | idem |
| Avertissement | `--warning` | `#f59e0b` | idem |
| Danger | `--danger` | `#ef4444` | idem |
| Fond page | `--bg` | `#f4f6f8` | `#0b1120` |
| Surface carte | `--card` | `#ffffff` | `#111827` |
| Texte principal | `--text` | `#0f172a` | `#e2e8f0` |
| Texte secondaire | `--muted` | `#64748b` | `#94a3b8` |
| Bordure | `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.07)` |

### Typographie

- **Police UI :** Inter (fallback : `system-ui, Arial`)
- Titres : `font-weight: 700-900`
- Corps : `font-weight: 400`, taille `14–16px`
- Labels champs : `font-weight: 600`, `13px`
- Hiérarchie : H1 `34px`, H2 `22px`, H3 `16px`

### Logo

- Fichier : `src/Frontend/public/logo.svg`
- Utiliser le mark carré sur chrome de l'app et favicons.
- Fond sombre : mark blanc sur accent ; fond clair : mark accent sur blanc.
- Espacement minimum autour du logo : `16px`.

---

## 2. Système de design (CSS Tokens)

Tous les tokens sont définis dans `src/Frontend/src/styles.css` sous `:root` et `body.app-dark`.

### Ombres & Rayons

```css
--radius:    14px   /* cartes principales */
--radius-sm:  9px   /* champs, boutons, badges */
--sh-xs      /* ombre très légère */
--sh-sm      /* ombre standard sur cartes */
--sh-md      /* ombre hover */
--sh-lg      /* ombre modals / panneaux flottants */
```

### Composants principaux

| Composant | Classe CSS | Notes |
|---|---|---|
| Sidebar | `.sidebar` | 230px, sticky, fond `--card`, nav groupée par section |
| Barre supérieure | `.top-bar` | hauteur 56px, fond `--card` |
| KPI Card | `.kpi-card .{accent|success|warning|danger|indigo}` | Variantes de couleur |
| Grille KPI | `.kpi-grid` | `auto-fill minmax(200px)` |
| Breakdown bar | `.breakdown-bar-track` / `.breakdown-bar-seg` | 3 segments animés |
| Barre onglets | `.tab-bar` / `.tab-btn` | Navigation sous-pages |
| Bouton primaire | `.btn-primary-custom` | Gradient teal, shadow glow |
| Bouton ghost | `.btn-ghost` | Bordure `--border`, hover accent |
| Champ texte | `.field-input` / `.field-select` | Bordure `--input-border`, focus ring |
| Status picker | `.status-picker` / `.status-card` | Grille 2×2, cartes cliquables |
| Sélecteur structure | `.struct-pills` / `.struct-pill` | Micro-entreprise / EURL / SASU |
| Toggle fiscal | `.fiscal-toggle-wrap` / `.fiscal-pill` | Foyer fiscal ↔ Retenue |
| Sélecteur parts | `.parts-selector` / `.parts-chip` | Chips 1–5 parts |
| Slider retenue | `.retenue-slider` | Custom thumb accent, 0–55% |
| Badge suggestion | `.retenue-suggest` | Taux PAS suggéré, cliquable |
| Badge portage | `.portage-fee-badge` | Affichage frais mensuels |
| Séparateur | `.sim-divider` | Ligne `--border` |

---

## 3. Thème sombre

Activé via `body.app-dark`. Toutes les variables CSS sont surchargées. Le toggle est géré dans `src/Frontend/src/App.jsx` via `localStorage` (clé : `msim_dark`).

---

## 4. Règles

**À faire :**
- Utiliser uniquement les variables CSS — pas de couleurs hexadécimales hardcodées.
- CTA principal : toujours `.btn-primary-custom` (gradient teal).
- Rouge (`--danger`) : erreurs et retenue à la source uniquement.

**À éviter :**
- Ne pas déformer le logo ni changer ses couleurs arbitrairement.
- Ne pas mélanger plusieurs couleurs d'accent dans un même composant.
- Ne pas désactiver le dark mode sans surcharge complète des variables.

---

## 5. Accessibilité

- Contraste texte/fond : WCAG AA minimum.
- Tous les SVG inline doivent avoir `role="img"` et `aria-label` si informatifs.
- Inputs : `name`, `aria-label`, et `autoComplete` corrects.
- Messages d'erreur : `role="alert"` ou `aria-live="polite"`.

---

## 6. Fichiers concernés

```
src/Frontend/src/styles.css       ← Design tokens, composants globaux
src/Frontend/src/App.jsx          ← Toggle dark/langue, router racine
src/Frontend/src/Home.jsx         ← Shell sidebar + top-bar
src/Frontend/src/PayrollSimulator.jsx  ← Formulaire simulateur (composants avancés)
src/Frontend/src/Login.jsx        ← Page auth split-screen
src/Frontend/src/login.css        ← Styles spécifiques auth
src/Frontend/src/Signup.jsx       ← Page inscription
src/Frontend/public/logo.svg      ← Mark SVG
```


