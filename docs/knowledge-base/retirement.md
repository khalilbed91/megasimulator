# Retraite — Règles, formules et spécifications (France, 2026)

## But du document

Fournir une spécification complète et prête à l'implémentation pour le calcul des retraites en France (2026). Contenu : formules de la retraite de base et complémentaire, paramètres 2026, règles pour indépendants, algorithmes pas à pas et modèles de données JSON exploitables.

## 1. Contexte (réforme 2023 / état 2026)

- Âge légal (exemples génériques) : 64 ans pour certaines générations (ex : natifs 1962/1963 selon calendrier de la réforme).
- PASS / Plafonds 2026 : 48 060 € (utilisé pour plafonner les salaires dans le calcul du SAM).

## 2. Retraite de base (CNAV) — formule générale

La pension de base pour un salarié du privé s'exprime par :

$$
Pension_{Base} = SAM \times Taux_{plein} \times \frac{Trimestres_{validés}}{Trimestres_{requis}}
$$

Définitions :
- $SAM$ (Salaire Annuel Moyen) : moyenne des 25 meilleures années de salaire brut, chaque année plafonnée au PASS de l'année correspondante.
- $Taux_{plein}$ : 50% (taux plein pour la retraite de base).
- $Trimestres_{validés}$ : trimestres réellement acquis par l'assuré.
- $Trimestres_{requis}$ : nombre de trimestres requis pour le taux plein (ex : 170 trimestres pour la génération 1963).

Décote / Surcote :
- Décote : réduction du taux si trimestres manquants. Exemple courant : -1,25% par trimestre manquant sur le taux de 50% (paramétrable selon génération).
- Surcote : +1,25% par trimestre supplémentaire.

Remarques d'implémentation :
- Pour calculer le `SAM`, collecter l'historique salarial (au moins 25 années). Pour chaque année : utiliser le salaire brut, le plafonner au `PASS` de l'année, puis prendre la moyenne des 25 plus hautes valeurs.
- Le simulateur doit accepter des jeux de `PASS` historiques pour un calcul exact multi-années.

## 3. Retraite complémentaire (Agirc-Arrco) — système par points

Formule :

