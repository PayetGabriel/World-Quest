// Points de compétences disponibles au départ
let pointsCompetences = 3;

// Niveau actuel de chaque compétence
let competences = {
  attaque: 0,
  defense: 0,
  vie: 0
};

// =====================
// INITIALISATION
// =====================

function initialiserHUD() {
  creerNavbar();
  creerMinimap();
  creerPanneauInventaire();
  creerPanneauSucces();
  creerPanneauCompetences();
  creerPanneauShop();
  creerPanneauMap();
  creerPanneauParametres();

  document.addEventListener("keydown", function(event) {
    if (combatEnCours) {
      return;
    }
    if (event.key === "i" || event.key === "I") {
      basculerPanneau("inventaire");
    }
    if (event.key === "c" || event.key === "C") {
      basculerPanneau("competences");
    }
  });
}

// =====================
// NAVBAR
// =====================

function creerNavbar() {
  let nav = document.createElement("div");
  nav.id = "navbar-haut";
  document.getElementById("game-wrapper").appendChild(nav);

  // Bouton EXIT à gauche
  let exit = creerBoutonIcone("Sortie.png", "Quitter", function() {
    let confirmation = confirm("Quitter le jeu ?");
    if (confirmation) {
      location.reload();
    }
  });
  exit.id = "nav-exit";
  nav.appendChild(exit);

  // Bloc central : barre de vie + boutons icônes ensemble
  let centre = document.createElement("div");
  centre.id = "nav-centre";
  nav.appendChild(centre);

  // Barre de vie dans le bloc central
  let pvZone = document.createElement("div");
  pvZone.id = "nav-pv-zone";

  let coeur = document.createElement("img");
  coeur.src = "assets/nav/extract/Coeur.png";
  coeur.id = "nav-coeur-img";
  coeur.alt = "PV";

  // 3 contours imbriqués autour de la barre
  let pvOuter = document.createElement("div");
  pvOuter.id = "nav-pv-outer";

  let pvMid = document.createElement("div");
  pvMid.id = "nav-pv-mid";

  let pvInner = document.createElement("div");
  pvInner.id = "nav-pv-inner";

  let pvWrap = document.createElement("div");
  pvWrap.id = "nav-pv-wrap";

  let pvFill = document.createElement("div");
  pvFill.id = "nav-pv-fill";

  let pvText = document.createElement("span");
  pvText.id = "nav-pv-text";
  pvText.textContent = "100/100";

  pvWrap.appendChild(pvFill);
  pvWrap.appendChild(pvText);
  pvInner.appendChild(pvWrap);
  pvMid.appendChild(pvInner);
  pvOuter.appendChild(pvMid);
  pvZone.appendChild(coeur);
  pvZone.appendChild(pvOuter);
  centre.appendChild(pvZone);

  // Séparateur vertical entre PV et boutons
  let sep = document.createElement("div");
  sep.id = "nav-sep";
  centre.appendChild(sep);

  // Les 5 boutons du centre
  // On utilise une fonction intermédiaire pour fixer la valeur dans la boucle
  let boutonsData = [
    { icone: "Inventaire.png",  label: "Inventaire",  panneau: "inventaire" },
    { icone: "Succès.png",      label: "Succès",       panneau: "succes" },
    { icone: "Compétences.png", label: "Compétences",  panneau: "competences" },
    { icone: "Coffre.png",      label: "Shop",         panneau: "shop" },
    { icone: "Map.png",         label: "Map",          panneau: "map" }
  ];

  for (let i = 0; i < boutonsData.length; i++) {
    let data = boutonsData[i];

    let bouton = creerBoutonIcone(data.icone, data.label, (function(nomPanneau) {
      return function() {
        basculerPanneau(nomPanneau);
      };
    })(data.panneau));

    centre.appendChild(bouton);
  }

  // Bouton PARAMÈTRES à droite
  let params = creerBoutonIcone("Paramètres.png", "Paramètres", function() {
    basculerPanneau("parametres");
  });
  params.id = "nav-params";
  nav.appendChild(params);
}

