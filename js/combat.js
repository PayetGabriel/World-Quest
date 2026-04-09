// ============================================================
// COMBAT.JS
// ============================================================

let combatEnCours = false;
let monumentEnCombat = null;

let cooldownAttaque = 0;
let cooldownEsquive = 0;
let timerGardien = 0;
let joueurEnDefense = false;
let inventaireOuvert = false;

const inventaire = {
  "potion-heal": 3,
  "potion-boost": 2
};

// Joueur dans la scène de combat
const combattant = {
  x: 200,
  y: 0,
  largeur: 100,   // 2x plus grand qu'avant
  hauteur: 160,
  velociteX: 0,
  velociteY: 0,
  auSol: false,
  regardeADroite: true,
  vitesse: 5,
  attackBoost: 0,
  attackBoostTours: 0
};

// Physique — saut plus haut, gravité moins forte
const GRAVITE = 0.45;
const FORCE_SAUT = -17;

// Canvas de combat
let canvasCombat = null;
let ctxCombat = null;

// Images du niveau de combat
let fondCombat = null;
let fondCombatCharge = false;
let collisionsImageData = null;
let collisionsLargeur = 0;
let collisionsHauteur = 0;
let collisionsCombatChargees = false;

// Animation sprite
let frameAnimCombat = 0;
let timerAnimCombat = 0;
const DUREE_FRAME_COMBAT = 150;

// Mapping id monument → nom du fichier dans assets/battle/
const FONDS_COMBAT = {
  "tour-eiffel":        "Fond Tour Effeil",
  "christ-redeempteur": "Rédempteur",
  "pyramides":          "Pyramides",
  "colisee":            "Colisée",
  "burj-khalifa":       "Burj Khalifa",
  "taj-mahal":          "Taj Mahal",
  "statue-liberte":     "Liberty",
  "acropole":           "Acropole d'Athènes",
  "kinkakuji":          "Kinkaku-Ji"
};

// Couleurs de collision (valeurs exactes transmises)
// Rouge  FF0000 → sol et murs solides
// Bleu   001EFF → plateformes traversables par le bas
// Vert   4CFF00 → zone vide → force saut

function demarrerCombat(monument) {
  combatEnCours = true;
  monumentEnCombat = monument;
  joueurEnDefense = false;
  timerGardien = 0;
  cooldownAttaque = 0;
  cooldownEsquive = 0;
  monument.gardien.hp = monument.gardien.hpMax;

  canvasCombat = document.getElementById("combat-canvas");
  canvasCombat.width = window.innerWidth;
  canvasCombat.height = window.innerHeight;
  ctxCombat = canvasCombat.getContext("2d");

  document.getElementById("combat-screen").style.display = "block";

  let nomFichier = FONDS_COMBAT[monument.id];
  if (nomFichier === undefined) {
    nomFichier = "Fond Tour Effeil";
  }

  fondCombatCharge = false;
  collisionsCombatChargees = false;
  collisionsImageData = null;

  fondCombat = new Image();
  fondCombat.src = "assets/battle/" + nomFichier + " HD.jpg";
  fondCombat.onload = function() {
    fondCombatCharge = true;
  };

  let imgCollisions = new Image();
  imgCollisions.src = "assets/battle/" + nomFichier + " Collisions.jpg";
  imgCollisions.onload = function() {
    let canvasTemp = document.createElement("canvas");
    canvasTemp.width = imgCollisions.width;
    canvasTemp.height = imgCollisions.height;
    let ctxTemp = canvasTemp.getContext("2d");
    ctxTemp.drawImage(imgCollisions, 0, 0);
    collisionsImageData = ctxTemp.getImageData(0, 0, imgCollisions.width, imgCollisions.height).data;
    collisionsLargeur = imgCollisions.width;
    collisionsHauteur = imgCollisions.height;
    collisionsCombatChargees = true;
    placerJoueurSurSol();
  };

  mettreAJourBarresCombat();
  mettreAJourInventaireAffichage();
}

