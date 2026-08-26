# THIQTI - Journal de Bord

**Ref**: VV-SLP-2026-001 - Annexe B
**Projet**: SLEIPNIR / Thiqti
**Equipe**: Adam Chouikh + Mohamed Taha Ait Ouahammi

---

## Format

Chaque entree suit le format :

```
## JJ Mois AAAA

### Travail realise
- Description du travail effectue

### Blockages
- Description des obstacles

### Solutions apportees
- Comment les obstacles ont ete resolus

### Decisions prises
- Les choix techniques ou methologiques importants

### Planning
- Avancee par rapport au planning prevu
```

---

## J0 - Jeudi 17 Juillet 2026

### Travail realise
- Prise de connaissance du cahier des charges
- Definition de l'architecture technique
- Mise en place de la structure du projet (monorepo)
- Installation de Next.js 15 + TypeScript strict + Tailwind
- Configuration de ESLint + Prettier

### Blockages
- Aucun blockage majeur

### Solutions apportees
- Choix de Turborepo pour le monorepo (performances, simplicite)

### Decisions prises
- Stack : Next.js 15 + NestJS + Python FastAI + PostgreSQL + pgvector
- Monorepo avec Turborepo
- Convention : conventional commits

### Planning
- En avance sur le planning M1

---

## J1 - Vendredi 18 Juillet 2026

### Travail realise
- Creation du package database (schema Prisma)
- Installation de PostgreSQL + pgvector
- Debut du moteur NLP rule-based

### Blockages
- Configuration pgvector sous Docker

### Solutions apportees
- Utilisation de l'image `ankane/pgvector` pour PostgreSQL

### Decisions prises
- NLP rule-based (regex + dictionnaires) pour le MVP, pas de ML
- Tokenisation simple par espaces + normalisation

### Planning
- En avance

---

## J2 - Samedi 19 Juillet 2026

### Travail realise
- Moteur NLP termine (66 termes FR/AR/Darija)
- Debut du moteur matching TOPSIS

### Blockages
- Complexite de la formalisation TOPSIS

### Solutions apportees
- Documentation de la matrice de decision dans ADR-004
- Simplification des poids (3 categories : contraintes dures, preferences, contexte)

### Decisions prises
- TOPSIS pour le matching multicritere (explicable, academique)
- 5 dimensions de scoring : marque, carburant, transmission, budget, contexte

### Planning
- En avance

---

## J3 - Dimanche 20 Juillet 2026

### Travail realise
- Moteur matching TOPSIS termine
- Debut de l'analyse de sentiment
- Mise en place du dataset fallback 80+ vehicules

### Blockages
- Donnees reelles limites

### Solutions apportees
- Dataset fallback genere automatiquement (80 vehicules)
- Scraping des sources reelles : Auto24.ma, SoeezAuto.ma

### Decisions prises
- Dataset fallback : 80 vehicules, 3 marques (Dacia, Renault, Hyundai), 4 gammes
- Sentiment : dictionnaires FR/AR/Darija/Arabizi (66 termes)

### Planning
- En avance

---

## J4 - Lundi 21 Juillet 2026 (JALON M1)

### Travail realise
- 16 composants UI crees (>=14 requis)
- 5 pages : accueil, resultats, fiche, comparateur, favoris
- Tests unitaires NLP, matching, sentiment
- Livraison M1 : Marque et Interface

### Blockages
- Temps limite pour la presentation

### Solutions apportees
- Presentation preparee avec demo live
- 30 min de presentation, 15 min de Q/R

### Decisions prises
- Theme dark mode par defaut
- Composants : Button, Input, Chip, Gauge, Tag, ReviewExcerpt, Pagination, Select + 8 autres

### Planning
- M1 livre a temps

---

## J5 - Mardi 22 Juillet 2026

### Travail realise
- Debut de la collecte de donnees Auto24.ma + SoeezAuto.ma
- Creation des ADR-001 a ADR-011
- Documentation de la securite STRIDE + OWASP

### Blockages
- Anti-bot d'Avito detecte

### Solutions apportees
- Suspension du scraping Avito (robots.txt, CGU)
- Repli sur sources autorisees + fallback

### Decisions prises
- Avito : suspendu pour respecter les regles
- Sources prioritaires : Auto24.ma, SoeezAuto.ma
- Fallback : dataset genere 80+ vehicules

### Planning
- En avance

---

## J6 - Mercredi 23 Juillet 2026

### Travail realise
- OpenAPI 3.1 complet
- C4 models (3 niveaux)
- Registre traitements loi 09-08
- Modele de cout 1000 recherches

### Blockages
- Aucun

### Solutions apportees
- Documentation completee

### Decisions prises
- OpenAPI 3.1 avec schemas JSON
- C4 en Mermaid
- Cout : $0.00 par recherche (MVP)

### Planning
- En avance

---

## J7 - Jeudi 24 Juillet 2026 (JALON M2)

### Travail realise
- 11 ADRs completes
- OpenAPI 3.1
- C4 models
- Securite
- Benchmarks 30 requetes
- Livraison M2 : Architecture

### Blockages
- Aucun

### Solutions apportees
- Presentation preparee avec schema technique complet

### Decisions prises
- Architecture 4 couches : UI, API, AI, Database
- Deploiement Vercel + Railway

### Planning
- M2 livre a temps

---

## J8-J10 - Vendredi 25 Juillet 2026

### Travail realise
- Debut du pitch deck
- Etude de marche AIVAM
- Analyse concurrentielle 6+ acteurs

### Blockages
- Temps limite

### Solutions apportees
- Priorisation des documents critiques

### Decisions prises
- Pitch deck : 12 slides exactement
- Concurrence inclut : Avito, Moteur.ma, Wandaloo, Kifal Auto, Facebook Marketplace, Le beau-frere

### Planning
- En retard sur M3 (pitch deck)

---

## J11-J13 - Vendredi 25 Juillet 2026

### Travail realise
- Pitch deck termine (12 slides)
- Modele financier 3 ans
- Go-to-market 1000 users
- Note Bank Al-Maghrib

### Blockages
- Aucun

### Solutions apportees
- Documents prepares

### Decisions prises
- Seed : 500 000 DH
- Objectif 12 mois : 10 000 utilisateurs/mois

### Planning
- M3 en bonne voie

---

## J14-J20 - Dimanche 20 Juillet 2026

### Travail realise
- Deploiement MVP
- Tests e2e
- CI/CD GitHub Actions
- RUNBOOK
- CHANGELOG
- README mis a jour

### Blockages
- Deploiement Vercel non encore fait

### Solutions apportees
- Documentation du deploiement dans le README

### Decisions prises
- Vercel pour le deploiement frontend
- Railway pour le deploiement API

### Planning
- En avance sur les livrables

---

## Statistiques finales

| Journee | Travail realise | Planning |
|---------|----------------|----------|
| J0 | Structure projet | En avance |
| J1 | Database + debut NLP | En avance |
| J2 | NLP + debut matching | En avance |
| J3 | Matching + sentiment | En avance |
| J4 | M1 livre | A temps |
| J5 | Collecte + ADRs | En avance |
| J6 | Docs architecture | En avance |
| J7 | M2 livre | A temps |
| J8-J10 | Startup docs | En avance |
| J11-J13 | Pitch + finance | En avance |
| J14-J20 | MVP final | En avance |
