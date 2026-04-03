let CANVAS_LARGEUR = window.innerWidth;
let CANVAS_HAUTEUR = window.innerHeight;

const canvas = document.getElementById("game-canvas");
canvas.width = CANVAS_LARGEUR;
canvas.height = CANVAS_HAUTEUR;
const ctx = canvas.getContext("2d");

// On calcule les dimensions de la camera maintenant qu on connait la taille de la fenetre
initialiserCamera();

// Quand la fenetre est redimensionnee, on met tout a jour
window.addEventListener("resize", function() {
  CANVAS_LARGEUR = window.innerWidth;
  CANVAS_HAUTEUR = window.innerHeight;

  canvas.width = CANVAS_LARGEUR;
  canvas.height = CANVAS_HAUTEUR;

  // On met aussi a jour le canvas du mode dev s'il existe
  if (canvasDev !== null) {
    canvasDev.width = CANVAS_LARGEUR;
    canvasDev.height = CANVAS_HAUTEUR;
  }

  // On redimensionne aussi le canvas du brouillard
  // Attention : changer .width ou .height réinitialise le contexte 2D
  // donc on doit récupérer un nouveau contexte après
  if (canvasBrouillard !== null) {
    canvasBrouillard.width = CANVAS_LARGEUR;
    canvasBrouillard.height = CANVAS_HAUTEUR;
    ctxBrouillard = canvasBrouillard.getContext("2d");
  }

  // On recalcule les dimensions de la camera selon le nouveau zoom
  camera.largeur = CANVAS_LARGEUR / ZOOM;
  camera.hauteur = CANVAS_HAUTEUR / ZOOM;
});

let dernierTemps = 0;

// demarrerJeu() est appelée depuis le bouton sur l'écran titre
// Elle remplace l'ancien appel automatique au chargement
function demarrerJeu() {
  particulesActives = false;
  const ecranTitre = document.getElementById("titre-screen");
  ecranTitre.style.transition = "opacity 0.6s";
  ecranTitre.style.opacity = "0";

  setTimeout(function() {
    ecranTitre.style.display = "none";

    chargerCollisions(function() {
      chargerZones(function() {
        chargerMap(function() {
          chargerSpritesheet(function() {
            console.log("Tout est chargé, démarrage du jeu !");
            initialiserDev();
            initialiserHUD();
            mettreAJourHUDJoueur();
            afficherMessage("Explore l'île et découvre les 9 monuments !");
            requestAnimationFrame(boucleDeJeu);
          });
        });
      });
    });
  }, 700);
}

function boucleDeJeu(tempsActuel) {
  const deltaTime = tempsActuel - dernierTemps;
  dernierTemps = tempsActuel;

  mettreAJourJeu(deltaTime);
  dessinerJeu();

  requestAnimationFrame(boucleDeJeu);
}

function mettreAJourJeu(deltaTime) {
  if (combatEnCours) {
    mettreAJourCombat(deltaTime);
    return;
  }

  // On calcule dx/dy pour l'animation avant de déplacer
  let dx = 0;
  let dy = 0;
  if (touchesEnfoncees["ArrowLeft"] || touchesEnfoncees["q"] || touchesEnfoncees["Q"]) { dx = -1; }
  if (touchesEnfoncees["ArrowRight"] || touchesEnfoncees["d"] || touchesEnfoncees["D"]) { dx = 1; }
  if (touchesEnfoncees["ArrowUp"] || touchesEnfoncees["z"] || touchesEnfoncees["Z"]) { dy = -1; }
  if (touchesEnfoncees["ArrowDown"] || touchesEnfoncees["s"] || touchesEnfoncees["S"]) { dy = 1; }

  mettreAJourAnimationJoueur(deltaTime, dx, dy);
  deplacerJoueur();
  mettreAJourCamera(joueur);
  verifierDebloquageDepart();

  const monumentProche = verifierProximiteMonuments(joueur);
  if (monumentProche !== null) {
    demarrerCombat(monumentProche);
  }
}

function dessinerJeu() {
  ctx.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);

  dessinerMap(ctx, camera);
  dessinerMonuments(ctx, camera);
  dessinerJoueur(ctx);
  dessinerBrouillard();
  mettreAJourDev();
  mettreAJourMinimap(mapImage);
  mettreAJourHUDNavbar();
}

// Affiche un message temporaire en bas de l'écran
let timerMessage = 0;

function afficherMessage(texte) {
  const boite = document.getElementById("message-box");
  boite.textContent = texte;
  boite.style.display = "block";
  timerMessage = 3000;

  setTimeout(function() {
    boite.style.display = "none";
  }, timerMessage);
}