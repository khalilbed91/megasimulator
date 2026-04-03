# Retraite — Règles, formules et spécifications (France, 2026)

_Dernière mise à jour : 2026-04-03 — Valeur du point Agirc-Arrco officielle (1,4386 €) ; trimestres post-LFSS 2026 (reprise presse + code) ; §10 pour doutes_

## But du document

Fournir une spécification complète et prête à l'implémentation pour le calcul des retraites en France (2026). Contenu : formules de la retraite de base et complémentaire, paramètres 2026, règles pour indépendants, algorithmes pas à pas, DTOs backend et modèles de données JSON exploitables.

---

## 1. Contexte (réforme 2023 / LFSS 2026)

- La **loi de financement de la sécurité sociale (LFSS) pour 2026** a modifié ou suspendu certaines mesures de la réforme 2023 (âges, durées d’assurance) pour plusieurs générations — le détail exact se lit au **JORF** et sur **service-public.fr** ; le tableau §2 ci-dessous reflète ce que le **code** applique après veille avril 2026 (presse spécialisée / fiches publiques).
- PASS 2026 : **48 060 €** (aligné PMSS annuel) — référence pour plafonner le SAM dans la spec ; le simulateur attend un SAM déjà saisi.
- PMSS 2026 : **4 005 €/mois** (confirmé **Agirc-Arrco**, tableau paramètres 2026).
- Taux plein retraite de base : **50 %**
- Prélèvements sur pension : le code applique **9,1 %** sur la pension brute comme **ordre de grandeur du plafond** (CSG taux normal + CRDS + CASA). Le **taux réel** dépend du revenu fiscal de référence (barèmes URSSAF / impots.gouv) — peut être plus bas (taux réduit / médian) ou 0 %.

---

## 2. Retraite de base (CNAV) — formule générale

$$
Pension_{Base} = SAM \times Taux_{plein} \times \frac{Trimestres_{validés}}{Trimestres_{requis}} \times (1 - décote) \times (1 + surcote)
$$

Définitions :
- **SAM** (Salaire Annuel Moyen) : moyenne des 25 meilleures années de salaire brut, chaque année plafonnée au PASS de l'année correspondante
- **Taux plein** : 50 %
- **Trimestres_validés** : trimestres réellement acquis par l'assuré
- **Trimestres_requis** : 170 pour la génération 1963 (paramétrable)
- **Décote** : −1,25 % par trimestre manquant, appliquée au taux de 50 %
- **Surcote** : +1,25 % par trimestre au-delà du requis

### Trimestres requis par génération — **implémentation `RetirementService`** (année de naissance seule)

> **Important** : le droit réel peut distinguer le **trimestre** de naissance (ex. 1965 : 170 trimestres si né au 1er trimestre, 171 sinon selon les fiches publiées après la LFSS 2026). Le produit ne saisit que l’**année** : **1965 → 171** par défaut (l’utilisateur peut corriger le champ « trimestres requis »).

| Année de naissance | Trimestres requis (code) | Rappel droit / LFSS 2026 (simplifié) |
|---|---|---|
| ≤ 1960 | Voir échelons 1952→168 … 1961–1962→169 | Âges légaux progressifs non modélisés au mois près |
| 1963 | 170 | |
| 1964 | **170** | LFSS 2026 : abaissement fréquemment cité par rapport au relèvement à 171 |
| 1965 | **171** | Cas 170 si naissance T1 — ajuster à la main |
| 1966 et + | **172** | |

---

## 3. Retraite complémentaire (Agirc-Arrco) — système par points

$$
Pension_{Complémentaire} = Points_{totaux} \times Valeur_{du\_point}
$$

Acquisition des points (annuelle) :