// Crée un bouton icône avec fond Boutton.png
function creerBoutonIcone(fichierIcone, label, action) {
  let wrap = document.createElement("div");
  wrap.className = "nav-btn-wrap";

  let btn = document.createElement("button");
  btn.className = "nav-btn";
  btn.style.backgroundImage = "url('assets/nav/extract/Boutton.png')";

  let img = document.createElement("img");
  img.src = "assets/nav/extract/" + fichierIcone;
  img.alt = label;
  img.className = "nav-icone";

  btn.appendChild(img);
  btn.addEventListener("click", action);

  let lbl = document.createElement("span");
  lbl.className = "nav-label";
  lbl.textContent = label;

  wrap.appendChild(btn);
  wrap.appendChild(lbl);

  return wrap;
}

// =====================
// MINIMAP
// =====================

let canvasMinimap = null;
let ctxMinimap = null;

function creerMinimap() {
  let wrapper = document.createElement("div");
  wrapper.id = "minimap-wrapper";

  canvasMinimap = document.createElement("canvas");
  canvasMinimap.width = 160;
  canvasMinimap.height = 90;
  ctxMinimap = canvasMinimap.getContext("2d");

  wrapper.appendChild(canvasMinimap);
  document.getElementById("game-wrapper").appendChild(wrapper);
}

function mettreAJourMinimap(mapImage) {
  if (ctxMinimap === null || mapImage === null) {
    return;
  }

  ctxMinimap.drawImage(mapImage, 0, 0, 160, 90);

  let mx = (joueur.x / MAP_LARGEUR) * 160;
  let my = (joueur.y / MAP_HAUTEUR) * 90;
  ctxMinimap.fillStyle = "#fff";
  ctxMinimap.beginPath();
  ctxMinimap.arc(mx, my, 3, 0, Math.PI * 2);
  ctxMinimap.fill();

  let cx = (camera.x / MAP_LARGEUR) * 160;
  let cy = (camera.y / MAP_HAUTEUR) * 90;
  let cw = (camera.largeur / MAP_LARGEUR) * 160;
  let ch = (camera.hauteur / MAP_HAUTEUR) * 90;
  ctxMinimap.strokeStyle = "rgba(255,255,255,0.5)";
  ctxMinimap.lineWidth = 1;
  ctxMinimap.strokeRect(cx, cy, cw, ch);
}

// =====================
// PANNEAUX — coquille commune
// =====================

function creerCoquillePanneau(id, titre) {
  let panneau = document.createElement("div");
  panneau.id = id;
  panneau.className = "panneau";

  let entete = document.createElement("div");
  entete.className = "panneau-entete";

  // Bloc gauche : titre + sous-titre (sous-titre rempli plus tard si besoin)
  let blocGauche = document.createElement("div");
  blocGauche.className = "panneau-entete-gauche";

  let labelTitre = document.createElement("span");
  labelTitre.className = "panneau-titre";
  labelTitre.textContent = titre;

  let labelSousTitre = document.createElement("span");
  labelSousTitre.className = "panneau-sous-titre";
  labelSousTitre.id = id + "-sous-titre";

  blocGauche.appendChild(labelTitre);
  blocGauche.appendChild(labelSousTitre);

  let btnFermer = document.createElement("button");
  btnFermer.className = "panneau-fermer";
  btnFermer.textContent = "✕";
  btnFermer.addEventListener("click", function() {
    panneau.style.display = "none";
  });

  entete.appendChild(blocGauche);
  entete.appendChild(btnFermer);

  let corps = document.createElement("div");
  corps.className = "panneau-corps";
  corps.id = id + "-corps";

  panneau.appendChild(entete);
  panneau.appendChild(corps);

  document.getElementById("game-wrapper").appendChild(panneau);
}

