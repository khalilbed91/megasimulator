import React from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import { PATH_GUIDES } from '../seo/guidePaths'

const payrollLink = (children, lang) => (
  <Link to={PATH.payroll} className="guide-inline-link">
    {children || (lang === 'en' ? 'payroll simulator' : 'simulateur de paie')}
  </Link>
)

const retirementLink = (children, lang) => (
  <Link to={PATH.retirement} className="guide-inline-link">
    {children || (lang === 'en' ? 'retirement simulator' : 'simulateur retraite')}
  </Link>
)

const loanLink = (children, lang) => (
  <Link to={PATH.loans} className="guide-inline-link">
    {children || (lang === 'en' ? 'loan simulator' : 'simulateur de prêts')}
  </Link>
)

/** IDs des articles (hors hub index). */
export const GUIDE_ARTICLE_IDS = [
  'salarieFreelanceNet2026',
  'portageVsMicro2026',
  'projectionRetraite2026',
  'creditImmoDecryptage2026',
]

export const GUIDE_PAGES = {
  index: {
    path: PATH_GUIDES.index,
    fr: {
      metaTitle: 'Guides paie, retraite & crédits | MegaSimulator',
      description:
        'Articles pratiques : salaire / freelance, portage vs micro-entrepreneur, projection retraite, crédit immo (PTZ, mensualités) — liens vers les simulateurs.',
      keywords:
        'guide salaire, retraite, crédit immobilier, PTZ, freelance, portage salarial, micro-entrepreneur, simulateur',
      topbarTitle: 'Guides',
      headline: 'Guides pratiques',
      lead:
        'Chaque guide relie une problématique métier à un outil : comparez des situations concrètes puis testez les chiffres dans le simulateur.',
    },
    en: {
      metaTitle: 'Payroll, retirement & loan guides | MegaSimulator',
      description:
        'Practical articles on payroll vs freelance, umbrella vs micro-entrepreneur, retirement projection, and French mortgage basics — with links to our tools.',
      keywords: 'payroll guide, retirement, mortgage, PTZ, freelance, umbrella company, micro-entrepreneur',
      topbarTitle: 'Guides',
      headline: 'Practical guides',
      lead:
        'Each guide connects a real question to a tool: understand the trade-offs, then run numbers in the simulator.',
    },
  },
  salarieFreelanceNet2026: {
    path: PATH_GUIDES.salarieFreelanceNet2026,
    simulatorPath: PATH.payroll,
    datePublished: '2026-04-03',
    fr: {
      metaTitle: 'Passer de salarié à freelance en 2026 : calcul du net | MegaSimulator',
      description:
        'Cadre du passage salarié → freelance en France : charges, prélèvement à la source, comparer un net « cible » avec le simulateur de paie MegaSimulator.',
      keywords:
        'salarié freelance 2026, brut net freelance, cotisations, prélèvement à la source, simulateur net',
      topbarTitle: 'Salarié → freelance',
      headline: 'Passer de salarié à freelance en 2026 : le guide du calcul net',
      sections: [
        {
          h2: 'Pourquoi le « net » change quand on quitte le salariat',
          body: (
            <>
              <p>
                En salarié, le net perçu résulte du brut, des cotisations salariales, du prélèvement à la source et parfois
                d’avantages (mutuelle, titres-restaurant, etc.). En freelance (ou en société), la chaîne de calcul est
                différente : les cotisations, la base et les options fiscales ne se superposent pas à l’identique.
              </p>
              <p>
                Pour un projet 2026, l’objectif n’est pas un chiffre « officiel » unique mais une{' '}
                <strong>fourchette cohérente</strong> : même niveau de vie cible, hypothèses explicites, même outil pour
                comparer salarié et freelance.
              </p>
              <p className="guide-cta-inline">
                Étape suivante : ouvrez le {payrollLink('simulateur de paie', 'fr')} et reproduisez votre situation
                salariée, puis basculez vers le mode freelance pour une lecture pédagogique du net.
              </p>
            </>
          ),
        },
        {
          h2: 'Comparer une rémunération « équivalente »',
          body: (
            <>
              <p>
                On compare souvent un brut salarial à un TJM ou à un montant facturé. Sans cadre, la comparaison est
                trompeuse. Gardez en tête : charges, délais de paiement, vacances non rémunérées, et besoin de trésorerie.
              </p>
              <p>
                Le {payrollLink(null, 'fr')} MegaSimulator permet de figer des hypothèses (statut, parts, PAS) et de
                relire le net et le coût côté employeur en salarié — utile comme repère avant d’isoler la partie freelance.
              </p>
            </>
          ),
        },
        {
          h2: 'Limites et usage responsable',
          body: (
            <>
              <p>
                Les simulateurs sont pédagogiques : ils ne remplacent ni un conseil juridique, ni un expert-comptable, ni
                une liasse fiscale. Les barèmes et paramètres évoluent ; vérifiez toujours auprès des sources officielles
                pour une décision engageante.
              </p>
            </>
          ),
        },
      ],
    },
    en: {
      metaTitle: 'Employee to freelance in 2026: net pay guide | MegaSimulator',
      description:
        'Framework for France: moving from employment to freelance, contributions and withholding — compare a target net with the payroll simulator.',
      keywords: 'employee to freelance france 2026, net salary, social contributions, withholding tax',
      topbarTitle: 'Employee → freelance',
      headline: 'Employee to freelance in 2026: a practical net pay guide',
      sections: [
        {
          h2: 'Why “take-home” pay changes outside employment',
          body: (
            <>
              <p>
                As an employee, net pay flows from gross, employee contributions, withholding tax and sometimes benefits.
                As a freelancer (or through a company), the calculation chain differs: bases, options and timelines are not
                identical.
              </p>
              <p>
                For 2026 planning, aim for a <strong>consistent range</strong>: same lifestyle target, explicit assumptions,
                and the same calculator to compare scenarios.
              </p>
              <p className="guide-cta-inline">
                Next step: open the {payrollLink('payroll simulator', 'en')} and model your employee situation, then switch
                to the freelance view for an educational net comparison.
              </p>
            </>
          ),
        },
        {
          h2: 'Comparing “equivalent” remuneration',
          body: (
            <>
              <p>
                People often compare a salary gross to a day rate or invoiced amount — easy to misread without a frame.
                Remember unpaid leave, payment delays, and working capital needs.
              </p>
              <p>
                MegaSimulator’s {payrollLink(null, 'en')} fixes assumptions (status, household parts, withholding) and shows
                net and employer cost in employment — a useful anchor before isolating freelance mechanics.
              </p>
            </>
          ),
        },
        {
          h2: 'Limits and responsible use',
          body: (
            <>
              <p>
                Calculators are educational; they are not legal, tax or accounting advice. Rules change — confirm with
                official sources before binding decisions.
              </p>
            </>
          ),
        },
      ],
    },
  },
  portageVsMicro2026: {
    path: PATH_GUIDES.portageVsMicro2026,
    simulatorPath: PATH.payroll,
    datePublished: '2026-04-03',
    fr: {
      metaTitle: 'Portage salarial vs auto-entrepreneur : lequel est plus rentable ? | MegaSimulator',
      description:
        'Comparer portage salarial et micro-entrepreneur : structure, cash-flow, protection sociale — puis chiffrer avec le simulateur paie / freelance.',
      keywords:
        'portage salarial vs auto-entrepreneur, micro-entreprise, rentabilité, cotisations, simulateur',
      topbarTitle: 'Portage vs micro',
      headline: 'Simulateur portage salarial vs auto-entrepreneur : quel est le plus rentable ?',
      sections: [
        {
          h2: 'Deux logiques de revenu, deux « nets »',
          body: (
            <>
              <p>
                Le portage salarial rapproche l’indépendant d’un <strong>statut salarié</strong> (fiche de paie, PAS,
                services du porteur). L’auto-entrepreneur suit la <strong>micro-BIC / micro-BNC</strong> avec versements
                libératoires ou régime classique selon cas — le net disponible et le rythme de trésorerie diffèrent.
              </p>
              <p className="guide-cta-inline">
                Pour chiffrer côte à côte des hypothèses de revenu, utilisez le {payrollLink('simulateur de paie', 'fr')}{' '}
                (modes salarié, freelance et portage salarial) avec les mêmes paramètres de prélèvement et de foyer.
              </p>
            </>
          ),
        },
        {
          h2: '« Rentable » : pour qui, sur quel horizon ?',
          body: (
            <>
              <p>
                La rentabilité dépend du taux de frais réels, du volume facturable, des besoins de protection sociale
                (retraite, arrêt maladie) et du confort administratif. Un statut peut être plus avantageux en cash-flow
                court terme et moins favorable en accumulation de droits — ou l’inverse.
              </p>
              <p>
                Plutôt qu’une réponse unique, construisez <strong>deux scénarios chiffrés</strong> dans le même outil, puis
                confrontez-les à votre situation (frais, épargne, risque client).
              </p>
            </>
          ),
        },
        {
          h2: 'Rappel',
          body: (
            <>
              <p>
                Article et simulateur sont des aides à la décision pédagogiques. Un professionnel (URSSAF, expert-comptable,
                conseil en gestion) reste indispensable pour un choix de structure et une optimisation conforme.
              </p>
            </>
          ),
        },
      ],
    },
    en: {
      metaTitle: 'Umbrella (portage) vs micro-entrepreneur: which pays better? | MegaSimulator',
      description:
        'Compare French umbrella employment and micro-entrepreneur structures — then run numbers with the payroll / freelance simulator.',
      keywords: 'umbrella company france, portage salarial, micro-entrepreneur, profitability calculator',
      topbarTitle: 'Umbrella vs micro',
      headline: 'Umbrella company vs micro-entrepreneur: which is more profitable?',
      sections: [
        {
          h2: 'Two income models, two kinds of “net”',
          body: (
            <>
              <p>
                Umbrella-style portage resembles <strong>employment</strong> (payslip, withholding, umbrella services).
                Micro-entrepreneur uses simplified social contributions — available cash and social coverage differ from
                classic employment.
              </p>
              <p className="guide-cta-inline">
                To compare income assumptions side by side, use the {payrollLink('payroll simulator', 'en')} (employee,
                freelance and umbrella-style paths) with consistent withholding and household settings.
              </p>
            </>
          ),
        },
        {
          h2: '“Profitable” for whom, over which horizon?',
          body: (
            <>
              <p>
                Outcomes hinge on real expense ratios, billable volume, social protection needs and admin burden. One
                route may win on short-term cash yet differ on long-term rights — or the opposite.
              </p>
              <p>
                Build <strong>two quantified scenarios</strong> in the same tool, then sanity-check against your costs,
                savings and client risk.
              </p>
            </>
          ),
        },
        {
          h2: 'Disclaimer',
          body: (
            <>
              <p>
                This article and the simulator are educational. Professionals (URSSAF, accountant, advisor) remain essential
                for structure choice and compliant planning.
              </p>
            </>
          ),
        },
      ],
    },
  },
  projectionRetraite2026: {
    path: PATH_GUIDES.projectionRetraite2026,
    simulatorPath: PATH.retirement,
    datePublished: '2026-04-03',
    fr: {
      metaTitle: 'Projection retraite 2026 : pension nette, trimestres, taux plein | MegaSimulator',
      description:
        'Comprendre la pension nette, les trimestres, décote et surcôte — puis tester des hypothèses avec le simulateur retraite MegaSimulator.',
      keywords:
        'simulation retraite 2026, pension nette, trimestres, taux plein, décote, surcôte, retraite france',
      topbarTitle: 'Retraite',
      headline: 'Projection retraite 2026 : pension nette, trimestres et départ',
      ctaSimulator: 'Lancer le simulateur retraite',
      sections: [
        {
          h2: 'Ce qu’une projection « pédagogique » peut (et ne peut pas) faire',
          body: (
            <>
              <p>
                La retraite en France combine régime de base, complémentaire, trimestres cotisés, âge légal, taux plein,
                décote ou surcôte. Aucun outil en ligne ne remplace un{' '}
                <strong>relevé d’informations retraite</strong> ou un conseiller — mais une projection cohérente aide à
                comparer : partir plus tôt vs plus tard, ou l’impact d’un salaire de référence différent.
              </p>
              <p className="guide-cta-inline">
                Utilisez le {retirementLink('simulateur retraite', 'fr')} pour figer une année de naissance, un nombre de
                trimestres et un salaire annuel moyen : vous obtenez une <strong>estimation indicative</strong> de pension
                nette et des ordres de grandeur sur le taux de remplacement.
              </p>
            </>
          ),
        },
        {
          h2: 'Trimestres et « taux plein » : pourquoi la durée compte',
          body: (
            <>
              <p>
                Les droits dépendent du nombre de trimestres validés et des règles d’âge. Un départ avant le taux plein peut
                déclencher une <strong>décote</strong> ; au-delà de certaines durées, une <strong>surcôte</strong> peut
                augmenter la pension. Les barèmes et paramètres évoluent : l’objectif ici est de visualiser la logique, pas
                de figer un droit définitif.
              </p>
              <p>
                En rejouant deux scénarios dans le même {retirementLink(null, 'fr')}, vous isolez l’effet des trimestres ou de
                l’âge de départ sur une base comparable.
              </p>
            </>
          ),
        },
        {
          h2: 'Limites',
          body: (
            <>
              <p>
                MegaSimulator applique un modèle simplifié (Agirc-Arrco, paramètres documentés en base produit). Pour une
                décision de carrière ou de départ, croisez avec les services officiels et un conseiller retraite.
              </p>
            </>
          ),
        },
      ],
    },
    en: {
      metaTitle: 'Retirement projection 2026: net pension and quarters | MegaSimulator',
      description:
        'How net pension, quarters, discount and premium fit together — then test assumptions with MegaSimulator’s retirement planner.',
      keywords: 'france retirement simulator, net pension, quarters, full rate, pension estimate',
      topbarTitle: 'Retirement',
      headline: 'Retirement projection 2026: net pension, quarters and leaving age',
      ctaSimulator: 'Open retirement simulator',
      sections: [
        {
          h2: 'What an educational projection can (and cannot) do',
          body: (
            <>
              <p>
                French retirement blends base and complementary schemes, validated quarters, legal age, full-rate rules,
                discounts and premiums. No web tool replaces an official statement or advisor — but a consistent model
                helps compare leaving earlier vs later, or different reference income paths.
              </p>
              <p className="guide-cta-inline">
                Use the {retirementLink('retirement simulator', 'en')} with birth year, quarters and average salary: you get
                an <strong>indicative</strong> net pension and replacement-rate hints.
              </p>
            </>
          ),
        },
        {
          h2: 'Quarters and full rate: why duration matters',
          body: (
            <>
              <p>
                Benefits hinge on validated quarters and age rules. Leaving before full rate may apply a <strong>discount</strong>
                ; longer careers may add a <strong>premium</strong>. Parameters change — the goal is to understand mechanics,
                not freeze a legal entitlement.
              </p>
              <p>
                Run two scenarios in the same {retirementLink(null, 'en')} to isolate the effect of quarters or retirement age
                on comparable assumptions.
              </p>
            </>
          ),
        },
        {
          h2: 'Limits',
          body: (
            <>
              <p>
                MegaSimulator uses a simplified documented model. For career or departure decisions, cross-check with
                official channels and a retirement advisor.
              </p>
            </>
          ),
        },
      ],
    },
  },
  creditImmoDecryptage2026: {
    path: PATH_GUIDES.creditImmoDecryptage2026,
    simulatorPath: PATH.loans,
    datePublished: '2026-04-03',
    fr: {
      metaTitle: 'Crédit immobilier 2026 : PTZ, mensualité, taux et coût total | MegaSimulator',
      description:
        'Lire un projet immo : notaire, PTZ, Action Logement, mensualité et endettement — puis chiffrer avec le simulateur prêt MegaSimulator.',
      keywords:
        'crédit immobilier 2026, simulation prêt immo, PTZ, mensualité, taux, HCSF, prêt à taux zéro',
      topbarTitle: 'Crédit immo',
      headline: 'Crédit immobilier 2026 : PTZ, taux, mensualité et ce qu’il faut surveiller',
      ctaSimulator: 'Lancer le simulateur de prêts',
      sections: [
        {
          h2: 'Du prix du bien à la mensualité « réelle »',
          body: (
            <>
              <p>
                Le montant emprunté par la banque intègre souvent le <strong>projet total</strong> (prix, frais de notaire
                selon ancien / neuf), moins l’apport, et parfois moins des aides (PTZ, prêt Action Logement). La mensualité
                regroupe capital + intérêts au taux nominal, assurance emprunteur, puis les phases PTZ ou complémentaires
                selon vos options.
              </p>
              <p className="guide-cta-inline">
                Le {loanLink('simulateur de prêts', 'fr')} relie ces briques : renseignez prix, régime TVA / notaire, apport,
                taux, durée, PTZ ou Action Logement, et option <strong>booster 0 %</strong> sur une tranche — pour un ordre
                de grandeur pédagogique.
              </p>
            </>
          ),
        },
        {
          h2: 'PTZ, taux d’usure et HCSF : trois garde-fous différents',
          body: (
            <>
              <p>
                Le <strong>PTZ</strong> dépend de zones et plafonds de ressources (modèle indicatif dans l’outil). Le{' '}
                <strong>taux d’usure</strong> plafonne le coût du crédit ; le ratio <strong>HCSF</strong> compare vos
                mensualités (et autres crédits) à vos revenus. Ce ne sont pas trois fois le même critère : les vérifier
                ensemble évite les surprises.
              </p>
              <p>
                Après lecture de ce guide, passez au {loanLink(null, 'fr')} avec vos chiffres réels ou hypothétiques pour
                voir alertes et mensualité totale en régime établi.
              </p>
            </>
          ),
        },
        {
          h2: 'Prêt conso / auto',
          body: (
            <>
              <p>
                Le même {loanLink('simulateur', 'fr')} couvre aussi les prêts personnels et auto : capital direct, durée,
                assurance et contrôle d’usure sur les montants &gt; 6 000 € — utile pour budgétiser hors immobilier.
              </p>
            </>
          ),
        },
        {
          h2: 'Rappel',
          body: (
            <>
              <p>
                Offres bancaires, assurances et frais réels varient. Utilisez l’outil pour structurer la discussion avec
                votre banque ou votre courtier, pas comme promesse de financement.
              </p>
            </>
          ),
        },
      ],
    },
    en: {
      metaTitle: 'French mortgage 2026: PTZ, rate, monthly payment & checks | MegaSimulator',
      description:
        'From purchase price to bank principal: notary, PTZ, Action Logement, debt ratio — then model it in MegaSimulator’s loan tool.',
      keywords: 'france mortgage simulator, PTZ, monthly payment, usury rate, HCSF, property loan',
      topbarTitle: 'Mortgage',
      headline: 'French mortgage 2026: PTZ, rates, payments and what to watch',
      ctaSimulator: 'Open loan simulator',
      sections: [
        {
          h2: 'From property price to the “real” monthly payment',
          body: (
            <>
              <p>
                Bank principal usually reflects the <strong>total project</strong> (price, notary fees for resale vs new),
                minus down payment and sometimes aids (PTZ, Action Logement). The monthly bill bundles principal and interest
                at the nominal rate, borrower insurance, then any PTZ amortisation phase or complementary loans you enable.
              </p>
              <p className="guide-cta-inline">
                The {loanLink('loan simulator', 'en')} wires these pieces together: price, VAT regime / notary, down payment,
                rate, term, PTZ or Action Logement, and an optional <strong>0% booster</strong> tranche — for an educational
                order of magnitude.
              </p>
            </>
          ),
        },
        {
          h2: 'PTZ, usury cap and HCSF: three different guardrails',
          body: (
            <>
              <p>
                <strong>PTZ</strong> depends on zones and income caps (indicative checks in the tool). The <strong>usury</strong>{' '}
                rate caps borrowing cost; <strong>HCSF-style debt ratio</strong> compares instalments (plus other loans) to
                income. They are not the same test — reviewing all three reduces surprises.
              </p>
              <p>
                After this guide, open the {loanLink(null, 'en')} with your numbers to see warnings and steady-state total
                monthly payment.
              </p>
            </>
          ),
        },
        {
          h2: 'Car and personal loans',
          body: (
            <>
              <p>
                The same {loanLink('simulator', 'en')} also covers car and personal loans: direct principal, term, insurance
                and usury checks for amounts over €6,000 — useful beyond real estate.
              </p>
            </>
          ),
        },
        {
          h2: 'Disclaimer',
          body: (
            <>
              <p>
                Real bank offers, insurance and fees differ. Use the tool to frame conversations with your bank or broker,
                not as a funding promise.
              </p>
            </>
          ),
        },
      ],
    },
  },
}
