let spritesheetJoueur = null;
let spritesheetChargee = false;

// Dimensions mesurées sur l'image 2000x1091
// Ces ratios fonctionnent quelle que soit la résolution du fichier
// car on calcule tout en pourcentage de la taille totale

// Bloc gauche : colonnes 0-3, séparation à x=980
// Bloc droit  : colonnes 4-7, de x=980 à x=2000
// 4 lignes de 272px de haut sur 1091px total

const SPRITESHEET_LARGEUR_REF = 2000;
const SPRITESHEET_HAUTEUR_REF = 1091;

const SEP_X = 980;      // séparation entre bloc gauche et droit
const CASE_G = 245;     // largeur d'une case bloc gauche
const CASE_D = 255;     // largeur d'une case bloc droit
const CASE_H = 272;     // hauteur d'une case (commune aux deux blocs)

// Définition des animations : chaque animation est une liste de cases [col, ligne, bloc]
// bloc = "g" pour gauche, "d" pour droit
const ANIMATIONS = {
  "marche_face": [
    [0, 0, "g"], [1, 0, "g"], [2, 0, "g"], [3, 0, "g"]
  ],
  "marche_dos": [
    [0, 1, "g"], [1, 1, "g"], [2, 1, "g"], [3, 1, "g"]
  ],
  "marche_profil": [
    [0, 2, "g"], [1, 2, "g"], [2, 2, "g"], [3, 2, "g"]
  ],
  "idle": [
    [0, 0, "d"]
  ],
  "attaque": [
    [0, 1, "d"], [1, 1, "d"], [2, 1, "d"], [3, 1, "d"]
  ],
  "blesse": [
    [0, 2, "d"], [1, 2, "d"]
  ],
  "mort": [
    [0, 3, "g"]
  ]
};

// État de l'animation courante du joueur
let animationCourante = "marche_face";
let frameIndex = 0;
let frameTimer = 0;
let regardeAGauche = false;
const DUREE_FRAME = 150; // ms par frame

function chargerSpritesheet(callback) {
  spritesheetJoueur = new Image();
  spritesheetJoueur.src = "assets/player_spritesheet.png";

  spritesheetJoueur.onload = function() {
    // On calcule les vrais ratios selon la taille réelle du fichier chargé
    spritesheetChargee = true;
    console.log("Spritesheet chargée :", spritesheetJoueur.width, "x", spritesheetJoueur.height);
    callback();
  };

  spritesheetJoueur.onerror = function() {
    console.error("Impossible de charger player_spritesheet.png");
    // On continue sans sprite, le joueur restera en formes basiques
    callback();
  };
}

// Retourne les coordonnées (sx, sy, sw, sh) d'une case dans la spritesheet
// en adaptant aux dimensions réelles du fichier chargé
function getCoordsCase(col, ligne, bloc) {
  const scaleX = spritesheetJoueur.width / SPRITESHEET_LARGEUR_REF;
  const scaleY = spritesheetJoueur.height / SPRITESHEET_HAUTEUR_REF;

  let sx, sw;
  if (bloc === "g") {
    sx = col * CASE_G * scaleX;
    sw = CASE_G * scaleX;
  } else {
    sx = (SEP_X + col * CASE_D) * scaleX;
    sw = CASE_D * scaleX;
  }

  const sy = ligne * CASE_H * scaleY;
  const sh = CASE_H * scaleY;

  return { sx, sy, sw, sh };
}

// Met à jour l'animation selon la direction du joueur
function mettreAJourAnimationJoueur(deltaTime, dx, dy) {
  if (dx !== 0 || dy !== 0) {

    // On met à jour regardeAGauche dès qu'une touche gauche/droite est appuyée
    // même en diagonale, pour que le sprite soit toujours dans le bon sens
    if (dx < 0) {
      regardeAGauche = true;
    } else if (dx > 0) {
      regardeAGauche = false;
    }

    // Haut et bas sont prioritaires sur gauche/droite pour l'animation
    if (dy > 0) {
      animationCourante = "marche_face";
    } else if (dy < 0) {
      animationCourante = "marche_dos";
    } else {
      animationCourante = "marche_profil";
    }

  } else {
    animationCourante = "idle";
  }

  // Avancer la frame selon le timer
  frameTimer = frameTimer + deltaTime;
  if (frameTimer >= DUREE_FRAME) {
    frameTimer = 0;
    const nbFrames = ANIMATIONS[animationCourante].length;
    frameIndex = (frameIndex + 1) % nbFrames;
  }
}

// Dessine le joueur avec son sprite à la position écran donnée
function dessinerSprite(ctx, ecranX, ecranY) {
  if (!spritesheetChargee || spritesheetJoueur === null) {
    return false; // signale qu'on doit utiliser le fallback
  }

  const frames = ANIMATIONS[animationCourante];
  const frame = frames[frameIndex % frames.length];
  const col = frame[0];
  const ligne = frame[1];
  const bloc = frame[2];

  const coords = getCoordsCase(col, ligne, bloc);

  const tailleAffichee = 80;
  const ratio = coords.sh / coords.sw;
  const hauteurAffichee = tailleAffichee * ratio;

  // Si le joueur va à gauche on retourne le sprite horizontalement
  if (regardeAGauche) {
    ctx.save();
    // On déplace l'origine au centre du sprite puis on inverse l'axe X
    ctx.translate(ecranX, ecranY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      spritesheetJoueur,
      coords.sx, coords.sy, coords.sw, coords.sh,
      -tailleAffichee / 2,
      -hauteurAffichee,
      tailleAffichee,
      hauteurAffichee
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      spritesheetJoueur,
      coords.sx, coords.sy, coords.sw, coords.sh,
      ecranX - tailleAffichee / 2,
      ecranY - hauteurAffichee,
      tailleAffichee,
      hauteurAffichee
    );
  }

  return true;
}

// Change l'animation manuellement (utilisé par combat.js)
function setAnimation(nom) {
  if (ANIMATIONS[nom] && animationCourante !== nom) {
    animationCourante = nom;
    frameIndex = 0;
    frameTimer = 0;
  }
}
