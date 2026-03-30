# Tâche planifiée — Déploiement & domaine (tests avec ami·e·s)

**Échéance visée :** à partir du 2026-03-31  
**Objectif :** exposer MegaSimulator sur un domaine public stable (HTTPS) pour que des testeurs externes puissent utiliser l’app sans setup local.

---

## Checklist produit

- [ ] Choisir hébergement **API** (.NET 10) : VPS, Azure App Service, Railway, Fly.io, etc.
- [ ] Choisir hébergement **frontend** (build Vite statique + CDN) ou servir le `dist` derrière le même domaine (reverse proxy).
- [ ] **Nom de domaine** : registrar + enregistrements DNS (A/AAAA ou CNAME vers l’hébergeur).
- [ ] **Certificat TLS** (Let’s Encrypt ou managé par la plateforme).
- [ ] **PostgreSQL** managée ou conteneur avec sauvegardes ; chaîne `CONNECTION_STRINGS__DEFAULT` en secret.
- [ ] Variables d’environnement production : `JWT__KEY` (longue et aléatoire), `JWT__ISSUER`, `FRONTEND__URL`, `GOOGLE__CLIENTID`, CORS aligné sur l’URL front publique.
- [ ] **Google Cloud Console** : ajouter l’origine JavaScript du front production ; même Client ID si GSI inchangé.
- [ ] Exécuter les **migrations** SQL au déploiement (même pipeline que `StartupMigrations` / `ApplyMigrations`).
- [ ] Vérifier **rate limiting** et charge acceptable pour une démo (ajuster fenêtres si besoin).
- [ ] Documenter l’**URL publique** et un compte invité / reset mots de passe si applicable.

## Notes

- En local, le front utilise le proxy Vite vers `localhost:5000`. En prod, soit même origine (reverse proxy), soit CORS + URL API absolue dans le build (`VITE_…` si ajouté).
- Définir **`VITE_PUBLIC_SITE_URL`** (origine HTTPS du front) au build pour **`sitemap.xml`** / **`robots.txt`** corrects. Hébergeur statique : fallback SPA (`vercel.json`, `public/_redirects` Netlify).
- Après mise en ligne, retester connexion Google, simulations invité, contact, historique utilisateur connecté.

---

_Document vivant : cocher les cases au fil des décisions._