// Spawn après fuite ou mort : 80px en dessous et décalé à gauche du monument
// Si c'est dans une collision, cherche la sortie la plus proche en spirale
function spawnerJoueurApresMonument(monument) {
  joueur.x = monument.x - 80;
  joueur.y = monument.y + 80;

  // D'abord descendre jusqu'à trouver un espace libre
  let tentatives = 0;
  while (estBloque(joueur.x, joueur.y) && tentatives < 150) {
    joueur.y = joueur.y + 1;
    tentatives = tentatives + 1;
  }

  if (!estBloque(joueur.x, joueur.y)) { return; }

  // Toujours bloqué : chercher au plus proche en spirale (cercles de rayon croissant)
  for (let rayon = 10; rayon <= 300; rayon = rayon + 10) {
    for (let angle = 0; angle < 360; angle = angle + 20) {
      let rad = angle * (Math.PI / 180);
      let testX = monument.x + Math.cos(rad) * rayon;
      let testY = monument.y + Math.sin(rad) * rayon;
      if (!estBloque(testX, testY)) {
        joueur.x = testX;
        joueur.y = testY;
        return;
      }
    }
  }
}

function terminerCombat(resultat) {
  combatEnCours = false;
  timerGardien = 0;
  document.getElementById("combat-screen").style.display = "none";
  inventaireOuvert = false;
  document.getElementById("inventory-screen").style.display = "none";

  // Vider les touches pour éviter le lag de déplacement
  let toutesLesTouches = Object.keys(touchesEnfoncees);
  for (let i = 0; i < toutesLesTouches.length; i++) {
    touchesEnfoncees[toutesLesTouches[i]] = false;
  }

  if (resultat === true) {
    monumentEnCombat.decouvert = true;
    donnerPointCompetence();
    mettreAJourSucces();
    debloquerZoneSuivante(monumentEnCombat.nom);
    afficherMessage("Monument découvert : " + monumentEnCombat.nom + " !");
    // Victoire : joueur reste à sa position overworld actuelle

  } else if (resultat === false) {
    joueur.hp = Math.floor(joueur.hpMax * 0.3);
    spawnerJoueurApresMonument(monumentEnCombat);
    mettreAJourHUDJoueur();
    afficherMessage("Tu as été vaincu... Tu repars avec 30% de vies.");

  } else if (resultat === "fuite") {
    spawnerJoueurApresMonument(monumentEnCombat);
    afficherMessage("Tu as fui le combat.");
  }

  fondCombatCharge = false;
  collisionsCombatChargees = false;
  collisionsImageData = null;
  monumentEnCombat = null;
}

// ---- Collisions ----

function getCouleurCollision(px, py) {
  if (collisionsImageData === null) {
    return { r: 255, v: 255, b: 255 };
  }
  if (px < 0 || py < 0 || px >= collisionsLargeur || py >= collisionsHauteur) {
    return { r: 255, v: 0, b: 0 };
  }
  let i = (py * collisionsLargeur + px) * 4;
  return {
    r: collisionsImageData[i],
    v: collisionsImageData[i + 1],
    b: collisionsImageData[i + 2]
  };
}

// Convertit une position écran → pixel dans l'image de collision
function ecranVersCollision(ex, ey) {
  return {
    px: Math.floor((ex / canvasCombat.width) * collisionsLargeur),
    py: Math.floor((ey / canvasCombat.height) * collisionsHauteur)
  };
}

function estSolide(ex, ey) {
  let coord = ecranVersCollision(ex, ey);
  let c = getCouleurCollision(coord.px, coord.py);
  // Rouge FF0000
  return c.r > 200 && c.v < 50 && c.b < 50;
}

function estPlateforme(ex, ey) {
  let coord = ecranVersCollision(ex, ey);
  let c = getCouleurCollision(coord.px, coord.py);
  // Bleu 001EFF — tolérance élargie car JPG compresse les couleurs
  // Le bleu doit dominer clairement, le rouge doit être très faible
  return c.b > 150 && c.r < 40 && c.v < 80;
}

function estVide(ex, ey) {
  let coord = ecranVersCollision(ex, ey);
  let c = getCouleurCollision(coord.px, coord.py);
  // Vert 4CFF00
  return c.v > 200 && c.r < 100 && c.b < 50;
}

// Teste uniquement le bas et les côtés du joueur contre les blocs solides
// On retire les coins du haut intentionnellement : pas de plafond
function joueurToucheSolide() {
  let margeX = 6;
  let bas = combattant.y + combattant.hauteur - 2;

  // Côtés : on teste quelques points à mi-hauteur pour les murs
  let milieu = combattant.y + combattant.hauteur * 0.6;

  let toucheBas = estSolide(combattant.x + margeX, bas) || estSolide(combattant.x + combattant.largeur - margeX, bas);
  let toucheMur = estSolide(combattant.x + margeX, milieu) || estSolide(combattant.x + combattant.largeur - margeX, milieu);

  return toucheBas || toucheMur;
}