$$
Points = \frac{Salaire_{Brut\_annuel} \times Taux_{de\_calcul}}{Prix_{d'achat\_du\_point}}
$$

Paramètres 2026 (`docs/knowledge-base/params/2026.json`) :
- `agirc_arrco.tranche1_pct` = 7,87 % (global sal+pat, salaire ≤ PMSS)
- `agirc_arrco.tranche2_pct` = 21,59 % (global sal+pat, salaire entre 1 et 8 PMSS)
- `agirc_arrco.valeur_point` = **1,4386 €** — **valeur de service du point** gelée du **1er novembre 2025 au 31 octobre 2026** ([Agirc-Arrco — Paramètres et chiffres du régime](https://www.agirc-arrco.fr/nos-etudes-et-publications/documentation-institutionnelle/parametres-et-donnees-statistiques/)).

> Prix d’achat du point 2026 : **20,1877 €** (même source).

Notes :
- Le calcul réel détaille la part salariale et patronale pour chaque tranche; pour un simulateur performant, stocker ces parts si on veut produire un bulletin détaillé.

---

## 4. Cas freelance / micro-entrepreneur (validation de trimestres)

Pour valider 4 trimestres en 2026, seuils approximatifs suivants :

| Activité | CA pour 1 trimestre | CA pour 4 trimestres (annuel) |
|---|---:|---:|
| Vente (BIC) | ~4 150 € | ~16 600 € |
| Prestations (BNC/Artisan) | ~2 450 € | ~9 800 € |
| Libéral (CIPAV) | ~2 700 € | ~10 800 € |

Remarque : ces seuils permettent d'acquérir les trimestres, mais n'assurent pas un niveau de pension élevé (pensions souvent faibles en micro-entreprise).

---

## 5. DTOs backend — prêts à implémenter

### `RetirementRequestDto.cs`

```csharp
public class RetirementRequestDto {
    public int? AnneeNaissance { get; set; }
    public int AgeDepart { get; set; } = 64;
    public decimal SalaireAnnuelMoyen { get; set; }   // SAM en €
    public int TrimestresValides { get; set; }
    public int TrimestresRequis { get; set; } = 170;
    public decimal PointsComplementaires { get; set; } // points Agirc-Arrco
    public string Regime { get; set; } = "general";   // general|fonctionnaire|liberal|artisan
    public decimal? RevenusAnnuelsActuels { get; set; } // pour taux de remplacement
}
```

### `RetirementResponseDto.cs`

```csharp
public class RetirementResponseDto {
    public decimal PensionBaseAnnuelle { get; set; }
    public decimal PensionComplementaireAnnuelle { get; set; }
    public decimal PensionBruteTotaleAnnuelle { get; set; }
    public decimal PensionNetteAnnuelle { get; set; }
    public decimal PensionNetteMensuelle { get; set; }
    public decimal TauxRemplacement { get; set; }
    public int TrimestresValides { get; set; }
    public int TrimestresRequis { get; set; }
    public int TrimestresManquants { get; set; }
    public decimal DecotePct { get; set; }
    public decimal SurcotePct { get; set; }
    public decimal Sam { get; set; }
    public decimal ValeurPoint { get; set; }
}
```

---

## 6. Algorithme d'implémentation — ordre d'exécution

```
1. Calculer trimestresManquants = max(0, trimestresRequis - trimestresValides)
   Calculer trimestresSupplementaires = max(0, trimestresValides - trimestresRequis)

2. Calculer décote et surcote :
   decote = trimestresManquants * 0.0125          // 1.25% par trimestre manquant
   surcote = trimestresSupplementaires * 0.0125   // 1.25% par trimestre en plus

3. Calculer pension de base CNAV :
   facteur = trimestresValides / trimestresRequis (plafonné à 1 si surcote)
   PensionBase = SAM * 0.50 * facteur * (1 - decote) * (1 + surcote)

4. Calculer pension complémentaire :
   PensionCompl = PointsComplementaires * 1.4386   // valeur service du point (officielle nov. 2025)

5. Total brut :
   PensionBrute = PensionBase + PensionCompl

6. Net (retenue sociale 9.1%) :
   PensionNette = PensionBrute * (1 - 0.091)
   PensionNetteMensuelle = PensionNette / 12

7. Taux de remplacement (si revenus actuels fournis) :
   TauxRemplacement = PensionNetteMensuelle / (RevenusAnnuelsActuels / 12)
```

---

## 7. Exemple numérique de référence

Données : génération 1963, salaire moyen 40 000 €/an, 170 trimestres validés, 8 000 points Agirc-Arrco

| Étape | Calcul | Résultat |
|---|---|---|
| Trimestres manquants | 170 - 170 | 0 |
| Décote | 0 × 1.25% | 0 % |
| Pension base | 40 000 × 50% × (170/170) | 20 000 €/an |
| Pension complémentaire | 8 000 × 1,4386 | **11 508,80 €/an** |
| Pension brute | 20 000 + 11 508,80 | **31 508,80 €/an** |
| Pension nette | 31 508,80 × 0,909 (arrondi `decimal` .NET) | **28 641,50 €/an** |
| Pension nette mensuelle | 28 641,50 / 12 (arrondi) | **≈ 2 386,79 €/mois** |

Exemple avec décote (150 trimestres validés au lieu de 170) :

| Étape | Calcul | Résultat |
|---|---|---|
| Trimestres manquants | 170 - 150 | 20 |
| Décote | 20 × 1.25% | 25 % |
| Pension base | 40 000 × 50% × (150/170) × (1 - 0.25) | ≈ 13 235 €/an |
| Pension compl. (même points) | 8 000 × 1,4386 | 11 508,80 €/an |
| Pension nette | (base arrondie + 11 508,80) × 0,909 → arrondi `decimal` | **≈ 22 492 €/an** |
| Pension nette mensuelle | | **≈ 1 874 €/mois** (selon arrondis intermédiaires) |

---

## 8. Tests unitaires à écrire (`RetirementServiceTests.cs`)

- **Cas 1** : taux plein (170 trimestres, SAM = 40 000 €) → PensionBase = 20 000 €/an
- **Cas 2** : décote 20 trimestres manquants → vérifier décote 25% appliquée
- **Cas 3** : surcote 4 trimestres supplémentaires → vérifier surcote 5% appliquée
- **Cas 4** : pension complémentaire 8 000 points × 1,4386 → 11 508,80 €/an
- **Cas 5** : pension nette = arrondi `decimal` de brute × (1 − 0,091)
- **Cas 6** : taux de remplacement calculé correctement

---

## 9. Notes et limitations

- Les règles réelles comportent de nombreux cas particuliers (régimes spéciaux, bonification pour enfants, majorations de durée d'assurance, exonérations partielles). Ce document fournit le socle mathématique.
- Les valeurs numériques (valeur du point, PASS, seuils micro) doivent être vérifiées sur les sources officielles (URSSAF, CNAV, Agirc-Arrco) et versionnées dans `params/2026.json`.
- Pour la V1 du simulateur : ne pas implémenter les régimes spéciaux — afficher un message si régime `fonctionnaire` ou `liberal` sélectionné.

---

## 10. Implémentation produit (`RetirementService`) — état et écarts

| Élément | Spécification doc | Code (`RetirementService.cs`) |
|--------|-------------------|-------------------------------|
| Formule base + décote/surcote | §2, §6 | Conforme (taux plein 50 %, 1,25 %/trim., décote plafonnée 25 %) |
| Complémentaire | §3 | `Points × 1,4386 €` (constante ; alignée [Agirc-Arrco](https://www.agirc-arrco.fr/nos-etudes-et-publications/documentation-institutionnelle/parametres-et-donnees-statistiques/)) |
| Retenue nette | Variable selon RFR | **9,1 %** fixe = plafond type (CSG normale + CRDS + CASA) — voir §1 |
| Trimestres requis | LFSS 2026 (reprise) | **1963→170, 1964→170, 1965→171, 1966+→172** ; pas de mois de naissance |
| Âge légal | §1 ; 1961 → 63 ans 6 mois dans le droit réel | **Simplifié** : ≤1960→63 ans, ≥1961→64 ans (pas de demi-année) |
| SAM | Plafonné au PASS par année (25 meilleures années) | **Saisie libre** : l’utilisateur entre déjà une moyenne ; pas de reconstitution PASS |
| Régimes spéciaux | §9 | Non couverts — avertissement UI |

**Actualité / conformité** : les montants (valeur du point Agirc-Arrco, taux de retenue, barèmes) évoluent chaque année. Vérifier les publications officielles (CNAV, Agirc-Arrco, Légifrance) avant communication grand public. Le simulateur reste **pédagogique**, pas un engagement de pension.

---

_Document consolidé le 2026-03-29 — revue officielle Agirc-Arrco + Banque de France + LFSS (presse) 2026-04-03_
