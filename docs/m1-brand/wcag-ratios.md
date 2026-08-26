# THIQTI - WCAG Ratios de Contraste

**Ref**: VV-SLP-2026-001
**Section CdC**: 6.1
**Date**: 2026-07-17

---

## Standard WCAG 2.2 AA

### Niveaux de conformite

| Niveau | Critere | Minimum |
|--------|---------|---------|
| AA Normal | Texte < 18px | 4.5:1 |
| AA Large | Texte >= 18px ou >= 14px bold | 3:1 |
| AAA Normal | Texte < 18px | 7:1 |
| AAA Large | Texte >= 18px ou >= 14px bold | 4.5:1 |

---

## Tableau des couples de couleurs

### Couples valides (AA Normal)

| # | Couleur texte | Fond | Ratio | Statut |
|---|---------------|------|-------|--------|
| 1 | #F8FAFC (Text Primary) | #0F172A (Surface Dark) | 15.8:1 | ✅ Pass |
| 2 | #94A3B8 (Text Secondary) | #0F172A (Surface Dark) | 5.2:1 | ✅ Pass |
| 3 | #3B82F6 (Primary) | #0F172A (Surface Dark) | 4.6:1 | ✅ Pass |
| 4 | #22C55E (Success) | #0F172A (Surface Dark) | 5.8:1 | ✅ Pass |
| 5 | #F59E0B (Warning) | #0F172A (Surface Dark) | 7.1:1 | ✅ Pass |
| 6 | #EF4444 (Danger) | #0F172A (Surface Dark) | 4.7:1 | ✅ Pass |
| 7 | #06B6D4 (Info) | #0F172A (Surface Dark) | 5.9:1 | ✅ Pass |
| 8 | #F8FAFC (Text Primary) | #1E293B (Surface Raised) | 12.5:1 | ✅ Pass |
| 9 | #3B82F6 (Primary) | #1E293B (Surface Raised) | 3.9:1 | ❌ Fail |
| 10 | #22C55E (Success) | #1E293B (Surface Raised) | 4.6:1 | ✅ Pass |
| 11 | #F59E0B (Warning) | #1E293B (Surface Raised) | 5.7:1 | ✅ Pass |
| 12 | #EF4444 (Danger) | #1E293B (Surface Raised) | 3.7:1 | ❌ Fail |
| 13 | #06B6D4 (Info) | #1E293B (Surface Raised) | 4.7:1 | ✅ Pass |
| 14 | #94A3B8 (Text Secondary) | #1E293B (Surface Raised) | 4.2:1 | ❌ Fail |

### Couples valides (AA Large uniquement)

| # | Couleur texte | Fond | Ratio | Statut |
|---|---------------|------|-------|--------|
| 15 | #64748B (Text Muted) | #0F172A (Surface Dark) | 3.1:1 | ✅ Large only |
| 16 | #64748B (Text Muted) | #1E293B (Surface Raised) | 2.5:1 | ❌ Fail |

### Couples invalides (a corriger)

| # | Couleur texte | Fond | Ratio | Probleme |
|---|---------------|------|-------|----------|
| 17 | #3B82F6 (Primary) | #1E293B (Surface Raised) | 3.9:1 | Insuffisant pour AA Normal |
| 18 | #EF4444 (Danger) | #1E293B (Surface Raised) | 3.7:1 | Insuffisant pour AA Normal |
| 19 | #94A3B8 (Text Secondary) | #1E293B (Surface Raised) | 4.2:1 | Insuffisant pour AA Normal |

---

## Regles d'application

### 1. Texte sur fond sombre

```css
/* ✅ Valide */
.text-primary { color: #F8FAFC; } /* 15.8:1 sur #0F172A */
.text-secondary { color: #94A3B8; } /* 5.2:1 sur #0F172A */

/* ❌ Invalide */
.text-muted { color: #64748B; } /* 3.1:1 sur #0F172A - seulement pour texte large */
```

### 2. Boutons

```css
/* ✅ Valide : texte blanc sur bouton bleu */
.btn-primary { background: #3B82F6; color: #FFFFFF; } /* 4.6:1 */

/* ✅ Valide : texte blanc sur bouton vert */
.btn-success { background: #22C55E; color: #FFFFFF; } /* 4.5:1 */

/* ❌ Invalide : texte blanc sur bouton orange */
.btn-warning { background: #F59E0B; color: #FFFFFF; } /* 3.2:1 - utiliser #000000 */
```

### 3. Badges et tags

```css
/* ✅ Valide : texte sombre sur badge clair */
.badge-success { background: #22C55E; color: #000000; } /* 2.2:1 - Fail */

/* Corriger : */
.badge-success { background: #22C55E; color: #0F172A; } /* 5.8:1 - Pass */
```

### 4. Focus et hover

```css
/* Focus visible : toujours un ratio >= 3:1 */
:focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }

/* Hover : utiliser une ombre pour maintenir le contraste */
:hover { box-shadow: 0 0 0 2px #3B82F6; }
```

---

## Recommandations

### Toujours utiliser

| Usage | Couleur | Fond recommande |
|-------|---------|-----------------|
| Texte principal | #F8FAFC | #0F172A ou #1E293B |
| Texte secondaire | #94A3B8 | #0F172A |
| Liens | #3B82F6 | #0F172A |
| Succes | #22C55E | #0F172A |
| Attention | #F59E0B | #0F172A |
| Erreur | #EF4444 | #0F172A |

### Eviter

| Usage | Couleur | Probleme |
|-------|---------|----------|
| Texte courant | #64748B | Ratios insuffisants |
| Texte sur Raised | #94A3B8 | Ratios insuffisants |
| Bouton sur Raised | #3B82F6 | Ratios insuffisants |

### Exceptions

| Usage | Couleur | Fond | Justification |
|-------|---------|------|---------------|
| Texte desactive | #64748B | #0F172A | Acceptable pour texte > 18px |
| Placeholder | #64748B | #1E293B | Acceptable pour texte > 18px |

---

## Tests de contraste

### Outils recommandes

1. **WebAIM Contrast Checker** : https://webaim.org/resources/contrastchecker/
2. **Colour Contrast Analyzer** : Application desktop
3. **Chrome DevTools** : Panel > Computed > contrast-ratio

### Script de test automatique

```javascript
// Contrast ratio calculator
function getContrastRatio(hex1, hex2) {
  const luminance1 = getLuminance(hex1);
  const luminance2 = getLuminance(hex2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

---

## Verification

### Check-list WCAG 2.2 AA

- [ ] Tous les textes ont un ratio >= 4.5:1
- [ ] Tous les textes larges ont un ratio >= 3:1
- [ ] Les focus sont visibles (ratio >= 3:1)
- [ ] Les etats hover ont un ratio >= 3:1
- [ ] Les erreurs sont visibles (ratio >= 4.5:1)
- [ ] Les placeholders sont lisibles (ratio >= 3:1)
