# THIQTI - Charte de Marque

**Ref**: VV-SLP-2026-001
**Version**: 1.0
**Date**: 2026-07-17
**Classification**: Confidentiel

---

## 1. Positionnement

### 1.1 Promesse en une phrase

**Thiqti comprend votre besoin et vous trouve la voiture idéale en trois secondes.**

### 1.2 Personnalité en cinq adjectifs

1. **Intelligent** : Le moteur comprend ce que vous voulez, pas ce que vous tapez
2. **Fiable** : Chaque donnée est sourcée, chaque score est justifié
3. **Accessible** : Une phrase suffit, aucune inscription requise
4. **Marocain** : Conçu pour le marché marocain, en darija comme en français
5. **Transparent** : Le classement s'explique, le baromètre montre ses limites

### 1.3 Positionnement concurrentiel

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

---

## 2. Palette de couleurs

### 2.1 Couleurs primaires

| Nom | HEX | RGB | CMJN | Usage |
|-----|-----|-----|------|-------|
| Primary (Bleu IA) | #3B82F6 | 59, 130, 246 | 76, 46, 0, 0 | Boutons principaux, liens, accent |
| Primary Dark | #1D4ED8 | 29, 78, 216 | 87, 66, 0, 0 | Hover, état actif |
| Primary Light | #93C5FD | 147, 197, 253 | 43, 17, 0, 0 | Fond subtil, badges |

### 2.2 Couleurs secondaires

| Nom | HEX | RGB | CMJN | Usage |
|-----|-----|-----|------|-------|
| Success (Vert) | #22C55E | 34, 197, 94 | 83, 0, 59, 0 | Score élevé, tags positifs |
| Warning (Orange) | #F59E0B | 245, 158, 11 | 0, 35, 95, 0 | Score moyen, alertes |
| Danger (Rouge) | #EF4444 | 239, 68, 68 | 0, 72, 72, 0 | Erreurs, tags négatifs |
| Info (Bleu clair) | #06B6D4 | 6, 182, 212 | 72, 14, 0, 0 | Information, aide |

### 2.3 Couleurs sémantiques

| Nom | HEX | Usage |
|-----|-----|-------|
| Surface Dark | #0F172A | Fond principal (dark mode) |
| Surface Raised | #1E293B | Cartes, modales |
| Surface Hover | #334155 | Survole d'éléments |
| Border | #334155 | Bordures subtiles |
| Text Primary | #F8FAFC | Texte principal |
| Text Secondary | #94A3B8 | Texte secondaire |
| Text Muted | #64748B | Texte désactivé |

### 2.4 Taux de contraste WCAG 2.2 AA

| Couple | Fond | Texte | Ratio | AA Normal | AA Large |
|--------|------|-------|-------|-----------|----------|
| Primary sur Dark | #0F172A | #3B82F6 | 4.6:1 | ✅ Pass | ✅ Pass |
| Text sur Dark | #0F172A | #F8FAFC | 15.8:1 | ✅ Pass | ✅ Pass |
| Text Sec sur Dark | #0F172A | #94A3B8 | 5.2:1 | ✅ Pass | ✅ Pass |
| Text Muted sur Dark | #0F172A | #64748B | 3.1:1 | ❌ Fail | ✅ Pass |
| Success sur Dark | #0F172A | #22C55E | 5.8:1 | ✅ Pass | ✅ Pass |
| Warning sur Dark | #0F172A | #F59E0B | 7.1:1 | ✅ Pass | ✅ Pass |
| Danger sur Dark | #0F172A | #EF4444 | 4.7:1 | ✅ Pass | ✅ Pass |
| Primary sur Raised | #1E293B | #3B82F6 | 3.9:1 | ❌ Fail | ✅ Pass |
| Text sur Raised | #1E293B | #F8FAFC | 12.5:1 | ✅ Pass | ✅ Pass |

