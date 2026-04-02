let combatEnCours = false;
let monumentEnCombat = null;
let joueurEnDefense = false;
let inventaireOuvert = false;

// Cooldown pour éviter d'appuyer trop vite
let cooldownAttaque = 0;
let cooldownEsquive = 0;

// Inventaire du joueur
const inventaire = {
  "potion-heal": 3,
  "potion-boost": 2
};

function demarrerCombat(monument) {
  combatEnCours = true;
  monumentEnCombat = monument;
  joueurEnDefense = false;

  // On remet les HP du gardien à fond
  monument.gardien.hp = monument.gardien.hpMax;

  document.getElementById("combat-screen").style.display = "flex";
  document.getElementById("enemy-name").textContent = monument.gardien.nom;
  document.getElementById("player-name").textContent = "Joueur";

  afficherLog("Le " + monument.gardien.nom + " vous barre la route !");
  mettreAJourBarresCombat();
  mettreAJourInventaireAffichage();
}

// resultat = true    : victoire, monument validé
// resultat = false   : défaite, pénalité sur les PV
// resultat = "fuite" : fuite, pas de pénalité, monument non validé
function terminerCombat(resultat) {
  combatEnCours = false;
  timerGardien = 0;
  document.getElementById("combat-screen").style.display = "none";
  inventaireOuvert = false;
  document.getElementById("inventory-screen").style.display = "none";

  if (resultat === true) {
    monumentEnCombat.decouvert = true;
    donnerPointCompetence();
    mettreAJourSucces();
    debloquerZoneSuivante(monumentEnCombat.nom);
    afficherMessage("Monument découvert : " + monumentEnCombat.nom + " !");
  } else if (resultat === false) {
    joueur.hp = Math.floor(joueur.hpMax * 0.3);
    joueur.y = joueur.y + 80;
    sortirDeLaCollision();
    mettreAJourHUDJoueur();
    afficherMessage("Tu as été vaincu... Tu repars avec 30% de vies.");
  } else if (resultat === "fuite") {
    joueur.y = joueur.y + 80;
    sortirDeLaCollision();
    afficherMessage("Tu as fui le combat.");
  }

  monumentEnCombat = null;
}

function afficherLog(texte) {
  document.getElementById("combat-log").textContent = texte;
}

function mettreAJourBarresCombat() {
  const pourcJoueur = (joueur.hp / joueur.hpMax) * 100;
  document.getElementById("player-combat-hp-fill").style.width = pourcJoueur + "%";
  document.getElementById("player-combat-hp-text").textContent = joueur.hp + "/" + joueur.hpMax;

  const gardien = monumentEnCombat.gardien;
  const pourcGardien = (gardien.hp / gardien.hpMax) * 100;
  document.getElementById("enemy-combat-hp-fill").style.width = pourcGardien + "%";
  document.getElementById("enemy-combat-hp-text").textContent = gardien.hp + "/" + gardien.hpMax;
}

// Appelée dans la boucle principale à chaque frame
function mettreAJourCombat(deltaTime) {
  if (!combatEnCours) {
    return;
  }

  if (cooldownAttaque > 0) {
    cooldownAttaque = cooldownAttaque - deltaTime;
  }
  if (cooldownEsquive > 0) {
    cooldownEsquive = cooldownEsquive - deltaTime;
  }

  // Touche A = attaquer
  if (touchesEnfoncees["a"] || touchesEnfoncees["A"]) {
    if (cooldownAttaque <= 0) {
      attaquerGardien();
      cooldownAttaque = 800; // ms avant de pouvoir réattaquer
    }
  }

  // Touche E = esquiver (se mettre en défense temporairement)
  if (touchesEnfoncees["e"] || touchesEnfoncees["E"]) {
    if (cooldownEsquive <= 0) {
      esquiver();
      cooldownEsquive = 1200;
    }
  }

  // Touche I = ouvrir/fermer inventaire
  if (touchesEnfoncees["i"] || touchesEnfoncees["I"]) {
    if (cooldownAttaque <= 0) {
      basculerInventaire();
      cooldownAttaque = 400;
    }
  }

  // Touches d'utilisation d'objets quand l'inventaire est ouvert
  if (inventaireOuvert) {
    if (touchesEnfoncees["f"] || touchesEnfoncees["F"]) {
      if (cooldownAttaque <= 0) {
        useItem("potion-heal");
        cooldownAttaque = 500;
      }
    }
    if (touchesEnfoncees["g"] || touchesEnfoncees["G"]) {
      if (cooldownAttaque <= 0) {
        useItem("potion-boost");
        cooldownAttaque = 500;
      }
    }
  }

  // Le gardien attaque tout seul toutes les 1.5 secondes
  if (joueurEnDefense === false) {
    gardienAttaque(deltaTime);
  }
}

