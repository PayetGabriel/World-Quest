// Données de l'image Zones.jpg lues pixel par pixel
let zonesImageData = null;
let zonesImageWidth = 0;
let zonesImageHeight = 0;

// Canvas du brouillard affiché par dessus la map
let canvasBrouillard = null;
let ctxBrouillard = null;

// Texture du brouillard (image 1024x1024 seamless)
let textureBrouillard = null;
let textureBrouillardChargee = false;

// Chaque zone a une couleur dans Zones.jpg et un état débloqué ou non
// L'ordre dans ce tableau est l'ordre de déblocage
const ZONES = [
  {
    nom: "Couloir départ",
    couleurR: 255, couleurV: 255, couleurB: 255,
    debloquee: true  // toujours libre, jamais de brouillard
  },
  {
    nom: "Tour Eiffel",
    couleurR: 168, couleurV: 20, couleurB: 255,
    debloquee: false
  },
  {
    nom: "Temple Grec",
    couleurR: 28, couleurV: 255, couleurB: 103,
    debloquee: false
  },
  {
    nom: "Sanctuaire Doré",
    couleurR: 255, couleurV: 246, couleurB: 12,
    debloquee: false
  },
  {
    nom: "Taj Mahal",
    couleurR: 255, couleurV: 0, couleurB: 203,
    debloquee: false
  },
  {
    nom: "Christ Rédempteur",
    couleurR: 0, couleurV: 0, couleurB: 0,
    debloquee: false
  },
  {
    nom: "Burj Khalifa",
    couleurR: 33, couleurV: 51, couleurB: 255,
    debloquee: false
  },
  {
    nom: "Statue de la Liberté",
    couleurR: 255, couleurV: 140, couleurB: 0,
    debloquee: false
  },
  {
    nom: "Pyramides",
    couleurR: 0, couleurV: 255, couleurB: 216,
    debloquee: false
  },
  {
    nom: "Colisée",
    couleurR: 0, couleurV: 161, couleurB: 255,
    debloquee: false
  }
];

// Charge Zones.jpg et crée le canvas du brouillard
function chargerZones(callback) {
  const image = new Image();
  image.src = "assets/Zones.jpg";

  image.onload = function() {
    const canvasTemp = document.createElement("canvas");
    canvasTemp.width = image.width;
    canvasTemp.height = image.height;

    const ctxTemp = canvasTemp.getContext("2d");
    ctxTemp.drawImage(image, 0, 0);

    zonesImageData = ctxTemp.getImageData(0, 0, image.width, image.height).data;
    zonesImageWidth = image.width;
    zonesImageHeight = image.height;

    console.log("Zones chargées :", image.width, "x", image.height);

    // On charge la texture du brouillard
    textureBrouillard = new Image();
    textureBrouillard.src = "assets/brouillard.jpg";
    textureBrouillard.onload = function() {
      textureBrouillardChargee = true;
    };

    creerCanvasBrouillard();
    callback();
  };

  image.onerror = function() {
    console.error("Impossible de charger Zones.jpg");
    callback();
  };
}

function creerCanvasBrouillard() {
  canvasBrouillard = document.createElement("canvas");
  canvasBrouillard.width = CANVAS_LARGEUR;
  canvasBrouillard.height = CANVAS_HAUTEUR;
  canvasBrouillard.style.position = "absolute";
  canvasBrouillard.style.top = "0";
  canvasBrouillard.style.left = "0";
  canvasBrouillard.style.pointerEvents = "none";
  canvasBrouillard.style.zIndex = "5";

  // On insère le canvas brouillard en PREMIER dans game-wrapper
  // pour qu'il soit sous tous les autres éléments (HUD, panneaux, etc.)
  const wrapper = document.getElementById("game-wrapper");
  const premierEnfant = wrapper.firstChild;
  if (premierEnfant) {
    wrapper.insertBefore(canvasBrouillard, premierEnfant);
  } else {
    wrapper.appendChild(canvasBrouillard);
  }

  ctxBrouillard = canvasBrouillard.getContext("2d");
}

