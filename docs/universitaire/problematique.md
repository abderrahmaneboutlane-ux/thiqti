# THIQTI - Problematique Scientifique

**Ref**: VV-SLP-2026-001
**Section CdC**: 12.3
**Date**: 2026-07-17

---

## Choix : Piste B

**Piste B : Comment l'analyse multilingue (francais, arabe, darija, arabizi) de donnees textuelles non structurees peut-elle ameliorer la pertinence des resultats d'un moteur de recherche automobile ?**

---

## Formulation de la problematique

### Probleme central

Les moteurs de recherche automobiles actuels au Maroc utilisent des systemes de matching base sur des mots-cles exacts ou des filtres categories. Cette approche ne fonctionne pas quand l'utilisateur s'exprime en darija, en arabe dialectal, ou en arabizi (langage textuel mixte).

### Question de recherche

**Comment concevoir un systeme de recherche automobile qui comprenne les requetes en langage naturel multilingue (FR/AR/Darija/Arabizi) et retourne des resultats pertinents avec une explication transparente du classement ?**

### Sous-questions

1. Comment tokeniser et normaliser les expressions en darija et en arabizi ?
2. Comment mapper des termes informels (ex: "khyara" = fiabilité) a des attributs structures ?
3. Comment rendre explicable un classement multicritere (TOPSIS) a l'utilisateur ?
4. Comment evaluer la pertinence des resultats sans jeu de donnees de test standardise ?

### Hypothese

Un systeme de matching multicritere (TOPSIS) combine avec un moteur NLP rule-based multilingue peut ameliorer significativement la pertinence des resultats par rapport a un matching par mots-cles simples, pour les recherches en darija et en arabizi.

### Approche methodologique

1. **Corpus de test** : 30 requetes annotationnees a la main (CdC 7.4)
2. **Metriques** : Precision@3, Recall@3, NDCG
3. **Comparaison** : TOPSIS vs matching par mots-cles
4. **Ablation** : Impact du module NLP sur la pertinence

### Originalite

- Premier moteur de recherche automobile en darija/arabizi
- Formalisation academique du matching (TOPSIS)
- Explicabilite du classement (scores de contribution)
- Barometre d'e-reputation pour le marche marocain

### Contributions attendues

1. Un dictionnaire de termes automobiles en darija/arabizi
2. Une methode de matching explicable pour les vehicules
3. Un benchmark de 30 requetes multilingues
4. Un prototype fonctionnel deployable
