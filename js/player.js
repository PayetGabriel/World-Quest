// Position du joueur sur la MAP (pas sur l'écran)
// Spawn : à droite de la Tour Eiffel, sur le chemin près des 4 pierres
const joueur = {
  x: 2318,
  y: 1003,
  vitesse: 4,
  hpMax: 100,
  hp: 100,
  attaque: 15,
  attackBoost: 0,
  attackBoostTours: 0,
  taille: 7    // rayon du joueur pour les collisions
};

// Touches actuellement enfoncées
const touchesEnfoncees = {};

document.addEventListener("keydown", function(event) {
  touchesEnfoncees[event.key] = true;
});

document.addEventListener("keyup", function(event) {
  touchesEnfoncees[event.key] = false;
});

function deplacerJoueur() {
  let dx = 0;
  let dy = 0;

  if (touchesEnfoncees["ArrowLeft"] || touchesEnfoncees["q"] || touchesEnfoncees["Q"]) {
    dx = -joueur.vitesse;
  }
  if (touchesEnfoncees["ArrowRight"] || touchesEnfoncees["d"] || touchesEnfoncees["D"]) {
    dx = joueur.vitesse;
  }
  if (touchesEnfoncees["ArrowUp"] || touchesEnfoncees["z"] || touchesEnfoncees["Z"]) {
    dy = -joueur.vitesse;
  }
  if (touchesEnfoncees["ArrowDown"] || touchesEnfoncees["s"] || touchesEnfoncees["S"]) {
    dy = joueur.vitesse;
  }

  /// Offset pour remonter la hitbox du joueur (collision plus haute que les pieds)
  const offsetCollisionY = -10;

  // On teste d'abord le déplacement horizontal
  const nouveauX = joueur.x + dx;
  if (!estBloque(nouveauX, joueur.y + offsetCollisionY)) {
    joueur.x = nouveauX;
  }

  // Puis le déplacement vertical séparément
  // (comme ça on peut glisser le long des murs)
  const nouveauY = joueur.y + dy;
  if (!estBloque(joueur.x, nouveauY + offsetCollisionY)) {
    joueur.y = nouveauY;
  }

  // On empêche le joueur de sortir de la map
  if (joueur.x < 0) { joueur.x = 0; }
  if (joueur.y < 0) { joueur.y = 0; }
  if (joueur.x > MAP_LARGEUR) { joueur.x = MAP_LARGEUR; }
  if (joueur.y > MAP_HAUTEUR) { joueur.y = MAP_HAUTEUR; }
}

// Dessine le joueur au centre de l'écran (la caméra le suit)
function dessinerJoueur(ctx) {
  const pos = mapVersEcran(joueur.x, joueur.y);

  // On essaie d'abord le sprite
  const spriteDessiné = dessinerSprite(ctx, pos.x, pos.y);

  // Si le sprite n'est pas chargé, on dessine les formes basiques
  if (!spriteDessiné) {
    ctx.fillStyle = "#2980b9";
    ctx.fillRect(pos.x - 5, pos.y - 7, 10, 14);

    ctx.fillStyle = "#c8a87a";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function mettreAJourHUDJoueur() {
  const pourcentage = (joueur.hp / joueur.hpMax) * 100;

  const barre = document.getElementById("player-combat-hp-fill");
  const texte = document.getElementById("player-combat-hp-text");

  if (barre !== null) {
    barre.style.width = pourcentage + "%";
  }

  if (texte !== null) {
    texte.textContent = joueur.hp + "/" + joueur.hpMax;
  }
}

// Après une fuite ou une mort, le joueur peut se retrouver dans une collision
// Cette fonction cherche le point libre le plus proche en spirale autour du joueur
function sortirDeLaCollision() {
  if (!estBloque(joueur.x, joueur.y)) {
    return;
  }

  // On teste des cercles de rayon croissant autour du joueur
  for (let rayon = 10; rayon <= 200; rayon += 10) {
    // On teste 16 points régulièrement espacés sur ce cercle
    for (let angle = 0; angle < 360; angle += 22) {
      const radians = angle * (Math.PI / 180);
      const testX = joueur.x + Math.cos(radians) * rayon;
      const testY = joueur.y + Math.sin(radians) * rayon;

      if (!estBloque(testX, testY)) {
        joueur.x = testX;
        joueur.y = testY;
        return;
      }
    }
  }
}