// Le bas du joueur touche une plateforme bleue (seulement si on descend)
// On teste sur une plage de 4px en Y pour ne pas rater une ligne fine (2-3px)
function joueurSurPlateforme() {
  if (combattant.velociteY < 0) { return false; }

  let gauche = combattant.x + 8;
  let milieu = combattant.x + combattant.largeur / 2;
  let droite = combattant.x + combattant.largeur - 8;
  let bas    = combattant.y + combattant.hauteur;

  // On teste le bas exact + les 3 pixels juste en dessous
  for (let dy = 0; dy <= 3; dy++) {
    if (estPlateforme(gauche, bas + dy)) { return true; }
    if (estPlateforme(milieu, bas + dy)) { return true; }
    if (estPlateforme(droite, bas + dy)) { return true; }
  }
  return false;
}

// Le bas du joueur est dans une zone verte (vide)
function joueurSurVide() {
  let mx = combattant.x + combattant.largeur / 2;
  let bas = combattant.y + combattant.hauteur - 4;
  return estVide(mx, bas);
}

// Place le joueur sur le sol au lancement du combat
function placerJoueurSurSol() {
  combattant.x = canvasCombat.width * 0.15;
  combattant.y = 0;
  combattant.velociteX = 0;
  combattant.velociteY = 0;
  combattant.auSol = false;

  // Descend jusqu'à toucher le sol
  for (let testY = 0; testY < canvasCombat.height - combattant.hauteur; testY++) {
    combattant.y = testY;
    if (joueurToucheSolide()) {
      combattant.y = testY - 1;
      combattant.auSol = true;
      break;
    }
  }
}

// ---- Mise à jour physique ----