// Retourne la zone correspondant à un pixel de la map
// On convertit les coordonnées map en coordonnées dans l'image Zones.jpg
function getZoneDuPixel(mapX, mapY) {
  if (zonesImageData === null) {
    return null;
  }

  // L'image Zones.jpg a peut-être une taille différente de la map
  // On recalcule les coordonnées proportionnellement
  const px = Math.floor((mapX / MAP_LARGEUR) * zonesImageWidth);
  const py = Math.floor((mapY / MAP_HAUTEUR) * zonesImageHeight);

  if (px < 0 || py < 0 || px >= zonesImageWidth || py >= zonesImageHeight) {
    return null;
  }

  const index = (py * zonesImageWidth + px) * 4;
  const r = zonesImageData[index];
  const v = zonesImageData[index + 1];
  const b = zonesImageData[index + 2];

  // On cherche quelle zone correspond à cette couleur
  // On tolère une petite marge car le JPG compresse et déforme légèrement les couleurs
  for (let i = 0; i < ZONES.length; i++) {
    const zone = ZONES[i];
    const diffR = Math.abs(r - zone.couleurR);
    const diffV = Math.abs(v - zone.couleurV);
    const diffB = Math.abs(b - zone.couleurB);

    if (diffR < 15 && diffV < 15 && diffB < 15) {
      return zone;
    }
  }

  return null;
}

// Cache simple pour éviter de relire le même pixel plusieurs fois par frame
// On stocke le dernier résultat et les coordonnées testées
let cacheDerniereMapX = -1;
let cacheDerniereMapY = -1;
let cacheDernierResultat = false;

// Vérifie si un point sur la map est dans une zone bloquée par le brouillard
function estBloqueParZone(mapX, mapY) {
  if (zonesImageData === null) {
    return false;
  }

  // Si on teste le même pixel qu'avant on retourne directement le résultat en cache
  const px = Math.round(mapX);
  const py = Math.round(mapY);
  if (px === cacheDerniereMapX && py === cacheDerniereMapY) {
    return cacheDernierResultat;
  }

  const zone = getZoneDuPixel(mapX, mapY);
  const resultat = (zone !== null && !zone.debloquee);

  cacheDerniereMapX = px;
  cacheDerniereMapY = py;
  cacheDernierResultat = resultat;

  return resultat;
}

// Vérifie si le joueur franchit la ligne de déclenchement du couloir vers la Tour Eiffel
// Cette ligne est à y=1399, x entre 2088 et 2158
// On utilise un booléen pour ne déclencher qu'une seule fois
let debloquageDepartFait = false;

function verifierDebloquageDepart() {
  if (debloquageDepartFait) {
    return;
  }

  if (joueur.y >= 1399 && joueur.x >= 2088 && joueur.x <= 2158) {
    debloquageDepartFait = true;
    debloquerZone(1);
    afficherMessage("Nouvelle zone débloquée : Tour Eiffel !");
  }
}

// Débloque une zone par son index dans le tableau ZONES
function debloquerZone(index) {
  if (index < ZONES.length) {
    ZONES[index].debloquee = true;
    console.log("Zone débloquée :", ZONES[index].nom);
  }
}

// Appelée depuis combat.js quand un monument est battu
// Elle débloque la zone suivante dans l'ordre
function debloquerZoneSuivante(nomMonument) {
  // On fait correspondre les noms des monuments aux index des zones
  const correspondances = {
    "Tour Eiffel":           2,  // débloque Temple Grec
    "Acropole d'Athènes":    3,  // débloque Sanctuaire Doré
    "Kinkaku-ji":            4,  // débloque Taj Mahal
    "Taj Mahal":             5,  // débloque Christ Rédempteur
    "Christ Rédempteur":     6,  // débloque Burj Khalifa
    "Burj Khalifa":          7,  // débloque Statue de la Liberté
    "Statue de la Liberté":  8,  // débloque Pyramides
    "Pyramides de Gizeh":    9,  // débloque Colisée
  };

  const indexADebloquer = correspondances[nomMonument];
  if (indexADebloquer !== undefined) {
    debloquerZone(indexADebloquer);
    afficherMessage("Nouvelle zone débloquée : " + ZONES[indexADebloquer].nom + " !");
  }
}