// Timer pour les attaques du gardien
let timerGardien = 0;

function gardienAttaque(deltaTime) {
  timerGardien = timerGardien + deltaTime;

  if (timerGardien >= 1500) {
    timerGardien = 0;

    const gardien = monumentEnCombat.gardien;
    const degats = Math.max(1, gardien.attaque - 3 + Math.floor(Math.random() * 7));
    joueur.hp = joueur.hp - degats;

    if (joueur.hp <= 0) {
      joueur.hp = 0;
      mettreAJourBarresCombat();
      mettreAJourHUDJoueur();
      afficherLog("Le gardien vous a vaincu !");
      setTimeout(function() {
        terminerCombat(false);
      }, 1500);
      return;
    }

    afficherLog("Le gardien attaque : -" + degats + " PV !");
    mettreAJourBarresCombat();
    mettreAJourHUDJoueur();
  }
}

function attaquerGardien() {
  if (inventaireOuvert) {
    return;
  }

  const gardien = monumentEnCombat.gardien;
  const attaqueTotale = joueur.attaque + joueur.attackBoost;
  const degats = Math.max(1, attaqueTotale - gardien.defense + Math.floor(Math.random() * 8));
  gardien.hp = gardien.hp - degats;

  if (gardien.hp <= 0) {
    gardien.hp = 0;
    mettreAJourBarresCombat();
    afficherLog("Victoire ! Le gardien est vaincu !");
    setTimeout(function() {
      terminerCombat(true);
    }, 1400);
    return;
  }

  // Diminue le boost d'attaque au fil des tours
  if (joueur.attackBoostTours > 0) {
    joueur.attackBoostTours = joueur.attackBoostTours - 1;
    if (joueur.attackBoostTours === 0) {
      joueur.attackBoost = 0;
    }
  }

  afficherLog("Tu attaques pour " + degats + " dégâts !");
  mettreAJourBarresCombat();
}

function esquiver() {
  joueurEnDefense = true;
  afficherLog("Tu esquives la prochaine attaque !");
  timerGardien = 0;

  setTimeout(function() {
    joueurEnDefense = false;
  }, 1000);
}

function basculerInventaire() {
  inventaireOuvert = !inventaireOuvert;

  if (inventaireOuvert) {
    document.getElementById("inventory-screen").style.display = "block";
    mettreAJourInventaireAffichage();
  } else {
    document.getElementById("inventory-screen").style.display = "none";
  }
}

function mettreAJourInventaireAffichage() {
  document.getElementById("count-potion-heal").textContent = "x" + inventaire["potion-heal"];
  document.getElementById("count-potion-boost").textContent = "x" + inventaire["potion-boost"];
}

// Appelée par les boutons HTML ou les touches clavier
function useItem(type) {
  if (type === "potion-heal") {
    if (inventaire["potion-heal"] <= 0) {
      afficherLog("Plus de potions de soin !");
      return;
    }
    inventaire["potion-heal"] = inventaire["potion-heal"] - 1;
    joueur.hp = joueur.hp + 30;
    if (joueur.hp > joueur.hpMax) {
      joueur.hp = joueur.hpMax;
    }
    afficherLog("Potion de soin utilisée : +30 PV !");
    mettreAJourBarresCombat();
    mettreAJourHUDJoueur();
  }

  if (type === "potion-boost") {
    if (inventaire["potion-boost"] <= 0) {
      afficherLog("Plus de potions de boost !");
      return;
    }
    inventaire["potion-boost"] = inventaire["potion-boost"] - 1;
    joueur.attackBoost = 10;
    joueur.attackBoostTours = 5;
    afficherLog("Potion de boost activée : +10 ATT pour 5 attaques !");
  }

  mettreAJourInventaireAffichage();
}

// Échap = fuite immédiate, pas de délai, pas de pénalité
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape" && combatEnCours) {
    terminerCombat("fuite");
  }
});
