# Analyse juridique et réglementaire

## SLEIPNIR - Plateforme IA d'achat et de vente automobile

Réf. VV-SLP-2026-001 · Volund Ventures SARL

---

## 1. Cadre juridique applicable

### 1.1 Protection des données personnelles

**Loi 09-08** relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.

| Aspect | Application SLEIPNIR | Conformité |
|--------|----------------------|------------|
| Base légale du traitement | Intérêt légitime (amélioration du service) et consentement (avis utilisateurs) | Conforme |
| Finalité | Recherche automobile, e-réputation, amélioration du moteur de matching | Conforme |
| Minimisation | Seules les données nécessaires au service sont collectées | Conforme |
| Durée de conservation | Données de navigation : 12 mois. Avis publiés : 24 mois. Logs : 6 mois | Conforme |
| Droits des personnes | Accès, rectification, suppression, opposition | Conforme (API dédiée prévue Phase 2) |
| Autorité de contrôle | CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) | — |

**Registre des traitements** : Ouvert au jalon M2, contient :
- Traitement des requêtes de recherche (logs anonymisés)
- Traitement des avis utilisateurs (pseudonymisation)
- Traitement des données de navigation (cookies strictement nécessaires)

### 1.2 Propriété intellectuelle et collecte de données

| Source | Statut juridique | Action requise |
|--------|-----------------|----------------|
| Auto24.ma | API publique disponible | Vérifier conditions d'utilisation, documenter en ADR |
| SoeezAuto.ma | Scraping HTML | Vérifier robots.txt, pas de clause d'interdiction explicite |
| Avito.ma | Scraping HTML | Attention : SPA, scraping possible mais à documenter |
| Sites constructeurs | Fiches techniques publiques | Informations publiques, pas de restriction identifiée |
| Presse automobile | Articles et tests | Citation avec source, pas de reproduction intégrale |

**Règle Volund** : Aucune source n'entre en production sans une ligne de conclusion écrite sur sa licéité.

### 1.3 Droits d'auteur et propriété intellectuelle

- **Code source** : Propriété de Volund Ventures SARL (cession signée au J0)
- **Nom commercial, marque, logotype** : Propriété de Volund Ventures SARL
- **Données collectées** : Propriété de Volund Ventures SARL
- **Corpus d'avis** : Propriété de Volund Ventures SARL
- **Modèles d'entraînement** : Propriété de Volund Ventures SARL

### 1.4 Licéité de la collecte web scraping

**Principe général** : Le scraping de données publiques est autorisé tant qu'il respecte :
1. Le robots.txt du site cible
2. Les conditions d'utilisation du site
3. Le droit des producteurs de bases de données
4. La charge serveur raisonnable (temporisation, horaires creux)

**Pour chaque source, la vérification inclut** :
- Existence et contenu du robots.txt
- Clause d'interdiction explicite du scraping dans les CGU
- Existence d'une API officielle alternative
- Risque de retrait judiciaire évalué

### 1.5 Lutte contre le blanchiment (Phase 3 uniquement)

**Loi 43-05** relative à la lutte contre le blanchiment de capitaux.

- **ANRF** (Autorité Nationale du Renseignement Financier) : autorité compétente
- **Applicable uniquement à la Phase 3** (paiement séquestre, KYC)
- **Pas d'applicabilité à la Phase 1** (pas de transaction financière)
- Les acronymes des cadres étrangers (AML, KYC européens) ne doivent pas apparaître dans les documents

### 1.6 Établissements de paiement (Phase 3 uniquement)

**Loi 103-12** (loi bancaire marocaine) :

- Le séquestre de fonds nécessite un agrément de Bank Al-Maghrib
- Alternative : adossement contractuel à un établissement déjà agréé
- **Sujet d'agrément, pas de développement** : note de 2 pages en M3
- Aucune ligne de code dédiée au paiement en Phase 1

