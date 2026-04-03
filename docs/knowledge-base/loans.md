# Crédits (Loans) — Règles, formules et spécifications (France, 2026)

## Objectif

Fournir la logique métier et les formules nécessaires pour simuler les crédits immobiliers, personnels et auto en France (2026). Inclut : formule d'amortissement, règles HCSF (endettement), assurance emprunteur, contrôle du taux d'usure, calcul inverse de capacité d'emprunt, paramètres 2026 et signatures de fonctions.

## 1. Formule d'amortissement (mensualité hors assurance)


Formule standard (échéance constante) :

$$
M = \frac{K \times \tfrac{r}{12}}{1 - (1 + \tfrac{r}{12})^{-n}}
$$

où :
- $K$ = capital emprunté (montant - apport)
- $r$ = taux nominal annuel (format décimal, ex : 0.034 pour 3,4%) — **standardisé** sur le fichier `docs/knowledge-base/params/2026.json` (champ `rate_format` = "decimal")
- $n$ = nombre total de mensualités (ex : 240 pour 20 ans)

Implémentation : produire aussi le tableau d'amortissement (capital restant dû, intérêts, principal, assurance) si on calcule assurance sur CRD.

## 2. Crédit immobilier — règles métier HCSF 2026

A. Taux d'endettement maximum (règle HCSF)

La mensualité (assurance incluse) ne doit pas dépasser 35% des revenus nets mensuels :

