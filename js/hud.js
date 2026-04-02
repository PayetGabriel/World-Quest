// Gestion de l'interface overworld (HUD)
// Contient : navbar haut, bouton exit, bouton parametres, minimap

let panneauParametresOuvert = false;
let panneauInventaireOuvert = false;
let panneauSuccesOuvert = false;
let panneauCompetencesOuvert = false;
let panneauShopOuvert = false;

// Points de competences disponibles
let pointsCompetences = 3;

// Stats du joueur ameliorees par les competences
const competences = {
  attaque: 0,
  defense: 0,
  vie: 0
};

function initialiserHUD() {
  creerNavbarHaut();
  creerBoutonExit();
  creerBoutonParametres();
  creerMinimap();
  creerPanneauParametres();
  creerPanneauInventaire();
  creerPanneauSucces();
  creerPanneauCompetences();
  creerPanneauShop();
}

// =====================
// NAVBAR DU HAUT
// =====================

function creerNavbarHaut() {
  const navbar = document.createElement("div");
  navbar.id = "navbar-haut";
  navbar.style.position = "absolute";
  navbar.style.top = "0";
  navbar.style.left = "50%";
  navbar.style.transform = "translateX(-50%)";
  navbar.style.display = "flex";
  navbar.style.alignItems = "center";
  navbar.style.gap = "16px";
  navbar.style.background = "rgba(0, 0, 0, 0.7)";
  navbar.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
  navbar.style.borderRadius = "0 0 12px 12px";
  navbar.style.padding = "8px 24px";
  navbar.style.zIndex = "20";
  navbar.style.pointerEvents = "all";

  // Barre de PV
  const pvWrapper = document.createElement("div");
  pvWrapper.style.display = "flex";
  pvWrapper.style.alignItems = "center";
  pvWrapper.style.gap = "8px";

  const pvLabel = document.createElement("span");
  pvLabel.style.color = "#ccc";
  pvLabel.style.fontSize = "12px";
  pvLabel.textContent = "PV";

  const pvBarBg = document.createElement("div");
  pvBarBg.style.width = "120px";
  pvBarBg.style.height = "10px";
  pvBarBg.style.background = "#333";
  pvBarBg.style.borderRadius = "5px";
  pvBarBg.style.overflow = "hidden";

  const pvBarFill = document.createElement("div");
  pvBarFill.id = "navbar-hp-fill";
  pvBarFill.style.height = "100%";
  pvBarFill.style.width = "100%";
  pvBarFill.style.background = "#e74c3c";
  pvBarFill.style.borderRadius = "5px";
  pvBarFill.style.transition = "width 0.2s";

  const pvText = document.createElement("span");
  pvText.id = "navbar-hp-text";
  pvText.style.color = "#fff";
  pvText.style.fontSize = "12px";
  pvText.textContent = "100/100";

  pvBarBg.appendChild(pvBarFill);
  pvWrapper.appendChild(pvLabel);
  pvWrapper.appendChild(pvBarBg);
  pvWrapper.appendChild(pvText);

  // Boutons de la navbar
  const boutonInventaire = creerBoutonNavbar("Inventaire", "I", function() {
    basculerPanneau("inventaire");
  });

  const boutonSucces = creerBoutonNavbar("Succès", "", function() {
    basculerPanneau("succes");
  });

  const boutonCompetences = creerBoutonNavbar("Compétences", "C", function() {
    basculerPanneau("competences");
  });

  const boutonShop = creerBoutonNavbar("Shop", "", function() {
    basculerPanneau("shop");
  });

  navbar.appendChild(pvWrapper);
  navbar.appendChild(boutonInventaire);
  navbar.appendChild(boutonSucces);
  navbar.appendChild(boutonCompetences);
  navbar.appendChild(boutonShop);

  document.getElementById("game-wrapper").appendChild(navbar);
}

