# THIQTI - Ethique et Limites

**Ref**: VV-SLP-2026-001
**Section CdC**: 12.4
**Date**: 2026-07-17

---

## 1. Considerations ethiques

### 1.1 Protection des donnees personnelles

**Principe** : Aucune donnee personnelle n'est collectee, stockee ou traitee sans consentement.

| Action | Statut | Justification |
|--------|--------|---------------|
| Collecte de donnees | Non | Pas d'inscription, pas de cookies |
| Stockage de donnees | Non | Aucune base de donnees utilisateur |
| Profilage | Non | Pas de suivi comportemental |
| Partage avec tiers | Non | Pas de publicite, pas de partenaires |

**Conformite** :
- Loi 09-08 (Maroc) : Registre des traitements disponible
- RGPD (UE) : Pas applicable (pas de residents UE)
- CCPA (California) : Pas applicable (pas de residents US)

### 1.2 Scraping et robots.txt

**Principe** : Respect strict des regles d'accessibilité web.

| Source | Statut | Justification |
|--------|--------|---------------|
| Auto24.ma | ✅ Autorise | Pas de restriction robots.txt |
| SoeezAuto.ma | ✅ Autorise | Pas de restriction robots.txt |
| Avito | ❌ Suspendu | Robots.txt + CGU interdisent le scraping |
| Moteur.ma | ❌ Non scrapable | SPA (Single Page Application) |

**Demarche** :
1. Verification robots.txt avant tout scraping
2. Respect des CGU de chaque source
3. Pas de scraping si interdit
4. Fallback sur donnees generees si necessaire

### 1.3 Biais algorithmiques

**Risques identifies** :

| Biais | Impact | Mitigation |
|-------|--------|------------|
| Biais de marque | Preferencer les marques populaires | Poids utilisateur, pas de marque par defaut |
| Biais de prix | Favoriser les vehicules hors budget | Filtre budget strict |
| Biais de langue | Exclure les utilisateurs arabophones | Multilingue (FR/AR/Darija/Arabizi) |
| Biais de donnees | Scores inexactes avec peu d'avis | Seuil minimal N=30, volume affiche |

**Transparence** :
- Chaque score est explicable (contribution par dimension)
- Le volume de donnees est toujours affiche
- Le barometre indique son incertitude
- Pas de "black box"

### 1.4 Impact environnemental

**Considerations** :
- Modele rule-based (pas de GPU, pas de LLM)
- Cout energetique minimal
- Hebergement green (Vercel : neutre en carbone)

---

## 2. Limites du systeme

### 2.1 Limites techniques

| Limite | Impact | Amelioration future |
|--------|--------|---------------------|
| NLP rule-based | Expressions non prevues | Ajout de regles, passage a un modele ML |
| Pas de deep learning | Pas de comprehension semantique profonde | BERT multilingue en Phase 2 |
| Dataset limité | Scores peu fiables avec peu d'avis | Augmentation du corpus |
| Pas de real-time | Pas de mise a jour en direct | Scraper automatiquement |
| Pas de cache | Requetes identiques recalculees | Redis en Phase 2 |

### 2.2 Limites fonctionnelles

| Limite | Impact | Amelioration future |
|--------|--------|---------------------|
| Pas de comparaison directe | Pas de cote a cote visuel | Interface compare |
| Pas de notification | Pas d'alerte prix | Email/webhook en Phase 2 |
| Pas d'historique | Pas de suivi de prix | Base de donnees temporelle |
| Pas de social | Pas de partage d'avis | Integration reseaux sociaux |
| Pas de mobile natif | PWA uniquement | Application mobile en Phase 3 |

### 2.3 Limites de donnees

| Limite | Impact | Amelioration future |
|--------|--------|---------------------|
| Sources limitées | Auto24 + SoeezAuto uniquement | Ajout d'autres sources |
| Pas de donnees en temps reel | Prix potentiellement obsolètes | Scraper quotidiennement |
| Pas de donnees historiques | Pas d'evolution de prix | Stocker les prix passes |
| Pas de donnees de fiabilite | Pas de score de fiabilite | Integration garage/reparateurs |
| Pas de donnees d'assurance | Pas de comparaison assurance | Partenariat assureurs |

### 2.4 Limites utilisateur

| Limite | Impact | Amelioration future |
|--------|--------|---------------------|
| Pas d'inscription | Pas de personnalisation | Compte utilisateur en Phase 2 |
| Pas de favoris persistants | Perte des favoris | Stockage local + cloud |
| Pas de recommandation | Pas de suggestions proactives | Moteur de recommandation |
| Pas de chatbot | Pas d'assistant conversationnel | Integration IA generative |
| Pas de multijoueur | Pas de comparaison partagee | Partage de lien compare |

---

## 3. Risques et mitigations

### 3.1 Risques techniques

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Panne du serveur | Moyenne | Forte | Deploiement Vercel (99.99% uptime) |
| Scrape bloque | Haute | Faible | Fallback sur donnees generees |
| Performance lente | Faible | Forte | Optimisation, cache |
| Bug critique | Faible | Forte | Tests e2e, CI/CD |
| Securite | Faible | Forte | OWASP, STRIDE |

### 3.2 Risques juridiques

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Action Avito | Faible | Forte | Suspension scraping |
| Non-conformite loi 09-08 | Faible | Forte | Registre des traitements |
| Plagiat | Faible | Forte | Attribution des sources |
| Propriete intellectuelle | Faible | Forte | Cession PI |

### 3.3 Risques business

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Pas d'utilisateurs | Moyenne | Forte | Go-to-market, SEO |
| Concurrence forte | Haute | Moyenne | Differenciation NLP |
| Pivot necessaire | Moyenne | Moyenne | Methode Lean Startup |
| Pas de financement | Haute | Forte | MVP bootstrap |

---

## 4. Ameliorations futures (Phase 2+)

### 4.1 Court terme (3-6 mois)

- [ ] Integration BERT multilingue pour le NLP
- [ ] Ajout de sources de donnees (Wandaloo, Kifal Auto)
- [ ] Cache Redis pour les performances
- [ ] Application mobile PWA
- [ ] Notification de prix

### 4.2 Moyen terme (6-12 mois)

- [ ] Modele ML pour le matching
- [ ] Chatbot IA generative
- [ ] Integration garage/reparateurs
- [ ] Partenariat assureurs
- [ ] Donnees historiques de prix

### 4.3 Long terme (12+ mois)

- [ ] Extension a l'Afrique du Nord
- [ ] Integration complete du cycle de vie (achat, entretien, revente)
- [ ] Marketplace de pieces detachees
- [ ] Financement automobile integre
- [ ] Verification d'historique (carnet d'entretien)

---

## 5. Ethique du code

### 5.1 Principes

1. **Transparence** : Code source ouvert, documentation complete
2. **Explicabilite** : Chaque decision est justifiee
3. **Accessibilite** : WCAG 2.2 AA minimum
4. **Confidentialite** : Pas de collecte de donnees personnelles
5. **Durabilite** : Impact environnemental minimal

### 5.2 Engagements

- Pas de dark patterns
- Pas de notification push non sollicitee
- Pas de partage de donnees avec des tiers
- Pas de publicite intrusiva
- Respect de l'utilisateur a chaque interaction
