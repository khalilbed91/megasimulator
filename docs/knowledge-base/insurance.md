# Assurances habitation / auto / moto — Règles, formules et spécifications (France, 2026)

_Dernière mise à jour : 2026-04-26 — veille Service-Public.fr / Légifrance + MVP MegaSimulator livré._

## Objectif

Définir le périmètre fonctionnel d’un simulateur d’assurance **habitation**, **auto** et **moto** pour MegaSimulator. Le simulateur doit expliquer les obligations légales françaises, estimer une prime pédagogique et montrer l’effet des garanties, franchises, zone, usage, valeur assurée et bonus-malus.

Point clé : en France, les **obligations d’assurance** sont réglementées, mais les **tarifs** restent fixés par les assureurs. Le produit ne doit donc pas présenter une prime comme un devis contractuel. Il doit afficher : “estimation indicative, non contractuelle, basée sur hypothèses MegaSimulator”.

## 1. Sources officielles retenues

| Sujet | Source |
|---|---|
| Locataire : assurance habitation risques locatifs obligatoire | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F31300` |
| Propriétaire : assurance habitation / copropriété | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F2023` |
| Responsabilité civile habitation | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F2123` |
| Assurance auto obligatoire au tiers | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F2628` |
| Garanties auto facultatives / tous risques | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F2622` |
| Bonus-malus automobile | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F2655` |
| Preuve d’assurance véhicule / FVA | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F1362` |
| Contrôle technique 2/3 roues et quadricycles catégorie L | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F37538` |
| Catastrophe naturelle / technologique | Service-Public.fr — `https://www.service-public.fr/particuliers/vosdroits/F3076` |
| Obligation d’assurance véhicules terrestres à moteur | Code des assurances, art. L211-1 — `https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073984` |

## 2. Règles réglementaires 2026 à refléter

### 2.1 Habitation

| Profil | Obligation minimale | Notes produit |
|---|---|---|
| Locataire résidence principale | Assurance habitation couvrant au minimum les **risques locatifs** : incendie, explosion, dégâts des eaux | Le propriétaire peut demander une attestation à la remise des clés puis chaque année. En cas de défaut, il peut mettre en demeure puis résilier le bail ou souscrire une assurance pour compte du locataire. |
| Colocation | Chaque colocataire doit être couvert pour les risques locatifs | Une police commune ou des polices séparées peuvent exister selon le bail. |
| Propriétaire occupant maison individuelle | Pas d’obligation générale d’assurance habitation | Fortement recommandé ; le propriétaire reste financièrement responsable des dommages causés aux tiers. |
| Propriétaire en copropriété | Assurance responsabilité civile obligatoire | À intégrer même si l’utilisateur choisit “propriétaire occupant”. |
| Propriétaire bailleur | Pas d’obligation générale hors copropriété, mais PNO recommandée | Le simulateur peut proposer “propriétaire non occupant” comme garantie recommandée. |

Garanties à proposer :
- **Risques locatifs / RC occupant** : socle obligatoire locataire.
- **Responsabilité civile vie privée** : dommages causés aux tiers par l’assuré, ses enfants, animaux ou objets sous sa garde, avec exclusions.
- **MRH** : incendie, explosion, dégâts des eaux, vol/vandalisme, bris de glace, événements climatiques, catastrophes naturelles si contrat dommages.
- **Contenu mobilier** : hypothèse interne calculée à partir de la surface pour éviter un formulaire trop lourd en MVP.
- **Objets de valeur** : option/plafond futur ; pas de champ utilisateur dans l’écran MVP.

Catastrophe naturelle :
- L’indemnisation suppose un contrat couvrant les dommages et un arrêté interministériel publié au Journal officiel.
- La déclaration se fait dans le délai légal communiqué par Service-Public (30 jours après publication de l’arrêté dans les fiches récentes).
- La garantie catastrophe naturelle est généralement incluse dans les contrats multirisques habitation, mais ne doit pas être simulée si l’utilisateur choisit seulement un socle sans dommages.

### 2.2 Auto

Règle minimale :
- Tout véhicule terrestre à moteur destiné à circuler doit être assuré au minimum en **responsabilité civile** (“au tiers”).
- La RC couvre les dommages causés aux tiers, pas les dommages au véhicule de l’assuré ni le conducteur responsable.
- La base juridique est le Code des assurances, notamment l’obligation d’assurance des véhicules terrestres à moteur.

Preuve d’assurance :
- Depuis le 1er avril 2024, la carte verte n’est plus exigée pour les véhicules immatriculés.
- En 2026, la preuve passe par le **Fichier des véhicules assurés (FVA)** et, au moment d’une souscription récente, par le mémo véhicule assuré.
- Pour certains véhicules non immatriculés, un certificat papier reste applicable.

