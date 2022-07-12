# Norme des Contributions au projet

Nous avons choisi d'imposer certaines règles aux contributions afin d'harmoniser les fichier uploadés et faciliter la production.

### Branches

Plusieurs branches ont été crées dans l'objectif de réduire les soucis de merge et de bugs:
- Les branches contributeurs séparant le progrès des differents développeurs pour éviter les conflits.
- La branche Dev visant à regrouper le travail des développeurs pour les phases de testing.
- La branche Main contenant exclusivement les versions fonctionnelles du projet.

### Contributions

#### Conditions des contributions

Les commits doivent être réalisés dans 2 situations:
- Un avancement considérable a été effectué et doit être testé
- Une fin de session de travail (sous reserve que le commit soit fonctionnel ou le(s) problème(s) clairement indiqué(s))

#### Norme des contributions

La norme est la suivante: *git commit -m "[...] Titre clair" -m "Description rapide" (plusieurs -m si nécessaire)*
- **[ADD]**: Ajout fonctionnel et suffisamment important
- **[EDIT]**: Modification d'une fonctionnalité déjà présente
- **[BUG]**: (contextuel) Un problème est présent dans le code. Doit être clairement identifié
- **[FIX]**: Résolution d'un problème préalablement identifié
- **[MERGE]**: Indique un merge nécesaire (branches Dev et Main uniquement)
- **[DELETE]**: Suppression de code ou de fonctionnalité

### Disclaimer

Merci de garder en tête que cette norme a été mise en place dans le but d'éviter les commit intempestifs. Toute contribution aux branches Dev et Main doivent être discutées au préalable avec tous les membres de l'équipe concernés.