# PROMPT COMPLET — Projet Thiqti
## Moteur de Recherche Automobile IA au Maroc

---

## 1. VISION GLOBALE

**Thiqti** est un moteur de recherche automobile intelligent pour le Maroc. Il agrège **1750+ véhicules** depuis 12 sources marocaines (Dacia Officiel, Renault, Peugeot, Auto24, Avito, Moteur.ma, Wandaloo, Kifal, Spoticar, etc.) et utilise l'**IA (NLP + TOPSIS)** pour comprendre les recherches en français et en darija marocaine, puis classer les résultats par pertinence.

**Stack technique :**
- Frontend : **Next.js 15** (App Router) + **React 19** + **Tailwind CSS** + **Framer Motion**
- Backend : **Route Handlers Next.js** (API REST)
- Base de données : **JSON en mémoire** (seed-data.json, 160K lignes, 1750 véhicules)
- IA : **NLP custom** (parsing français/darija, normalisation d'accents) + **classement TOPSIS** multi-critères
- Landing page : **single.html** (SPA vanilla JS, servie à la racine `/` via rewrite Next.js)
- 3D : **Three.js** (hologramme WebGL), **CSS perspective transforms**, **canvas 2D** (radar charts)
- Images voitures : **cdn.imagin.studio** (photos réelles par marque/modèle) + fallback Unsplash

---

## 2. ARCHITECTURE DES PAGES

### 2.1 Page d'accueil : `single.html` (servie à `/`)

**Fichier :** `apps/web/public/single.html` (~4300 lignes, SPA vanilla)

C'est la page principale du site. Elle est une SPA complète en vanilla JS avec :
- **Hero** : Barre de recherche NLP, stats flottantes, photo Porsche avec hologramme 3D
- **Marques** : Pills cliquables (Dacia, Renault, Peugeot, VW, Toyota, Hyundai, Kia, MG, BYD, Mercedes, BMW, Audi, Porsche, Ford, Nissan, Honda, Mazda, Skoda)
- **Catégories** : Citadine, SUV, Berline, Électrique, Pick-up — avec images
- **Résultats** : Cards de voitures avec score IA, prix, favoris, bouton comparer
- **Comparateur** : Sélection de 2-4 véhicules, comparaison côte à côte
- **Chat assistant** : Interface de chat NLP qui comprend le français et le darija
- **Filtres** : Budget, marque, carburant, ville, année — sidebar ou modal
- **Navigation** : SPA routing interne (home → results → compare → chat)

**Données inline** : Le JSON complet des 1750 véhicules est embarqué dans `window.REAL_CARS_INLINE` (ligne ~585)

**Scripts 3D** : Three.js + GLTFLoader + car.glb — chargés en lazy load après le `window.load`

### 2.2 Page résultats : `/results`

**Fichier :** `apps/web/src/app/(app)/results/page.tsx` (~890 lignes)

La page de recherche React. Affiche les résultats du moteur NLP+TOPSIS.

**Fonctionnalités :**
- Recherche textuelle NLP ("SUV diesel sous 300000 DH à Casablanca")
- **Filtres structurés** : carrosserie (SUV, Berline, Citadine, Compacte, Crossover, Break), motorisation (Essence, Diesel, Hybride, Électrique), budget max, année min, kilométrage max, marque, ville
- **Tri** : par score IA, prix croissant/décroissant, année
- **Vue grille/liste** toggle
- **Pagination** : scroll infinis ou pagination classique
- **Favoris** : stockés en localStorage, cœur animé
- **Comparaison** : sélection de véhicules à comparer
- **Score IA** : badge avec explication au hover
- **Radar de confiance** : canvas 2D, pseudo-3D
- **Filtres rapides** : chips pour carburant et ville

**API utilisée :** `GET /api/search?q=...&fuel=...&body_type=...&make=...&city=...&max_price=...&min_year=...&max_km=...&sort=...&page=...&limit=...`

### 2.3 Page détail véhicule : `/vehicle/[slug]`

**Fichier :** `apps/web/src/app/(app)/vehicle/[slug]/page.tsx` (~700 lignes)

Fiche détaillée d'un véhicule spécifique.

**Sections :**
- **Galerie** : Image principale + miniatures avec parallaxe
- **Header** : Nom, année, prix, localisation, source
- **Onglets** : Description, Caractéristiques (TiltCard 3D), Avis IA
- **Score IA** : Badge circulaire animé avec explication
- **Radar de confiance** : ConfidenceRadar canvas
- **Prix du marché** : PriceTimeline avec marqueur animé
- **Véhicules similaires** : Recommandations
- **Contact** : WhatsApp, téléphone, email vendeur
- **Bouton Comparer** : Ajout au comparateur

**Animations :** ScrollReveal, StaggerReveal, TiltCard, hover-lift, tab-active, flip-in

### 2.4 Page comparateur : `/compare`

**Fichier :** `apps/web/src/app/(app)/compare/page.tsx` (~400 lignes)

Compare 2 à 4 véhicules côte à côte.

**Fonctionnalités :**
- Sélection de véhicules (depuis résultats ou directement)
- Tableau de comparaison : prix, km, carburant, année, transmission, ville, score
- Mise en surbrillance du meilleur choix
- **Flip-in** 3D quand un véhicule est remplacé
- Conseil IA basé sur les véhicules sélectionnés
- ScrollReveal pour l'animation d'entrée

### 2.5 Page favoris : `/favorites`

**Fichier :** `apps/web/src/app/(app)/favorites/page.tsx` (~200 lignes)

Liste des véhicules sauvegardés en favoris.

**Fonctionnalités :**
- Grille de cards favoris
- Suppression avec cœur animé
- Stockage localStorage
- ScrollReveal animation
- État vide avec CTA

### 2.6 Chat assistant : `/chat`

**Fichier :** `apps/web/src/app/(app)/chat/page.tsx` + `components/chat/ChatPlatform.tsx`

Assistant IA bilingue (français + darija).

**Fonctionnalités :**
- Interface de chat avec messages user/assistant
- NLP qui comprend : "je cherche un SUV diesel pas cher à Casablanca"
- Questions de clarification si la requête est vague
- Suggestions rapides
- Affichage des résultats dans le chat (cards cliquables)
- Historique de conversation
- Navigation vers `/results` avec la requête
- Chargement dynamique (dynamic import, SSR désactivé)

### 2.7 Pages admin : `/admin`

**Fichier :** `apps/web/src/app/(app)/admin/`

Panneau d'administration (basique) pour le dashboard.

---

## 3. NAVIGATION

### Sidebar (desktop) — `AppShell.tsx`
Navigation latérale avec logo, liens (Accueil, Explorer, Comparer, Favoris, Assistant), et mode sombre

### Barre flottante (mobile) — `FloatingBottomNav.tsx`
Bottom nav glassmorphique fixée en bas, 5 boutons (Accueil, Explorer, Comparer central surélevé, Favoris, Assistant). Masquée sur la page d'accueil single.html.

### Command Palette — `CommandPalette.tsx`
Ouverte avec Ctrl+K, recherche rapide de pages, navigation instantanée

---

## 4. SYSTÈME D'IMAGES

### Hiérarchie des images (CarImage.tsx) :
1. `src` prop (image_url du véhicule → Imagin Studio CDN)
2. `sources` prop (photos[0], photos[1] → Imagin Studio, puis Unsplash)
3. Brand HD map (BRAND_HD_IMAGES — Unsplash par marque)
4. Body type HD map (BODY_HD_IMAGES — Unsplash par carrosserie)
5. Default Unsplash
6. SVG CarIllustration (fallback ultime)

### Sources d'images :
- **cdn.imagin.studio** : Photos configurateur par marque+modèle (images réelles)
- **Unsplash** : Stock photos par marque (fallback)
- **Sites marocains** : Dacia.ma, Auto24.ma (source originale)

### Next.js Image Optimization :
- Remote patterns configurés dans `next.config.ts` pour tous les domaines
- `cdn.imagin.studio` autorisé

---

## 5. SYSTÈME DE FILTRES

### Frontend (results/page.tsx) :
- **Refine panel** : 7 filtres structurés (carrosserie, motorisation, budget, année, km, marque, ville)
- **Quick filters** : Chips pour carburant et ville
- **Tri** : Score, prix ↑↓, année
- Envoi de paramètres structurés à l'API (`fuel`, `body_type`, `make`, `city`, `max_price`, `min_year`, `max_km`)

### Backend (route.ts → backend-db.ts) :
- **NLP parser** : Analyse le texte "SUV diesel sous 300000" → extrait critères
- **Filtres structurés** : Appliqués en cascade via `.filter()` chain
- **TOPSIS** : Classement multi-critères (prix, km, score, consommation, âge)
- **Pagination** : Page/limit, tri côté serveur

### API : `GET /api/search`
Paramètres : `q`, `make`, `model`, `fuel`, `body_type`, `transmission`, `city`, `min_price`, `max_price`, `min_year`, `max_km`, `sort`, `page`, `limit`

---

## 6. SYSTÈME 3D & ANIMATIONS

### single.html (SPA vanilla) :
- **Three.js** : Canvas WebGL hologramme superposé sur photo Porsche
  - Modèle GLB avec matériaux glass/wireframe
  - OrbitControls auto-rotate, mouse interaction
  - Lazy-loaded via `window.load`
- **3D Tilt** : CSS perspective transforms sur cartes (3d-effects.js)
- **Parallax** : Mouse-tracking sur mesh gradient du hero
- **Float** : Animation flottante pour badges et statistiques

### React App (composants) :
- **Hero3D** : Canvas 2D particles (silhouette trace → orbital network)
- **TiltCard** : CSS perspective + glare overlay au hover
- **ConfidenceRadar** : Canvas radar chart avec pseudo-3D rotation
- **ScoreReliefCard** : Badge 3D avec SVG ring animé
- **PriceTimeline** : Timeline du marché avec marqueur animé
- **ScrollReveal** : IntersectionObserver, direction/scale/delay
- **StaggerReveal** : Enfants auto-stagger au scroll
- **PageTransition** : framer-motion fade+blur
- **AnimatedMeshGradient** : Fond radial animé (prefers-reduced-motion respecté)

### Classes CSS 3D :
- `.hover-lift` : translateY(-4px) au hover
- `.glow-brand` : Ombre bleue pulsante
- `.text-gradient-brand` : Texte dégradé bleu
- `.link-underline` : Soulignement animé au hover
- `.spec-card-3d` : perspective 800px + tilt 2°
- `.tab-active` : Slide animation onglet
- `.animate-float` : Flottage 3s
- `.pulse-glow` : Halo pulsant
- `.flip-in` : Rotation Y 3D pour remplacement carte
- `.gallery-parallax` : Transform composé au scroll

---

## 7. DESIGN SYSTEM

### Palette :
- **Brand** : Blue 600 (#0284C7) — confiance, action
- **Price** : Indigo 600 (#2563EB) — hiérarchie prix
- **Accent** : Violet 500 (#8B5CF6) — signature IA
- **Success** : Emerald 600 (#059669) — score élevé
- **Warning** : Amber 600 (#D97706) — score moyen
- **Danger** : Red 600 (#DC2626) — alerte
- **Neutral** : Slate 50→950 — fond, texte, bordures

### Typography :
- Display : DM Serif Display (hero)
- UI : Inter (variable weight 400-700)
- Scale : xs(12) → 6xl(60)

### Ombres (4 niveaux) :
- elev-1 : repos
- elev-2 : carte standard
- elev-3 : survol/dropdown
- elev-4 : modal/drawer

### Radius : sm(6) md(10) lg(14) xl(18) 2xl(24) 3xl(32) full

### Glass : backdrop-blur-md + white/45 + border white/70

---

## 8. FICHIERS CLÉS

```
apps/web/
├── public/
│   ├── single.html          # Landing page SPA (4326 lignes)
│   ├── styles.css            # Styles single.html (1942 lignes)
│   ├── 3d-effects.css        # CSS 3D tilt/parallax (270 lignes)
│   ├── 3d-effects.js         # JS tilt engine (155 lignes)
│   ├── hero-3d.js            # Three.js hologramme (155 lignes)
│   ├── models/car.glb        # Modèle 3D voiture (1.6MB)
│   └── vendor/umd/           # Three.js + loaders UMD
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (AnimatedMeshGradient, FloatingBottomNav, etc.)
│   │   ├── globals.css       # Design tokens + animations (1094 lignes)
│   │   ├── (app)/
│   │   │   ├── layout.tsx    # AppShell sidebar wrapper
│   │   │   ├── results/      # Page résultats
│   │   │   ├── vehicle/      # Détail véhicule
│   │   │   ├── compare/      # Comparateur
│   │   │   ├── favorites/    # Favoris
│   │   │   ├── chat/         # Assistant IA
│   │   │   └── admin/        # Dashboard admin
│   │   └── api/
│   │       └── search/route.ts  # API recherche (GET)
│   ├── components/
│   │   ├── AppShell.tsx      # Layout sidebar + nav
│   │   ├── Logo.tsx          # Logo SVG Thiqti
│   │   ├── CarImage.tsx      # Composant image voiture (cascade fallback)
│   │   ├── FloatingBottomNav.tsx  # Bottom nav mobile
│   │   ├── CommandPalette.tsx     # Ctrl+K palette
│   │   ├── ScrollProgress.tsx     # Barre progression scroll
│   │   ├── ScrollToTop.tsx        # Bouton retour haut
│   │   ├── ScrollDepthEffect.tsx  # Parallaxe scroll
│   │   ├── AnimatedMeshGradient.tsx # Fond animé
│   │   ├── CustomCursor.tsx       # Curseur custom
│   │   ├── PageTransition.tsx     # Transitions pages
│   │   ├── ScrollReveal.tsx       # Animation au scroll
│   │   ├── StaggerReveal.tsx      # Animation stagger
│   │   ├── Toast.tsx              # Notifications toast
│   │   ├── ui/
│   │   │   ├── TiltCard.tsx       # Carte 3D tilt
│   │   │   ├── ConfidenceRadar.tsx # Radar canvas 2D
│   │   │   ├── ScoreReliefCard.tsx # Badge score 3D
│   │   │   └── PriceTimeline.tsx  # Timeline prix marché
│   │   └── chat/
│   │       └── ChatPlatform.tsx   # Interface chat IA
│   ├── lib/
│   │   ├── backend-db.ts     # Backend in-memory (719 lignes)
│   │   ├── nlp.ts            # Parser NLP français/darija
│   │   ├── matching.ts       # TOPSIS multi-critères
│   │   └── data/
│   │       └── seed-data.json # Base 1750 véhicules (160K lignes)
│   └── types/
│       └── lucide-react.d.ts  # Types icons custom
├── tailwind.config.ts        # Design system complet
├── next.config.ts            # Rewrites + image patterns
└── tsconfig.json
```

---

## 9. BUGS CORRIGÉS / AMÉLIORATIONS FAITES

1. **Images réelles** : Tous les véhicules utilisent maintenant `cdn.imagin.studio` (photos par modèle) au lieu d'Unsplash générique
2. **Filtres structurés** : Les filtres envoient des paramètres structurés (`fuel`, `body_type`, `make`, etc.) à l'API au lieu de concaténer du texte NLP
3. **FloatingBottomNav** : Ré-ajouté au layout root, masqué sur `/`
4. **3D hero** : Modèle GLB corrigé (`car.glb` au lieu de `voiture.glb` inexistant), scripts Three.js lazy-loaded
5. **Performance** : Suppression de `breathing-glass` (animation continue sur toutes les cartes), ajout `will-change`, `prefers-reduced-motion` pour toutes les animations
6. **TypeScript** : 0 erreurs
7. **Tests** : 61/61 passent

---

## 10. COMMANDES UTILES

```bash
# Dev server (port 3001)
cd apps/web && npx next dev --port 3001

# Type check
npx tsc --noEmit

# Tests
npx vitest run

# Build production
npx next build
```