Garanties à proposer :
- **Tiers simple** : responsabilité civile.
- **Tiers étendu** : RC + vol/incendie + bris de glace + événements climatiques selon options.
- **Tous risques** : dommages tous accidents, y compris lorsque l’assuré est responsable, selon exclusions.
- **Conducteur** : garantie corporelle du conducteur, à afficher séparément car elle n’est pas couverte par la RC minimale.
- **Assistance** : 0 km / 25 km, véhicule de remplacement.

Bonus-malus (CRM) :
- Coefficient de départ : `1.00`.
- Une année sans sinistre responsable : coefficient × `0.95`.
- Accident totalement responsable : coefficient × `1.25`.
- Accident partiellement responsable : coefficient × `1.125` (usage courant du CRM).
- Bornes à appliquer : minimum `0.50`, maximum `3.50`.
- Certains véhicules sont exclus du mécanisme selon Service-Public (ex. cyclomoteurs, motos légères, véhicules de collection, véhicules agricoles, etc.). Le simulateur doit donc avoir un champ `crmApplicable`.

### 2.3 Moto / scooter / catégorie L

Règle minimale :
- Les deux-roues, trois-roues et quadricycles motorisés sont des véhicules terrestres à moteur : assurance RC obligatoire.
- Les deux-roues de moins de 50 cm3 doivent aussi être assurés.
- L’assurance reste obligatoire même si le véhicule roule peu ; le simulateur peut proposer un usage “garage / hivernage” mais ne doit pas laisser entendre qu’il supprime l’obligation de RC.

Contrôle technique catégorie L :
- Le contrôle technique des véhicules de catégorie L est mis en place depuis 2024.
- En 2026, le calendrier concerne notamment les véhicules immatriculés en 2020 et 2021.
- Validité du contrôle : 3 ans selon Service-Public.
- Ce n’est pas un tarif d’assurance, mais un facteur de conformité / risque à afficher comme alerte.

Garanties à proposer :
- **Tiers moto** : responsabilité civile.
- **Vol / incendie** : très importante pour moto/scooter, souvent liée au stationnement et à l’antivol.
- **Dommages collision / tous accidents** : option selon valeur du véhicule.
- **Équipement du motard** : casque, gants, blouson, airbag, accessoires.
- **Assistance** : panne, crevaison, remorquage.

## 3. Modèle tarifaire pédagogique

Le simulateur doit séparer :
- `legalMinimumPremium` : coût indicatif du socle obligatoire.
- `coveragePremium` : options choisies.
- `riskAdjustments` : facteurs de profil, zone, usage, historique.
- `deductibleAdjustment` : effet d’une franchise plus ou moins élevée.
- `taxesAndFees` : placeholder si l’on ajoute plus tard taxes / frais, non détaillés MVP.

Formule générique :

```text
annualPremium =
  basePremium
  × zoneFactor
  × usageFactor
  × profileFactor
  × assetFactor
  × claimsFactor
  × crmFactor
  + selectedCoverageAddons
  - deductibleDiscount
```

Mensualisation :

```text
monthlyPremium = annualPremium / 12
```

À arrondir :
- Montants : 2 décimales.
- Coefficients : 3 décimales maximum.
- Pourcentages : 2 décimales maximum.

## 4. Variables par produit

### 4.1 Habitation

Entrées :
- `occupantStatus` : `tenant | owner_occupier | landlord | co_owner`.
- `housingType` : `apartment | house`.
- `surfaceSqm`.
- `postalCode` : saisi via autocomplete référentiel France.
- `deductibleLevel` : `low | medium | high`.
- `coverageLevel` : `legal_minimum | standard_mrh | premium_mrh`.

Champs volontairement masqués en MVP habitation :
- `contentsValue` et `valuableItemsValue` ne sont pas demandés à l’utilisateur. Le service utilise des hypothèses internes dérivées de `surfaceSqm`.
- L’objectif business est de garder un parcours court : code postal, surface, formule, franchise.

Facteurs indicatifs MVP :
- Surface : augmente la prime via `surfaceSqm × baseRatePerSqm`.
- Maison > appartement.
- Grande ville / zone sinistre > zone standard via le `zoneFactor` du référentiel postal.
- Capital mobilier augmente le risque mais reste estimé côté service en MVP.
- Franchise haute réduit la prime.

#### Référentiel codes postaux habitation

Le simulateur habitation ne demande pas une adresse complète. Il utilise un référentiel postal France :

