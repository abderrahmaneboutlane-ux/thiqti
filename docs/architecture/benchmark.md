# SLEIPNIR — Banc d'Essai Moteur de Matching

**Ref**: VV-SLP-2026-001  
**Date**: 2026-07-17  
**Statut**: Active

---

## 1. Méthodologie

### 1.1 Objectif

Évaluer la qualité du moteur de matching multicritère TOPSIS sur 30 requêtes de référence couvrant les cas d'usage principaux du produit.

### 1.2 Critères d'évaluation

| Critère | Seuil minimum | Méthode |
|---------|---------------|---------|
| Pertinence top 3 | ≥ 80% | Review manuelle du DRI |
| Explicabilité | 100% | Chaque résultat doit avoir une explication |
| Temps de réponse | < 2.5s (p95) | Mesure automatisée |
| Tolérance budget | 15% par défaut | Vérification du code |
| Gestion ambiguïté | ≤ 2 résultats aberrants | Review manuelle |

### 1.3 Annotation

Chaque requête est annotée avec :
- **Critères attendus** : ce que le moteur devrait extraire
- **Véhicules attendus** : les 3 meilleurs véhicules attendus
- **Score attendu** : la plage de score TOPSIS attendue

---

## 2. Jeu de test — 30 requêtes

### Catégorie 1 : Requête simple (10 requêtes)

| # | Requête | Critères attendus | Véhicules attendus (top 3) |
|---|---------|-------------------|---------------------------|
| 1 | "SUV" | carrosserie: SUV | Tout SUV du dataset |
| 2 | "Diesel" | motorisation: Diesel | Tout véhicule diesel |
| 3 | "Toyota" | marque: Toyota | Tous les Toyota |
| 4 | "Casablanca" | ville: Casablanca | Véhicules à Casablanca |
| 5 | "Berline automatique" | carrosserie: Berline, transmission: Automatique | Berlines auto |
| 6 | "Moins de 100000 km" | kmMax: 100000 | Véhicules < 100k km |
| 7 | "Année 2023" | anneeMin: 2023, anneeMax: 2024 | Véhicules 2023-2024 |
| 8 | "Hybride" | motorisation: Hybride | Véhicules hybrides |
| 9 | "Sous 200000 DH" | budgetMax: 200000 | Véhicules < 200k DH |
| 10 | "Citadine essence" | carrosserie: Citadine, motorisation: Essence | Citadines essence |

### Catégorie 2 : Requête complexe (10 requêtes)

| # | Requête | Critères attendus | Véhicules attendus (top 3) |
|---|---------|-------------------|---------------------------|
| 11 | "SUV hybride autour de 350000 DH" | carrosserie: SUV, motorisation: Hybride, budget: 280k-420k | SUV hybrides milieu de gamme |
| 12 | "Berline diesel confortable pour la famille" | carrosserie: Berline, motorisation: Diesel, intent: familial | Berlines spacieuses diesel |
| 13 | "Voiture économique pour la ville" | intent: economique, ville | Citadines abordables |
| 14 | "4x4 puissant pour le voyage" | carrosserie: SUV, intent: route, sportif | SUV premium |
| 15 | "Peugeot récente sous 250000 DH" | marque: Peugeot, budgetMax: 250000, anneeMin: 2022 | Peugeot récentes abordables |
| 16 | "SUV 7 places pour la famille" | carrosserie: SUV, intent: familial | SUV 7 places |
| 17 | "Diesel automatique moins de 80000 km" | motorisation: Diesel, transmission: Automatique, kmMax: 80000 | Diesel auto peu roulé |
| 18 | "Voiture de luxe premium" | intent: confort | Véhicules premium |
| 19 | "Rabat berline essence" | ville: Rabat, carrosserie: Berline, motorisation: Essence | Berlines essence Rabat |
| 20 | "SUV entre 300000 et 500000 DH" | carrosserie: SUV, budgetMin: 300000, budgetMax: 500000 | SUV milieu/haut de gamme |