// Crée une ligne item réutilisable (inventaire, shop)
function creerLigneItem(fichierIcone, nom, desc, idCount, action) {
  let ligne = document.createElement("div");
  ligne.className = "item-ligne";

  let icone = document.createElement("img");
  icone.src = "assets/nav/extract/" + fichierIcone;
  icone.className = "item-icone";
  icone.alt = "";

  let info = document.createElement("div");
  info.className = "item-info";

  let nomEl = document.createElement("div");
  nomEl.className = "item-nom";
  nomEl.textContent = nom;

  let descEl = document.createElement("div");
  descEl.className = "item-desc";
  descEl.textContent = desc;

  info.appendChild(nomEl);
  info.appendChild(descEl);

  let count = document.createElement("span");
  count.className = "item-count";
  count.id = idCount;
  count.textContent = "x0";

  let btn = document.createElement("button");
  btn.className = "item-btn";
  btn.textContent = "Utiliser";
  btn.addEventListener("click", action);

  ligne.appendChild(icone);
  ligne.appendChild(info);
  ligne.appendChild(count);
  ligne.appendChild(btn);

  return ligne;
}

// ---- Inventaire ----

function creerPanneauInventaire() {
  creerCoquillePanneau("panneau-inventaire", "Inventaire");
  let corps = document.getElementById("panneau-inventaire-corps");

  corps.appendChild(creerLigneItem("Potion rouge.png", "Potion de soin", "Restaure 30 PV", "inv-count-heal", function() {
    useItemHorsCombat("potion-heal");
  }));

  corps.appendChild(creerLigneItem("Potion marron.png", "Potion de boost", "+10 ATT / 5 attaques", "inv-count-boost", function() {
    useItemHorsCombat("potion-boost");
  }));
}

// ---- Succès ----

function creerPanneauSucces() {
  creerCoquillePanneau("panneau-succes", "Succès");
  let corps = document.getElementById("panneau-succes-corps");

  for (let i = 0; i < MONUMENTS.length; i++) {
    let monument = MONUMENTS[i];

    let ligne = document.createElement("div");
    ligne.className = "succes-ligne";

    let etoile = document.createElement("span");
    etoile.className = "succes-etoile";
    etoile.id = "succes-etoile-" + monument.id;
    etoile.textContent = "☆";

    let nomEl = document.createElement("span");
    nomEl.className = "succes-nom";
    nomEl.textContent = monument.nom;

    let paysEl = document.createElement("span");
    paysEl.className = "succes-pays";
    paysEl.textContent = monument.pays;

    ligne.appendChild(etoile);
    ligne.appendChild(nomEl);
    ligne.appendChild(paysEl);
    corps.appendChild(ligne);
  }
}

// ---- Compétences ----

function creerPanneauCompetences() {
  creerCoquillePanneau("panneau-competences", "Compétences");
  let corps = document.getElementById("panneau-competences-corps");

  // Le sous-titre dans l'en-tête affiche les points dispo
  let sousTitre = document.getElementById("panneau-competences-sous-titre");
  if (sousTitre !== null) {
    sousTitre.textContent = "Points disponibles : " + pointsCompetences;
    sousTitre.id = "comp-points";
  }

  // Icônes correspondant à chaque stat
  let statsData = [
    { id: "attaque", label: "Attaque",  desc: "+5 ATT par niveau", icone: "Compétences.png" },
    { id: "defense", label: "Défense",  desc: "+3 DEF par niveau", icone: "Casque 1.png"    },
    { id: "vie",     label: "Vie max",  desc: "+20 PV par niveau", icone: "Coeur.png"        }
  ];

  for (let i = 0; i < statsData.length; i++) {
    let stat = statsData[i];

    let ligne = document.createElement("div");
    ligne.className = "item-ligne";

    // Icône à gauche
    let icone = document.createElement("img");
    icone.src = "assets/nav/extract/" + stat.icone;
    icone.className = "item-icone";
    icone.alt = "";

    // Texte au centre
    let info = document.createElement("div");
    info.className = "item-info";

    let nomEl = document.createElement("div");
    nomEl.className = "item-nom";
    nomEl.textContent = stat.label;

    let descEl = document.createElement("div");
    descEl.className = "item-desc";
    descEl.textContent = stat.desc;

    info.appendChild(nomEl);
    info.appendChild(descEl);

    // Bloc droite : niveau empilé au-dessus du bouton
    let droite = document.createElement("div");
    droite.className = "item-droite";

    let niveauLabel = document.createElement("span");
    niveauLabel.className = "item-count";
    niveauLabel.id = "comp-niveau-" + stat.id;
    niveauLabel.textContent = "Niv. 0";

    let btnPlus = document.createElement("button");
    btnPlus.className = "item-btn";
    btnPlus.textContent = "+";
    btnPlus.addEventListener("click", (function(idStat) {
      return function() {
        ameliorerCompetence(idStat);
      };
    })(stat.id));

    droite.appendChild(niveauLabel);
    droite.appendChild(btnPlus);

    ligne.appendChild(icone);
    ligne.appendChild(info);
    ligne.appendChild(droite);
    corps.appendChild(ligne);
  }
}

