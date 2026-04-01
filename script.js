/* ==============================
   CHARGEMENT DES DONNÉES JSON
   Au début je pensais écrire mes cartes
   directement en HTML comme je l'avais fait,
   mais le prof nous a expliqué qu'en vrai
   les sites chargent leurs produits depuis
   une base de données (ou un fichier JSON).
   J'ai donc appris à utiliser fetch() pour
   lire le fichier data.json depuis JavaScript.
   ============================== */
 
// Cette variable va stocker tous les parfums chargés depuis le JSON
let tousLesParfums = [];
 
// Cette variable stocke les parfums qui passent les filtres actifs
let parfumsFiltres = [];
 
// fetch() envoie une requête pour lire le fichier JSON
// .then() c'est ce qu'on fait "ensuite" quand la réponse arrive
// J'ai eu du mal à comprendre pourquoi il fallait deux .then() :
// le premier convertit la réponse brute en objet JS, le second utilise les données
fetch("data.json")
  .then(function (reponse) {
    return reponse.json();
  })
  .then(function (data) {
    tousLesParfums = data.items;
    parfumsFiltres = tousLesParfums;
 
    afficherCartes(tousLesParfums);
    mettreAJourCompteur(tousLesParfums.length);
    configurerFiltres();
    configurerTri();
  })
  .catch(function (erreur) {
    // Si le fichier JSON est introuvable ou mal formaté, on affiche un message
    console.error("Erreur lors du chargement des données :", erreur);
  });
 
 
/* ==============================
   GÉNÉRATION DES CARTES
   J'ai d'abord essayé de faire
   document.write() mais ça effaçait toute
   la page ! J'ai appris qu'il fallait
   utiliser innerHTML pour injecter du HTML
   dans un élément existant.
   ============================== */
 
function afficherCartes(parfums) {
  // On sélectionne la grille du catalogue (pas celle des recommandations)
  const grille = document.querySelector(".catalogue .grille-produits");
 
  // Si aucun résultat, on affiche un message
  if (parfums.length === 0) {
    grille.innerHTML = "<p style='color:#888; font-style:italic;'>Aucun parfum ne correspond à votre sélection.</p>";
    return;
  }
 
  // On vide la grille avant d'y injecter les nouvelles cartes
  // Problème rencontré : sans cette ligne, les cartes s'ajoutaient en double à chaque filtre
  grille.innerHTML = "";
 
  // Pour chaque parfum dans le tableau, on crée une carte HTML
  parfums.forEach(function (parfum) {
    // On construit le HTML de la carte comme une chaîne de texte
    // J'ai utilisé les "template literals" (les backticks `) pour écrire
    // plusieurs lignes sans avoir à concaténer avec des +
    const carteHTML = `
      <div class="carte" data-nom="${parfum.name}" data-brand="${parfum.brand}">
        <div class="image-produit">
          <img src="${parfum.image}" alt="${parfum.name}" />
        </div>
        <p class="marque">${parfum.brand}</p>
        <p class="nom">${parfum.name}</p>
        <p class="famille">${parfum.famille}</p>
        <div class="pied-carte">
          <span class="prix">${parfum.price.toFixed(2)} €</span>
          <button class="btn-coeur" onclick="toggleFavori(this)">♡</button>
        </div>
      </div>
    `;
 
    // On ajoute la carte à la grille
    grille.innerHTML += carteHTML;
  });
}
 
 
/* ==============================
   COMPTEUR DE RÉSULTATS
   J'ai sélectionné l'élément avec
   querySelector et .textContent pour
   changer le texte sans toucher au HTML
   ============================== */
 
function mettreAJourCompteur(nombre) {
  const compteur = document.querySelector(".nb-resultats");
  // Si un seul résultat, on écrit "résultat" au singulier
  if (nombre <= 1) {
    compteur.textContent = nombre + " résultat";
  } else {
    compteur.textContent = nombre + " résultats";
  }
}
 
 
/* ==============================
   BOUTON FAVORI (CŒUR)
   J'ai essayé d'abord avec .style.color
   directement, mais c'était difficile de
   savoir si le cœur était déjà actif ou non.
   J'ai finalement utilisé classList.toggle()
   qui ajoute ou retire une classe CSS automatiquement.
   ============================== */
 
function toggleFavori(bouton) {
  bouton.classList.toggle("favori-actif");
 
  // On change le symbole selon l'état
  if (bouton.classList.contains("favori-actif")) {
    bouton.textContent = "♥"; // Cœur plein = ajouté aux favoris
    bouton.style.color = "#C9A96E";
    bouton.style.borderColor = "#C9A96E";
  } else {
    bouton.textContent = "♡"; // Cœur vide = retiré des favoris
    bouton.style.color = "#888";
    bouton.style.borderColor = "#e0e0e0";
  }
}
 
 
/* ==============================
   FILTRES
   Problème principal : je voulais que
   plusieurs filtres fonctionnent ensemble.
   Par exemple : "Femme" ET "Floral" en même temps.
   J'ai donc créé un objet "filtresActifs" qui
   mémorise toutes les cases cochées,
   puis j'applique tous les filtres d'un coup.
   ============================== */
 