### Catégorie 3 : Requête ambiguë (5 requêtes)

| # | Requête | Critères attendus | Véhicules attendus (top 3) |
|---|---------|-------------------|---------------------------|
| 21 | "Une voiture pas chère" | intent: economique | Les moins chers |
| 22 | "Quelque chose de bien" | intent: confort | Meilleurs scores |
| 23 | "Une voiture pour emmener les enfants" | intent: familial | Véhicules familiaux |
| 24 | "Je veux un truc rapide" | intent: sportif | Véhicules performants |
| 25 | "Auto" | (aucun critère) | Tous les véhicules |

### Catégorie 4 : Requête edge case (5 requêtes)

| # | Requête | Critères attendus | Véhicules attendus (top 3) |
|---|---------|-------------------|---------------------------|
| 26 | "Voiture électrique" | motorisation: Électrique | Si disponible, sinon: données insuffisantes |
| 27 | "Budget 5000 DH" | budgetMax: 5000 | Aucun résultat (hors range) |
| 28 | "BMW SUV 2025 100000 km" | marque: BMW, carrosserie: SUV, anneeMin: 2025, kmMax: 100000 | Combinaison rare |
| 29 | "SUV hybride berline diesel" | Contradiction carrosserie | Gestion de la contradiction |
| 30 | "" (requête vide) | (aucun critère) | Tous les véhicules, pas d'erreur |

---

## 3. Résultats attendus

### 3.1 Scores TOPSIS par catégorie

| Catégorie | Score attendu | Justification |
|-----------|---------------|---------------|
| Requête simple | 70-95% | Critères clairs, facilement extractibles |
| Requête complexe | 60-85% | Critères multiples, poids à ajuster |
| Requête ambiguë | 40-70% | Critères implicites, dépend de l'intention |
| Edge case | Variable | Cas limites, test de robustesse |

### 3.2 Temps de réponse cible

| Métrique | Cible | Méthode |
|----------|-------|---------|
| p50 | < 500ms | Mesure automatisée |
| p95 | < 2.5s | Mesure automatisée |
| p99 | < 4s | Mesure automatisée |

---

## 4. Script de test

```typescript
// apps/web/src/lib/benchmark-runner.ts
import { parseQuery } from './nlp';
import { rankVehicles } from './matching';

const TEST_QUERIES = [
  { id: 1, query: "SUV", expectedBody: "SUV" },
  { id: 2, query: "Diesel", expectedFuel: "Diesel" },
  { id: 3, query: "Toyota", expectedBrand: "Toyota" },
  // ... 27 autres requêtes
];

async function runBenchmark() {
  const results = [];
  
  for (const test of TEST_QUERIES) {
    const start = performance.now();
    const criteria = parseQuery(test.query);
    const ranked = await rankVehicles(getAllVehicles(), criteria);
    const duration = performance.now() - start;
    
    results.push({
      id: test.id,
      query: test.query,
      criteria,
      top3: ranked.slice(0, 3).map(v => v.id),
      duration,
      passed: duration < 2500,
    });
  }
  
  return results;
}
```

---

## 5. Critères de validation

| Critère | Résultat | Statut |
|---------|----------|--------|
| Pertinence top 3 ≥ 80% | À mesurer | ⏳ |
| Explicabilité 100% | Code vérifié | ✅ |
| Temps p95 < 2.5s | À mesurer | ⏳ |
| Tolérance budget 15% | Code vérifié | ✅ |
| Edge cases gérés | Code vérifié | ✅ |

---

## 6. Exécution

```bash
# Lancer le banc d'essai
npm run benchmark

# Résultat attendu
Benchmark Results:
  Total: 30 queries
  Passed: XX/30
  Avg duration: XXXms
  p95 duration: XXXms
  p99 duration: XXXms
```
