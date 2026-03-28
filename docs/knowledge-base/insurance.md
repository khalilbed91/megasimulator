# Assurances — Règles, formules et spécifications (France, 2026)

## Objectif

Décrire les formules et règles métier pour les assurances importantes du simulateur (assurance emprunteur, mutuelle, auto, prévoyance) en 2026, avec paramètres 2026 et signatures de fonctions prêtes à l'implémentation.

## 1. Assurance emprunteur (prêt immobilier)

### A. Méthodes de calcul

- Sur capital initial (fixe) :

$$
Mensualit\'e_{Assur} = \frac{K \times Taux_{assur\_annuel}}{12}
$$

- Sur capital restant dû (dégressive) :

$$
Mensualit\'e_{Assur}(m) = \frac{CRD(m) \times Taux_{assur\_annuel}}{12}
$$

où $CRD(m)$ est le capital restant dû au mois $m$ calculé depuis le tableau d'amortissement.

### B. Quotité

- La quotité définit la part du capital assurée.
- Formule coût total avec quotité :

$$
Co\^ut_{Total} = Mensualit\'e_{Assur} \times Quotit\'e
$$

Exemples : célibataire = 100% ; couple 50/50 ou 70/30 etc.

### C. Impact sur le TAEG

- L'assurance entre dans le calcul du TAEG. Le simulateur doit ajouter l'assurance (et frais) au taux nominal afin de calculer et comparer au taux d'usure.

## 2. Mutuelle (assurance santé)

### A. Mutuelle d'entreprise (salariés)

- Règle minimale : l'employeur prend au moins 50% du coût du panier de soins minimum.
- Coût salarié = Cotisation_totale × 0,50 (part salariale à prélever).
- Fiscalité : la part employeur est traitée comme avantage (réintégration selon règles fiscales).

### B. Mutuelle TNS / Loi Madelin

- Les cotisations Madelin sont déductibles du bénéfice imposable.
- Gain fiscal estimé : Cotisation × Taux Marginal d'Imposition (TMI) (approximatif pour simulation).

## 3. Assurance auto — Bonus / Malus (CRM)

- Coefficient initial nouveau conducteur : 1,00.
- Mise à jour annuelle :
  - Pas de sinistre responsable : $Co_{n+1} = Co_n \times 0{,}95$ (−5%).
  - Sinistre responsable : $Co_{n+1} = Co_n \times 1{,}25$ (+25%).
- Seuils : min = 0,50 ; max = 3,50.

Coût annuel ≈ Prime_base × Coefficient.

## 4. Assurances de revenus / Prévoyance

- Couverture IJ (Indemnités Journalières) : permet maintien partiel des revenus en cas d'arrêt.
- Délais/carences types : 3 jours (accident), 15 jours (maladie), 30 jours (hospitalisation) — paramétrables.
- Taux estimé 2026 : 1%–3% du revenu annuel brut selon âge/profil/profession.

## 5. Variables & paramètres 2026 (exemple JSON)

Les paramètres centraux (taux, plafonds, exemples) sont stockés dans `docs/knowledge-base/params/2026.json`. Utiliser ce fichier pour initialiser les valeurs en code et marquer les champs `verified` après validation.

Exemple (voir le fichier `params/2026.json` pour les valeurs détaillées) :

```json
{
  "params_file": "docs/knowledge-base/params/2026.json",
  "note": "Assurance examples and rates are managed centrally."
}
```

## 6. Signatures de fonctions proposées

- `computeBorrowerInsuranceFixed(capital, annualInsuranceRate) -> monthlyInsurance`
- `computeBorrowerInsuranceCRD(crd_month, annualInsuranceRate) -> monthlyInsurance`
- `applyQuotity(monthlyInsurance, quotity) -> monthlyInsuranceWithQuotity`
- `computeMutuelleCost(totalMonthlyPremium, employerSharePct=0.5) -> {employeeCost, employerCost}`
- `updateBonusMalus(coef, claimResponsible:boolean) -> newCoef`
- `computePrevoyanceCost(annualIncome, pct) -> annualCost`

## 7. Tests unitaires suggérés

- Vérifier `computeBorrowerInsuranceFixed` avec K=200000 et rate=0.0015 → mensualité fixe.
- Vérifier `computeBorrowerInsuranceCRD` sur tableau d'amortissement → somme des mensualités cohérente.
- Vérifier `updateBonusMalus` pour série d'années sans sinistre → atteinte du bonus 0,50 après ~13 ans.

## 8. Notes et intégration

- L'assurance impacte le TAEG et les décisions de capacité d'emprunt — toujours calculer et exposer la part assurance.
- Permettre profils de risque (âge, fumeur, pathologie) en tant que modificateurs de taux pour les simulations avancées.

---

Document créé/mis à jour pour intégrer les assurances dans le simulateur 2026.
# Insurance — Business Rules & Formulas

## Overview

Insurance products vary widely. For each product (home, car, moto, bicycle, mobile device), document pricing factors: risk classes, age, location, coverage limits, deductible, and tariff tables.

## Premium estimation (high level)

premium = baseRate * exposureFactor * riskModifiers - discounts

Where factors and modifiers are defined per product and sourced from underwriting rules.

Implementation notes:
- Store tariff tables and risk matrices as data-driven tables.
- Document mandatory coverages and regulatory minimums.

Test vectors: include sample profiles with expected premium outcomes once tariff tables are added.