$$
Pension_{Compl\'ementaire} = Points_{totaux} \times Valeur\_du\_point
$$

Acquisition des points (annuelle) :

$$
Points = \frac{Salaire\_Brut\_annuel \times Taux\_de\_calcul}{Prix\_d'achat\_du\_point}
$$

Paramètres 2026 : les valeurs estimées sont centralisées dans `docs/knowledge-base/params/2026.json`.

- `agirc_arrco.tranche1_pct`, `agirc_arrco.tranche2_pct`, `agirc_arrco.valeur_point` contiennent les taux/valeur du point (format décimal). Ces valeurs sont marquées `verified: false` et doivent être vérifiées contre les sources officielles.

Notes :
- Le calcul réel détaille la part salariale et patronale pour chaque tranche; pour un simulateur performant, stocker ces parts si on veut produire un bulletin détaillé.

## 4. Cas freelance / micro-entrepreneur (validation de trimestres)

Pour valider 4 trimestres en 2026, seuils approximatifs suivants :

| Activité | CA pour 1 trimestre | CA pour 4 trimestres (annuel) |
|---|---:|---:|
| Vente (BIC) | ~4 150 € | ~16 600 € |
| Prestations (BNC/Artisan) | ~2 450 € | ~9 800 € |
| Libéral (CIPAV) | ~2 700 € | ~10 800 € |

Remarque : ces seuils permettent d'acquérir les trimestres, mais n'assurent pas un niveau de pension élevé (pensions souvent faibles en micro-entreprise).

## 5. Paramètres et constantes (extrait JSON 2026)

```json
{
  "version": "2026-01",
  "effective_date": "2026-01-01",
  "pass": 48060,
  "taux_plein": 0.50,
  "trimestres_requis": {
    "1963": 170
  },
  "age_legal": {
    "1963": 64
  },
  "agirc_arrco": "see docs/knowledge-base/params/2026.json",
  "decote_pct_par_trimestre": 0.0125,
  "surcote_pct_par_trimestre": 0.0125,
  "retraites_social_deductions_pct": 9.1,
  "freelance_quarter_thresholds": {
    "vente_bic_q": 4150,
    "prestations_q": 2450,
    "liberal_q": 2700
  }
}
```

## 6. Algorithme détaillé (logique métier) — ordre d'exécution

1. Vérifier l'éligibilité : si $Age < Age\_legal$, signaler inéligibilité ou calculer pension théorique différée.
2. Calculer le `SAM` :
   - Récupérer l'historique annuel des salaires bruts.
   - Pour chaque année, plafonner le salaire au `PASS` de l'année.
   - Prendre les 25 meilleures années : $SAM = \frac{\sum_{i=1}^{25} salaire\_plafonne_i}{25}$.
3. Appliquer prorata trimestres :
   - facteur_trimestres = $\frac{Trimestres_{valid\'es}}{Trimestres_{requis}}$.
4. Calculer la base :

$$
Pension_{Base} = SAM \times Taux_{plein} \times facteur\_trimestres\times(1 - decote)\times(1 + surcote)
$$

   - `decote` et `surcote` calculés en fonction des trimestres manquants/en trop.
5. Calculer la complémentaire :
   - Agréger `Points_{totaux}` sur la carrière.
   - $Pension_{Compl\'ementaire} = Points_{totaux} \times Valeur\_du\_point$.
6. Somme :

$$
Pension_{Brute\_Totale} = Pension_{Base} + Pension_{Compl\'ementaire}
$$

7. Nettoyage social (retenues) :

$$
Pension_{Net} = Pension_{Brute\_Totale} \times (1 - 0.091)
$$

## 7. Exemples numériques rapides

- Exemple simplifié (hypothétique) :
  - `SAM` = 40 000 €
  - `Trimestres_validés` = 170 (plein)
  - `Pension_Base` = 40 000 × 0.50 × (170/170) = 20 000 € / an
  - `Pension_Complémentaire` (si Points_totaux = 8 000) = 8 000 × 1.45 = 11 600 € / an
  - `Pension_Brute_Totale` = 31 600 € / an
  - `Pension_Net` ≈ 31 600 × (1 - 0.091) ≈ 28 726 € / an

## 8. Fonctions proposées (signatures)

- `computeSAM(salaryHistory, passByYear) -> float`
- `computeBasePension(SAM, tauxPlein, trimestresValides, trimestresRequis, decoteRate, surcoteRate) -> float`
- `computePointsFromSalary(salary, tauxCalcul, prixPoint) -> float`
- `computeComplementaryPension(pointsTotal, valeurPoint) -> float`
- `computePensionNet(bruteTotal, socialDeductionPct=9.1) -> float`

## 9. Tests unitaires suggérés

- Cas 1 : salarié avec 170 trimestres, SAM connu → vérifier Pension_Base calculée.
- Cas 2 : salarié avec trimestres manquants → vérifier application décote.
- Cas 3 : freelance micro-valide trimestres → seuils trimestriels.

## 10. Notes et limitations

- Les règles réelles comportent de nombreux cas particuliers (régimes spéciaux, droit à majoration, bonification, bonification pour enfants, majorations de durée d'assurance, exonérations partielles). Ce document fournit le socle mathématique et les paramètres 2026 ; l'enrichissement métier se fera itérativement.
- Les valeurs numériques fournies (valeur du point, PASS, seuils micro) doivent être vérifiées sur les sources officielles (URSSAF, CNAV, Agirc-Arrco) et versionnées.

---

Document mis à jour pour permettre l'implémentation des calculs de retraite dans le simulateur 2026.
# Retirement — Business Rules & Projection

## Overview

Retirement projections estimate future pension revenue based on career history, contributions, and statutory rules. French retirement systems are complex; start with a simplified projection model and add regime-specific rules.

## Simplified projection (illustrative)

Estimate future pension as a function of average career salary, contribution rate, and accrual factor per year.

pension = averageSalary * accrualRate * creditedYears

Implementation notes:
- Record contribution history per year, validate credited years and gaps.
- Allow scenario assumptions: retirement age, career interruptions, part-time periods.

Test vectors: provide example career histories and expected pension estimates using the simplified formula.

Sources: official French pension administration documentation (to be added per rule).
