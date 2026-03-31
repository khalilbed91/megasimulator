import React from 'react'
import { Link } from 'react-router-dom'
import { PATH } from '../seo/paths'
import './legal.css'

const PUBLISHER =
  (typeof import.meta.env.VITE_LEGAL_PUBLISHER_NAME === 'string' && import.meta.env.VITE_LEGAL_PUBLISHER_NAME.trim()) || null

const UPDATED = '2026-04-02'

function MentionsFr() {
  return (
    <article className="legal-doc">
      <h1>Mentions légales</h1>
      <p className="legal-updated">Dernière mise à jour : {UPDATED}</p>

      <div className="legal-note">
        Document d’information générale (France). Les simulateurs sont des <strong>outils pédagogiques</strong>, pas des conseils
        juridiques, fiscaux ou sociaux. Pour toute situation réelle, rapprochez-vous d’un professionnel habilité.
      </div>

      <h2>1. Éditeur du site</h2>
      {PUBLISHER ? (
        <p>
          <strong>{PUBLISHER}</strong>
          <br />
          Site : megasimulateur.org
          <br />
          Pour nous contacter : <Link to={PATH.contact}>page Contact</Link>.
        </p>
      ) : (
        <p>
          Site <strong>megasimulateur.org</strong>. Pour nous contacter : <Link to={PATH.contact}>page Contact</Link>.
        </p>
      )}

      <h2>2. Hébergement</h2>
      <p>
        Les données du site sont hébergées par <strong>Hetzner Online GmbH</strong>, Industriestr. 25, 91710 Gunzenhausen,
        Allemagne —{' '}
        <a href="https://www.hetzner.com" target="_blank" rel="noopener noreferrer">
          www.hetzner.com
        </a>
        .
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Les éléments du site (textes, interface, code, marques affichées) sont protégés. Toute reproduction non autorisée est
        interdite sauf exceptions légales.
      </p>

      <h2>4. Limitation de responsabilité</h2>
      <p>
        Les résultats des simulations sont indicatifs et peuvent différer de votre situation réelle (convention collective,
        accords, paramètres entreprise, règles fiscales, etc.). L’éditeur ne saurait être tenu responsable d’une décision
        prise uniquement sur la base du site.
      </p>

      <p>
        <Link to={PATH.privacy}>Politique de confidentialité</Link>
      </p>
    </article>
  )
}

function MentionsEn() {
  return (
    <article className="legal-doc">
      <h1>Legal notices</h1>
      <p className="legal-updated">Last updated: {UPDATED}</p>

      <div className="legal-note">
        General information (French site). Simulators are <strong>educational tools</strong>, not legal, tax, or labour advice.
        For real decisions, consult a qualified professional.
      </div>

      <h2>1. Publisher</h2>
      {PUBLISHER ? (
        <p>
          <strong>{PUBLISHER}</strong>
          <br />
          Website: megasimulateur.org
          <br />
          To contact us: <Link to={PATH.contact}>Contact page</Link>.
        </p>
      ) : (
        <p>
          Website <strong>megasimulateur.org</strong>. To contact us: <Link to={PATH.contact}>Contact page</Link>.
        </p>
      )}

      <h2>2. Hosting</h2>
      <p>
        Hosting: <strong>Hetzner Online GmbH</strong>, Industriestr. 25, 91710 Gunzenhausen, Germany —{' '}
        <a href="https://www.hetzner.com" target="_blank" rel="noopener noreferrer">
          www.hetzner.com
        </a>
        .
      </p>

      <h2>3. Intellectual property</h2>
      <p>Content and software are protected. Unauthorized copying is prohibited except as allowed by law.</p>

      <h2>4. Disclaimer</h2>
      <p>
        Results are illustrative only. The publisher is not liable for actions taken solely on the basis of this website.
      </p>

      <p>
        <Link to={PATH.privacy}>Privacy policy</Link>
      </p>
    </article>
  )
}

