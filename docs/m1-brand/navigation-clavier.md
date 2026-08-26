# THIQTI - Navigation Clavier

**Ref**: VV-SLP-2026-001
**Section CdC**: 6.1
**Date**: 2026-07-17

---

## 1. Principes de navigation clavier

### 1.1 Norme WCAG 2.2

| Critere | Description | Niveau |
|---------|-------------|--------|
| 2.1.1 Clavier | Toutes les fonctions utilisables au clavier | A |
| 2.1.2 Pas de piege clavier | Aucun piege clavier | A |
| 2.4.3 Ordre de focus | Ordre de focus logique | A |
| 2.4.7 Focus visible | Focus toujours visible | AA |

### 1.2 Touches de raccourci

| Touche | Action |
|--------|--------|
| Tab | Element suivant |
| Shift + Tab | Element precedent |
| Enter | Activer le lien ou bouton |
| Espace | Activer le bouton |
| Fleche bas | Element suivant (dans un groupe) |
| Fleche haut | Element precedent (dans un groupe) |
| Echap | Fermer la modale / dropdown |
| Home | Premier element (dans un groupe) |
| End | Dernier element (dans un groupe) |

---

## 2. Composants et navigation

### 2.1 Barre de recherche

| Touche | Action |
|--------|--------|
| Tab | Focus sur la barre de recherche |
| Entrer | Soumettre la recherche |
| Echap | Fermer les suggestions |
| Fleche bas | Selectionner suggestion suivante |
| Fleche haut | Selectionner suggestion precedente |
| Enter | Selectionner la suggestion |

### 2.2 Boutons

| Touche | Action |
|--------|--------|
| Tab | Focus sur le bouton |
| Enter | Activer le bouton |
| Espace | Activer le bouton |

### 2.3 Liens

| Touche | Action |
|--------|--------|
| Tab | Focus sur le lien |
| Enter | Naviguer vers la cible |

### 2.4 Select (Dropdown)

| Touche | Action |
|--------|--------|
| Tab | Focus sur le select |
| Espace / Enter | Ouvrir le dropdown |
| Fleche bas | Option suivante |
| Fleche haut | Option precedente |
| Enter | Selectionner l'option |
| Echap | Fermer le dropdown |

### 2.5 Modal

| Touche | Action |
|--------|--------|
| Tab | Focus dans la modale (piege) |
| Echap | Fermer la modale |
| Enter | Confirmer (si bouton focus) |

### 2.6 Pagination

| Touche | Action |
|--------|--------|
| Tab | Focus sur les boutons de pagination |
| Enter | Aller a la page |

### 2.7 Filtres

| Touche | Action |
|--------|--------|
| Tab | Focus sur les filtres |
| Espace | Activer/desactiver le filtre |
| Enter | Appliquer le filtre |

---

## 3. Ordre de focus

### 3.1 Page d'accueil

```
1. Barre de recherche
2. Bouton "Rechercher"
3. Liens de navigation
4. Contenu principal
5. Pied de page
```

### 3.2 Page de resultats

```
1. Barre de recherche
2. Bouton "Rechercher"
3. Filtres
4. Resultats (cliquables)
5. Pagination
6. Bouton "Comparer"
```

### 3.3 Page de fiche vehicule

```
1. Barre de recherche
2. Bouton "Rechercher"
3. Bouton "Comparer"
4. Bouton "Ajouter aux favoris"
5. Contenu de la fiche
6. Bouton "Retour"
```

### 3.4 Page comparateur

```
1. Barre de recherche
2. Bouton "Rechercher"
3. Vehicules (selectionnables)
4. Bouton "Retirer"
5. Bouton "Retour"
```

### 3.5 Page favoris

```
1. Barre de recherche
2. Bouton "Rechercher"
3. Vehicules (cliquables)
4. Bouton "Retirer des favoris"
5. Bouton "Retour"
```

---

## 4. Focus visible

### 4.1 Styles de focus

