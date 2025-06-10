# 📚 Examens Bac Informatique Tunisie

## 📁 Structure des Dossiers

Chaque matière a son propre dossier avec les examens organisés par année et session :

```
public/exams/
├── math/
├── sciences_physiques/
├── programmation_theorique/
├── programmation_pratique/
├── sti_theorique/
├── sti_pratique/
├── francais/
├── arabe/
├── anglais/
├── philosophie/
├── allemand/
└── exams-database.json
```

## 📄 Convention de Nommage des Fichiers PDF

Format : `{matiere}_{annee}_{session}.pdf`

Exemples :
- `math_2023_principale.pdf`
- `math_2023_controle.pdf`
- `programmation_theorique_2022_principale.pdf`
- `sti_pratique_2023_controle.pdf`

## 🔧 Corrections (Optionnel)

Format : `{matiere}_{annee}_{session}_correction.pdf`

Exemples :
- `math_2023_principale_correction.pdf`
- `francais_2022_principale_correction.pdf`

## 📋 Comment Ajouter de Nouveaux Examens

1. **Ajouter le fichier PDF** dans le dossier approprié
2. **Mettre à jour** `exams-database.json` avec les informations du nouvel examen
3. **Respecter** la convention de nommage
4. **Tester** que le fichier est accessible via l'interface web

## 🎯 Statuts des Examens

- **available: true** - Examen disponible au téléchargement
- **available: false** - Examen bientôt disponible
- **correction** - Fichier de correction disponible (optionnel)

## 📊 Matières Disponibles

1. **Mathématiques** (coeff: 3)
2. **Sciences Physiques** (coeff: 2)
3. **Programmation Théorique** (coeff: 3)
4. **Programmation Pratique** (coeff: 3)
5. **STI Théorique** (coeff: 3)
6. **STI Pratique** (coeff: 3)
7. **Français** (coeff: 1)
8. **Arabe** (coeff: 1)
9. **Anglais** (coeff: 1)
10. **Philosophie** (coeff: 1)
11. **Allemand** (coeff: 1) - Optionnel