function mettreAJourCombat(deltaTime) {
  if (!combatEnCours) { return; }

  if (cooldownAttaque > 0) { cooldownAttaque = cooldownAttaque - deltaTime; }
  if (cooldownEsquive > 0) { cooldownEsquive = cooldownEsquive - deltaTime; }

  // Déplacement horizontal
  combattant.velociteX = 0;
  if (touchesEnfoncees["ArrowLeft"] || touchesEnfoncees["q"] || touchesEnfoncees["Q"]) {
    combattant.velociteX = -combattant.vitesse;
    combattant.regardeADroite = false;
  }
  if (touchesEnfoncees["ArrowRight"] || touchesEnfoncees["d"] || touchesEnfoncees["D"]) {
    combattant.velociteX = combattant.vitesse;
    combattant.regardeADroite = true;
  }

  // Saut
  if ((touchesEnfoncees["ArrowUp"] || touchesEnfoncees["z"] || touchesEnfoncees["Z"]) && combattant.auSol) {
    combattant.velociteY = FORCE_SAUT;
    combattant.auSol = false;
  }

  // Zone vide → force saut
  if (joueurSurVide() && combattant.auSol) {
    combattant.velociteY = FORCE_SAUT * 0.7;
    combattant.auSol = false;
  }

  // Gravité
  combattant.velociteY = combattant.velociteY + GRAVITE;

  // --- Déplacement horizontal + collision avec glissement sol penché ---
  combattant.x = combattant.x + combattant.velociteX;
  if (joueurToucheSolide()) {
    // Essayer de monter d'1 à 4px pour passer les petites marches / sols penchés
    let glisse = false;
    for (let montee = 1; montee <= 4; montee++) {
      combattant.y = combattant.y - 1;
      if (!joueurToucheSolide()) {
        glisse = true;
        break;
      }
    }
    if (!glisse) {
      // Vrai mur — annuler le déplacement et remettre y
      combattant.x = combattant.x - combattant.velociteX;
      combattant.y = combattant.y + 4; // remettre y à sa valeur d'avant
    }
  }
  if (combattant.x < 0) { combattant.x = 0; }
  if (combattant.x + combattant.largeur > canvasCombat.width) {
    combattant.x = canvasCombat.width - combattant.largeur;
  }

  // --- Déplacement vertical ---

  // On mémorise le bas avant le déplacement pour tester le trajet complet
  let basAvant = combattant.y + combattant.hauteur;

  combattant.y = combattant.y + combattant.velociteY;
  combattant.auSol = false;

  // Bord haut de l'écran — empêche de sortir et le crash qui va avec
  if (combattant.y < 0) {
    combattant.y = 0;
    combattant.velociteY = 0;
  }

  // Blocs solides — sol et murs, pas de plafond
  if (joueurToucheSolide()) {
    if (combattant.velociteY >= 0) {
      while (joueurToucheSolide()) { combattant.y = combattant.y - 1; }
      combattant.auSol = true;
    }
    // Si velociteY < 0 on laisse passer (pas de plafond)
    combattant.velociteY = 0;
  }

  // Plateforme one-way (bleue) : ignorée si on monte, active si on descend ou statique
  // On teste tout le trajet vertical parcouru ce frame pour ne pas rater les lignes fines
  if (!combattant.auSol && combattant.velociteY >= 0) {
    let basApres = combattant.y + combattant.hauteur;
    let gauche = combattant.x + 8;
    let milieu = combattant.x + combattant.largeur / 2;
    let droite = combattant.x + combattant.largeur - 8;

    // Convertir le trajet en pixels image
    let pyAvant = Math.floor((basAvant / canvasCombat.height) * collisionsHauteur);
    let pyApres = Math.floor((basApres / canvasCombat.height) * collisionsHauteur);
    let pxG = Math.floor((gauche / canvasCombat.width) * collisionsLargeur);
    let pxM = Math.floor((milieu / canvasCombat.width) * collisionsLargeur);
    let pxD = Math.floor((droite / canvasCombat.width) * collisionsLargeur);

    let touchePlateforme = false;
    let pyCollision = -1;

    // Scanner chaque ligne image entre basAvant et basApres
    for (let py = pyAvant; py <= pyApres + 1; py++) {
      let cG = getCouleurCollision(pxG, py);
      let cM = getCouleurCollision(pxM, py);
      let cD = getCouleurCollision(pxD, py);

      if ((cG.b > 150 && cG.r < 40 && cG.v < 80) ||
          (cM.b > 150 && cM.r < 40 && cM.v < 80) ||
          (cD.b > 150 && cD.r < 40 && cD.v < 80)) {
        touchePlateforme = true;
        pyCollision = py;
        break;
      }
    }

    if (touchePlateforme) {
      // Repositionner le joueur juste au-dessus de la ligne de collision
      let ecranYCollision = Math.floor((pyCollision / collisionsHauteur) * canvasCombat.height);
      combattant.y = ecranYCollision - combattant.hauteur;
      combattant.auSol = true;
      combattant.velociteY = 0;
    }
  }

  // Bord bas écran
  if (combattant.y + combattant.hauteur > canvasCombat.height) {
    combattant.y = canvasCombat.height - combattant.hauteur;
    combattant.auSol = true;
    combattant.velociteY = 0;
  }

  // --- Actions ---
  if ((touchesEnfoncees["a"] || touchesEnfoncees["A"]) && cooldownAttaque <= 0 && !inventaireOuvert) {
    attaquerGardien();
    cooldownAttaque = 800;
  }

  if ((touchesEnfoncees["e"] || touchesEnfoncees["E"]) && cooldownEsquive <= 0) {
    esquiver();
    cooldownEsquive = 1200;
  }

  if ((touchesEnfoncees["i"] || touchesEnfoncees["I"]) && cooldownAttaque <= 0) {
    basculerInventaireCombat();
    cooldownAttaque = 400;
  }

  if (inventaireOuvert) {
    if ((touchesEnfoncees["f"] || touchesEnfoncees["F"]) && cooldownAttaque <= 0) {
      useItem("potion-heal");
      cooldownAttaque = 500;
    }
    if ((touchesEnfoncees["g"] || touchesEnfoncees["G"]) && cooldownAttaque <= 0) {
      useItem("potion-boost");
      cooldownAttaque = 500;
    }
  }

  if (!joueurEnDefense) {
    gardienAttaque(deltaTime);
  }

  // Animation sprite
  timerAnimCombat = timerAnimCombat + deltaTime;
  if (timerAnimCombat >= DUREE_FRAME_COMBAT) {
    timerAnimCombat = 0;
    frameAnimCombat = (frameAnimCombat + 1) % 4;
  }
}

// ---- Dessin ----

