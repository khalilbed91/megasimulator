# Paie — Règles, formules et spécifications (France, 2026)

## But du document

Fournir une version reformulée et structurée des règles de paie 2026 afin de faciliter l'implémentation d'un simulateur de salaire. Contenu : paramètres officiels 2026, formules clefs, règles spécifiques (CDI/CADRE/CDD, indépendant, portage, JEI) et un modèle de données (JSON) exploitable par le code.

## 1. Paramètres fondamentaux (référence 2026)

- SMIC 2026 (estimation janvier)
	- Brut horaire : 12,02 €
	- Brut mensuel (35 h) : 1 823,03 €
- Plafond Mensuel de la Sécurité Sociale (PMSS) 2026
	- Mensuel : 4 005 €
	- Annuel : 48 060 €

> Remarque : les taux et plafonds évoluent chaque année ; le simulateur doit versionner les jeux de paramètres par date d'effet.

## 2. Principes de calcul (vue d'ensemble)

- Conversion Brut → Net (salarié) :
	- Net = Brut - Cotisations_salariales (pour un mois)
	- Cotisations_salariales = somme des contributions (santé, vieillesse, chômage, retraite complémentaire, CSG/CRDS, etc.) appliquées selon assiette et plafonds.
- Coût employeur :
	- Coût_total_employeur = Brut + Cotisations_patronales

- Retenue à la source (PAS) côté produit :
	- L’écran paie ne demande plus de nombre de parts, situation familiale ou enfants.
	- Le mode fiscal expose uniquement un taux de retenue direct en pourcentage.
	- Le taux par défaut est suggéré à partir du brut annuel saisi (`brutAnnuel × 0,78` pour approximer le net annuel), puis l’utilisateur peut l’ajuster.
	- Le frontend envoie `Parts = 0` pour empêcher le fallback quotient familial côté API et `RetenuePct` pour appliquer le taux choisi.

## 3. Salariés du privé — règles synthétiques

- Estimations de base (approximatives pour l'UI/estimator) :
	- Non-cadre : cotisations salariales ≈ 21,7% du brut
	- Cadre : cotisations salariales ≈ 21,9% du brut (inclut APEC ~0,024% salarié)

- Retraite complémentaire (Agirc-Arrco) — valeurs et parts
	- Voir `docs/knowledge-base/params/2026.json` → `agirc_arrco` pour les taux estimés (format décimal).
	- Les valeurs stockées sont des taux globaux (part salariale + patronale). Pour bulletin détaillé, découper les parts salarial/patronal dans une table séparée.

- CSG / CRDS :
	- Assiette : 98,25% du salaire brut
	- CSG déductible : 6,80%
	- CSG/CRDS non déductibles : 2,90%

## 4. Spécificités CDD

- Prime de précarité (fin de contrat) : 10% des totaux bruts versés.
- Cette prime est soumise à cotisations sociales et à l'impôt.

## 5. Freelance & Indépendants (synthèse)

- Micro-entreprise (auto-entrepreneur) — taux applicables sur CA encaissé :
	- Prestations de services (BNC/BIC) : 21,20% à 25,60% (selon régime/organisme)
	- Achat/Revente : 12,30%
- ACRE 2026 : à partir du 01/07/2026, exonération réduite — taux minoré passe de 50% à 75% des taux habituels (l'aide diminue). Implémenter date d'effet.
- Freelance en société :
	- SASU (assimilié salarié) : charges totales ≈ 80% du salaire net (≈45% patronales + 22% salariales en moyenne)
	- EURL (TNS) : charges ≈ 45% du revenu net (ordre de grandeur)

## 6. Portage salarial

- Frais de gestion : 5%–10% du CA
- Taux de restitution net (avant impôt) : ~48%–51% du CA HT
- Réserve obligatoire : provisionner 10% du salaire de base (pour congés/précarité)

## 7. JEI (Jeune Entreprise Innovante)

- Exonération partielle des cotisations patronales pour R&D
- Plafond d'exonération : salaire brut ≤ 2 × PMSS = 8 010 € (arrondir selon source; ici 8 010 € ≈ 2×4 005 €)
- Impact : réduction du coût employeur de ~20%–30% sur profils R&D (approx.)

## 8. Spécifications pour implémentation

Objectifs : fournir une base de données versionnée de paramètres et des fonctions réutilisables pour :
- calcul brut→net (salarié)
- calcul coût employeur
- calcul prime CDD
- conversion CA freelance → net/après charges

Proposition : centraliser tous les paramètres numériques dans `docs/knowledge-base/params/2026.json` et y accéder depuis le code.

Exemple d'accès :

```json
{
  "params_file": "docs/knowledge-base/params/2026.json",
  "note": "Les taux et plafonds sont centralisés dans le fichier ci‑dessus et sont au format décimal (ex. 0.034 pour 3.4%). Toutes les valeurs sont marquées 'verified' = false jusqu'à validation officielle."
}
```

Notes :
- Les pourcentages Agirc-Arrco doivent être decoupés en part salariale / part patronale si l'on veut produire bulletin détaillé.
- Toutes les valeurs doivent pouvoir être surchargées par statut (JEI, portage, convention collective spécifique).

## 9. Formules clefs (à implémenter)

- Net estimé (simplifié) :

	Net = Brut - (Brut * cotisations_salariales_pct)

- Coût employeur (simplifié) :

	Coût_employeur = Brut * (1 + cotisations_patronales_pct)

- CSG sur salaire :

	Base_CSG = Brut * (csg_crds.assiette_pct / 100)
	CSG_deductible = Base_CSG * (csg_crds.csg_deductible_pct / 100)
	CSG_non_deductible = Base_CSG * (csg_crds.csg_non_deductible_pct / 100)

- Retenue à la source directe :

	Retenue = Net_avant_PAS * (RetenuePct / 100)

	Net_apres_PAS = Net_avant_PAS - Retenue

- Prime CDD :

	Prime_precarite = Total_bruts_verses * (cdd.prime_precarite_pct / 100)

## 10. Exemple numérique rapide

- Cas : brut = 3 000 € / mois, salarié non-cadre (cotisations salariales estimées = 21,7%)
	- Net ≈ 3000 - (3000 * 0.217) = 2350,00 € (approx.)
	- Coût employeur (si cotisations patronales ≈ 45%) : 3000 * 1.45 = 4350 €

## 11. Tâches prochaines (implémentation)

- Fournir le JSON des paramètres (par versions/dates) — voir section `model` ci‑dessus.
- Implémenter fonctions : `brutToNet(brut, statut, options)`, `employerCost(brut, statut)`, `computeCDDPrime(totalBruts)`.
- Ajouter jeux de tests unitaires avec vecteurs connus (SMIC, cas cadre/non-cadre, CDD, micro-entreprise).

---

Sources et vérification : l'implémentation finale devra être alignée sur les textes URSSAF/Legifrance 2026 ; ces valeurs sont des estimations et des synthèses destinées à démarrer le développement.

Document créé / mis à jour pour faciliter l'implémentation du simulateur de paie 2026.