**Note**: Text Muted (#64748B) sur fond Dark ne passe que pour le texte large (>18px ou >14px bold). Utiliser Text Secondary (#94A3B8) pour le texte courant.

---

## 3. Typographie

### 3.1 Familles

| Famille | Usage | Licence |
|---------|-------|---------|
| Inter | Interface, boutons, labels | SIL Open Font License (gratuit) |
| Calibri | Corps de texte, paragraphes | Microsoft (licenciée avec Windows) |
| Cambria | Titres, headings | Microsoft (licenciée avec Windows) |
| Noto Sans Arabic | Arabe, darija | SIL Open Font License (gratuit) |

### 3.2 Échelle modulaire

| Niveau | Taille | Graisse | Interligne | Usage |
|--------|--------|---------|------------|-------|
| Display | 48px | Bold (700) | 1.1 | Titre accueil |
| H1 | 36px | Bold (700) | 1.2 | Titre de page |
| H2 | 28px | Semibold (600) | 1.3 | Sections |
| H3 | 22px | Semibold (600) | 1.4 | Sous-sections |
| H4 | 18px | Medium (500) | 1.4 | Cartes, blocs |
| Body | 16px | Regular (400) | 1.5 | Texte courant |
| Body Small | 14px | Regular (400) | 1.5 | Texte secondaire |
| Caption | 12px | Regular (400) | 1.4 | Labels, badges |
| Micro | 10px | Medium (500) | 1.3 | Tags, annotations |

### 3.3 Graisses

| Graisse | Numéro | Usage |
|---------|--------|-------|
| Regular | 400 | Texte courant |
| Medium | 500 | Labels, boutons secondaires |
| Semibold | 600 | Titres, Navigation |
| Bold | 700 | Titres principaux, CTA |

---

## 4. Espacement

### 4.1 Grille

Base : **4px**. Tous les espacements sont des multiples de 4.

| Token | Valeur | Usage |
|-------|--------|-------|
| space-1 | 4px | Espacement micro |
| space-2 | 8px | Entre éléments proches |
| space-3 | 12px | Padding interne petit |
| space-4 | 16px | Padding interne standard |
| space-5 | 20px | Entre blocs |
| space-6 | 24px | Padding carte |
| space-8 | 32px | Entre sections |
| space-10 | 40px | Marges larges |
| space-12 | 48px | Sections |
| space-16 | 64px | Pages |

### 4.2 Rayons

| Token | Valeur | Usage |
|-------|--------|-------|
| radius-sm | 6px | Tags, badges |
| radius-md | 8px | Boutons, inputs |
| radius-lg | 12px | Cartes |
| radius-xl | 16px | Modales |
| radius-full | 9999px | Pillules, avatars |

### 4.3 Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.3) | Éléments légers |
| shadow-md | 0 4px 6px rgba(0,0,0,0.3) | Cartes |
| shadow-lg | 0 10px 15px rgba(0,0,0,0.3) | Modales, dropdowns |
| shadow-xl | 0 20px 25px rgba(0,0,0,0.3) | Popovers |

---

## 5. Iconographie

### 5.1 Famille

**Lucide React** : https://lucide.dev

- Épaisseur de trait : 1.5px (stroke)
- Grille : 24x24px
- Tailles utilisées : 16px (inline), 20px (boutons), 24px (navigation), 32px (état vide)

### 5.2 Règles de construction

- Pas de remplissage (outline uniquement)
- Arrondis sur les extrémités (strokeLinecap: round)
- Pas de double stroke
- Cohérence d'épaisseur sur toutes les icônes

---

## 6. Direction photographique

### 6.1 Références

| # | Description | Pourquoi |
|---|-------------|----------|
| 1 | Voiture sur route marocaine, lumière dorée | Connexion locale, émotion |
| 2 | Intérieur premium, focus sur le tableau de bord | Qualité, technologie |
| 3 | Vue aérienne d'une ville marocaine | Contexte urbain |
| 4 | Personne au volant, vue de dos | Projection utilisateur |
| 5 | Détail mécanique (moteur, roue) | Fiabilité, expertise |
| 6 | Coucher de soleil sur une autoroute | Liberté, voyage |

### 6.2 Ce qu'il ne faut jamais faire

- Photos sous stock watermarked
- Voitures avec plaques d'immatriculation visibles
- Images trop retouchées / irréalistes
- Photos sombres / négatives
- Visuels avec du texte incrusté
- Images génériques de banque d'images sans lien avec le Maroc

---

## 7. Voix et ton

### 7.1 Règles

| # | Règle | Exemple |
|---|-------|---------|
| 1 | Direct, pas de superlatif non étayé | ✅ "92% de match" ❌ "Le meilleur véhicule" |
| 2 | L'utilisateur est expert de son besoin | ✅ "Vous cherchez un SUV" ❌ "Laissez-nous vous guider" |
| 3 | Les chiffres ont une source | ✅ "8.2/10 sur 214 avis" ❌ "Très bien noté" |
| 4 | La darija est respectée, pas parodiée | ✅ "khouya, hadchi mzyan" ❌ "khouyaaa mzyaaaan" |
| 5 | Le doute est affiché, jamais caché | ✅ "Données insuffisantes" ❌ "Score par défaut" |

### 7.2 Exemples avant/après

| Contexte | Avant (❌) | Après (✅) |
|----------|-----------|-----------|
| Accueil | "Bienvenue sur la meilleure plateforme" | "Décrivez votre voiture idéale" |
| Résultat | "Ce véhicule est incroyable" | "92% de correspondance avec votre recherche" |
| Erreur | "Oups, quelque chose s'est mal passé" | "Réseau indisponible. Réessayez." |
| Baromètre | "Excellent modèle" | "8.2/10, sur 214 avis des 18 derniers mois" |
| Darija | "Chouf had l9ti3a" | "Voici les résultats pour votre recherche" |

---

## 8. Principes de mouvement

### 8.1 Durées

| Type | Durée | Courbe |
|------|-------|--------|
| Micro-interaction | 150ms | ease-out |
| Apparition élément | 200ms | ease-in-out |
| Transition page | 300ms | ease-in-out |
| Animation complexe | 500ms | cubic-bezier |

### 8.2 Ce qui bouge

- Apparition des résultats (fade-in + slide-up)
- Survole des cartes (scale subtil 1.02)
- Chargement (squelette pulsant)
- Notifications (slide-in depuis la droite)

### 8.3 Ce qui ne bouge jamais

- La barre de recherche reste fixe
- La navigation ne défile pas
- Les scores et chiffres n'ont pas d'animation
- Le baromètre se remplit, ne tourne pas

---

## 9. Cas d'usage interdits

1. **Pas de comic sans** : Jamais de polices informelles
2. **Pas de dégradés arc-en-ciel** : La palette est limitée aux couleurs définies
3. **Pas d'ombres colorées** : Ombres noires uniquement
4. **Pas de texte sur image sans overlay** : Toujours un fond semi-transparent
5. **Pas d'animation infinie** : Maximum 3 secondes, puis arrêt
6. **Pas de scroll horizontal** : Le contenu s'adapte à la largeur