function creerBoutonNavbar(texte, touche, action) {
  const btn = document.createElement("button");
  btn.style.background = "rgba(255,255,255,0.07)";
  btn.style.border = "0.5px solid rgba(255,255,255,0.2)";
  btn.style.color = "#fff";
  btn.style.fontSize = "12px";
  btn.style.padding = "5px 12px";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.gap = "6px";

  const labelTexte = document.createElement("span");
  labelTexte.textContent = texte;
  btn.appendChild(labelTexte);

  if (touche !== "") {
    const labelTouche = document.createElement("span");
    labelTouche.style.color = "#f0c040";
    labelTouche.style.fontSize = "10px";
    labelTouche.textContent = "[" + touche + "]";
    btn.appendChild(labelTouche);
  }

  btn.addEventListener("mouseover", function() {
    btn.style.background = "rgba(255,255,255,0.15)";
  });
  btn.addEventListener("mouseout", function() {
    btn.style.background = "rgba(255,255,255,0.07)";
  });

  btn.addEventListener("click", action);
  return btn;
}

// =====================
// BOUTON EXIT (haut gauche)
// =====================

function creerBoutonExit() {
  const btn = document.createElement("button");
  btn.id = "bouton-exit";
  btn.textContent = "EXIT";
  btn.style.position = "absolute";
  btn.style.top = "12px";
  btn.style.left = "12px";
  btn.style.background = "rgba(0,0,0,0.7)";
  btn.style.border = "0.5px solid rgba(255,255,255,0.2)";
  btn.style.color = "#ff6b6b";
  btn.style.fontSize = "12px";
  btn.style.padding = "6px 14px";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "50";
  btn.style.letterSpacing = "2px";

  btn.addEventListener("click", function() {
    const confirmation = confirm("Quitter le jeu ?");
    if (confirmation) {
      location.reload();
    }
  });

  document.getElementById("game-wrapper").appendChild(btn);
}

// =====================
// BOUTON PARAMETRES (haut droite)
// =====================

function creerBoutonParametres() {
  const btn = document.createElement("button");
  btn.id = "bouton-parametres";
  btn.textContent = "⚙";
  btn.style.position = "absolute";
  btn.style.top = "12px";
  btn.style.right = "12px";
  btn.style.background = "rgba(0,0,0,0.7)";
  btn.style.border = "0.5px solid rgba(255,255,255,0.2)";
  btn.style.color = "#fff";
  btn.style.fontSize = "18px";
  btn.style.width = "36px";
  btn.style.height = "36px";
  btn.style.borderRadius = "8px";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "20";

  btn.addEventListener("click", function() {
    basculerPanneau("parametres");
  });

  document.getElementById("game-wrapper").appendChild(btn);
}

// =====================
// MINIMAP (bas droite)
// =====================

let canvasMinimap = null;
let ctxMinimap = null;

function creerMinimap() {
  const wrapper = document.createElement("div");
  wrapper.id = "minimap-wrapper";
  wrapper.style.position = "absolute";
  wrapper.style.bottom = "12px";
  wrapper.style.right = "12px";
  wrapper.style.width = "160px";
  wrapper.style.height = "90px";
  wrapper.style.border = "1px solid rgba(255,255,255,0.25)";
  wrapper.style.borderRadius = "6px";
  wrapper.style.overflow = "hidden";
  wrapper.style.zIndex = "20";
  wrapper.style.background = "#111";

  canvasMinimap = document.createElement("canvas");
  canvasMinimap.width = 160;
  canvasMinimap.height = 90;
  canvasMinimap.style.display = "block";
  ctxMinimap = canvasMinimap.getContext("2d");

  wrapper.appendChild(canvasMinimap);
  document.getElementById("game-wrapper").appendChild(wrapper);
}

// Dessine la minimap a chaque frame
function mettreAJourMinimap(mapImage) {
  if (ctxMinimap === null || mapImage === null) {
    return;
  }

  // On dessine la map entiere en miniature
  ctxMinimap.drawImage(mapImage, 0, 0, 160, 90);

  // On dessine le joueur comme un point blanc
  const minimapX = (joueur.x / MAP_LARGEUR) * 160;
  const minimapY = (joueur.y / MAP_HAUTEUR) * 90;

  ctxMinimap.fillStyle = "#fff";
  ctxMinimap.beginPath();
  ctxMinimap.arc(minimapX, minimapY, 3, 0, Math.PI * 2);
  ctxMinimap.fill();

  // On dessine un rectangle qui montre la zone visible par la camera
  const camX = (camera.x / MAP_LARGEUR) * 160;
  const camY = (camera.y / MAP_HAUTEUR) * 90;
  const camW = (camera.largeur / MAP_LARGEUR) * 160;
  const camH = (camera.hauteur / MAP_HAUTEUR) * 90;

  ctxMinimap.strokeStyle = "rgba(255,255,255,0.5)";
  ctxMinimap.lineWidth = 1;
  ctxMinimap.strokeRect(camX, camY, camW, camH);
}