- Table PostgreSQL : `france_postal_codes` créée par `011_add_france_postal_codes.sql`.
- Seed complet : `src/Infrastructure/SeedData/france_postal_codes_official.csv`, base officielle La Poste (`laposte-hexasmal`), environ 39k lignes.
- Import automatique : `PostalCodeSeeder` charge le CSV au démarrage API si la table est incomplète.
- Cache : `PostalCodeService` charge les lignes en `IMemoryCache` pendant 12h.
- API : `GET /api/reference/postal-codes?q=...`.
- Format UI : `CODE - Ville`, par exemple `92400 - Courbevoie` ou `95130 - Le Plessis Bouchard`.

Le `zoneFactor` est une hypothèse produit. Il est plus élevé pour Paris, petite couronne et grandes métropoles, mais ne constitue pas un tarif assureur.

#### Parcours après simulation

Après affichage de la prime indicative, l’UI propose un lien externe vers un comparateur assurance :

- habitation → page assurance habitation ;
- auto → page assurance auto ;
- moto → page assurance moto.

Ce lien est affiché comme **non sponsorisé** et MegaSimulator ne transmet pas les données de simulation. Si un partenariat réel est signé plus tard, le wording et le suivi devront être revus pour respecter la transparence commerciale.

### 4.2 Auto

Entrées :
- `vehicleValue`.
- `vehicleAgeYears`.
- `powerFiscalHp`.
- `energy` : `gasoline | diesel | hybrid | electric`.
- `usage` : `private | commute | professional`.
- `annualMileage`.
- `parking` : `street | closed_garage | private_parking`.
- `driverAge`.
- `licenseYears`.
- `crm`.
- `claimsLast36Months`.
- `coverageLevel` : `third_party | third_party_plus | all_risk`.
- `deductibleLevel`.

Facteurs indicatifs MVP :
- Jeune conducteur / permis récent : facteur majorant.
- Usage professionnel ou kilométrage élevé : facteur majorant.
- Stationnement rue : facteur majorant.
- Véhicule puissant ou valeur élevée : facteur majorant.
- CRM : multiplicateur direct pour la part liée à la conduite.

### 4.3 Moto

Entrées :
- `category` : `moped_50 | scooter_125 | motorcycle | maxi_scooter | quad`.
- `engineCc`.
- `vehicleValue`.
- `driverAge`.
- `licenseYears`.
- `annualMileage`.
- `parking`.
- `antiTheftDevice` : `none | approved_lock | alarm_tracker`.
- `crm`.
- `crmApplicable`.
- `technicalInspectionStatus` : `not_required_yet | valid | overdue | unknown`.
- `coverageLevel` : `third_party | theft_fire | all_risk`.
- `equipmentValue`.

Facteurs indicatifs MVP :
- Moto de forte cylindrée : majoration.
- Vol/incendie dépend fortement du stationnement et antivol.
- Équipement du motard : prime optionnelle proportionnelle au capital couvert.
- CT en retard : ne pas calculer une sanction réglementaire d’assurance, mais afficher un warning conformité.

## 5. Paramètres de départ proposés

Ces valeurs sont des hypothèses produit pour lancer un simulateur pédagogique. Elles ne sont pas des barèmes officiels.

```json
{
  "insurance": {
    "verified": false,
    "currency": "EUR",
    "home": {
      "base_annual": {
        "tenant_legal_minimum": 85,
        "standard_mrh": 145,
        "premium_mrh": 240
      },
      "base_rate_per_sqm": 1.35,
      "house_factor": 1.18,
      "co_owner_rc_minimum": 45,
      "contents_rate": 0.0025,
      "valuable_items_rate": 0.006
    },
    "vehicle": {
      "auto_base_annual": {
        "third_party": 260,
        "third_party_plus": 420,
        "all_risk": 680
      },
      "moto_base_annual": {
        "third_party": 180,
        "theft_fire": 330,
        "all_risk": 560
      },
      "crm_min": 0.5,
      "crm_max": 3.5,
      "crm_no_claim_factor": 0.95,
      "crm_responsible_claim_factor": 1.25,
      "crm_partial_claim_factor": 1.125
    },
    "deductible_discount": {
      "low": 0,
      "medium": 0.05,
      "high": 0.1
    }
  }
}
```

## 6. Algorithmes

### 6.1 Mise à jour du bonus-malus

```text
if crmApplicable == false:
  return currentCrm

nextCrm = currentCrm

for each claim in policyYear:
  if claim.responsibility == "full":
    nextCrm = nextCrm × 1.25
  if claim.responsibility == "partial":
    nextCrm = nextCrm × 1.125

if no responsible or partial claim:
  nextCrm = nextCrm × 0.95

return clamp(round(nextCrm, 3), 0.50, 3.50)
```

### 6.2 Prime habitation

