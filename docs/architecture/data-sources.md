# SLEIPNIR — Cartographie des Sources de Données

**Ref**: VV-SLP-2026-001  
**Date**: 2026-07-17  
**Statut**: Active

---

## 1. Vue d'ensemble

| Source | Type | Volumétrie estimée | Fréquence | Statut |
|--------|------|-------------------|-----------|--------|
| Auto24.ma | API publique | 5 000+ annonces | Quotidienne | Active |
| SoeezAuto.ma | Scraping HTML | 2 000+ annonces | Quotidienne | Active |
| Avito.ma | Scraping HTML | 10 000+ annonces | Quotidienne | Active |
| Moteur.ma | SPA (non scrapable) | N/A | N/A | Retirée |
| OVoiture.ma | SPA (non scrapable) | N/A | N/A | Retirée |
| Dataset fallback | JSON local | 80+ véhicules | Manuel | Active |

---

## 2. Détail par source

### 2.1 Auto24.ma

| Champ | Valeur |
|-------|--------|
| **URL** | https://auto24.ma |
| **Type d'accès** | API REST publique (pas de clé requise) |
| **Volumétrie** | ~5 000 annonces véhicules neufs et occasion |
| **Données extractibles** | Marque, modèle, année, prix, kilométrage, carburant, transmission, ville, photos |
| **robots.txt** | Autorise l'indexation des pages véhicules |
| **Conditions d'utilisation** | Pas de clause d'interdiction de scraping identifiée. Les données sont publiques. |
| **Risque juridique** | Faible. API publique, pas de protection anti-bot documentée. |
| **Conclusion licéité** | ✅ **AUTORISÉ**. Source publique accessible via API. Aucune restriction identifiée. Données non personnelles (descriptifs véhicules). |

### 2.2 SoeezAuto.ma

| Champ | Valeur |
|-------|--------|
| **URL** | https://soeezauto.ma |
| **Type d'accès** | Scraping HTML (Playwright) |
| **Volumétrie** | ~2 000 annonces |
| **Données extractibles** | Marque, modèle, année, prix, kilométrage, carburant, ville, photos, fiche technique |
| **robots.txt** | Autorise les bots à l'indexation des pages publiques |
| **Conditions d'utilisation** | Pas de clause d'interdiction de scraping. Contenu public. |
| **Risque juridique** | Faible. Contenu public, pas de protection technique anti-scraping. |
| **Conclusion licéité** | ✅ **AUTORISÉ**. Scraping de contenu public sans protection technique. Données non personnelles. Respect du robots.txt. |

### 2.3 Avito.ma

| Champ | Valeur |
|-------|--------|
| **URL** | https://avito.ma |
| **Type d'accès** | Scraping HTML (Playwright) |
| **Volumétrie** | ~10 000 annonces véhicules |
| **Données extractibles** | Marque, modèle, année, prix, kilométrage, carburant, ville, photos |
| **robots.txt** | **Interdit** : `User-agent: * Disallow: /` |
| **Conditions d'utilisation** | **Clause anti-scraping présente** : "Vous ne devez pas reproduire, distribuer, ou créer des œuvres dérivées" |
| **Risque juridique** | **Élevé**. Scraping en violation du robots.txt et des CGU. |
| **Conclusion licéité** | ⚠️ **SUSPENDU**. Source retirée de la production. Les données d'Avito ne seront utilisées qu'à des fins de développement/test, jamais en production. Remplacement par Fallback Dataset pour le MVP. |

### 2.4 Moteur.ma

| Champ | Valeur |
|-------|--------|
| **URL** | https://moteur.ma |
| **Type d'accès** | SPA (Single Page Application) |
| **Volumétrie** | N/A |
| **Raison du rejet** | Application JavaScript uniquement. Playwright ne peut pas extraire les données de manière fiable (rendu côté client, charges dynamiques). |
| **Conclusion licéité** | ℹ️ **NON APPLICABLE**. Source techniquement inaccessible. Pas de tentative de scraping effectuée. |

### 2.5 OVoiture.ma

| Champ | Valeur |
|-------|--------|
| **URL** | https://ovoiture.ma |
| **Type d'accès** | SPA (Single Page Application) |
| **Volumétrie** | N/A |
| **Raison du rejet** | Même problème que Moteur.ma. Application JavaScript sans API publique. |
| **Conclusion licéité** | ℹ️ **NON APPLICABLE**. Source techniquement inaccessible. |

### 2.6 Dataset Fallback

| Champ | Valeur |
|-------|--------|
| **Source** | Compilation manuelle à partir de données publiques |
| **Volumétrie** | 80+ véhicules |
| **Données** | Marques populaires au Maroc : Dacia, Renault, Peugeot, Toyota, Hyundai, Kia, Volkswagen, BMW, Mercedes, Nissan |
| **Mise à jour** | Manuelle, lors de changements de prix catalogue |
| **Risque juridique** | Aucun. Données compilées à partir de sources publiques. |
| **Conclusion licéité** | ✅ **AUTORISÉ**. Dataset de secours sans restriction. |

---

## 3. Matrice de décision

| Source | Licéité | Technique | Volume | Risque | Décision |
|--------|---------|-----------|--------|--------|----------|
| Auto24.ma | ✅ | ✅ API | 5 000 | Faible | **Production** |
| SoeezAuto.ma | ✅ | ✅ Scraping | 2 000 | Faible | **Production** |
| Avito.ma | ❌ | ✅ Scraping | 10 000 | Élevé | **Retirée** |
| Moteur.ma | ℹ️ | ❌ SPA | N/A | N/A | **Retirée** |
| OVoiture.ma | ℹ️ | ❌ SPA | N/A | N/A | **Retirée** |
| Fallback | ✅ | ✅ Local | 80 | Aucun | **Production** |

---

## 4. Stratégie de collecte

### 4.1 Ordonnancement

```
03:00 UTC — Début du cron quotidien
  ├── Auto24.ma (API) — ~30 secondes
  ├── SoeezAuto.ma (Scraping) — ~2 minutes
  ├── Fallback Dataset (local) — ~1 seconde
  └── Déduplication + fusion — ~5 secondes
```

### 4.2 Résilience

| Situation | Traitement |
|-----------|------------|
| Source indisponible | Timeout 30s, passage à la source suivante |
| Changement de HTML | Fallback automatique sur le dataset local |
| Rate limiting | Attente exponentielle (1s, 2s, 4s, max 3 tentatives) |
| Erreur réseau | Log + alerte, continuation avec sources restantes |

### 4.3 Déduplication

```typescript
// Clé de dédoublonnage : marque + modèle + année + prix
const key = `${car.make.toLowerCase()}_${car.model.toLowerCase()}_${car.year}_${car.price}`;
```

En cas de doublon : conservation du véhicule avec le kilométrage le plus bas.

---

## 5. Suivi et monitoring

| Métrique | Seuil d'alerte | Action |
|----------|----------------|--------|
| Nombre total de véhicules | < 50 | Vérifier les sources |
| Taux d'échec scraping | > 50% | Review robots.txt |
| Temps de collecte | > 5 minutes | Optimiser les requêtes |
| Doublons détectés | > 30% | Réviser la clé de dédoublonnage |

---

## 6. Évolution prévue

| Phase | Source ajoutée | Condition |
|-------|---------------|-----------|
| Phase 2 | Occasion agrégée | Validation licéité par Volund |
| Phase 3 | Marketplace | Agrément requis |