// Dessine le brouillard sur toutes les zones non débloquées
// La texture est ancrée sur la MAP (pas sur l écran)
function dessinerBrouillard() {
  if (ctxBrouillard === null || zonesImageData === null) {
    return;
  }

  // Étape 1 : masque basse résolution
  const echelleReduite = 6;
  const largeurReduite = Math.ceil(CANVAS_LARGEUR / echelleReduite);
  const hauteurReduite = Math.ceil(CANVAS_HAUTEUR / echelleReduite);

  const masque = document.createElement("canvas");
  masque.width = largeurReduite;
  masque.height = hauteurReduite;
  const ctxMasque = masque.getContext("2d");

  for (let px = 0; px < largeurReduite; px++) {
    for (let py = 0; py < hauteurReduite; py++) {
      const ecranX = px * echelleReduite;
      const ecranY = py * echelleReduite;
      const mapX = camera.x + (ecranX / CANVAS_LARGEUR) * camera.largeur;
      const mapY = camera.y + (ecranY / CANVAS_HAUTEUR) * camera.hauteur;

      const zone = getZoneDuPixel(mapX, mapY);
      if (zone !== null && !zone.debloquee) {
        ctxMasque.fillStyle = "rgba(255, 255, 255, 1)";
        ctxMasque.fillRect(px, py, 1, 1);
      }
    }
  }

  // Étape 2 : canvas final avec texture ancrée sur la map
  const final = document.createElement("canvas");
  final.width = CANVAS_LARGEUR;
  final.height = CANVAS_HAUTEUR;
  const ctxFinal = final.getContext("2d");

  if (textureBrouillardChargee) {
    // La texture fait 1024x1024 pixels sur la map, elle se répète (tile)
    const tailleTextureSurMap = 1024;

    // Décalage de la caméra dans la texture (modulo pour le tiling)
    const offsetX = camera.x % tailleTextureSurMap;
    const offsetY = camera.y % tailleTextureSurMap;

    // Taille de la texture en pixels écran
    const pixelMapParEcranX = camera.largeur / CANVAS_LARGEUR;
    const pixelMapParEcranY = camera.hauteur / CANVAS_HAUTEUR;
    const tailleTextureEcranX = tailleTextureSurMap / pixelMapParEcranX;
    const tailleTextureEcranY = tailleTextureSurMap / pixelMapParEcranY;

    // Point de départ du tiling (négatif pour commencer hors écran si besoin)
    const debutX = -(offsetX / pixelMapParEcranX);
    const debutY = -(offsetY / pixelMapParEcranY);

    let y = debutY;
    while (y < CANVAS_HAUTEUR) {
      let x = debutX;
      while (x < CANVAS_LARGEUR) {
        ctxFinal.drawImage(textureBrouillard, x, y, tailleTextureEcranX, tailleTextureEcranY);
        x = x + tailleTextureEcranX;
      }
      y = y + tailleTextureEcranY;
    }

  } else {
    ctxFinal.fillStyle = "rgba(240, 245, 255, 1)";
    ctxFinal.fillRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
  }

  // Étape 3 : masque avec bords flous
  ctxFinal.imageSmoothingEnabled = true;
  ctxFinal.imageSmoothingQuality = "high";
  ctxFinal.globalCompositeOperation = "destination-in";
  ctxFinal.filter = "blur(28px)";
  ctxFinal.drawImage(masque, 0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
  ctxFinal.filter = "none";
  ctxFinal.globalCompositeOperation = "source-over";

  // Deuxième passe pour opacifier le centre
  ctxFinal.globalCompositeOperation = "destination-in";
  ctxFinal.filter = "blur(6px)";
  ctxFinal.drawImage(masque, 0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
  ctxFinal.filter = "none";
  ctxFinal.globalCompositeOperation = "source-over";

  // Étape 4 : on colle sur le canvas principal
  ctxBrouillard.clearRect(0, 0, CANVAS_LARGEUR, CANVAS_HAUTEUR);
  ctxBrouillard.drawImage(final, 0, 0);
}