### 1.7 Immatriculation et transfert de propriété

**NARSA** (Agence Nationale de la Sécurité Routière) :
- Immatriculation et mutation relèvent de la NARSA
- Aucune API publique de mutation ouverte à un tiers privée
- **Conséquence** : Aucune automatisation du transfert de propriété n'est possible

---

## 2. Conformité OWASP Top 10

| Risque | Mesure SLEIPNIR |
|--------|-----------------|
| A01 - Broken Access Control | Authentification par tokens, contrôle d'accès côté serveur |
| A02 - Cryptographic Failures | Mots de passe hashés (bcrypt), HTTPS obligatoire |
| A03 - Injection | Requêtes paramétrées (TypeORM), validation des entrées |
| A04 - Insecure Design | Threat modeling STRIDE documenté (ADR-007) |
| A05 - Security Misconfiguration | Variables d'environnement, pas de secrets dans le code |
| A06 - Vulnerable Components | Dépendances auditées, mise à jour régulière |
| A07 - Auth Failures | Rate limiting sur les endpoints d'authentification |
| A08 - Data Integrity | Validation des données entrantes (class-validator) |
| A09 - Logging Failures | Logs structurés, observabilité (ADR-009) |
| A10 - SSRF | Pas d' URLs utilisateur en entrée côté serveur |

---

## 3. Threat Modeling STRIDE

| Menace | Description | Mitigation |
|--------|-------------|------------|
| **S**poofing | Usurpation d'identité via la barre de recherche | Validation des entrées, pas d'exécution de code |
| **T**ampering | Manipulation des données de recherche | Validation côté serveur, signatures |
| **R**epudiation | Négation d'actions | Logs d'audit horodatés |
| **I**nformation Disclosure | Fuite de données personnelles | Anonymisation des avis, chiffrement |
| **D**enial of Service | Attaque par déni de service | Rate limiting, cache, CDN |
| **E**levation of Privilege | Escalade de privilèges | Contrôle d'accès rôle par rôle |

---

## 4. Injection de prompt (LLM)

La barre de recherche est une entrée utilisateur libre qui alimente directement le moteur NLP.

**Mesures de protection** :
1. Validation longueur maximale (500 caractères)
2. Filtrage des caractères spéciaux
3. Sanitisation des entrées avant traitement
4. Rate limiting par IP
5. Monitoring des patterns d'attaque connus

**Test prévu** : Revue avec Volund avant le M5, sur des cas d'attaque documentés.

---

## 5. Manipulation du baromètre

**Risque identifié** : Un concessionnaire pourrait tenter de manipuler le baromètre en publiant de faux avis.

**Mesures architecturales** :
1. Détection de spam et d'astroturfing (patterns de publication)
2. Vérification de l'historique de publication par IP
3. Seuil minimal de 30 avis avant publication du score
4. Modération humaine possible
5. Traçabilité de chaque avis (source, horodatage)

---

## 6. Propriété intellectuelle du rapport universitaire

- Le rapport peut décrire le travail réalisé
- Interdiction de divulguer : identifiants, secrets, clés d'API, URLs internes, contrats, données clients
- Le modèle financier ne peut pas être inclus en version publique
- Autorisation écrite de diffusion requise (section 13 du cahier des charges)

---

## 7. Conclusion

Le projet SLEIPNIR Phase 1 est conforme au cadre juridique marocain applicable. Les principaux sujets de vigilance sont :

1. **Licéité de la collecte** : vérification source par source avant mise en production
2. **Protection des données personnelles** : registre des traitements ouvert, anonymisation des avis
3. **Injection de prompt** : garde-fous documentés et testés

Les sujets Phase 3 (paiement, KYC, séquestre) sont des sujets d'agrément, pas de développement.

---

*Document établi le 16 juillet 2026 par Volund Ventures SARL*
*Réf. VV-SLP-2026-001 · v1.0 · Confidentiel*
