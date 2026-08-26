# THIQTI - Etat de l'Art

**Ref**: VV-SLP-2026-001
**Section CdC**: 12.4
**Date**: 2026-07-17

---

## 1. Recherche d'information automobile

### 1.1 Moteurs de recherche generalistes

Google et Bing dominent la recherche d'information generale, mais presentent des limites pour la recherche specialisee automobile :

- **Google Shopping** :索引 les annonces mais ne comprend pas les preferences specifiques (carburant, transmission, budget)
- **Google Autos** : filtres par categorie mais pas de recherche en langage naturel
- **Limites** : pas de matching multicritere, pas d'explication du classement

### 1.2 Moteurs de recherche specialises

| Plateforme | Marche | Moteur | Limite |
|------------|--------|--------|--------|
| Autotrader | US/UK | Filtres categories | Pas de NLP |
| CarGurus | US/UK | Matching prix + avis | Pas multilingue |
| Avito | Maroc | Filtres categories | Pas de NLP, pas multilingue |
| Moteur.ma | Maroc | Filtres categories | Pas de NLP, SPA non scrapable |

### 1.3 Recherche en langage naturel

Les systemes de recherche en langage naturel (NLQ) ont evolue :

- **BERT** (2018) : Pre-training bidirectionnel, revolution NLP
- **GPT** (2018-2024) : Modeles generatifs, comprehension contextuelle
- **T5** (2019) : Text-to-Text, unification des taches NLP
- **BERT multilingue** (2019) : 104 langues, mais performances varie

---

## 2. NLP multilingue

### 2.1 Francais

- **CamemBERT** (2019) : Modele FR, 138 Go de texte
- **FlauBERT** (2020) : FR, comparable a CamemBERT
- **Donnees** : Wikipedia FR, OSFR, newsletters
- **Etat** : Tres bien couvert, modeles performants

### 2.2 Arabe standard

- **AraBERT** (2020) : Modele AR, 77Go de texte
- **CAMeLBERT** (2021) : VAR, dialectaux, et code-switching
- **ARBERT** (2020) : AR standard
- **Donnees** : Wikipedia AR, OSCAR, news
- **Etat** : Bien couvert, mais dialectes moins bien

### 2.3 Arabe dialectal (Darija)

- **MARBERT** (2022) : Dialectes MAR
- **DziriBERT** (2023) : Darija
- **Donnees** : Twitter, forums, commentaires
- **Etat** : Limites, peu de ressources

### 2.4 Arabizi

- **Pas de modele dedicie** : ecriture non standardisee
- **Approches** : Normalisation Unicode -> AR/Latin
- **Defis** : Pas de tokenizer standard, code-switching frequent
- **Etat** : Recherche active, pas de solution mature

### 2.5 Approches pour notre projet

Notre approche est differente des modeles LLM :

1. **Rule-based** : Regex + dictionnaires (rapide, interpretable)
2. **Pas de deep learning** : Pas de GPU requis, pas de latence
3. **Explicable** : Chaque extraction est traçable
4. **Multilingue** : Dictionnaires separes FR/AR/Darija/Arabizi
5. **Extensible** : Ajout de regles simples

**Justification** : Pour un MVP, l'approche rule-based est plus rapide a developper, plus interpretable, et plus economique qu'un modele LLM.

---

## 3. Matching multicritere

### 3.1 Methodes de classement

| Methode | Principe | Avantage | Inconvenient |
|---------|----------|----------|--------------|
| BM25 | Frequence de mots | Simple, efficace | Pas de semantique |
| TF-IDF | Frequence inverse | Bon pour documents | Pas de contexte |
| PageRank | Liens entre pages | Populaire | Pas pour produits |
| TOPSIS | Distance ideal | Explicable, academique | Poids a definir |

### 3.2 TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)

- **Propose par** : Hwang et Yoon (1981)
- **Principe** : Choisir l'alternative la plus proche de la solution ideale positive et la plus lointaine de la solution ideale negative
- **Avantages** : Simple, rapide, explicable, pas d'hypothese de distribution
- **Applications** : Selection de fournisseurs, evaluation de performances, classement

### 3.3 Applications au domaine automobile

- **Kelley Blue Book** : Classement par prix et avis
- **Edmunds** : Matching preferences + budget
- **Autotrader** : Filtres avances + scoring
- **Aucun** : Pas de TOPSIS explicable dans un moteur de recherche