// ---- Shop ----

function creerPanneauShop() {
  creerCoquillePanneau("panneau-shop", "Shop");
  let corps = document.getElementById("panneau-shop-corps");

  let orLabel = document.createElement("div");
  orLabel.className = "shop-or";
  orLabel.id = "shop-or";
  orLabel.textContent = "Or : 0";
  corps.appendChild(orLabel);

  let itemsShop = [
    { icone: "Potion rouge.png",  nom: "Potion de soin",  desc: "Restaure 30 PV",      cle: "potion-heal",  prix: 50 },
    { icone: "Potion marron.png", nom: "Potion de boost", desc: "+10 ATT / 5 attaques", cle: "potion-boost", prix: 80 }
  ];

  for (let i = 0; i < itemsShop.length; i++) {
    let item = itemsShop[i];

    let ligne = document.createElement("div");
    ligne.className = "item-ligne";

    let icone = document.createElement("img");
    icone.src = "assets/nav/extract/" + item.icone;
    icone.className = "item-icone";
    icone.alt = "";

    let info = document.createElement("div");
    info.className = "item-info";

    let nomEl = document.createElement("div");
    nomEl.className = "item-nom";
    nomEl.textContent = item.nom;

    let descEl = document.createElement("div");
    descEl.className = "item-desc";
    descEl.textContent = item.desc;

    info.appendChild(nomEl);
    info.appendChild(descEl);

    let btnAcheter = document.createElement("button");
    btnAcheter.className = "item-btn item-btn-or";
    btnAcheter.textContent = item.prix + " or";
    btnAcheter.addEventListener("click", (function(cle, prix) {
      return function() {
        acheterItem(cle, prix);
      };
    })(item.cle, item.prix));

    ligne.appendChild(icone);
    ligne.appendChild(info);
    ligne.appendChild(btnAcheter);
    corps.appendChild(ligne);
  }
}

// ---- Map — plein écran indépendant (pas un .panneau classique) ----

function creerPanneauMap() {
  let ecran = document.createElement("div");
  ecran.id = "panneau-map";
  document.getElementById("game-wrapper").appendChild(ecran);

  // Canvas plein écran
  let canvasMap = document.createElement("canvas");
  canvasMap.id = "map-panel-canvas";
  ecran.appendChild(canvasMap);

  // Bouton ✕ en haut à droite — fond Boutton.png, texte × en dégradé rouge
  let btn = document.createElement("button");
  btn.id = "map-btn-fermer";
  btn.className = "nav-btn";
  btn.style.backgroundImage = "url('assets/nav/extract/Boutton.png')";

  let croix = document.createElement("span");
  croix.id = "map-croix";
  croix.textContent = "×";

  btn.appendChild(croix);
  btn.addEventListener("click", function() {
    ecran.style.display = "none";
  });

  ecran.appendChild(btn);

  // Touche M pour ouvrir, Échap pour fermer
  document.addEventListener("keydown", function(event) {
    if (event.key === "m" || event.key === "M") {
      if (combatEnCours) { return; }
      if (ecran.style.display === "none" || ecran.style.display === "") {
        ecran.style.display = "block";
        mettreAJourPanneauMap();
      } else {
        ecran.style.display = "none";
      }
    }
    if (event.key === "Escape" && !combatEnCours) {
      ecran.style.display = "none";
    }
  });
}

