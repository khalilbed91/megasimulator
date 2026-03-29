Frontend — Guidelines techniques (login UI/UX)

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