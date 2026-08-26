# SLEIPNIR - Modele Financier 3 Ans

**Ref**: VV-SLP-2026-001
**Date**: 2026-07-17
**Devise**: MAD (Dirham marocain)

---

## 1. Hypotheses

### 1.1 Hypotheses commerciales

| Parametre | Annee 1 | Annee 2 | Annee 3 | Source |
|-----------|---------|---------|---------|--------|
| Utilisateurs mensuels (fin d'annee) | 2 000 | 15 000 | 50 000 | Projection SEO + bouche-a-oreille |
| Taux conversion premium | 5% | 8% | 12% | Benchmarks SaaS Maroc |
| Panier moyen premium | 190 DH/mois | 190 DH/mois | 210 DH/mois | Ajustement inflation |
| Leads concessionnaires/mois | 20 | 150 | 500 | Croissance progressive |
| CAC moyen | 30 DH | 25 DH | 20 DH | Economie d'echelle SEO |
| Churn mensuel premium | 8% | 6% | 5% | Amelioration produit |

### 1.2 Hypotheses techniques

| Parametre | Valeur | Justification |
|-----------|--------|---------------|
| Couts infrastructure/mois | 0 DH (Annee 1) | Vercel Free + dataset fallback |
| Couts LLM/mois | 50 DH (Annee 1) | GPT-4o-mini, 1000 requetes/jour |
| Couts Whisper/mois | 25 DH (Annee 1) | 500 transferts vocaux/mois |
| Couts total tech/mois | 75 DH (Annee 1) | Phase 1 minimale |

### 1.3 Hypotheses RH

| Poste | Salaire brut/mois | Charges (30%) | Total/mois |
|-------|-------------------|---------------|------------|
| Developpeur Senior | 15 000 DH | 4 500 DH | 19 500 DH |
| Developpeur Junior | 8 000 DH | 2 400 DH | 10 400 DH |
| Chef de projet | 18 000 DH | 5 400 DH | 23 400 DH |

---

## 2. Compte de resultat (3 ans)

### Annee 1

| Poste | Montant (DH) | Details |
|-------|--------------|---------|
| **REVENUS** | | |
| Abonnements premium | 456 000 | 2 000 users x 5% x 190 DH x 12 |
| Leads concessionnaires | 12 000 | 20 leads/mois x 50 DH x 12 |
| Sponsoring | 0 | Pas en Phase 1 |
| **Total revenus** | **468 000** | |
| **CHARGES** | | |
| Salaires (2 developpeurs) | 249 600 | 2 x 10 400 x 12 |
| Infrastructure | 900 | 75 DH/mois x 12 |
| Marketing/SEO | 60 000 | 5 000 DH/mois |
| Juridique/comptabilite | 12 000 | 1 000 DH/mois |
| Divers | 18 000 | 1 500 DH/mois |
| **Total charges** | **340 500** | |
| **Resultat brut** | **127 500** | |
| Impots (15% pour PME) | 19 125 | |
| **Resultat net** | **108 375** | |

### Annee 2

| Poste | Montant (DH) | Details |
|-------|--------------|---------|
| **REVENUS** | | |
| Abonnements premium | 3 240 000 | 15 000 users x 8% x 190 x 12 |
| Leads concessionnaires | 90 000 | 150 leads/mois x 50 DH x 12 |
| Sponsoring | 120 000 | 2 concessionnaires x 5 000 x 12 |
| **Total revenus** | **3 450 000** | |
| **CHARGES** | | |
| Salaires (5 personnes) | 1 014 000 | 3 seniors + 2 juniors |
| Infrastructure | 12 000 | Vercel Pro + Supabase Pro |
| LLM + Voice | 3 600 | 300 DH/mois x 12 |
| Marketing/SEO | 180 000 | 15 000 DH/mois |
| Juridique/comptabilite | 24 000 | 2 000 DH/mois |
| Bureau | 60 000 | 5 000 DH/mois |
| Divers | 36 000 | 3 000 DH/mois |
| **Total charges** | **1 329 600** | |
| **Resultat brut** | **2 120 400** | |
| Impots (15%) | 318 060 | |
| **Resultat net** | **1 802 340** | |

### Annee 3

| Poste | Montant (DH) | Details |
|-------|--------------|---------|
| **REVENUS** | | |
| Abonnements premium | 12 096 000 | 50 000 users x 12% x 210 x 12 |
| Leads concessionnaires | 300 000 | 500 leads/mois x 50 DH x 12 |
| Sponsoring | 360 000 | 6 concessionnaires x 5 000 x 12 |
| Marketplace (Phase 3) | 500 000 | Commissions sur ventes |
| **Total revenus** | **13 256 000** | |
| **CHARGES** | | |
| Salaires (8 personnes) | 1 872 000 | + business + data engineer |
| Infrastructure | 60 000 | Scale auto |
| LLM + Voice | 18 000 | 1 500 DH/mois x 12 |
| Marketing/SEO | 360 000 | 30 000 DH/mois |
| Juridique/comptabilite | 36 000 | 3 000 DH/mois |
| Bureau | 120 000 | 10 000 DH/mois |
| Divers | 72 000 | 6 000 DH/mois |
| **Total charges** | **2 538 000** | |
| **Resultat brut** | **10 718 000** | |
| Impots (15%) | 1 607 700 | |
| **Resultat net** | **9 110 300** | |

---

## 3. Tresorerie

| Critere | Annee 1 | Annee 2 | Annee 3 |
|---------|---------|---------|---------|
| Tresorerie debut | 0 | 108 375 | 1 910 715 |
| Flux libre | 108 375 | 1 802 340 | 9 110 300 |
| Tresorerie fin | 108 375 | 1 910 715 | 11 021 015 |
| Point mort (cumul) | Mois 8 | Mois 14 | Atteint An 2 |

---

## 4. CAC, LTV et Retour

| Critere | Valeur | Calcul |
|---------|--------|--------|
| CAC organique | 30 DH | Marketing / nouveaux clients |
| CAC payant | 150 DH | Ads / nouveaux clients |
| CAC mixte | 45 DH | Moyenne ponderee |
| LTV premium | 3 174 DH | 190 DH x (1/churn) x retention |
| LTV/CAC | 70x | LTV / CAC mixte |
| Delai retour CAC | 0.2 mois | CAC / panier moyen mensuel |
| Marge brute | 85% | (Revenu - Cout tech) / Revenu |

---

## 5. Plan de financement

| Poste | Montant (DH) | Source |
|-------|--------------|--------|
| Seed (auto-financement) | 100 000 | Fondateurs |
| Revenue Annee 1 | 468 000 | Operations |
| **Total disponible An 1** | **568 000** | |
| Besoin total An 1 | 340 500 | Charges |
| **Excédent An 1** | **227 500** | Report An 2 |

Pas de levée nécessaire pour le MVP. Le produit est auto-financable dès l'Année 1.

---

## 6. Analyse de sensibilite

### Scenario pessimiste (-30% revenus)

| Critere | Base | Pessimiste |
|---------|------|------------|
| Revenus An 1 | 468 000 | 327 600 |
| Charges An 1 | 340 500 | 340 500 |
| Resultat net | 108 375 | -10 103 |
| Point mort | Mois 8 | Non atteint An 1 |

### Scenario optimiste (+50% revenus)

| Critere | Base | Optimiste |
|---------|------|-----------|
| Revenus An 1 | 468 000 | 702 000 |
| Charges An 1 | 340 500 | 340 500 |
| Resultat net | 108 375 | 307 575 |
| Point mort | Mois 8 | Mois 5 |

---

## 7. Hypotheses isolees

Chaque constante est explicite et modifiable :

```
HYPOTHESES = {
  users_y1: 2000,           // Utilisateurs fin annee 1
  premium_rate_y1: 0.05,    // Taux conversion premium
  premium_price: 190,       // Panier moyen DH/mois
  lead_price: 50,           // Prix par lead DH
  leads_per_month_y1: 20,   // Leads concessionnaires/mois
  cac_organic: 30,          // Cac organique DH
  churn_monthly_y1: 0.08,   // Churn mensuel
  dev_salary_junior: 8000,  // Salaire brut developpeur junior
  infra_monthly: 75,        // Couts infra/mois DH
  llm_monthly: 50,          // Couts LLM/mois DH
  tax_rate: 0.15,           // Taux imposition PME
}
```

**Aucune constante n'est codee en dur dans une formule.**