```text
base = baseAnnualByCoverage[coverageLevel]

if occupantStatus == "co_owner" and coverageLevel == "legal_minimum":
  base = coOwnerRcMinimum

surfacePart = surfaceSqm × baseRatePerSqm
contentsPart = contentsValue × contentsRate
valuablePart = valuableItemsValue × valuableItemsRate

annual = (base + surfacePart + contentsPart + valuablePart)
annual = annual × housingTypeFactor × zoneFactor
annual = annual × (1 - deductibleDiscount[deductibleLevel])
```

### 6.3 Prime auto

```text
base = autoBaseAnnual[coverageLevel]
assetFactor = 1 + min(vehicleValue / 50000, 1.5) × 0.25
driverFactor = youngDriverFactor × licenseFactor
usageFactor = mileageFactor × usageTypeFactor × parkingFactor
claimsFactor = 1 + claimsLast36Months × 0.12

annual = base × assetFactor × driverFactor × usageFactor × claimsFactor × clamp(crm, 0.5, 3.5)
annual = annual × (1 - deductibleDiscount[deductibleLevel])
```

### 6.4 Prime moto

```text
base = motoBaseAnnual[coverageLevel]
engineFactor = factorFromCategoryAndCc(category, engineCc)
theftFactor = parkingFactor × antiTheftFactor
equipmentPart = equipmentValue × equipmentCoverageRate
crmFactor = crmApplicable ? clamp(crm, 0.5, 3.5) : 1

annual = (base × engineFactor × theftFactor × crmFactor) + equipmentPart
annual = annual × (1 - deductibleDiscount[deductibleLevel])
```

## 7. DTOs proposés

### `InsuranceRequestDto`

```csharp
public class InsuranceRequestDto
{
    public string Product { get; set; } = "home"; // home|auto|moto
    public string CoverageLevel { get; set; } = "standard";
    public string DeductibleLevel { get; set; } = "medium";
    public string PostalCode { get; set; } = "";
    public decimal ZoneFactor { get; set; } = 1m;

    public HomeInsuranceInput? Home { get; set; }
    public VehicleInsuranceInput? Vehicle { get; set; }
}
```

### `InsuranceResponseDto`

```csharp
public class InsuranceResponseDto
{
    public decimal AnnualPremium { get; set; }
    public decimal MonthlyPremium { get; set; }
    public decimal LegalMinimumAnnualPremium { get; set; }
    public decimal CoverageAddonsAnnualPremium { get; set; }
    public decimal RiskAdjustmentAmount { get; set; }
    public decimal DeductibleDiscountAmount { get; set; }
    public decimal CrmUsed { get; set; }
    public bool IsMandatoryInsurance { get; set; }
    public string MandatoryCoverageLabel { get; set; } = "";
    public List<string> Warnings { get; set; } = new();
    public List<string> Assumptions { get; set; } = new();
}
```

## 8. UX proposée

Onglets :
- `Habitation`
- `Auto`
- `Moto`

Résultat principal :
- Prime mensuelle estimée.
- Prime annuelle estimée.
- Socle obligatoire détecté.
- Garanties incluses / non incluses.
- Franchise choisie.
- Warnings réglementaires : locataire sans risques locatifs, copropriété sans RC, véhicule sans RC, moto CT en retard.

Messages de prudence :
- “Cette simulation n’est pas un devis d’assurance.”
- “Les tarifs réels dépendent de l’assureur, de l’adresse exacte, des antécédents et des conditions contractuelles.”
- “La responsabilité civile est obligatoire pour les véhicules terrestres à moteur.”

## 9. Tests unitaires suggérés

- Habitation locataire `legal_minimum` : `IsMandatoryInsurance = true`, label risques locatifs.
- Habitation propriétaire maison individuelle : pas d’obligation générale, mais recommandation RC.
- Habitation copropriétaire : RC obligatoire.
- Auto tiers : RC obligatoire et prime mensuelle = annuel / 12.
- Auto CRM : `1.00` sans sinistre devient `0.95`; accident responsable devient `1.25`; accident partiel devient `1.125`; bornes `0.50` / `3.50`.
- Moto `moped_50` : RC obligatoire, `crmApplicable` peut être faux selon catégorie.
- Moto CT `overdue` : warning conformité, pas de calcul de pénalité automatique.
- Montants arrondis à 2 décimales, coefficients à 3 décimales.

## 10. Limites MVP

- Pas de devis réel ni d’appel assureur.
- Pas de scoring précis par adresse fine, sinistralité locale, marque/modèle exact ou base SRA.
- Pas de calcul légal détaillé des taxes d’assurance.
- Pas de gestion des exclusions contractuelles au cas par cas.
- Les valeurs de paramètres doivent rester `verified=false` tant qu’elles ne proviennent pas d’un barème contractuel ou d’une source officielle adaptée.