// Objet qui stocke l'état des filtres actifs
// J'utilise des tableaux vides pour dire "aucun filtre actif pour l'instant"
let filtresActifs = {
  genre: [],
  marque: [],
  famille: []
};
 
function configurerFiltres() {
  // On sélectionne toutes les cases à cocher dans la barre de filtres
  const cases = document.querySelectorAll(".filtres input[type='checkbox']");
 
  // Pour chaque case, on écoute le clic
  cases.forEach(function (uneCase) {
    uneCase.addEventListener("change", function () {
      // On récupère le groupe (genre, marque ou famille)
      const groupe = uneCase.closest(".groupe-filtre");
      const titreGroupe = groupe.querySelector(".titre-filtre").textContent.trim();
 
      // On lit la valeur (le texte du label)
      const valeur = uneCase.parentElement.textContent.trim();
 
      // Selon le titre du groupe, on met à jour le bon tableau dans filtresActifs
      if (titreGroupe === "GENRE") {
        mettreAJourTableauFiltres(filtresActifs.genre, valeur, uneCase.checked);
      } else if (titreGroupe === "MARQUE") {
        mettreAJourTableauFiltres(filtresActifs.marque, valeur, uneCase.checked);
      } else if (titreGroupe === "FAMILLE OLFACTIVE") {
        mettreAJourTableauFiltres(filtresActifs.famille, valeur, uneCase.checked);
      }
 
      // On applique tous les filtres actifs
      appliquerFiltres();
    });
  });
}
 
// Ajoute ou retire une valeur d'un tableau de filtres
function mettreAJourTableauFiltres(tableau, valeur, estCoche) {
  if (estCoche) {
    tableau.push(valeur); // on ajoute le filtre
  } else {
    // On retire la valeur du tableau avec indexOf + splice
    // Problème : j'avais essayé filter() mais splice() marche mieux ici
    const index = tableau.indexOf(valeur);
    if (index > -1) {
      tableau.splice(index, 1);
    }
  }
}
 
function appliquerFiltres() {
  // On repart de la liste complète à chaque application de filtre
  parfumsFiltres = tousLesParfums.filter(function (parfum) {
 
    // Filtre genre : si aucun genre coché, on accepte tout
    const genreOK = filtresActifs.genre.length === 0
      || filtresActifs.genre.includes(parfum.gender);
 
    // Filtre marque : même logique
    const marqueOK = filtresActifs.marque.length === 0
      || filtresActifs.marque.some(function (m) {
          return parfum.brand.toLowerCase().includes(m.toLowerCase());
        });
 
    // Filtre famille olfactive : même logique
    const familleOK = filtresActifs.famille.length === 0
      || filtresActifs.famille.some(function (f) {
          return parfum.famille.toLowerCase().includes(f.toLowerCase());
        });
 
    // Le parfum est accepté seulement si les 3 filtres passent
    return genreOK && marqueOK && familleOK;
  });
 
  // On réapplique le tri en cours avant d'afficher
  appliquerTri();
  mettreAJourCompteur(parfumsFiltres.length);
}
 
 
/* ==============================
   TRI PAR PRIX / NOM
   J'ai utilisé la méthode .sort() de JavaScript
   sur une copie du tableau (slice()) pour ne pas
   modifier l'ordre d'origine des données.
   La fonction de comparaison dans sort() me
   donnait du fil à retordre : j'ai compris
   qu'il faut retourner un nombre négatif, 0
   ou positif selon l'ordre voulu.
   ============================== */
 
// Variable qui mémorise le tri actuel
let triActuel = "prix-croissant";
 
function configurerTri() {
  const boutonsTri = document.querySelectorAll(".filtres input[type='radio']");
 
  boutonsTri.forEach(function (bouton) {
    bouton.addEventListener("change", function () {
      // On lit le texte du label pour savoir quel tri choisir
      const labelTexte = bouton.parentElement.textContent.trim();
 
      if (labelTexte === "Prix croissant") {
        triActuel = "prix-croissant";
      } else if (labelTexte === "Prix décroissant") {
        triActuel = "prix-decroissant";
      } else if (labelTexte === "Nom A - Z") {
        triActuel = "nom-az";
      } else if (labelTexte === "Nom Z - A") {
        triActuel = "nom-za";
      }
 
      appliquerTri();
    });
  });
}
 
function appliquerTri() {
  // On travaille sur une copie pour ne pas altérer parfumsFiltres
  let parfumsTries = parfumsFiltres.slice();
 
  if (triActuel === "prix-croissant") {
    parfumsTries.sort(function (a, b) { return a.price - b.price; });
  } else if (triActuel === "prix-decroissant") {
    parfumsTries.sort(function (a, b) { return b.price - a.price; });
  } else if (triActuel === "nom-az") {
    parfumsTries.sort(function (a, b) { return a.name.localeCompare(b.name); });
  } else if (triActuel === "nom-za") {
    parfumsTries.sort(function (a, b) { return b.name.localeCompare(a.name); });
  }
 
  afficherCartes(parfumsTries);
}