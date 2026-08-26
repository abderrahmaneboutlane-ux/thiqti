# THIQTI - Script Test Utilisateur <60 secondes

**Ref**: VV-SLP-2026-001
**Section CdC**: 9.5
**Date**: 2026-07-17

---

## Objectif

Verifier qu'un utilisateur inconnu peut effectuer une recherche complete et obtenir des resultats en moins de 60 secondes.

---

## Protocole

### Pre-test (0-10 secondes)

1. Ouvrir l'URL : `https://thiqti.vercel.app`
2. Presenter l'ecran a l'utilisateur
3. Dire : "Vous souhaitez acheter un vehicule. Decrivez votre voiture ideale."

### Test (10-50 secondes)

1. **Requete** : L'utilisateur tape sa requete en langage naturel
   - Exemple : "SUV hybride autour de 350 000 DH, confortable pour la famille"
   - Autoriser : FR, AR, Darija, Arabizi

2. **Soumission** : L'utilisateur clique sur "Rechercher" ou appuie sur Entree

3. **Resultats** : L'utilisateur voit les resultats
   - Verifier que les resultats s'affichent en < 3 secondes
   - Verifier que les resultats sont pertinents (score > 50%)

4. **Selection** : L'utilisateur clique sur un vehicule
   - Verifier que la fiche vehicule s'affiche
   - Verifier que le score de correspondance est visible

### Post-test (50-60 secondes)

1. Demander : "Les resultats etaient-ils pertinents ?"
2. Demander : "Le score vous a-t-il aide a comprendre pourquoi ce vehicule ?"
3. Remercier l'utilisateur

---

## Metriques

| Metrique | Cible | Mesure |
|----------|-------|--------|
| Temps total | < 60 secondes | Chronometre |
| Temps de reponse | < 3 secondes | Chronometre |
| Requete comprise | Oui/Non | Observation |
| Resultats pertinents | Oui/Non | Feedback |
| Score compris | Oui/Non | Feedback |
| Erreurs console | 0 | DevTools |

---

## Script d'execution

### Pour le testeur

```
1. Ouvrir https://thiqti.vercel.app
2. Dire a l'utilisateur : "Decrivez votre voiture ideale"
3. Demarrer le chronometre quand l'utilisateur commence a taper
4. Arreter le chronometre quand l'utilisateur clique sur un vehicule
5. Noter les metriques
6. Poser les questions post-test
```

### Pour le developpeur

```
1. Ouvrir Chrome DevTools (F12)
2. Aller dans l'onglet Console
3. Verifier qu'il n'y a pas d'erreurs
4. Verifier que les requetes repondent en < 3 secondes
5. Verifier que les resultats ont un score > 50%
```

---

## Exigences

### Avant le test

- [ ] Le site est deploye sur Vercel
- [ ] Le site est accessible depuis un reseau 4G
- [ ] Le site est fonctionnel (pas d'erreurs)
- [ ] Le script est charge (pas de ralentissement)
- [ ] Les donnees sont disponibles (80+ vehicules)

### Pendant le test

- [ ] L'utilisateur n'a pas d'instruction prealable
- [ ] L'utilisateur utilise son propre appareil (tactile ou souris)
- [ ] L'utilisateur peut poser des questions
- [ ] Le testeur ne donne pas d'aide

### Apres le test

- [ ] Les metriques sont enregistrees
- [ ] Le feedback est recueilli
- [ ] Les erreurs sont notees
- [ ] Les ameliorations sont proposees

---

## Cas de test

### Cas 1 : Requete FR simple

**Requete** : "SUV autour de 300 000 DH"
**Attendu** : 3-5 resultats, tous des SUV, prix < 350 000 DH

### Cas 2 : Requete AR

**Requete** : "سيارة اقتصادية للعائلة"
**Attendu** : 3-5 resultats, tous des berlines economiques

### Cas 3 : Requete Darija

**Requete** : "khiyar dial hybride"
**Attendu** : 3-5 resultats, tous des hybrides

### Cas 4 : Requete Arabizi

**Requete** : "koura dial SUV"
**Attendu** : 3-5 resultats, tous des SUV

### Cas 5 : Requete complexe

**Requete** : "Berline automatique diesel confortable pour ville autour de 250000 DH"
**Attendu** : 3-5 resultats, tous des berlines, automatique, diesel, < 300 000 DH

---

## Tableau de notation

| Test | Temps | Pertinence | Score | Erreurs | Note |
|------|-------|------------|-------|---------|------|
| Cas 1 | /60s | Oui/Non | >50% | 0 | /5 |
| Cas 2 | /60s | Oui/Non | >50% | 0 | /5 |
| Cas 3 | /60s | Oui/Non | >50% | 0 | /5 |
| Cas 4 | /60s | Oui/Non | >50% | 0 | /5 |
| Cas 5 | /60s | Oui/Non | >50% | 0 | /5 |
| **Total** | /300s | /5 | /5 | /5 | /25 |

---

## Resultats attendus

### Succes

- Temps total < 60 secondes
- Temps de reponse < 3 secondes
- Requete comprise dans 100% des cas
- Resultats pertinents dans 80% des cas
- Score compris dans 80% des cas
- 0 erreur console

### Echec

- Temps total > 60 secondes
- Temps de reponse > 3 secondes
- Requete pas comprise dans > 20% des cas
- Resultats pas pertinents dans > 20% des cas
- Score pas compris dans > 20% des cas
- > 0 erreurs console

---

## Ameliorations proposees

### Si echec

1. **Optimiser les performances** : Cache, CDN, lazy loading
2. **Ameliorer le NLP** : Ajouter des regles, corriger les mappings
3. **Augmenter les donnees** : Plus de vehicules, plus de sources
4. **Simplifier l'interface** : Moins d'options, plus de clarte
5. **Former les testeurs** : Instructions plus claires

### Si succes

1. **Documenter** : Ajouter au journal de bord
2. **Partager** : Presenter aux encadrants
3. **Repeter** : Faire d'autres tests avec d'autres utilisateurs
4. **Ameliorer** : Corriger les petits problemes identifies