// =====================
// PANNEAUX (inventaire, succès, compétences, shop, paramètres)
// =====================

function creerPanneau(id, titre) {
  const panneau = document.createElement("div");
  panneau.id = id;
  panneau.style.position = "absolute";
  panneau.style.top = "50%";
  panneau.style.left = "50%";
  panneau.style.transform = "translate(-50%, -50%)";
  panneau.style.background = "rgba(10, 10, 20, 0.96)";
  panneau.style.border = "0.5px solid rgba(255,255,255,0.15)";
  panneau.style.borderRadius = "12px";
  panneau.style.padding = "20px 24px";
  panneau.style.width = "340px";
  panneau.style.display = "none";
  panneau.style.color = "#fff";
  panneau.style.zIndex = "30";
  panneau.style.fontFamily = "Arial, sans-serif";

  const enTete = document.createElement("div");
  enTete.style.display = "flex";
  enTete.style.justifyContent = "space-between";
  enTete.style.alignItems = "center";
  enTete.style.marginBottom = "16px";

  const labelTitre = document.createElement("div");
  labelTitre.style.fontSize = "15px";
  labelTitre.style.fontWeight = "500";
  labelTitre.style.color = "#f0c040";
  labelTitre.textContent = titre;

  const btnFermer = document.createElement("button");
  btnFermer.textContent = "✕";
  btnFermer.style.background = "transparent";
  btnFermer.style.border = "none";
  btnFermer.style.color = "#aaa";
  btnFermer.style.fontSize = "16px";
  btnFermer.style.cursor = "pointer";
  btnFermer.addEventListener("click", function() {
    panneau.style.display = "none";
  });

  enTete.appendChild(labelTitre);
  enTete.appendChild(btnFermer);
  panneau.appendChild(enTete);

  document.getElementById("game-wrapper").appendChild(panneau);
  return panneau;
}

