# THIQTI - Index du Data Room

**Ref**: VV-SLP-2026-001
**Date**: 2026-07-17
**Classification**: Confidentiel

---

## Structure du Data Room

### 1. Documents juridiques et administratifs

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 1.1 | Convention de stage tripartite | `administratif/convention-stage.pdf` | A signer |
| 1.2 | Accord de confidentialite | `administratif/nda.pdf` | A signer |
| 1.3 | Acte de cession PI | `administratif/cession-pi.pdf` | A signer |
| 1.4 | Cahier des charges | `VV-SLP-2026-001 Projet SLEIPNIR Cahier des charges (1).pdf` | Valide |

### 2. Pitch Deck et dossier startup

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 2.1 | Pitch deck (12 slides) | `docs/m3-startup/pitch-deck.md` | Pret |
| 2.2 | Executive summary | `docs/m3-startup/executive-summary.md` | Pret |
| 2.3 | Etude de marche | `docs/m3-startup/etude-marche.md` | Pret |
| 2.4 | Analyse concurrentielle | `docs/m3-startup/competitive-analysis.md` | Pret |
| 2.5 | Modele financier 3 ans | `docs/m3-startup/financial-model.md` | Pret |
| 2.6 | Go-to-market 1000 users | `docs/m3-startup/go-to-market.md` | Pret |
| 2.7 | Note Bank Al-Maghrib | `docs/m3-startup/bank-al-maghrib.md` | Pret |
| 2.8 | Note juridique | `docs/m3-startup/juridique.md` | Pret |
| 2.9 | Dossier startup complet | `docs/m3-startup/dossier-startup.md` | Pret |

### 3. Architecture technique

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 3.1 | C4 Modeles (3 niveaux) | `docs/architecture/c4-models.md` | Pret |
| 3.2 | OpenAPI 3.1 | `docs/openapi.json` | Pret |
| 3.3 | Modele de cout | `docs/architecture/cost-model.md` | Pret |
| 3.4 | Securite STRIDE + OWASP | `docs/architecture/security.md` | Pret |
| 3.5 | Registre traitements loi 09-08 | `docs/architecture/data-register.md` | Pret |
| 3.6 | Cartographie sources | `docs/architecture/data-sources.md` | Pret |
| 3.7 | Benchmarks | `docs/architecture/benchmark.md` | Pret |
| 3.8 | Tests | `docs/architecture/testing.md` | Pret |
| 3.9 | Deploiement | `docs/architecture/deployment.md` | Pret |

### 4. ADR (Architecture Decision Records)

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 4.1 | ADR-001: Stack Technique | `docs/ADRs/ADR-001-Stack-Technique.md` | Accepte |
| 4.2 | ADR-002: Architecture Donnees | `docs/ADRs/ADR-002-Architecture-Donnees.md` | Accepte |
| 4.3 | ADR-003: Moteur NLP | `docs/ADRs/ADR-003-Moteur-NLP.md` | Accepte |
| 4.4 | ADR-004: Moteur Matching | `docs/ADRs/ADR-004-Moteur-Matching.md` | Accepte |
| 4.5 | ADR-005: Sources Donnees | `docs/ADRs/ADR-005-Sources-Donnees.md` | Accepte |
| 4.6 | ADR-006: Barometre Reputation | `docs/ADRs/ADR-006-Barometre-Reputation.md` | Accepte |
| 4.7 | ADR-007: Securite | `docs/ADRs/ADR-007-Securite.md` | Accepte |
| 4.8 | ADR-008: Deploiement | `docs/ADRs/ADR-008-Deploiement.md` | Accepte |
| 4.9 | ADR-009: Observabilite | `docs/ADRs/ADR-009-Observabilite.md` | Accepte |
| 4.10 | ADR-010: CICD | `docs/ADRs/ADR-010-CICD.md` | Accepte |
| 4.11 | ADR-011: Conventions Code | `docs/ADRs/ADR-011-Conventions-Code.md` | Accepte |

### 5. Marque et interface

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 5.1 | Charte de marque | `docs/m1-brand/charte-de-marque.md` | Pret |
| 5.2 | WCAG ratios contraste | `docs/m1-brand/wcag-ratios.md` | Pret |
| 5.3 | Navigation clavier | `docs/m1-brand/navigation-clavier.md` | Pret |

### 6. Code source

| # | Element | Chemin | Statut |
|---|---------|--------|--------|
| 6.1 | Application web | `apps/web/` | Developpe |
| 6.2 | API NestJS | `apps/api/` | Phase 2 |
| 6.3 | Service AI | `apps/ai/` | Phase 2 |
| 6.4 | Package database | `packages/database/` | Schema pret |

### 7. Documentation operationnelle

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 7.1 | README | `README.md` | Pret |
| 7.2 | RUNBOOK | `RUNBOOK.md` | Pret |
| 7.3 | CHANGELOG | `CHANGELOG.md` | Pret |
| 7.4 | Journal de bord | `docs/journal-de-bord/` | En cours |

### 8. Rapport universitaire

| # | Document | Chemin | Statut |
|---|----------|--------|--------|
| 8.1 | Plan detaille | `docs/universitaire/plan-rapport.md` | Pret |
| 8.2 | Etat de l'art | `docs/universitaire/etat-art.md` | En cours |
| 8.3 | Problematique scientifique | `docs/universitaire/problematique.md` | Pret |
| 8.4 | Bibliographie | `docs/universitaire/bibliographie.md` | Pret |
| 8.5 | Ethique et limites | `docs/universitaire/ethique-limites.md` | Pret |

### 9. Scripts et outils

| # | Element | Chemin | Statut |
|---|---------|--------|--------|
| 9.1 | Tests unitaires | `apps/web/src/lib/*.test.ts` | Ecris |
| 9.2 | Tests e2e | `apps/web/e2e/` | Ecris |
| 9.3 | CI/CD | `.github/workflows/ci.yml` | Configure |
| 9.4 | Docker | `docker-compose.yml` | Configure |

---

## Acces

| Ressource | URL / Chemin |
|-----------|--------------|
| Depot GitHub | `github.com/your-org/thiqti` |
| Production (apres deploiement) | `https://thiqti.vercel.app` |
| Documentation | `docs/` dans le depot |
| ADRs | `docs/ADRs/` dans le depot |

---

## Derniere mise a jour

| Date | Modification |
|------|--------------|
| 2026-07-17 | Creation initiale du data room |
