# Épargne & Projets — Règles, formules et guide pratique (France, 2026)

## Objectif

Fournir une spécification et des formules pour simuler des objectifs d'épargne (projets ciblés), calculer l'effort épargne nécessaire, proposer optimisations de budget (« switch ») et prioriser les sacrifices pour atteindre un objectif (ex : 12 000 € pour une voiture en 24 mois).

## 1. Formule cible d'épargne (baseline)

On suppose un objectif nominal, un horizon en mois, une inflation annuelle $(i_{inf})$ et un rendement nominal annuel $(r)$ sur le placement.

Notation :
- Objectif : $O$ (ex : 12 000 €)
- Horizon en mois : $N$ (ex : 24)
- Inflation annuelle : $i_{inf}$ (ex : 0,02)
- Rendement annuel nominal : $r$ (ex : 0,03)

On indexe l'objectif sur l'inflation annualisée (approche simplifiée) :

$$O_{index\'e} = O \times (1 + i_{inf})^{\tfrac{N}{12}}$$

Si on épargne mensuellement et que le placement rapporte $r$ par an (capitalisation mensuelle), l'effort mensuel approximatif est :

$$
E_{mensuel} \approx \frac{O_{index\'e}}{\sum_{k=1}^{N} (1 + r/12)^{-(N-k+1)}}
$$

Approche pratique (approximation rapide) : calculer l'objectif indexé puis répartir en mensualités en tenant compte d'un rendement moyen (ex. Livret A ~3%). Pour 12 000 € sur 24 mois avec r≈3% on obtient E_mensuel ≈ 485 € (ordre de grandeur).

## 2. Optimisations de charges fixes (le "Switch")

L'idée : comparer Solution A (actuelle) vs Solution B (optimisée) pour estimer gain mensuel $G$.

Formule générale :

$$G = Co\^ut_A - Co\^ut_B + Avantages\_reçus - Co\^ut\_impl\_B$$

Exemples concrets :

- Transport (Navigo vs vélo / Liberté+)
  - $G_{transport} = Co\^ut_{Navigo} - Co\^ut_{VeloLoue}$ (ex. ~90 € − ~30 € → gain indicatif ~60 €/mois)
- Télécom & Fibre
  - $G_{telecom} = (Mobile_{std} + Fibre_{std}) - (Mobile_{opt} + Fibre_{opt})$ (ex. 70 − 40 = 30 €/mois)

## 3. Ratios comportementaux et budget

Utiliser règle 50/30/20 adaptée :

- Besoins : max 50% du net
- Envies : max 20% du net
- Épargne projet : min 30% du net (si prioritaire)

Calcul du budget vêtements (exemple):

Formule claire :

$$
Budget_{vetements\_mois} = \frac{Salaire_{Net\_annuel} \times 0{,}05}{12}
$$

Remarque : l'utilisateur avait proposé 5% du revenu annuel net ; la forme ci‑dessus calcule la valeur mensuelle correspondante.

## 4. Algorithme "Sacrifice nécessaire" (ordre de priorités)

1. Calculer $E_{mensuel\_requi}$ via Section 1.
2. Mesurer $E_{actuelle}$ (épargne déjà allouée / mois). Si $E_{actuelle} \ge E_{mensuel\_requi}$ → OK.
3. Sinon, Gap = $E_{mensuel\_requi} - E_{actuelle}$.
4. Appliquer optimisations par niveaux (estimer gains cumulés) :
   - Niveau 1 (automatique) : regrouper abonnements (Netflix/Spotify/Gym) → gain estimé variable.
   - Niveau 2 (transport) : Navigo → vélo loué → gain estimé (ex: ~60 €/mois).
   - Niveau 3 (alimentation) : Meal prep vs prêt-à-manger → gain estimé 150–300 €/mois.
5. Si Gap > somme_gains_max → proposer allonger horizon ou augmenter apport initial.

## 5. Exemple chiffré (12 000 € en 24 mois)

- Objectif indexé (inflation 2%) : $O_{index\'e} = 12\,000 \times 1.02^{2} \approx 12\,485$€
- Rendement Livret A r≈3% annuel → E_mensuel ≈ 485 € (arrondi)

Synthèse d'optimisation proposée (exemple) :

- Par an : 6 000 € (supprimer 1 voyage long-courrier)
- Par mois : 430 € (200 Meal Prep + 60 Vélo + 170 Arbitrage loisirs)
- Par jour : 16,40 € (~prix d'un menu UberEats)

## 6. Modèle de paramètres (exemple JSON)

```json
{
  "version": "2026-01",
  "effective_date": "2026-01-01",
  "inflation_estimate": 0.02,
  "default_savings_rate": 0.30,
  "livret_a_rate": 0.03,
  "switch_examples": {
    "navigo_monthly_example": 90,
    "bike_rental_monthly_example": 30,
    "ikv_annual_max": 700,
    "bike_monthly_cost": 30,
    "telecom_standard": 70,
    "telecom_optimized": 40
  },
  "behavioural": {
    "clothing_pct_annual": 0.05,
    "fringue_meter_threshold_monthly": null
  }
}
```

## 7. Signatures de fonctions proposées

- `computeMonthlyTarget(objective, months, inflation, annualRate) -> float`
- `computeIndexedObjective(objective, inflation, months) -> float`
- `computeSwitchGain(costA, costB, oneOffCostsB=0, benefits=0) -> monthlyGain`
- `computeGapAndPlan(currentSavings, requiredMonthly, switches[]) -> {gap, suggestedSwitches, newMonthlySavings}`

## 8. Conseils pratiques (format court)

- Prioriser gains récurrents (transport, abonnements) plutôt que petites économies ponctuelles.
- Automatiser l'épargne (virement automatique vers un livret dédié le jour de paie).
- Réévaluer horizon si Gap trop élevé : augmenter durée réduit E_mensuel exponentiellement.

## 9. Tests suggérés

- Vérifier `computeMonthlyTarget` sur vecteurs connus (O=12 000, N=24, r=0.03, i=0.02).
- Vérifier `computeSwitchGain` pour Navigo→Vélo et Telecom standard→optimisé.

---

Document créé pour intégrer le volet épargne/projets dans le simulateur 2026.