function dessinerCombat() {
  if (!combatEnCours || ctxCombat === null) { return; }

  let larg = canvasCombat.width;
  let haut = canvasCombat.height;

  ctxCombat.clearRect(0, 0, larg, haut);

  if (fondCombatCharge) {
    ctxCombat.drawImage(fondCombat, 0, 0, larg, haut);
  } else {
    ctxCombat.fillStyle = "#1a2a1a";
    ctxCombat.fillRect(0, 0, larg, haut);
  }

  dessinerJoueurCombat();
  dessinerHUDCombat();
}

function dessinerJoueurCombat() {
  if (!spritesheetChargee || spritesheetJoueur === null) {
    ctxCombat.fillStyle = "#2980b9";
    ctxCombat.fillRect(combattant.x, combattant.y, combattant.largeur, combattant.hauteur);
    return;
  }

  // Sprite marche_profil : ligne 2 bloc gauche, 4 frames de 245px large x 272px haut
  let scaleX = spritesheetJoueur.width / 2000;
  let scaleY = spritesheetJoueur.height / 1091;

  let col = frameAnimCombat % 4;
  let sx = col * 245 * scaleX;
  let sy = 2 * 272 * scaleY;
  let sw = 245 * scaleX;
  let sh = 272 * scaleY;

  let ratio = sh / sw;
  let affW = combattant.largeur;
  let affH = affW * ratio;
  let affX = combattant.x;
  let affY = combattant.y + combattant.hauteur - affH;

  if (!combattant.regardeADroite) {
    ctxCombat.save();
    ctxCombat.translate(affX + affW, affY);
    ctxCombat.scale(-1, 1);
    ctxCombat.drawImage(spritesheetJoueur, sx, sy, sw, sh, 0, 0, affW, affH);
    ctxCombat.restore();
  } else {
    ctxCombat.drawImage(spritesheetJoueur, sx, sy, sw, sh, affX, affY, affW, affH);
  }
}

// HUD dessiné sur le canvas de combat (pas de DOM)
function dessinerHUDCombat() {
  if (monumentEnCombat === null) { return; }

  let larg = canvasCombat.width;
  let gardien = monumentEnCombat.gardien;

  // Fond bande en bas
  ctxCombat.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctxCombat.fillRect(0, canvasCombat.height - 90, larg, 90);

  // Barre joueur (gauche)
  dessinerBarreHP(30, canvasCombat.height - 65, 200, 20, joueur.hp, joueur.hpMax, "#5a9a5a", "Joueur");

  // Barre gardien (droite)
  dessinerBarreHP(larg - 230, canvasCombat.height - 65, 200, 20, gardien.hp, gardien.hpMax, "#9a5a5a", gardien.nom);

  // Log au centre
  ctxCombat.fillStyle = "rgba(255,255,255,0.85)";
  ctxCombat.font = "14px Arial";
  ctxCombat.textAlign = "center";
  let logEl = document.getElementById("combat-log");
  if (logEl !== null) {
    ctxCombat.fillText(logEl.textContent, larg / 2, canvasCombat.height - 45);
  }

  // Contrôles hint
  ctxCombat.fillStyle = "rgba(255,255,255,0.4)";
  ctxCombat.font = "11px Arial";
  ctxCombat.fillText("A = Attaquer   E = Esquiver   I = Inventaire   Échap = Fuir", larg / 2, canvasCombat.height - 15);
  ctxCombat.textAlign = "left";
}

function dessinerBarreHP(x, y, largeur, hauteur, hp, hpMax, couleur, nom) {
  // Fond
  ctxCombat.fillStyle = "#333";
  ctxCombat.fillRect(x, y, largeur, hauteur);

  // Remplissage
  let pourcent = Math.max(0, hp / hpMax);
  ctxCombat.fillStyle = couleur;
  ctxCombat.fillRect(x, y, largeur * pourcent, hauteur);

  // Bordure
  ctxCombat.strokeStyle = "rgba(255,255,255,0.3)";
  ctxCombat.lineWidth = 1;
  ctxCombat.strokeRect(x, y, largeur, hauteur);

  // Texte
  ctxCombat.fillStyle = "#fff";
  ctxCombat.font = "11px Arial";
  ctxCombat.fillText(nom + "  " + hp + "/" + hpMax, x, y - 4);
}

// ---- Actions gardien / joueur ----