function mettreAJourPanneauMap() {
  let c = document.getElementById("map-panel-canvas");
  if (c === null || typeof mapImage === "undefined" || mapImage === null) {
    return;
  }

  // On adapte la taille du canvas à l'écran
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  let ctx2 = c.getContext("2d");

  // On dessine la map en gardant les proportions, centrée
  let ratioMap = MAP_LARGEUR / MAP_HAUTEUR;
  let ratioEcran = window.innerWidth / window.innerHeight;

  let drawW, drawH, drawX, drawY;

  if (ratioEcran > ratioMap) {
    drawH = window.innerHeight;
    drawW = drawH * ratioMap;
    drawX = (window.innerWidth - drawW) / 2;
    drawY = 0;
  } else {
    drawW = window.innerWidth;
    drawH = drawW / ratioMap;
    drawX = 0;
    drawY = (window.innerHeight - drawH) / 2;
  }

  ctx2.drawImage(mapImage, drawX, drawY, drawW, drawH);

  // Points monuments
  for (let i = 0; i < MONUMENTS.length; i++) {
    let m = MONUMENTS[i];
    let mx = drawX + (m.x / MAP_LARGEUR) * drawW;
    let my = drawY + (m.y / MAP_HAUTEUR) * drawH;
    ctx2.fillStyle = m.decouvert ? "#f0c040" : "#e74c3c";
    ctx2.beginPath();
    ctx2.arc(mx, my, 6, 0, Math.PI * 2);
    ctx2.fill();
  }

  // Point joueur
  let jx = drawX + (joueur.x / MAP_LARGEUR) * drawW;
  let jy = drawY + (joueur.y / MAP_HAUTEUR) * drawH;
  ctx2.fillStyle = "#fff";
  ctx2.beginPath();
  ctx2.arc(jx, jy, 7, 0, Math.PI * 2);
  ctx2.fill();
}

// ---- Paramètres ----

function creerPanneauParametres() {
  creerCoquillePanneau("panneau-parametres", "Paramètres");
  let corps = document.getElementById("panneau-parametres-corps");

  let ligneMusique = document.createElement("div");
  ligneMusique.className = "param-ligne";

  let labelMusique = document.createElement("span");
  labelMusique.textContent = "Musique";

  let btnMusique = document.createElement("button");
  btnMusique.className = "item-btn";
  btnMusique.id = "btn-musique";
  btnMusique.textContent = "ON";
  btnMusique.addEventListener("click", function() {
    if (btnMusique.textContent === "ON") {
      btnMusique.textContent = "OFF";
    } else {
      btnMusique.textContent = "ON";
    }
  });

  ligneMusique.appendChild(labelMusique);
  ligneMusique.appendChild(btnMusique);

  let ligneLangue = document.createElement("div");
  ligneLangue.className = "param-ligne";

  let labelLangue = document.createElement("span");
  labelLangue.textContent = "Langue";

  let select = document.createElement("select");
  select.className = "param-select";

  let optFr = document.createElement("option");
  optFr.value = "fr";
  optFr.textContent = "Français";
  select.appendChild(optFr);

  ligneLangue.appendChild(labelLangue);
  ligneLangue.appendChild(select);

  let version = document.createElement("div");
  version.className = "param-version";
  version.textContent = "Version 0.1 — World Quest";

  corps.appendChild(ligneMusique);
  corps.appendChild(ligneLangue);
  corps.appendChild(version);
}

// =====================
// LOGIQUE DES PANNEAUX
// =====================

