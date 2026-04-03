import React from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import { PATH_GUIDES } from '../seo/guidePaths'

const payrollLink = (children, lang) => (
  <Link to={PATH.payroll} className="guide-inline-link">
    {children || (lang === 'en' ? 'payroll simulator' : 'simulateur de paie')}
  </Link>
)

/** IDs des articles (hors hub index). */
export const GUIDE_ARTICLE_IDS = ['salarieFreelanceNet2026', 'portageVsMicro2026']

export const GUIDE_PAGES = {
  index: {
    path: PATH_GUIDES.index,
    fr: {
      metaTitle: 'Guides paie & statuts | MegaSimulator',
      description:
        'Articles pratiques : passage salarié / freelance, portage salarial vs micro-entrepreneur, avec liens vers nos simulateurs.',
      keywords: 'guide salaire, freelance, portage salarial, micro-entrepreneur, brut net',
      topbarTitle: 'Guides',
      headline: 'Guides pratiques',
      lead:
        'Chaque guide relie une problématique métier à un outil : comparez des situations concrètes puis testez les chiffres dans le simulateur.',
    },
    en: {
      metaTitle: 'Payroll & business structure guides | MegaSimulator',
      description:
        'Practical articles on employee vs freelance, umbrella company vs micro-entrepreneur, with links to our calculators.',
      keywords: 'payroll guide, freelance, umbrella company, micro-entrepreneur, gross net',
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
}