function attaquerGardien() {
  let gardien = monumentEnCombat.gardien;
  let attaqueTotale = joueur.attaque + combattant.attackBoost;
  let degats = Math.max(1, attaqueTotale - gardien.defense + Math.floor(Math.random() * 8));
  gardien.hp = gardien.hp - degats;

  if (combattant.attackBoostTours > 0) {
    combattant.attackBoostTours = combattant.attackBoostTours - 1;
    if (combattant.attackBoostTours === 0) { combattant.attackBoost = 0; }
  }

  if (gardien.hp <= 0) {
    gardien.hp = 0;
    afficherLog("Victoire ! Le gardien est vaincu !");
    setTimeout(function() { terminerCombat(true); }, 1400);
    return;
  }

  afficherLog("Tu attaques pour " + degats + " dégâts !");
  mettreAJourBarresCombat();
}

function gardienAttaque(deltaTime) {
  timerGardien = timerGardien + deltaTime;
  if (timerGardien < 1500) { return; }
  timerGardien = 0;

  let gardien = monumentEnCombat.gardien;
  let degats = Math.max(1, gardien.attaque - 3 + Math.floor(Math.random() * 7));
  joueur.hp = joueur.hp - degats;

  if (joueur.hp <= 0) {
    joueur.hp = 0;
    mettreAJourHUDJoueur();
    afficherLog("Le gardien vous a vaincu !");
    setTimeout(function() { terminerCombat(false); }, 1500);
    return;
  }

  afficherLog("Le gardien attaque : -" + degats + " PV !");
  mettreAJourBarresCombat();
  mettreAJourHUDJoueur();
}

function esquiver() {
  joueurEnDefense = true;
  afficherLog("Tu esquives la prochaine attaque !");
  timerGardien = 0;
  setTimeout(function() { joueurEnDefense = false; }, 1000);
}

function basculerInventaireCombat() {
  inventaireOuvert = !inventaireOuvert;
  document.getElementById("inventory-screen").style.display = inventaireOuvert ? "block" : "none";
  if (inventaireOuvert) { mettreAJourInventaireAffichage(); }
}

function mettreAJourInventaireAffichage() {
  let h = document.getElementById("count-potion-heal");
  let b = document.getElementById("count-potion-boost");
  if (h !== null) { h.textContent = "x" + inventaire["potion-heal"]; }
  if (b !== null) { b.textContent = "x" + inventaire["potion-boost"]; }
}

function useItem(type) {
  if (type === "potion-heal") {
    if (inventaire["potion-heal"] <= 0) { afficherLog("Plus de potions de soin !"); return; }
    inventaire["potion-heal"] = inventaire["potion-heal"] - 1;
    joueur.hp = Math.min(joueur.hp + 30, joueur.hpMax);
    afficherLog("Potion de soin utilisée : +30 PV !");
    mettreAJourBarresCombat();
    mettreAJourHUDJoueur();
  }
  if (type === "potion-boost") {
    if (inventaire["potion-boost"] <= 0) { afficherLog("Plus de potions de boost !"); return; }
    inventaire["potion-boost"] = inventaire["potion-boost"] - 1;
    combattant.attackBoost = 10;
    combattant.attackBoostTours = 5;
    afficherLog("Potion de boost activée : +10 ATT pour 5 attaques !");
  }
  mettreAJourInventaireAffichage();
}

function afficherLog(texte) {
  let el = document.getElementById("combat-log");
  if (el !== null) { el.textContent = texte; }
}

function mettreAJourBarresCombat() {
  // Les barres DOM ne sont plus utilisées visuellement (HUD canvas)
  // On met quand même à jour pour le mode dev (touche K)
  let fillJ = document.getElementById("player-combat-hp-fill");
  let textJ = document.getElementById("player-combat-hp-text");
  if (fillJ !== null) { fillJ.style.width = (joueur.hp / joueur.hpMax * 100) + "%"; }
  if (textJ !== null) { textJ.textContent = joueur.hp + "/" + joueur.hpMax; }

  if (monumentEnCombat === null) { return; }
  let gardien = monumentEnCombat.gardien;
  let fillG = document.getElementById("enemy-combat-hp-fill");
  let textG = document.getElementById("enemy-combat-hp-text");
  if (fillG !== null) { fillG.style.width = (gardien.hp / gardien.hpMax * 100) + "%"; }
  if (textG !== null) { textG.textContent = gardien.hp + "/" + gardien.hpMax; }
}

// Fuite via Échap
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape" && combatEnCours) {
    terminerCombat("fuite");
  }
});