```css
/* Focus par defaut */
:focus { outline: 2px solid #3B82F6; outline-offset: 2px; }

/* Focus sur les boutons */
.btn:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}

/* Focus sur les liens */
a:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Focus sur les inputs */
input:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-color: #3B82F6;
}

/* Focus sur les selects */
select:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-color: #3B82F6;
}
```

### 4.2 Desactiver le focus (a eviter)

```css
/* ❌ JAMAIS faire */
:focus { outline: none; }

/* ✅ Acceptable seulement si un autre indicateur est present */
:focus:not(:focus-visible) { outline: none; }
:focus-visible { outline: 2px solid #3B82F6; }
```

---

## 5. Tests de navigation clavier

### 5.1 Script de test

```typescript
// tests/keyboard-navigation.test.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation clavier', () => {
  test('Tab sur la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    
    // Focus sur la barre de recherche
    await page.keyboard.press('Tab');
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
    
    // Focus sur le bouton
    await page.keyboard.press('Tab');
    const searchButton = page.locator('button:has-text("Rechercher")');
    await expect(searchButton).toBeFocused();
  });

  test('Navigation dans les suggestions', async ({ page }) => {
    await page.goto('/');
    
    // Taper une recherche
    await page.fill('input[type="search"]', 'SUV');
    await page.waitForSelector('[role="listbox"]');
    
    // Naviguer avec les fleches
    await page.keyboard.press('ArrowDown');
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toHaveAttribute('aria-selected', 'true');
    
    // Selectionner avec Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/results/);
  });

  test('Fermeture de la modale avec Echap', async ({ page }) => {
    await page.goto('/results');
    
    // Ouvrir un filtre
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verifier que la modale est ouverte
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Fermer avec Echap
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
```

### 5.2 Checklist manuelle

- [ ] Tab navigation fonctionne sur toutes les pages
- [ ] Focus toujours visible
- [ ] Ordre de focus logique
- [ ] Aucun piege clavier
- [ ] Echap ferme les modales
- [ ] Enter active les boutons
- [ ] Fleches naviguent dans les listes
- [ ] Pas de raccourci en conflit avec le navigateur

---

## 6. Accessibilite

### 6.1 ARIA

| Attribut | Usage | Exemple |
|----------|-------|---------|
| role="search" | Barre de recherche | `<form role="search">` |
| role="listbox" | Liste de suggestions | `<div role="listbox">` |
| role="option" | Option dans la liste | `<div role="option">` |
| role="dialog" | Modale | `<div role="dialog">` |
| aria-label | Label accessible | `<button aria-label="Fermer">` |
| aria-selected | Selection | `<div aria-selected="true">` |
| aria-expanded | Etat ouvert/ferme | `<button aria-expanded="true">` |
| aria-live | Mise a jour dynamique | `<div aria-live="polite">` |

### 6.2 Screen readers

| Composant | Annonce |
|-----------|---------|
| Barre de recherche | "Recherche, champ de texte" |
| Bouton | "Rechercher, bouton" |
| Resultat | "Vehicule, Dacia Sandero, 85 000 DH, 8.2 sur 10" |
| Filtre | "Filtre marque, coche" |
| Pagination | "Page 1 sur 5" |
| Modale | "Dialogue ouvert" |
| Score | "Score de correspondance, 85 pour cent" |

---

## 7. Tests automatises

### 7.1 axe-core

```javascript
// axe-core pour tests d'accessibilite
const axe = require('axe-core');

test('Aucune erreur d\'accessibilite', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(() => axe.run());
  expect(results.violations).toHaveLength(0);
});
```

### 7.2 Lighthouse

```bash
# Audit d'accessibilite
lighthouse http://localhost:3000 --only-categories=accessibility
```

### 7.3 playwright

```typescript
// Test de visibilite du focus
test('Focus visible sur tous les elements interactifs', async ({ page }) => {
  await page.goto('/');
  
  const interactiveElements = page.locator('button, a, input, select, [tabindex]');
  const count = await interactiveElements.count();
  
  for (let i = 0; i < count; i++) {
    const element = interactiveElements.nth(i);
    await element.focus();
    const outline = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle;
    });
    expect(outline).not.toBe('none');
  }
});
```