function basculerPanneau(nom) {
  // La map est un plein écran à part, pas un .panneau classique
  if (nom === "map") {
    let ecranMap = document.getElementById("panneau-map");
    if (ecranMap === null) { return; }
    if (ecranMap.style.display === "none" || ecranMap.style.display === "") {
      ecranMap.style.display = "block";
      mettreAJourPanneauMap();
    } else {
      ecranMap.style.display = "none";
    }
    return;
  }

  let tous = ["inventaire", "succes", "competences", "shop", "parametres"];

  for (let i = 0; i < tous.length; i++) {
    let panneau = document.getElementById("panneau-" + tous[i]);
    if (panneau === null) {
      continue;
    }
    if (tous[i] === nom) {
      if (panneau.style.display === "none" || panneau.style.display === "") {
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

function mettreAJourPanneau(nom) {
  if (nom === "inventaire") {
    let h = document.getElementById("inv-count-heal");
    let b = document.getElementById("inv-count-boost");
    if (h !== null) { h.textContent = "x" + inventaire["potion-heal"]; }
    if (b !== null) { b.textContent = "x" + inventaire["potion-boost"]; }
  }

  if (nom === "succes") {
    for (let i = 0; i < MONUMENTS.length; i++) {
      let el = document.getElementById("succes-etoile-" + MONUMENTS[i].id);
      if (el === null) { continue; }
      if (MONUMENTS[i].decouvert) {
        el.textContent = "★";
        el.style.color = "#f0c040";
      } else {
        el.textContent = "☆";
        el.style.color = "#555";
      }
    }
  }

  if (nom === "competences") {
    // Le sous-titre est dans l'en-tête du panneau
    let el = document.getElementById("comp-points");
    if (el !== null) { el.textContent = "Points disponibles : " + pointsCompetences; }
    let ids = ["attaque", "defense", "vie"];
    for (let i = 0; i < ids.length; i++) {
      let niv = document.getElementById("comp-niveau-" + ids[i]);
      if (niv !== null) { niv.textContent = "Niv. " + competences[ids[i]]; }
    }
  }
}

// =====================
// ACTIONS
// =====================

function ameliorerCompetence(type) {
  if (pointsCompetences <= 0) {
    return;
  }
  pointsCompetences = pointsCompetences - 1;
  competences[type] = competences[type] + 1;

  if (type === "attaque") { joueur.attaque = joueur.attaque + 5; }
  if (type === "defense") { joueur.defense = (joueur.defense || 0) + 3; }
  if (type === "vie") {
    joueur.hpMax = joueur.hpMax + 20;
    joueur.hp = joueur.hp + 20;
    mettreAJourHUDJoueur();
  }

  mettreAJourPanneau("competences");
}

function acheterItem(cle, prix) {
  inventaire[cle] = inventaire[cle] + 1;
  afficherMessage("Acheté : " + cle);
}

function useItemHorsCombat(type) {
  if (type === "potion-heal") {
    if (inventaire["potion-heal"] <= 0) {
      afficherMessage("Plus de potions de soin !");
      return;
    }
    inventaire["potion-heal"] = inventaire["potion-heal"] - 1;
    joueur.hp = joueur.hp + 30;
    if (joueur.hp > joueur.hpMax) { joueur.hp = joueur.hpMax; }
    mettreAJourHUDJoueur();
    mettreAJourHUDNavbar();
    afficherMessage("Potion de soin utilisée : +30 PV !");
  }

  if (type === "potion-boost") {
    if (inventaire["potion-boost"] <= 0) {
      afficherMessage("Plus de potions de boost !");
      return;
    }
    inventaire["potion-boost"] = inventaire["potion-boost"] - 1;
    joueur.attackBoost = 10;
    joueur.attackBoostTours = 5;
    afficherMessage("Potion de boost activée : +10 ATT pour 5 attaques !");
  }

  mettreAJourPanneau("inventaire");
}

// =====================
// MISE À JOUR HUD
// =====================

function mettreAJourHUDNavbar() {
  let fill = document.getElementById("nav-pv-fill");
  let text = document.getElementById("nav-pv-text");
  if (fill !== null) { fill.style.width = (joueur.hp / joueur.hpMax * 100) + "%"; }
  if (text !== null) { text.textContent = joueur.hp + "/" + joueur.hpMax; }
}

function mettreAJourSucces() {
  mettreAJourPanneau("succes");
}

function donnerPointCompetence() {
  pointsCompetences = pointsCompetences + 1;
}