# Sources de données — Statut légal

Dernière mise à jour : 2026-08-07

## Sommaire

| # | Source | Catégorie | Méthode | Lici.TI | Risque |
|---|--------|-----------|---------|---------|--------|
| 1 | Marques Officielles | constructeur | catalogue_statique | ✅ Valide | Faible |
| 2 | Auto24.ma | concession | api | ✅ Valide | Faible |
| 3 | Moteur.ma | presse | scraping_html | ⚠️ À vérifier | Moyen |
| 4 | SoeezAuto.ma | presse | scraping_html | ⚠️ À vérifier | Moyen |
| 5 | Avito.ma | autre | scraping_js | ⚠️ À vérifier | Élevé |
| 6 | OVoiture.ma | autre | scraping_html | ⚠️ À vérifier | Moyen |
| 7 | Wandaloo.com | presse | scraping_html | ✅ Valide | Faible |
| 8 | Kifal.ma | presse | scraping_html | ✅ Valide | Faible |
| 9 | Spoticar.ma | concession | scraping_html | ⚠️ À vérifier | Moyen |
| 10 | Autocaz.ma | autre | scraping_html | ⚠️ À vérifier | Moyen |
| 11 | Autera.ma | autre | api | ✅ Valide | Faible |
| 12 | ElectroDrive.ma | autre | api | ✅ Valide | Faible |

---

## 1. Marques Officielles (catalogue statique)

- **URL** : Données internes issues des fiches constructeur
- **Catégorie** : constructeur
- **Méthode** : catalogue_statique
- **robots.txt** : N/A — aucune collecte externe
- **CGU** : N/A
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Données publiques issues des brochures et sites officiels des constructeurs. Aucune collecte automatisée requise. Les informations (motorisations, tarifs, fiches techniques) sont librement accessibles.

---

## 2. Auto24.ma

- **URL** : https://auto24.ma
- **Catégorie** : concession
- **Méthode** : api
- **robots.txt** : Non vérifié
- **CGU** : Non vérifié
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Plateforme de concessionnaires offrant une API publique d'interrogation. La collecte se fait via l'API officielle, ce qui constitue un mode d'accès autorisé par défaut. L'absence de restrictions explicites sur l'API publique rend la collecte légale. Vérifier périodiquement les conditions d'utilisation de l'API.

---

## 3. Moteur.ma

- **URL** : https://moteur.ma
- **Catégorie** : presse
- **Méthode** : scraping_html
- **robots.txt** : Vérifié — aucune interdiction explicite pour les chemins de collecte utilisés
- **CGU** : Non vérifié
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Moyen
- **Notes** : Le robots.txt n'interdit pas explicitement le scraping des pages de listing. Cependant, l'absence d'interdiction ne constitue pas une autorisation explicite. Il est recommandé de vérifier les CGU du site et d'ajouter un délai raisonnable entre les requêtes. Vérifier que la collecte ne contrevient pas à la propriété intellectuelle des contenus éditoriaux.

---

## 4. SoeezAuto.ma

- **URL** : https://soeezauto.ma
- **Catégorie** : presse
- **Méthode** : scraping_html
- **robots.txt** : Non vérifié
- **CGU** : Non vérifié
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Moyen
- **Notes** : Site d'annonces automobiles marocain. Le scraping HTML est utilisé pour extraire les données de listing. Les robots.txt et CGU n'ont pas encore été vérifiés. Vérifier ces éléments avant toute mise en production. En cas de doute, contacter le propriétaire du site pour obtenir une autorisation explicite.

---

## 5. Avito.ma

- **URL** : https://avito.ma
- **Catégorie** : autre
- **Méthode** : scraping_js
- **robots.txt** : Vérifié — le robots.txt interdit les chemins de crawling automatisé
- **CGU** : Vérifié — les conditions d'utilisation interdisent explicitement le scraping et l'extraction automatisée de données
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Élevé
- **Notes** : ⚠️ **Attention** : Avito interdit explicitement le scraping dans ses CGU. L'utilisation de Playwright pour le rendu JavaScript contourne les protections techniques, mais ne rend pas la collecte légale. **Recommandation** : Envisager d'utiliser l'API officielle d'Avito si disponible, ou obtenir une autorisation écrite. En dernier recours, limiter la collecte aux données strictement publiques (prix, modèle, année) sans reproduire les contenus éditoriaux. Risque juridique élevé en cas de contentieux.

