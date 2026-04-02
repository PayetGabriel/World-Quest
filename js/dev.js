let devModeActif = false;
let afficherCollisions = false;
let canvasDev = null;
let ctxDev = null;
let panneauDev = null;

// Appelée depuis main.js une fois tout le reste initialisé
function initialiserDev() {
  canvasDev = document.createElement("canvas");
  canvasDev.width = CANVAS_LARGEUR;
  canvasDev.height = CANVAS_HAUTEUR;
  canvasDev.style.position = "absolute";
  canvasDev.style.top = "0";
  canvasDev.style.left = "0";
  canvasDev.style.pointerEvents = "none";
  canvasDev.style.display = "none";
  canvasDev.style.zIndex = "25";
  document.getElementById("game-wrapper").appendChild(canvasDev);

  ctxDev = canvasDev.getContext("2d");

  panneauDev = document.createElement("div");
  panneauDev.style.position = "absolute";
  panneauDev.style.top = "10px";
  panneauDev.style.right = "10px";
  panneauDev.style.background = "rgba(0, 0, 0, 0.85)";
  panneauDev.style.border = "1px solid #f0c040";
  panneauDev.style.borderRadius = "8px";
  panneauDev.style.padding = "10px 14px";
  panneauDev.style.color = "white";
  panneauDev.style.fontSize = "12px";
  panneauDev.style.display = "none";
  panneauDev.style.lineHeight = "1.8";
  panneauDev.style.zIndex = "999";
  panneauDev.innerHTML = `
    <div style="color:#f0c040;font-size:13px;margin-bottom:6px;">MODE DEV</div>
    <div><b>O</b> — Afficher/cacher collisions</div>
    <div><b>K</b> — Remettre PV a fond</div>
    <div><b>L</b> — Tuer le boss en cours</div>
    <div style="margin-top:8px;color:#888;font-size:11px;">P pour fermer</div>
  `;
  document.getElementById("game-wrapper").appendChild(panneauDev);

  document.addEventListener("keydown", function(event) {

    if (event.key === "p" || event.key === "P") {

      devModeActif = !devModeActif;

      if (devModeActif) {

        panneauDev.style.display = "block";
        canvasDev.style.display = "block";

      } else {

        panneauDev.style.display = "none";
        canvasDev.style.display = "none";

        afficherCollisions = false;

        // 🔥 RESET ETAT PROPRE
        ctxDev.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
      }
    }

    if ((event.key === "o" || event.key === "O") && devModeActif) {

      afficherCollisions = !afficherCollisions;

      if (afficherCollisions) {
        canvasDev.style.display = "block";
        dessinerOverlayCollisions();
      } else {
        ctxDev.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
      }
    }

    if ((event.key === "k" || event.key === "K") && devModeActif) {
      joueur.hp = joueur.hpMax;
      mettreAJourHUDJoueur();
      if (combatEnCours) {
        mettreAJourBarresCombat();
      }
    }

    if ((event.key === "l" || event.key === "L") && devModeActif) {
      if (combatEnCours && monumentEnCombat !== null) {
        monumentEnCombat.gardien.hp = 0;
        mettreAJourBarresCombat();
        afficherLog("[DEV] Gardien elimine !");
        setTimeout(function() {
          terminerCombat(true);
        }, 600);
      }
    }

  });
}

function dessinerOverlayCollisions() {
  ctxDev.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);

  const pas = 8;

  for (let ecranX = 0; ecranX < CANVAS_LARGEUR; ecranX += pas) {
    for (let ecranY = 0; ecranY < CANVAS_HAUTEUR; ecranY += pas) {
      const mapX = camera.x + (ecranX / CANVAS_LARGEUR) * camera.largeur;
      const mapY = camera.y + (ecranY / CANVAS_HAUTEUR) * camera.hauteur;

      if (estBloque(mapX, mapY)) {
        ctxDev.fillStyle = "rgba(255, 0, 0, 0.4)";
        ctxDev.fillRect(ecranX, ecranY, pas, pas);
      }
    }
  }
}

function mettreAJourDev() {
  // On efface le canvas dev a chaque frame
  ctxDev.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);

  // Overlay rouge des collisions si actif
  if (afficherCollisions) {
    dessinerOverlayCollisions();
  }
  

  // Afficher coordonnees et hitbox quand le mode dev est ouvert
  if (devModeActif) {

    // Coordonnees en bas a gauche
    ctxDev.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctxDev.fillRect(10, CANVAS_HAUTEUR - 40, 260, 28);
    ctxDev.fillStyle = "#f0c040";
    ctxDev.font = "13px Arial";
    ctxDev.fillText("x: " + Math.round(joueur.x) + "   y: " + Math.round(joueur.y), 18, CANVAS_HAUTEUR - 21);

    // Hitbox du joueur : cercle rouge a sa position sur l ecran
    // joueur.taille est le rayon en pixels sur la map
    // On le convertit en pixels ecran avec le ratio camera/canvas
    const posEcran = mapVersEcran(joueur.x, joueur.y);
    const rayonEcran = joueur.taille * (CANVAS_LARGEUR / camera.largeur);

    ctxDev.strokeStyle = "rgba(255, 0, 0, 0.9)";
    ctxDev.lineWidth = 2;
    ctxDev.beginPath();
    ctxDev.arc(posEcran.x, posEcran.y, rayonEcran, 0, Math.PI * 2);
    ctxDev.stroke();
  }
}