### 3.4 Notre contribution

- **TOPSIS adapte** : Poids dynamiques selon les preferences utilisateur
- **Explicabilite** : Score de contribution par dimension
- **Contexte marocain** : Prix en DH, marques populaires, carburant
- **Integre au NLP** : Le moteur NLP alimente le TOPSIS

---

## 4. E-reputation et analyse de sentiment

### 4.1 Analyse de sentiment

| Approche | Type | Avantage | Inconvenient |
|----------|------|----------|--------------|
| Lexique | Rule-based | Rapide, interpretable | Limite, pas de contexte |
| ML supervise | Classique | Bonne performance | Donnees necessaires |
| Deep learning | Transformer | Etat de l'art | Couteux, complexe |

### 4.2 Analyse de sentiment en arabe

- **Mazajak** (2020) : Dataset AR, sentiment
- **SemEval** : competitions NLP arabe
- **Defis** : Dialectes, code-switching, emoticones

### 4.3 Systemes de notation

- **Google Reviews** : 1-5 etoiles, pas specifique automobile
- **Trustpilot** : 1-10, pas de volume
- **CarBuzz** : Avis experts, pas utilisateurs
- **Notre approche** : Score sur 10, volume toujours affiche, fenetre temporelle

### 4.4 Barometre automobile

- **J.D. Power** : Satisfaisfaction constructeur (US)
- **Consumer Reports** : Fiabilite (US)
- **Auto Bild** : Classement qualite (DE)
- **Aucun au Maroc** : Pas de barometre automobile local

---

## 5. Conformite et ethique

### 5.1 Protection des donnees

- **RGPD** (UE) : Regulation generale sur les donnees personnelles
- **Loi 09-08** (Maroc) : Protection des donnees a caractere personnel
- **CCPA** (California) : Protection de la vie privee

### 5.2 Scraping et liccite

- **Robots.txt** : Standard pour interdire le scraping
- **CGU** : Conditions generales d'utilisation
- **Linkedin Corp. v. hiQ** (2022) : Scraping public legal
- **Notre position** : Respect robots.txt, sources autorisees uniquement

### 5.3 Biais algorithmiques

- **Algorithmic Accountability Act** (2022) : Audit des algorithmes
- **Notre approche** : Explicabilite, transparence, regul humain

---

## 6. Synthese et positionnement

### 6.1 Tableau comparatif

| Critere | Google | Avito | Moteur.ma | THIQTI |
|---------|--------|-------|-----------|--------|
| Recherche NLP | Partielle | Non | Non | Complete |
| Multilingue | Oui | Non | Non | FR/AR/Darija/Arabizi |
| Matching multicritere | Non | Filtres | Filtres | TOPSIS |
| Explicabilite | Non | Non | Non | Score de contribution |
| E-reputation | Generique | Non | Non | Automobile MAR |
| Conformite loi | Oui | Oui | Oui | Oui + registre |

### 6.2 Lacunes identifiees

1. Pas de moteur de recherche NLP automobile au Maroc
2. Pas de matching multicritere explicable
3. Pas de barometre e-reputation automobile local
4. Pas de support darija/arabizi dans la recherche automobile

### 6.3 Notre positionnement

**THIQTI** se positionne comme le premier moteur de recherche automobile IA au Maroc, combinant :
- NLP multilingue (FR/AR/Darija/Arabizi)
- Matching multicritere TOPSIS explicable
- Barometre d'e-reputation local
- Conformite loi 09-08

---

## References

[1] Devlin et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers.
[2] Martin et al. (2019). CamemBERT: a Tuned French Language Model.
[3] Antoun et al. (2020). AraBERT: Transformer-based Model for Arabic Language Understanding.
[4] Hwang et al. (1981). Multiple Attribute Decision Making.
[5] Google. (2024). Google Shopping Documentation.
[6] ONCFU. (2025). Annuaire statistique du parc automobile.
[7] AIVAM. (2024). Marche automobile marocain.
[8] Loi 09-08. (2009). Protection des donnees personnelles - Maroc.
[9] Linked Corp. v. hiQ. (2022). Supreme Court of the United States.
[10] Algorithmic Accountability Act. (2022). US Congress.
