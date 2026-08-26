# SLEIPNIR - Pitch Deck (12 Slides)

**Ref**: VV-SLP-2026-001
**Date**: 2026-07-17
**Format**: Volund (noir chaud, or antique, cream)

---

## Slide 1 - Purpose

**Thiqti**

Trouvez votre voiture ideale au Maroc en une phrase.

Plateforme IA de recherche automobile qui comprend votre besoin en langage naturel et vous classe les meilleures offres en 3 secondes.

---

## Slide 2 - Probleme

**Acheter une voiture au Maroc, c'est ouvrir 11 onglets et demander a un cousin.**

- 11 millions de vehicules en circulation au Maroc (ONCFU 2025)
- Marche du neuf : 180 000 unites/an (AIVAM 2024)
- Marche de l'occasion : 3x le marche du neuf
- 73% des acheteurs commencent par Internet (Google/Maroc 2024)
- Aucun moteur de recherche IA dedie au Maroc

**Source** : AIVAM, ONCFU, Google Consumer Barometer Maroc 2024

---

## Slide 3 - Pourquoi maintenant

**Trois technologies convergent en 2026.**

1. **LLM accessibles** : GPT-4o-mini a $0.15/1K requetes (vs $60 en 2023)
2. **NLP multilingue** : Support darija/arabizi natif (Whisper v3, 99 langues)
3. **Infrastructure serverless** : Deploiement gratuit sur Vercel (100 GB/mois)

En 2021 : Cout NLP ~$5/requete. En 2026 : Cout NLP ~$0.00015/requete.

Le marche marocain n'a jamais eu acces a ces technologies a ce cout.

---

## Slide 4 - Solution

**Thiqti : une phrase, trois secondes, les bonnes voitures.**

Requete : "SUV hybride autour de 350 000 DH, confortable pour la famille"

Resultat :
1. Toyota RAV4 Hybrid - 92% match - 345 000 DH
2. Hyundai Tucson Hybrid - 87% match - 335 000 DH
3. Kia Sportage Hybrid - 84% match - 328 000 DH

**3 fonctions cles :**
- Moteur NLP : extraction de criteres en langage naturel
- Matching multicritere TOPSIS : classement explicable
- Barometre e-reputation : ce que pensent les vrais utilisateurs

---

## Slide 5 - Demonstration

**3 captures du chemin nominal :**

1. **Accueil** : Barre de recherche unique, epuree
2. **Resultats** : Classement avec explications ("Pourquoi ce resultat ?")
3. **Fiche vehicule** : Specs + barometre + offres

---

## Slide 6 - Marche

**TAM : 2.3 milliards DH** (marche automobile Maroc, neuf + occasion)

| Marche | Volume | Source |
|--------|--------|--------|
| TAM (Total Addressable) | 2.3 Mrd DH | AIVAM + ONCFU 2024 |
| SAM (Serviceable) | 230 M DH | Segment digital (10%) |
| SOM (Obtainable) | 23 M DH | 10 000 utilisateurs/mois a 190 DH/utilisateur |

**Construction bottom-up :**
- 180 000 acheteurs neuf/an x 10% digital x 190 DH = 3.4 M DH
- 540 000 acheteurs occasion/an x 5% digital x 190 DH = 5.1 M DH
- Total SOM annee 1 : ~8.5 M DH

**Source** : AIVAM 2024, estimation taux de conversion digital

---

## Slide 7 - Modele economique

**Freemium avec monetisation B2B.**

| Revenu | Source | Prix |
|--------|--------|------|
| Abonnement premium | Utilisateurs (recherches illimitees, alerts) | 190 DH/mois |
| Lead concessionnaires | Vente de leads qualifies | 50 DH/lead |
| Sponsoring | Mise en avant fiches | 5 000 DH/mois |

**Unit economics :**
- CAC : 30 DH (acquisition organique + SEO)
- LTV : 570 DH (abonnement 3 ans)
- LTV/CAC : 19x
- Delai de retour : 2 mois

---

## Slide 8 - Concurrence

| Acteur | Force | Faiblesse | Notre avantage |
|--------|-------|-----------|----------------|
| **Avito** | Volume d'annonces | Pas de matching IA | Moteur intelligent |
| **Moteur.ma** | Specialiste auto | Pas de NLP | Recherche langage naturel |
| **Wandaloo** | Communaute forte | Forum date | Donnees fraiches + IA |
| **Kifal Auto** | Argus referent | Pas de matching | Matching multicritere |
| **Facebook Marketplace** | Reach massif | Zero fiabilite | Fiabilite + explication |
| **Le beau-frere** | Confiance | Pas de donnees | Donnees + objectivite |

Le statu quo (le beau-frere qui s'y connait) est notre vrai concurrent.

---

## Slide 9 - Moat

**Pourquoi ceci ne se copie pas en 3 mois.**

1. **Donnees proprietaires** : Corpus d'avis automobiliers marocains en darija/arabizi, non reproductible sans crawling massif
2. **Expertise NLP multilingue** : Regex + dictionnaires FR/AR/Darija/Arabizi, calibres sur le domaine auto marocain
3. **Matching TOPSIS explicable** : Formalisation academique, pas un simple filtre
4. **Reseau de sources** : Acces API Auto24 + scraping SoeezAuto, relations a developper
5. **Registre conformite** : Loi 09-08, OWASP, framework securite des le jour 1

---

## Slide 10 - Traction et feuille de route

| Date | Jalons |
|------|--------|
| 17 juillet 2026 | Kickoff, kickoff technique |
| 21 juillet 2026 | M1 : Marque et interface complete |
| 24 juillet 2026 | M2 : Architecture complete |
| 31 juillet 2026 | M3 : Dossier startup + Sprint 1 |
| 7 aout 2026 | M4 : Sprint 2, chemin nominal complet |
| 13 aout 2026 | M5 : MVP en production |

**Ou nous en sommes :** Architecture terminee, NLP + TOPSIS fonctionnels, 80+ vehicules en dataset.

---

## Slide 11 - Equipe

| Role | Nom | Competence |
|------|-----|------------|
| DRI Architecture | Mohamed Taha Ait Ouahammi | Backend, NLP, matching |
| DRI Marque/Interface | Adam Chouikh | Frontend, UI/UX, design |
| Encadrant | Younes Boumalek | Volund Ventures |
| Commanditaire | Zakaria | Volund Ventures |

**Ce qui manque :**
- Business development (post-MVP)
- Data engineer (scraping scale)
- Marketing (acquisition utilisateurs)

---

## Slide 12 - Ask

**Nous cherchons : 500 000 DH (seed)**

| Poste | Montant |
|-------|---------|
| Infrastructure (6 mois) | 120 000 DH |
| Acquisition utilisateurs | 180 000 DH |
| Developpement Phase 2 | 150 000 DH |
| Reserve | 50 000 DH |

**Objectif 12 mois :** 10 000 utilisateurs/mois, 500 abonnes premium, pivot vers Phase 2 (occasion + marketplace).
