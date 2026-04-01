---
name: web-search-ask-first
description: >-
  Before using web search or URL fetch for up-to-date information, ask the user
  for permission. Apply on MegaSimulator and whenever external web research is
  considered (regulation, package advisories, API docs, etc.).
---

# Web search — ask first

## Rule

You **may** use internet search (`web_search`) or fetch public URLs (`web_fetch`) when fresh or external facts would materially improve the answer.

**Before** doing so:

1. **Ask the user** in one short sentence whether they agree (e.g. “May I search the web for the latest X?” / « Puis-je chercher sur le web pour … ? »).
2. If they **decline** or **do not answer**, rely on the repo, project docs, and built-in knowledge only.
3. If they **approve**, run the search/fetch and cite sources with full URLs when sharing results.

## When this applies

- French regulatory or fiscal updates not in `docs/knowledge-base/`.
- Security advisories, CVEs, or package version guidance.
- Third-party API or framework behavior that may have changed after training data.

## When you can skip asking

- The user **already** asked you to search or to “look it up online”.
- The task **explicitly** requires current web data and the user confirmed that scope.

## Alignment

Même règle que **§ 4.4** (agent / recherche web) dans `docs/general-guidelines.md` — à lire avec **§ 4.4** entier (skills `megasimulator-dev-stack`, périmètre commits, builds).