function PrivacyFr() {
  return (
    <article className="legal-doc">
      <h1>Politique de confidentialité</h1>
      <p className="legal-updated">Dernière mise à jour : {UPDATED}</p>

      <div className="legal-note">
        Cette politique décrit le traitement des données à caractère personnel dans le cadre du règlement (UE) 2016/679 (RGPD)
        et de la loi « Informatique et Libertés ». Elle vise à être claire et proportionnée au service proposé.
      </div>

      <h2>1. Responsable du traitement</h2>
      <p>
        {PUBLISHER ? (
          <>
            <strong>{PUBLISHER}</strong>, exploitant megasimulateur.org. Pour toute question relative aux données personnelles,
            contactez-nous <strong>uniquement</strong> via la <Link to={PATH.contact}>page Contact</Link> du site (aucun e-mail
            public pour ces demandes).
          </>
        ) : (
          <>
            Exploitant du site <strong>megasimulateur.org</strong>. Pour toute question relative aux données personnelles,
            contactez-nous <strong>uniquement</strong> via la <Link to={PATH.contact}>page Contact</Link> du site (aucun e-mail
            public pour ces demandes).
          </>
        )}
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>
          <strong>Compte utilisateur</strong> (si inscription) : identifiant, email, nom le cas échéant, mot de passe chiffré
          côté serveur.
        </li>
        <li>
          <strong>Connexion Google</strong> (si utilisée) : identifiants et informations de profil transmis par Google selon
          leurs modalités.
        </li>
        <li>
          <strong>Simulations enregistrées</strong> : paramètres et résultats que vous sauvegardez en étant connecté (voir
          limite de conservation en nombre ci-dessous).
        </li>
        <li>
          <strong>Formulaire de contact</strong> : nom, email, message.
        </li>
        <li>
          <strong>Données techniques</strong> : journaux serveur (logs) limités (ex. adresse IP, horodatage) pour sécurité et
          maintenance.
        </li>
        <li>
          <strong>Stockage local navigateur</strong> (localStorage) : préférences (thème, langue) et jeton de session si vous
          vous connectez.
        </li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>
          Fournir le service et les comptes utilisateurs — <strong>exécution du contrat</strong> / mesures précontractuelles.
        </li>
        <li>
          Répondre aux messages — <strong>intérêt légitime</strong> ou exécution de mesures à votre demande.
        </li>
        <li>
          Sécurité, prévention des abus — <strong>intérêt légitime</strong>.
        </li>
        <li>
          Connexion Google — <strong>votre consentement</strong> lorsque vous choisissez ce mode de connexion.
        </li>
      </ul>

      <h2>4. Durées de conservation</h2>
      <p>
        <strong>Historique des simulations</strong> : au plus <strong>10</strong> entrées récentes par compte ; les entrées
        plus anciennes sont supprimées automatiquement lorsque cette limite est dépassée.
        <br />
        Données de compte : conservées tant que le compte est actif, puis supprimées ou anonymisées dans des délais raisonnables
        après suppression du compte ou après une longue période d’inactivité (sauf obligations légales de conservation).
        <br />
        Logs : durée courte, compatible avec la sécurité.
        <br />
        Messages contact : durée limitée nécessaire au traitement.
      </p>

      <h2>5. Destinataires</h2>
      <p>
        Données hébergées sur les serveurs de notre hébergeur (Hetzner). Lorsque vous utilisez Google, certaines informations
        sont traitées par Google LLC selon leur politique et, le cas échéant, des garanties appropriées (clauses types de la
        Commission européenne, etc.).
      </p>

      <h2>6. Cookies et traceurs</h2>
      <p>
        Nous privilégions les cookies / stockages <strong>nécessaires</strong> au fonctionnement (session, préférences). La
        connexion via Google peut imposer des cookies techniques liés à leur service. Nous n’utilisons pas, dans la version
        actuelle du site, de cookies publicitaires ou de mesure d’audience « non essentiels » ; toute évolution sera reflétée
        ici et, si la loi l’exige, par un choix explicite.
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, la portabilité lorsque applicable, et vous
        opposer à certains traitements. Pour exercer ces droits, utilisez <strong>uniquement</strong> la{' '}
        <Link to={PATH.contact}>page Contact</Link> (aucun e-mail public dédié).
        <br />
        Vous pouvez introduire une réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        ).
      </p>

      <h2>8. Transferts hors UE</h2>
      <p>
        Des transferts peuvent intervenir dans le cadre de services tiers (ex. Google) ; nous visons à nous appuyer sur des
        mécanismes reconnus par le RGPD lorsque ces transferts concernent les États-Unis ou d’autres pays tiers.
      </p>

      <p>
        <Link to={PATH.legalMentions}>Mentions légales</Link>
      </p>
    </article>
  )
}

function PrivacyEn() {
  return (
    <article className="legal-doc">
      <h1>Privacy policy</h1>
      <p className="legal-updated">Last updated: {UPDATED}</p>

      <div className="legal-note">
        This policy describes how we process personal data under the GDPR and French law. It is meant to be clear and
        proportionate.
      </div>

      <h2>1. Data controller</h2>
      <p>
        Operator of <strong>megasimulateur.org</strong>
        {PUBLISHER ? (
          <>
            : <strong>{PUBLISHER}</strong>
          </>
        ) : null}
        . For any question about personal data, contact us <strong>only</strong> through the site’s{' '}
        <Link to={PATH.contact}>Contact page</Link> (no public email for this purpose).
      </p>

      <h2>2. Data we process</h2>
      <ul>
        <li>Account data (email, name, salted/hashed password on the server).</li>
        <li>Google sign-in data when you choose Google.</li>
        <li>Saved simulations when logged in (retention limit applies — see below).</li>
        <li>Contact form submissions.</li>
        <li>Limited server logs for security.</li>
        <li>Browser local storage for preferences and session token.</li>
      </ul>

      <h2>3. Purposes and legal bases</h2>
      <ul>
        <li>Provide the service — contract / pre-contract measures.</li>
        <li>Reply to messages — legitimate interest or pre-contract.</li>
        <li>Security — legitimate interest.</li>
        <li>Google login — your consent when you use it.</li>
      </ul>

      <h2>4. Retention</h2>
      <p>
        <strong>Simulation history</strong>: at most <strong>10</strong> recent entries per account; older entries are
        deleted automatically when this limit is exceeded.
        <br />
        Account data: kept while the account is active, then deleted or anonymized within reasonable delays after account
        deletion or long inactivity, unless the law requires longer storage.
      </p>

      <h2>5. Recipients</h2>
      <p>
        Hosting provider (Hetzner). Google when you use Google sign-in. Appropriate safeguards may apply for international
        transfers.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use necessary cookies / storage only for core functionality. Google may set session-related cookies when you use
        their button. We do not use advertising or non-essential analytics cookies in the current version.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Access, rectification, erasure, restriction, portability where applicable, and objection in some cases. To exercise
        these rights, use <strong>only</strong> the <Link to={PATH.contact}>Contact page</Link> (no public email for this
        purpose). You may lodge a complaint with your supervisory authority.
      </p>

      <p>
        <Link to={PATH.legalMentions}>Legal notices</Link>
      </p>
    </article>
  )
}

export default function LegalPageView({ page, lang }) {
  const L = lang === 'en' ? 'en' : 'fr'
  if (page === 'mentions') return L === 'en' ? <MentionsEn /> : <MentionsFr />
  return L === 'en' ? <PrivacyEn /> : <PrivacyFr />
}
