# SLEIPNIR - Note sur l'agrement Bank Al-Maghrib (Phase 3)

**Ref**: VV-SLP-2026-001
**Date**: 2026-07-17
**Statut** : Note de cadrage, pas un avis juridique

---

## 1. Objet

Cette note evalue le chemin regulatoriel pour integrer un paiement par sequestre dans la Phase 3 de Thiqti (marketplace automobile). Elle identifie les conditions d'agrement, les alternatives, et le moment d'appeler un avocat.

---

## 2. Contexte regulatoriel marocain

### 2.1 Loi 103-12 (Loi bancaire)

La loi 103-12 sur l'activite bancaire encadre :
- Les etablissements de credit (banques classiques)
- Les etablissements de paiement (nouvelle categorie)
- Les services de paiement

### 2.2 Categories d'etablissements de paiement

| Categorie | Plafond transaction | Conditions |
|-----------|---------------------|------------|
| Etablissement de paiement de categorie 1 | 200 000 DH | Capital minimum 10 M DH |
| Etablissement de paiement de categorie 2 | 20 000 DH | Capital minimum 1 M DH |
| Etablissement de paiement de categorie 3 | 5 000 DH | Capital minimum 200 000 DH |

### 2.3 Conditions d'obtention

| Condition | Details |
|-----------|---------|
| Capital social | Minimum 1M a 10M DH selon categorie |
| Dirigeants | Casier judiciaire, experience bancaire/paiement |
| Business plan | Detaille, avec projection sur 3 ans |
| Systeme d'information | Audit securite obligatoire |
| Garanties | Caution ou assurance responsabilite |
| Delai d'obtention | 6 a 12 mois |

---

## 3. Ce que Thiqti veut faire (Phase 3)

### 3.1 Sequestre

Le paiement par sequestre consiste a :
1. L'acheteur paie le vehicule sur un compte sequestre
2. Le vendeur livre le vehicule
3. Le sequestre libere les fonds au vendeur

### 3.2 Pourquoi c'est un sujet d'agrement

Le sequestre implique la **detection de fonds de tiers**. Selon la loi 103-12, tout service impliquant la detention temporaire de fonds pour le compte d'autrui necessite un agrement d'etablissement de paiement.

---

## 4. Les 3 options pour Thiqti

### Option 1 : Obtenir l'agrement (recommandee a long terme)

| Avantage | Inconvenient |
|----------|--------------|
| Controle total de l'experience | Delai 6-12 mois |
| Pas de dependance a un tiers | Capital minimum 1M DH |
| Revue complete de la valeur | Audit securite obligatoire |
| Compatibilite avec toutes les phases | Personnel dedie requis |

**Cout estime** : 500 000 a 1 500 000 DH (capital + legal + audit)

### Option 2 : Adossement contractuel a un etablissement existant

| Avantage | Inconvenient |
|----------|--------------|
| Pas d'agrement propre | Dependance au partenaire |
| Delai plus court (3-6 mois) | Commission sur transactions |
| Capital moindre | Moins de controle |
| Partage de la charge regulatorielle | Risque de rupture du partenariat |

**Partenaires potentiels** : Bank Assafa, CIH Bank, Wafasalik

**Cout estime** : 100 000 a 300 000 DH (legal + commission)

### Option 3 : Passer par un PSP existant (solution temporaire)

| Avantage | Inconvenient |
|----------|--------------|
| Deploiement immediat | Commission elevee (2-5%) |
| Pas de legal | Pas de sequestre natif |
| Simple a implementer | Dependance forte |

**Partenaires potentiels** : Payzone, M-Way, Cash Plus

**Cout estime** : Commission de 2-5% sur chaque transaction

---

## 5. Recommandation

### Court terme (Phase 1-2) : Option 3

Utiliser un PSP existant pour les transactions simples (pas de sequestre). Cela permet de valider le produit sans investissement regulatoriel.

### Moyen terme (Phase 3) : Option 2

S'adosser a un etablissement de paiement existant (CIH Bank ou Bank Assafa) pour le sequestre. Delai 3-6 mois, capital moindre.

### Long terme (Phase 4+) : Option 1

Obtenir son propre agrement si le volume le justifie (> 1000 transactions/mois).

---

## 6. Calendrier

| Phase | Action | Responsable | Delai |
|-------|--------|-------------|-------|
| Phase 1 (aout 2026) | Lancement MVP, pas de paiement | - | - |
| Phase 2 (Q4 2026) | Integration PSP simple | Technique | 1 mois |
| Phase 3 (Q1 2027) | Demande d'adossement | Juridique + Direction | 3-6 mois |
| Phase 4 (Q3 2027) | Demande d'agrement (si volume) | Juridique | 6-12 mois |

---

## 7. Points d'attention

| Risque | Niveau | Mitigation |
|--------|--------|------------|
| Refus d'agrement | Eleve | Commencer par l'adossement |
| Delai trop long | Moyen | Utiliser un PSP en attendant |
| Cout eleve | Moyen | Phase 3 financee par les revenus Phase 2 |
| Changement regulatori | Faible | Suivre les publications Bank Al-Maghrib |

---

## 8. Conclusion

**L'agrement Bank Al-Maghrib n'est pas un sujet de developpement, c'est un sujet de strategie regulatorielle.**

Thiqti ne doit pas construire de code de paiement avant d'avoir obtenu l'agrement ou l'adossement. La Phase 1 et 2 fonctionnent sans paiement. La Phase 3 peut se faire par adossement. L'agrement propre n'est necessaire que si le volume depasse 1000 transactions/mois.

**Prochaine etape** : Prendre RDV avec un avocat specialise en droit bancaire marocain quand la Phase 2 est lancee.