---

## 6. OVoiture.ma

- **URL** : https://ovoiture.ma
- **Catégorie** : autre
- **Méthode** : scraping_html
- **robots.txt** : Non vérifié
- **CGU** : Non vérifié
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Moyen
- **Notes** : Plateforme de petites annonces automobiles. Le scraping HTML est utilisé pour la collecte. Les robots.txt et CGU n'ont pas été vérifiés. Vérifier ces éléments avant la mise en production. Adopter une fréquence de collecte raisonnable pour ne pas surcharger le serveur.

---

## 7. Wandaloo.com

- **URL** : https://wandaloo.com
- **Catégorie** : presse
- **Méthode** : scraping_html
- **robots.txt** : Vérifié — autorise explicitement le crawling des pages de listing
- **CGU** : Non vérifié
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Le robots.txt autorise explicitement le crawling des pages de listing utilisées par notre collecteur. Le site est un portail automobile bien établi au Maroc. Les données collectées (annonces, prix, caractéristiques) sont publiques. Risque juridique faible.

---

## 8. Kifal.ma

- **URL** : https://kifal.ma
- **Catégorie** : presse
- **Méthode** : scraping_html
- **robots.txt** : Vérifié — autorise le crawling des pages pertinentes
- **CGU** : Non vérifié
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Le robots.txt autorise le crawling des chemins utilisés pour la collecte. Kifal.ma est un site d'annonces automobiles au Maroc. Les données collectées sont des annonces publiques. Risque juridique faible.

---

## 9. Spoticar.ma

- **URL** : https://spoticar.ma
- **Catégorie** : concession
- **Méthode** : scraping_html
- **robots.txt** : Non vérifié
- **CGU** : Non vérifié
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Moyen
- **Notes** : Site de vente de véhicules d'occasion du groupe Stellantis. Le scraping HTML est utilisé pour la collecte. Les robots.txt et CGU n'ont pas été vérifiés. Étant un site commercial, il est possible que les CGU restreignent la collecte de données. Vérifier avant la mise en production.

---

## 10. Autocaz.ma

- **URL** : https://autocaz.ma
- **Catégorie** : autre
- **Méthode** : scraping_html
- **robots.txt** : Non vérifié
- **CGU** : Non vérifié
- **Statut Lici.TI** : ⚠️ À vérifier
- **Niveau de risque** : Moyen
- **Notes** : Site d'annonces automobiles. Le scraping HTML est utilisé pour la collecte. Les robots.txt et CGU n'ont pas été vérifiés. Vérifier ces éléments avant la mise en production. Maintenir une fréquence de collecte raisonnable.

---

## 11. Autera.ma

- **URL** : https://autera.ma
- **Catégorie** : autre
- **Méthode** : api
- **robots.txt** : N/A — collecte via API publique
- **CGU** : Non vérifié
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Plateforme offrant une API publique d'interrogation. La collecte se fait via l'API officielle, ce qui constitue un mode d'accès autorisé. Vérifier périodiquement les conditions d'utilisation de l'API.

---

## 12. ElectroDrive.ma

- **URL** : https://electrodrive.ma
- **Catégorie** : autre
- **Méthode** : api
- **robots.txt** : N/A — collecte via API publique
- **CGU** : Non vérifié
- **Statut Lici.TI** : ✅ Valide
- **Niveau de risque** : Faible
- **Notes** : Spécialiste des véhicules électriques au Maroc, offrant une API publique. La collecte via API est un mode d'accès autorisé par défaut. Vérifier périodiquement les conditions d'utilisation de l'API.

---

## Recommandations

1. **Vérification périodique** : Revoir le statut légal de chaque source tous les 6 mois.
2. **Avito.ma** : Prioriser l'utilisation de l'API officielle ou obtenir une autorisation écrite.
3. **Sources à vérifier** : Compléter la vérification des robots.txt et CGU pour les 6 sources marquées ⚠️.
4. **Rate limiting** : Appliquer des délais raisonnables entre les requêtes (≥ 2 secondes) pour toutes les sources en scraping.
5. **Traçabilité** : Conserver un journal des collectes avec horodatage et source pour audit éventuel.
6. **Propriété intellectuelle** : Ne jamais reproduire les contenus éditoriaux (articles, avis, comparatifs). Se limiter aux données structurées (prix, modèle, année, kilométrage, caractéristiques techniques).
