# THIQTI - Plan Detaille du Rapport

**Ref**: VV-SLP-2026-001
**Section CdC**: 12.4
**Date**: 2026-07-17

---

## Structure du rapport

### Introduction (3-4 pages)

1. **Contexte** : Le marche automobile marocain, les problemes d'acces a l'information
2. **Problematique** : Les limites des moteurs de recherche existants en multilingue
3. **Objectifs** : Concevoir un moteur de recherche IA multilingue pour le Maroc
4. **Annonce du plan** : Structure du rapport

---

### Chapitre 1 : Etat de l'art (8-10 pages)

#### 1.1 Recherche d'information automobile
- Moteurs de recherche classiques (Google, Bing)
- Moteurs de recherche specialises (Autotrader, CarGurus)
- Limites pour les marches emerges

#### 1.2 NLP multilingue
- Traitement du francais standard
- Traitement de l'arabe standard et dialectal
- Les defis de la darija et de l'arabizi
- Approches existantes : BERT multilingue, CamemBERT, AraBERT

#### 1.3 Matching multicritere
- Methodes de classement (BM25, TF-IDF)
- Approches vectorielles (embeddings)
- TOPSIS et methodes de decision multicritere

#### 1.4 E-reputation et analyse de sentiment
- Analyse de sentiment en arabe
- Systemes de notation et barometres
- Applications au domaine automobile

#### 1.5 Synthese et positionnement
- Tableau comparatif des solutions existantes
- Identification des lacunes
- Positionnement de notre contribution

---

### Chapitre 2 : Conception et architecture (8-10 pages)

#### 2.1 Besoins fonctionnels
- Recherche en langage naturel
- Matching multicritere explicable
- Barometre d'e-reputation
- Interface utilisateur

#### 2.2 Besoins non fonctionnels
- Performance (< 3 secondes)
- Accessibilite (WCAG 2.2 AA)
- Securite (OWASP, STRIDE)
- Conformite (loi 09-08)

#### 2.3 Architecture technique
- Vue C4 (conteneurs, composants, code)
- Moteur NLP rule-based
- Moteur matching TOPSIS
- Base de donnees PostgreSQL + pgvector

#### 2.4 Modele de donnees
- Schema Prisma
- Entites principales : Vehicule, Critere, Score, Avis
- Relations et contraintes

#### 2.5 Choix architecturaux (ADRs)
- Justification de chaque ADR
- Options considerees et rejetees

---

### Chapitre 3 : Implementation (6-8 pages)

#### 3.1 Moteur NLP
- Tokenisation et normalisation
- Extraction de criteres (66 termes)
- Dictionnaires FR/AR/Darija/Arabizi
- Exemples de requetes et resultats

#### 3.2 Moteur matching TOPSIS
- Formalisation mathematique
- Matrice de decision
- Calcul des poids
- Score de correspondance et explicabilite

#### 3.3 Analyse de sentiment
- Dictionnaires de sentiments
- Calcul du score (-1 a +1)
- Extraction d'extraits pertinents
- Seuil de confiance

#### 3.4 Collecte de donnees
- Sources : Auto24.ma, SoeezAuto.ma
- Scraping et normalisation
- Dataset fallback
- Liccite et robots.txt

#### 3.5 Interface utilisateur
- Design system (16 composants)
- Pages principales
- Etats transverses (chargement, vide, erreur)
- Accessibilite

---

### Chapitre 4 : Evaluation (4-6 pages)

#### 4.1 Protocole experimental
- Banc d'essai : 30 requetes
- Annotation a la main
- Metriques : Precision@3, Recall@3, NDCG

#### 4.2 Resultats
- Performance du matching TOPSIS
- Impact du module NLP
- Comparaison avec baseline (mots-cles)
- Temps de reponse

#### 4.3 Analyse qualitative
- Cas de reussite
- Cas d'echec
- Limites identifiees

#### 4.4 Validation utilisateur
- Test < 60 secondes
- Feedback qualitatif
- Ameliorations proposees

---

### Conclusion (2-3 pages)

1. **Synthese** : Resume des contributions
2. **Limites** : Ce que le systeme ne fait pas encore
3. **Perspectives** : Phase 2, ameliorations futures

---

### Bibliographie (2-4 pages)

- 25+ references academiques et techniques
- Format APA ou IEEE

---

### Annexes (variable)

- A : Journal de bord
- B : ADRs completes
- C : Banc d'essai detaille
- D : Source de donnees
- E : Code source (QR code vers GitHub)

---

## Volume estime

| Section | Pages |
|---------|-------|
| Introduction | 3-4 |
| Chapitre 1 | 8-10 |
| Chapitre 2 | 8-10 |
| Chapitre 3 | 6-8 |
| Chapitre 4 | 4-6 |
| Conclusion | 2-3 |
| Bibliographie | 2-4 |
| Annexes | 4-6 |
| **Total** | **40-50** |

---

## Planning de redaction

| Semaine | Travail |
|---------|---------|
| S1 | Introduction + Chapitre 1 (état de l'art) |
| S2 | Chapitre 2 (conception) |
| S3 | Chapitre 3 (implementation) |
| S4 | Chapitre 4 (evaluation) + Conclusion |
| S5 | Relecture + Annexes + Mise en forme |
