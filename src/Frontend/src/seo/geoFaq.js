export const GEO_FAQ = {
  fr: {
    payroll: [
      {
        question: 'Comment calculer un salaire net à partir du brut en France ?',
        answer:
          'On part du salaire brut, on retire les cotisations salariales, puis on applique éventuellement la retenue à la source. MegaSimulator affiche aussi le coût employeur et les cotisations pour donner un ordre de grandeur pédagogique.',
      },
      {
        question: 'La retenue à la source est-elle automatique dans le simulateur ?',
        answer:
          'Oui. Le taux par défaut réagit au brut annuel saisi, puis l’utilisateur peut le modifier directement en pourcentage. Le produit ne demande plus de parts fiscales, situation familiale ou enfants.',
      },
      {
        question: 'Le résultat est-il un bulletin de paie officiel ?',
        answer:
          'Non. Le calcul est une estimation pédagogique basée sur des hypothèses documentées. Une fiche de paie réelle dépend de la convention collective, des exonérations, avantages et paramètres employeur.',
      },
    ],
    retirement: [
      {
        question: 'Que calcule le simulateur retraite ?',
        answer:
          'Il estime une pension nette mensuelle à partir de l’année de naissance, de l’âge de départ, des trimestres, du salaire annuel moyen et des points complémentaires.',
      },
      {
        question: 'Pourquoi les trimestres changent-ils le résultat ?',
        answer:
          'Les trimestres servent à approcher le taux plein. Un manque de trimestres peut réduire la pension par décote, tandis qu’un départ plus tardif peut créer une surcote.',
      },
      {
        question: 'Cette projection remplace-t-elle un relevé officiel ?',
        answer:
          'Non. Elle aide à comparer des scénarios. Pour une décision de départ, il faut vérifier avec les services officiels et les caisses de retraite.',
      },
    ],
    loans: [
      {
        question: 'Comment est calculée une mensualité de prêt ?',
        answer:
          'Le simulateur combine capital emprunté, durée, taux nominal, assurance et frais indicatifs. Pour l’immobilier, il ajoute aussi des repères comme notaire, PTZ, Action Logement et taux d’usure.',
      },
      {
        question: 'Le ratio HCSF est-il vérifié ?',
        answer:
          'Oui, l’outil affiche un indicateur pédagogique d’endettement autour de la règle des 35 %, mais une banque peut appliquer sa propre analyse du dossier.',
      },
      {
        question: 'Le TAEG affiché est-il contractuel ?',
        answer:
          'Non. Le TAEG est indicatif et simplifié. Une offre bancaire réelle peut inclure des frais, garanties et assurances calculés différemment.',
      },
    ],
    savings: [
      {
        question: 'Comment calculer l’effort mensuel pour atteindre un objectif d’épargne ?',
        answer:
          'Le simulateur part du montant cible, de l’horizon, de l’épargne actuelle et d’hypothèses de rendement ou d’inflation pour estimer un versement mensuel nécessaire.',
      },
      {
        question: 'Les leviers budgétaires sont-ils personnalisés ?',
        answer:
          'Ils sont indicatifs. Ils servent à visualiser des ordres de grandeur et ne remplacent pas une analyse complète des dépenses du foyer.',
      },
      {
        question: 'Le rendement est-il garanti ?',
        answer:
          'Non. Les rendements et l’inflation sont des hypothèses pédagogiques. Le résultat n’est pas une promesse de performance.',
      },
    ],
    insurance: [
      {
        question: 'Quelle assurance est obligatoire en France ?',
        answer:
          'Pour un véhicule terrestre à moteur, la responsabilité civile est obligatoire. Pour l’habitation, le locataire doit couvrir au minimum les risques locatifs ; un copropriétaire doit au moins être couvert en responsabilité civile.',
      },
      {
        question: 'Comment fonctionne l’autocomplete code postal ?',
        answer:
          'L’habitation utilise un référentiel France basé sur la base officielle La Poste. Le code postal ou la ville permet de choisir une commune, par exemple 92400 - Courbevoie ou 95130 - Le Plessis Bouchard.',
      },
      {
        question: 'La prime d’assurance est-elle un devis ?',
        answer:
          'Non. La prime est indicative et non contractuelle. Elle sert à comprendre l’effet de la formule, de la franchise, du véhicule, de la zone et du bonus-malus.',
      },
    ],
  },
  en: {
    payroll: [
      {
        question: 'How do you estimate net salary from gross pay in France?',
        answer:
          'Start from gross pay, subtract employee social contributions, then optionally apply withholding tax. MegaSimulator also shows employer cost and contributions as an educational estimate.',
      },
      {
        question: 'Is withholding tax automatic?',
        answer:
          'Yes. The default percentage reacts to annual gross pay and can still be edited directly. The product no longer asks for household parts or family status.',
      },
      {
        question: 'Is this an official payslip?',
        answer:
          'No. It is an educational estimate. Real payslips depend on collective agreements, employer settings, benefits and exemptions.',
      },
    ],
    retirement: [
      {
        question: 'What does the retirement simulator estimate?',
        answer:
          'It estimates monthly net pension from birth year, retirement age, validated quarters, average annual salary and complementary pension points.',
      },
      {
        question: 'Why do quarters matter?',
        answer:
          'Quarters help determine full-rate entitlement. Missing quarters may reduce the pension; leaving later can increase it through a premium.',
      },
      {
        question: 'Does this replace an official pension statement?',
        answer:
          'No. It compares scenarios. Official services and pension funds remain necessary before a binding decision.',
      },
    ],
    loans: [
      {
        question: 'How is a loan payment calculated?',
        answer:
          'The simulator combines principal, term, nominal rate, insurance and indicative fees. For mortgages, it also shows notary, PTZ, Action Logement and usury-rate hints.',
      },
      {
        question: 'Is the debt ratio checked?',
        answer:
          'Yes, it gives an educational 35% debt-ratio indicator, while banks may apply their own underwriting rules.',
      },
      {
        question: 'Is the displayed APR contractual?',
        answer:
          'No. It is simplified and indicative. Real offers may calculate fees, insurance and guarantees differently.',
      },
    ],
    savings: [
      {
        question: 'How is the monthly savings effort estimated?',
        answer:
          'The simulator uses target amount, horizon, current savings and yield or inflation assumptions to estimate the required monthly contribution.',
      },
      {
        question: 'Are budget levers personalized?',
        answer:
          'They are indicative and meant to show orders of magnitude, not replace a full household budget review.',
      },
      {
        question: 'Is the yield guaranteed?',
        answer:
          'No. Yield and inflation are assumptions. The result is not a performance promise.',
      },
    ],
    insurance: [
      {
        question: 'Which insurance is mandatory in France?',
        answer:
          'Motor vehicles need third-party liability insurance. Tenants need at least rental-risk cover for housing, and co-owners need civil liability cover.',
      },
      {
        question: 'How does postal-code autocomplete work?',
        answer:
          'Home insurance uses a French postal-code reference based on the official La Poste dataset. Users can search by code or city, such as 92400 - Courbevoie.',
      },
      {
        question: 'Is the insurance premium a quote?',
        answer:
          'No. It is indicative and non-contractual. It explains how coverage, deductible, vehicle, zone and no-claim coefficient affect price.',
      },
    ],
  },
}

export function getGeoFaq(pageKey, lang) {
  const L = lang === 'en' ? 'en' : 'fr'
  return GEO_FAQ[L][pageKey] || []
}