function creerPanneauInventaire() {
  const panneau = creerPanneau("panneau-inventaire", "Inventaire");

  const contenu = document.createElement("div");
  contenu.id = "inventaire-contenu";
  contenu.style.display = "flex";
  contenu.style.flexDirection = "column";
  contenu.style.gap = "10px";

  contenu.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);padding:10px 14px;border-radius:8px;">
      <div>
        <div style="font-size:14px;">Potion de soin</div>
        <div style="font-size:11px;color:#aaa;">Restaure 30 PV — touche [F]</div>
      </div>
      <div style="color:#f0c040;font-size:13px;" id="inv-count-heal">x0</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);padding:10px 14px;border-radius:8px;">
      <div>
        <div style="font-size:14px;">Potion de boost</div>
        <div style="font-size:11px;color:#aaa;">+10 ATT pendant 5 attaques — touche [G]</div>
      </div>
      <div style="color:#f0c040;font-size:13px;" id="inv-count-boost">x0</div>
    </div>
  `;

  panneau.appendChild(contenu);
}

function creerPanneauSucces() {
  const panneau = creerPanneau("panneau-succes", "Succès");

  const contenu = document.createElement("div");
  contenu.style.display = "flex";
  contenu.style.flexDirection = "column";
  contenu.style.gap = "8px";

  const monuments = [
    "Tour Eiffel", "Pyramides de Gizeh", "Colisée", "Burj Khalifa",
    "Taj Mahal", "Statue de la Liberté", "Acropole d'Athènes",
    "Kinkaku-ji", "Christ Rédempteur"
  ];

  for (let i = 0; i < monuments.length; i++) {
    const ligne = document.createElement("div");
    ligne.style.display = "flex";
    ligne.style.alignItems = "center";
    ligne.style.gap = "10px";
    ligne.style.padding = "6px 10px";
    ligne.style.background = "rgba(255,255,255,0.04)";
    ligne.style.borderRadius = "6px";
    ligne.dataset.monument = MONUMENTS[i].id;

    const etoile = document.createElement("span");
    etoile.style.fontSize = "16px";
    etoile.textContent = "☆";
    etoile.id = "succes-etoile-" + MONUMENTS[i].id;

    const nom = document.createElement("span");
    nom.style.fontSize = "13px";
    nom.textContent = monuments[i];

    ligne.appendChild(etoile);
    ligne.appendChild(nom);
    contenu.appendChild(ligne);
  }

  panneau.appendChild(contenu);
}

function creerPanneauCompetences() {
  const panneau = creerPanneau("panneau-competences", "Compétences");

  const pointsLabel = document.createElement("div");
  pointsLabel.id = "comp-points";
  pointsLabel.style.fontSize = "12px";
  pointsLabel.style.color = "#aaa";
  pointsLabel.style.marginBottom = "12px";
  pointsLabel.textContent = "Points disponibles : " + pointsCompetences;

  const lignes = [
    { id: "attaque", label: "Attaque", desc: "+5 ATT par niveau" },
    { id: "defense", label: "Défense", desc: "+3 DEF par niveau" },
    { id: "vie",     label: "Vie max", desc: "+20 PV par niveau" }
  ];

  const contenu = document.createElement("div");
  contenu.style.display = "flex";
  contenu.style.flexDirection = "column";
  contenu.style.gap = "10px";

  for (let i = 0; i < lignes.length; i++) {
    const stat = lignes[i];

    const ligne = document.createElement("div");
    ligne.style.display = "flex";
    ligne.style.justifyContent = "space-between";
    ligne.style.alignItems = "center";
    ligne.style.background = "rgba(255,255,255,0.06)";
    ligne.style.padding = "10px 14px";
    ligne.style.borderRadius = "8px";

    const info = document.createElement("div");
    const labelNom = document.createElement("div");
    labelNom.style.fontSize = "14px";
    labelNom.textContent = stat.label;
    const labelDesc = document.createElement("div");
    labelDesc.style.fontSize = "11px";
    labelDesc.style.color = "#aaa";
    labelDesc.textContent = stat.desc;
    info.appendChild(labelNom);
    info.appendChild(labelDesc);

    const droite = document.createElement("div");
    droite.style.display = "flex";
    droite.style.alignItems = "center";
    droite.style.gap = "8px";

    const niveauLabel = document.createElement("span");
    niveauLabel.id = "comp-niveau-" + stat.id;
    niveauLabel.style.color = "#f0c040";
    niveauLabel.style.fontSize = "13px";
    niveauLabel.textContent = "Niv. " + competences[stat.id];

    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.style.background = "rgba(255,255,255,0.1)";
    btnPlus.style.border = "0.5px solid rgba(255,255,255,0.2)";
    btnPlus.style.color = "#fff";
    btnPlus.style.width = "26px";
    btnPlus.style.height = "26px";
    btnPlus.style.borderRadius = "6px";
    btnPlus.style.cursor = "pointer";
    btnPlus.style.fontSize = "14px";

    btnPlus.addEventListener("click", function() {
      ameliorerCompetence(stat.id);
    });

    droite.appendChild(niveauLabel);
    droite.appendChild(btnPlus);
    ligne.appendChild(info);
    ligne.appendChild(droite);
    contenu.appendChild(ligne);
  }

  panneau.appendChild(pointsLabel);
  panneau.appendChild(contenu);
}

function creerPanneauShop() {
  const panneau = creerPanneau("panneau-shop", "Shop");

  const contenu = document.createElement("div");
  contenu.style.display = "flex";
  contenu.style.flexDirection = "column";
  contenu.style.gap = "10px";

  const items = [
    { nom: "Potion de soin", prix: 50, desc: "Restaure 30 PV", cle: "potion-heal" },
    { nom: "Potion de boost", prix: 80, desc: "+10 ATT pendant 5 attaques", cle: "potion-boost" }
  ];

  const orLabel = document.createElement("div");
  orLabel.id = "shop-or";
  orLabel.style.fontSize = "13px";
  orLabel.style.color = "#f0c040";
  orLabel.style.marginBottom = "10px";
  orLabel.textContent = "Or : 0";
  contenu.appendChild(orLabel);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const ligne = document.createElement("div");
    ligne.style.display = "flex";
    ligne.style.justifyContent = "space-between";
    ligne.style.alignItems = "center";
    ligne.style.background = "rgba(255,255,255,0.06)";
    ligne.style.padding = "10px 14px";
    ligne.style.borderRadius = "8px";

    const info = document.createElement("div");
    const labelNom = document.createElement("div");
    labelNom.style.fontSize = "14px";
    labelNom.textContent = item.nom;
    const labelDesc = document.createElement("div");
    labelDesc.style.fontSize = "11px";
    labelDesc.style.color = "#aaa";
    labelDesc.textContent = item.desc;
    info.appendChild(labelNom);
    info.appendChild(labelDesc);

    const btnAcheter = document.createElement("button");
    btnAcheter.textContent = item.prix + " or";
    btnAcheter.style.background = "rgba(240,192,64,0.15)";
    btnAcheter.style.border = "0.5px solid #f0c040";
    btnAcheter.style.color = "#f0c040";
    btnAcheter.style.fontSize = "12px";
    btnAcheter.style.padding = "5px 12px";
    btnAcheter.style.borderRadius = "6px";
    btnAcheter.style.cursor = "pointer";
    btnAcheter.dataset.cle = item.cle;
    btnAcheter.dataset.prix = item.prix;

    btnAcheter.addEventListener("click", function() {
      acheterItem(this.dataset.cle, parseInt(this.dataset.prix));
    });

    ligne.appendChild(info);
    ligne.appendChild(btnAcheter);
    contenu.appendChild(ligne);
  }

  panneau.appendChild(contenu);
}

function creerPanneauParametres() {
  const panneau = creerPanneau("panneau-parametres", "Paramètres");

  const contenu = document.createElement("div");
  contenu.style.display = "flex";
  contenu.style.flexDirection = "column";
  contenu.style.gap = "12px";

  // Musique on/off
  const ligneMusique = document.createElement("div");
  ligneMusique.style.display = "flex";
  ligneMusique.style.justifyContent = "space-between";
  ligneMusique.style.alignItems = "center";

  const labelMusique = document.createElement("span");
  labelMusique.style.fontSize = "13px";
  labelMusique.textContent = "Musique";

  const btnMusique = document.createElement("button");
  btnMusique.id = "btn-musique";
  btnMusique.textContent = "ON";
  btnMusique.style.background = "rgba(255,255,255,0.08)";
  btnMusique.style.border = "0.5px solid rgba(255,255,255,0.2)";
  btnMusique.style.color = "#fff";
  btnMusique.style.fontSize = "12px";
  btnMusique.style.padding = "4px 14px";
  btnMusique.style.borderRadius = "6px";
  btnMusique.style.cursor = "pointer";
  btnMusique.addEventListener("click", function() {
    if (btnMusique.textContent === "ON") {
      btnMusique.textContent = "OFF";
    } else {
      btnMusique.textContent = "ON";
    }
  });

  ligneMusique.appendChild(labelMusique);
  ligneMusique.appendChild(btnMusique);

  // Langue
  const ligneLangue = document.createElement("div");
  ligneLangue.style.display = "flex";
  ligneLangue.style.justifyContent = "space-between";
  ligneLangue.style.alignItems = "center";

  const labelLangue = document.createElement("span");
  labelLangue.style.fontSize = "13px";
  labelLangue.textContent = "Langue";

  const selectLangue = document.createElement("select");
  selectLangue.style.background = "rgba(255,255,255,0.08)";
  selectLangue.style.border = "0.5px solid rgba(255,255,255,0.2)";
  selectLangue.style.color = "#fff";
  selectLangue.style.fontSize = "12px";
  selectLangue.style.padding = "4px 8px";
  selectLangue.style.borderRadius = "6px";

  const optFr = document.createElement("option");
  optFr.value = "fr";
  optFr.textContent = "Français";
  selectLangue.appendChild(optFr);

  ligneLangue.appendChild(labelLangue);
  ligneLangue.appendChild(selectLangue);

  // Version
  const ligneVersion = document.createElement("div");
  ligneVersion.style.fontSize = "11px";
  ligneVersion.style.color = "#555";
  ligneVersion.style.marginTop = "8px";
  ligneVersion.textContent = "Version 0.1 — World Quest";

  contenu.appendChild(ligneMusique);
  contenu.appendChild(ligneLangue);
  contenu.appendChild(ligneVersion);
  panneau.appendChild(contenu);
}

// =====================
// LOGIQUE DES PANNEAUX
// =====================

// Ouvre ou ferme un panneau, ferme les autres
function basculerPanneau(nom) {
  const tous = ["inventaire", "succes", "competences", "shop", "parametres"];

  for (let i = 0; i < tous.length; i++) {
    const panneau = document.getElementById("panneau-" + tous[i]);
    if (tous[i] === nom) {
      if (panneau.style.display === "none") {
        panneau.style.display = "block";
        mettreAJourPanneau(nom);
      } else {
        panneau.style.display = "none";
      }
    } else {
      panneau.style.display = "none";
    }
  }
}

// Met a jour le contenu du panneau avant de l'afficher
function mettreAJourPanneau(nom) {
  if (nom === "inventaire") {
    document.getElementById("inv-count-heal").textContent = "x" + inventaire["potion-heal"];
    document.getElementById("inv-count-boost").textContent = "x" + inventaire["potion-boost"];
  }

  if (nom === "succes") {
    for (let i = 0; i < MONUMENTS.length; i++) {
      const etoile = document.getElementById("succes-etoile-" + MONUMENTS[i].id);
      if (etoile !== null) {
        if (MONUMENTS[i].decouvert) {
          etoile.textContent = "★";
          etoile.style.color = "#f0c040";
        } else {
          etoile.textContent = "☆";
          etoile.style.color = "#555";
        }
      }
    }
  }

  if (nom === "competences") {
    document.getElementById("comp-points").textContent = "Points disponibles : " + pointsCompetences;
    document.getElementById("comp-niveau-attaque").textContent = "Niv. " + competences.attaque;
    document.getElementById("comp-niveau-defense").textContent = "Niv. " + competences.defense;
    document.getElementById("comp-niveau-vie").textContent = "Niv. " + competences.vie;
  }
}

// Ameliore une competence si on a des points
function ameliorerCompetence(type) {
  if (pointsCompetences <= 0) {
    return;
  }

  pointsCompetences = pointsCompetences - 1;
  competences[type] = competences[type] + 1;

  if (type === "attaque") {
    joueur.attaque = joueur.attaque + 5;
  }
  if (type === "defense") {
    joueur.defense = (joueur.defense || 0) + 3;
  }
  if (type === "vie") {
    joueur.hpMax = joueur.hpMax + 20;
    joueur.hp = joueur.hp + 20;
    mettreAJourHUDJoueur();
  }

  mettreAJourPanneau("competences");
}

// Achat dans le shop (or a integrer plus tard)
function acheterItem(cle, prix) {
  inventaire[cle] = inventaire[cle] + 1;
  afficherMessage("Acheté : " + cle);
}

// =====================
// MISE A JOUR HUD
// =====================

// Appele a chaque frame pour tenir les barres a jour
function mettreAJourHUDNavbar() {
  const navFill = document.getElementById("navbar-hp-fill");
  const navText = document.getElementById("navbar-hp-text");
  if (navFill !== null) {
    navFill.style.width = (joueur.hp / joueur.hpMax * 100) + "%";
  }
  if (navText !== null) {
    navText.textContent = joueur.hp + "/" + joueur.hpMax;
  }
}

// Appele quand un monument est decouvert pour mettre a jour les succes
function mettreAJourSucces() {
  mettreAJourPanneau("succes");
}

// Donne un point de competence quand un monument est battu
function donnerPointCompetence() {
  pointsCompetences = pointsCompetences + 1;
}