$$
Endettement = \frac{M + Mensualit\'e_{assur} + Autres\ Cr\'edits}{Revenus\ Nets\ Mensuels} \le 0{,}35
$$

B. Assurance emprunteur (TAEA) — modes de calcul

- Sur capital initial (fixe) :

  $$Mensualit\'e_{assur} = \frac{K \times Taux_{assur\_annuel}}{12}$$

- Sur capital restant dû (variable) : la mensualité assurance décroit ; nécessite intégration dans le tableau d'amortissement (calcul par période).

C. Taux d'usure (plafond légal)

Le simulateur doit refuser ou signaler les simulations dont le TAEG dépasse le taux d'usure en vigueur.
- Exemple Taux d'usure T1 2026 (20 ans+) : 5,13% (valeur indicative).
- TAEG = Taux nominal + Assurance + Frais de dossier + Garantie.

## 3. Crédit auto & prêt personnel

- Moins de contraintes sur la durée, mais le TAEG est surveillé.
- Taux moyens auto 2026 : 4,5% - 7,5% selon durée.
- Coût total :

$$Co\^ut = (M \times n) - K$$

- Pour le conso, inclure frais de dossier et calculer TAEG réel.

## 4. Calcul inverse — capacité d'emprunt

Mensualité maximale :

$$M_{max} = (Salaire\_net\_mensuel \times 0{,}35) - Charges\_existantes - Autres\_cr\'edits$$

Conversion en capital max :

$$
K_{max} = M_{max} \times \frac{1 - (1 + \tfrac{i}{12})^{-n}}{\tfrac{i}{12}}
$$

Implémentation : prendre en compte apport, frais initiaux, reste à vivre minimal et taux d'usure.

## 5. Variables et paramètres 2026 (exemple JSON)

```json
{
  "version": "2026-01",
  "effective_date": "2026-01-01",
  "hcsf": {
    "max_debt_ratio": 0.35,
    "reste_a_vivre_min": 800
  },
  "taux_usure": {
    "immo_20_plus": 0.0519,
    "source_banque_france_avril_2026": "https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2"
  },
  "assurance": {
    "mode": "sur_capital_initial|sur_crd",
    "example_rate_annuel": 0.003
  },
  "parameters": {
    "apport_pct_min": 0.10,
    "notary_fees_old_pct": 0.07,
    "notary_fees_new_pct": 0.02,
    "max_immo_duration_years": 25,
    "max_immo_duration_with_works_years": 27
  }
}
```

## 6. Contrôles métiers à implémenter

- Vérifier `TAEG <= taux_usure` (par périodicité des taux d'usure).
- Vérifier `Endettement <= max_debt_ratio` (inclure assurance & autres crédits).
- Vérifier `reste à vivre >= reste_a_vivre_min`.
- Calculer tableau d'amortissement si assurance sur CRD ou pour afficher détail intérêts/principal.

## 7. Exemples

- Exemple simple :
  - Salaire net = 3000 €/mois
  - Mensualité auto existante = 200 €/mois
  - M_max = 3000 × 0.35 − 200 = 850 €/mois

  - Si i = 0.034 (3,4%), n = 240 mois (20 ans) :
    - K_max = 850 × (1 − (1 + 0.034/12)^{-240}) / (0.034/12)

## 8. Signatures de fonctions proposées

- `monthlyPayment(K, annualRate, months) -> float`
- `amortizationSchedule(K, annualRate, months, insuranceMode=None, insuranceRate=None) -> list` (renvoit lignes mois par mois)
- `computeTAEG(annualRate, insuranceAnnualRate, fees, guaranteeCost) -> float`
- `checkDebtRatio(monthlyPayment, insuranceMonthly, otherCreditsMonthly, netMonthlyIncome, maxDebtRatio=0.35) -> bool`
- `maxCapitalFromPayment(Mmax, annualRate, months) -> float`

## 9. Tests unitaires suggérés

- Vérifier `monthlyPayment` contre vecteurs connus (K=200000, i=0.02, n=240).
- Vérifier `amortizationSchedule` que le dernier capital restant dû ≈ 0.
- Vérifier `checkDebtRatio` sur cas limites (exactement 35%).
- Vérifier blocage si `TAEG > taux_usure`.

## 10. Notes et limites

- Les frais de dossier, garanties et pratiques de calcul du TAEG peuvent varier ; stocker ces éléments en paramètre.
- Les taux d'usure sont publiés trimestriellement — intégrer une source de mise à jour.

## 11. Implémentation produit (MegaSimulator)

### 11.1 API

- **POST** `/api/loan/simulate` — corps JSON : `LoanRequestDto` (camelCase). Réponse : `LoanResponseDto`.
- Persistance optionnelle pour utilisateurs connectés : `simulations.type = 'loan'`.

### 11.2 Couverture fonctionnelle

| Fonction | Détail |
|----------|--------|
| Amortissement | Mensualité constante, assurance sur capital initial, aperçu tableau (24 lignes max en réponse) |
| Immobilier | Prix TTC et/ou prix HT + régime TVA (neuf 20 % / 10 % / 5,5 %, ancien), frais de notaire indicatifs (7,5 % / 2 %) |
| PTZ | Contrôle revenu fiscal de réf. seuil par zone (barème indicatif 2026 dans `LoanService`), plafond montant indicatif par zone, différé puis mensualités sans intérêt sur phase amortissement |
| Action Logement | Tranche complémentaire taux paramétrable (défaut 1 %), montant plafonné 40 k€ (cas HLM 40 k€ non différencié dans le MVP) |
| Booster 0 % (immo) | Champ `boosterAmount` : tranche du **capital banque** amortie à 0 % sur la **même durée** que le prêt au taux nominal (modèle pédagogique type offres bancaires ; conditions réelles variables). Réponse : `mainBankPrincipal`, `boosterAmountApplied`. |
| Auto / perso | Capital direct, mêmes contrôles TAEG approximatif et HCSF si revenus renseignés |
| HCSF | Ratio 35 %, reste à vivre indicatif 800 € (paramétrable côté doc, pas encore en JSON) |

### 11.3 Sources web complémentaires (à valider officiellement)

- **PTZ** : fiche ministérielle et barèmes ([économie.gouv — PTZ](https://www.economie.gouv.fr/particuliers/pret-taux-zero-ptz)), compléments ([Stop-Loyer — barèmes PTZ 2026](https://stop-loyer.fr/baremes-ptz-2026)).
- **TVA réduite logement neuf** : conditions géographiques et sociales ([France Rénov' — TVA taux réduit](https://www.france-renov.gouv.fr/aides/tva-taux-reduit)).
- **Prêt Action Logement** : taux et plafonds ([actionlogement.fr — prêt accession](https://www.actionlogement.fr/le-pret-accession)).
- **Taux d'usure** : [Banque de France](https://www.banque-france.fr/statistiques/taux-et-cours/taux-d-usure).

### 11.4 Fichiers code

- Backend : `Application/Services/LoanService.cs`, `Application/DTOs/Loan*`, `Application/Interfaces/ILoanService.cs`, `Api/Controllers/LoanController.cs`
- Frontend : `Frontend/src/LoanSimulator.jsx`
- Paramètres indicatifs : `docs/knowledge-base/params/2026.json` → `loans`

---

## 12. Revue implémentation & actualité (2026-04-03)

| Zone | Implémenté (`LoanService.cs`) | À surveiller |
|------|------------------------------|--------------|
| Amortissement | Mensualité constante, assurance sur capital initial, aperçu tableau (24 lignes) | Assurance sur CRD non proposée en UI |
| TAEG | **Indicatif** : nominal + assurance + frais étalés (approximation) | Le TAEG réglementaire peut différer ; ne pas l’assimiler à une offre bancaire |
| Taux d’usure | **Aligné Banque de France** (crédits immobiliers personnes physiques, effet **1er avril 2026**, publication **T2 2026**) : **4,00 %** (&lt;10 ans), **4,48 %** (10 à &lt;20 ans), **5,19 %** (≥20 ans) ; prêt conso **&gt;6 000 €** : **8,61 %** | [Tableau officiel](https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2) — nouvelle parution chaque trimestre |
| HCSF | Ratio 35 %, reste à vivre 800 € | Seuils réels peuvent intégrer d’autres critères bancaires |
| PTZ / PAL | Barèmes indicatifs zones / plafonds revenus | Revalider sur [economie.gouv.fr](https://www.economie.gouv.fr/) et sources officielles à chaque mise à jour produit |
| Frais notaire | Ancien 7,5 % / neuf 2 % indicatifs | Ordres de grandeur seulement |

**Conclusion** : le module prêts reste **pédagogique** sur le TAEG ; les **seuils d’usure** suivent désormais les taux publiés par la **Banque de France** pour avril 2026. Mettre à jour `LoanService.ResolveUsuryThresholdPercent` et `params/2026.json` à chaque nouvelle parution trimestrielle.

Tests automatisés : `tests/MegaSimulator.Tests/LoanServiceTests.cs`.
