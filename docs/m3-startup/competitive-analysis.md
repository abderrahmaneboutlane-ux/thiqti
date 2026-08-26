# SLEIPNIR - Analyse Concurrentielle

**Ref**: VV-SLP-2026-001
**Date**: 2026-07-17
**Acteurs analyses** : 6 + statu quo

---

## 1. Vue d'ensemble

| Acteur | Type | Annee | Siege | Traffic mensuel |
|--------|------|-------|-------|-----------------|
| Avito.ma | Marketplace generaliste | 2006 | Maroc | 15M visites |
| Moteur.ma | Portail auto specialise | 2012 | Casablanca | 500K visites |
| Wandaloo | Forum automobile | 2006 | Maroc | 300K visites |
| Kifal Auto | Argus + annonces | 2010 | Casablanca | 200K visites |
| Facebook Marketplace | Reseau social + marketplace | 2016 | Global | 10M+ au Maroc |
| Le beau-frere | Recommandation orale | Toujours | Partout | Illimite |

---

## 2. Fiches acteurs

### 2.1 Avito.ma

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | La plus grande marketplace du Maroc. Volume d'annonces vehicules : 10 000+ |
| **Modele economique** | Annonces payantes (mise en avant), commission sur ventes |
| **Forces** | Volume, notoriete, SEO puissant, confiance utilisateurs |
| **Faiblesses** | Pas de matching IA, pas de scoring, pas de verification, arnaques frequentes, pas de fiche technique standardisee |
| **Ce que Thiqti leur prend** | Le segment "recherche intelligente" (utilisateurs qui savent ce qu'ils veulent mais ne trouvent pas) |
| **Menace directe** | Forte. Pourrait integrer un moteur IA si le marche bouge |

### 2.2 Moteur.ma

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | Portail automobile specialise Maroc. Fiches techniques, comparateurs, actualites |
| **Modele economique** | Publicite, leads concessionnaires |
| **Forces** | Contenu technique riche, SEO auto, base de donnees vehicules |
| **Faiblesses** | Pas de NLP, pas de matching multicritere, interface datee, pas de barometre reputation |
| **Ce que Thiqti leur prend** | Le segment "recherche par critere" (utilisateurs qui comparent) |
| **Menace directe** | Moyenne. Peu agile, structure legacy |

### 2.3 Wandaloo

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | Forum automobile Maroc. Communaute active, avis utilisateurs |
| **Modele economique** | Publicite, sponsorship concessionnaires |
| **Forces** | Communaute fidele, avis authentiques, SEO forum |
| **Faiblesses** | Forum date (phpBB), pas de structure, pas de données techniques, pas de matching |
| **Ce que Thiqti leur prend** | Le segment "avis et reputation" (utilisateurs qui cherchent l'avis des autres) |
| **Menace directe** | Faible. Communaute niche, pas de tech |

### 2.4 Kifal Auto

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | Argus automobile Maroc. Prix du neuf et de l'occasion |
| **Modele economique** | Abonnement argus, leads |
| **Forces** | Reference tarifaire, donnees prix |
| **Faiblesses** | Pas de matching, pas de reputation, pas de recherche intelligente, interface basique |
| **Ce que Thiqti leur prend** | Le segment "estimation prix" (si on integre l'argus) |
| **Menace directe** | Faible. Specialiste prix, pas de experience utilisateur |

### 2.5 Facebook Marketplace

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | Marketplace integree a Facebook. Volume enorme |
| **Modele economique** | Publicite, pas de commission |
| **Forces** | Reach massif, gratuit, messagerie integree |
| **Faiblesses** | Zero fiabilite, zero structure, zero matching, arnaques, pas de fiche technique |
| **Ce que Thiqti leur prend** | Le segment "recherche structuree" (utilisateurs qui veulent des donnees fiables) |
| **Menace directe** | Forte en volume, faible en qualite |

### 2.6 Le beau-frere qui s'y connait

| Critere | Details |
|---------|---------|
| **Proposition de valeur** | Recommandation personnelle basee sur l'experience |
| **Modele economique** | Gratuit (faveur) |
| **Forces** | Confiance, connaissance locale, conseil personnalise |
| **Faiblesses** | Pas de donnees, pas de scale, biais, pas objectif, disponible uniquement en personne |
| **Ce que Thiqti leur prend** | L'objectivite et la scale (recommandation data-driven vs opinion) |
| **Menace directe** | **C'est notre vrai concurrent.** L'habitude culturelle de demander a un pro. |

---

## 3. Matrice de positionnement

```
                    Recherche intelligente
                           ^
                           |
                    Thiqti |  Avito
                           |
     Faible ----------------+----------------> Fort
     Experience             |              Experience
     utilisateur            |              utilisateur
                           |
              Kifal Auto   |  Moteur.ma
                           |
                           |
                    Qualite des donnees
```

**Positionnement Thiqti** : Haute qualite des donnees + Forte experience utilisateur

---

## 4. Analyse SWOT de Thiqti

| | Positif | Negatif |
|--|---------|---------|
| **Interne** | Forces : NLP multilingue, matching TOPSIS explicable, barometre reputation | Faiblesses : Pas de base utilisateurs, pas de marque, dataset limité |
| **Externe** | Opportunites : Pas de concurrent IA au Maroc, couts LLM en chute | Menaces : Avito pourrait copier,-reglementation, confiance utilisateurs |

---

## 5. Positionnement par fonctionnalite

| Fonctionnalite | Avito | Moteur.ma | Wandaloo | Kifal | FB | Thiqti |
|----------------|-------|-----------|----------|-------|----|---------|
| Recherche texte libre | Non | Non | Non | Non | Non | **Oui** |
| NLP darija/arabizi | Non | Non | Non | Non | Non | **Oui** |
| Matching multicritere | Filtres basiques | Filtres | Non | Non | Non | **TOPSIS** |
| Explicabilite | Non | Non | Non | Non | Non | **Oui** |
| Barometre reputation | Non | Non | Avis bruts | Non | Non | **Oui** |
| Score fiabilite | Non | Non | Non | Non | Non | **Oui** |
| Fiche technique | Non | Oui | Non | Partielle | Non | **Oui** |
| Comparateur | Non | Oui | Non | Non | Non | **Oui** |
| Favoris | Non | Non | Non | Non | Non | **Oui** |
| Saisie vocale | Non | Non | Non | Non | Non | **Oui** |

---

## 6. Avantage concurrentiel durable (Moat)

**Ce n'est ni le scraping, ni l'interface.**

1. **Corpus darija/arabizi** : Dataset d'avis annotés en darija sur le domaine auto marocain. Non reproductible sans crawling massif + annotation manuelle.

2. **Expertise NLP multilingue** : Regex + dictionnaires calibrés sur le vocabulaire auto marocain (66 termes darija, 42 termes arabes). Chaque source de données a ses spécificités.

3. **Matching TOPSIS explicable** : Formalisation académique (Hwang & Yoon, 1981) avec profils de poids BWM. Pas un simple filtre SQL.

4. **Conformite loi 09-08** : Registre des traitements, STRIDE, OWASP des le jour 1. Avantage réglementaire quand la CNPD se renforcera.

5. **Données temps réel** : Rafraîchissement quotidien avec traçabilité source + horodatage. Les concurrents ont des données statiques.

---

## 7. Stratégie face aux concurrents

| Concurrent | Strategie |
|------------|-----------|
| Avito | Ne pas attaquer sur le volume. Attaquer sur la qualite de la recherche et la fiabilite |
| Moteur.ma | Devenir la reference pour la recherche intelligente. Ils sont nos potentiels partenaires (pas nos ennemis) |
| Wandaloo | Ne pas replicer le forum. Integrer les avis Wandaloo dans le barometre (avec attribution) |
| Kifal Auto | Complementarite. Kifal pour l'argus, Thiqti pour la recherche et la reputation |
| Facebook | Ne pas attaquer directement. Devenir l'alternative "serieuse" pour les acheteurs informes |
| Le beau-frere | Remplacer l'opinion par des donnees. "Ton beau-frere n'a pas 214 avis sur le RAV4" |
