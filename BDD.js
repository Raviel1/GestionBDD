const mysql = require('mysql');
const fs = require('fs');
const readline = require('readline');
// Récupérer le résultat de la requête et convertir en entier
let num_articles = 0;

// Connexion à la base de données
const connexion = mysql.createConnection({
   host: '127.0.0.1',
   user: 'root',
   password: '',
   database: 'drupaldb'
});


// Fonction pour insérer un nouvel article dans la table ARTICLE (CONTENU EST UN JSON)
function Insertion(CONTENU) {
  let TITRE = '';

  //Creation d'un nouvel article
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Quel est le titre de votre article ? ', (name) => {
    TITRE = name;
    const date_creation = new Date().getTime(); // récupère la date actuelle au format timestamp
    const sql_insert_article = `
    INSERT INTO ARTICLE (TITRE, date_creation, CONTENU) VALUES (?,FROM_UNIXTIME(?), ?)`;
    
    connexion.query(sql_insert_article, [TITRE, date_creation/1000, CONTENU], (err, result) => {
       if (err) throw err;
       console.log('Nouvel article ajouté avec succès');
       console.log('ID de l\'article ajouté :', result.insertId);
       rl.close(); // fermeture de l'interface readline dans la callback de la méthode query
    });
  });
}


//INSERER A PARTIR D'UN RESUME
function insertionParResume(TITRE, resume) {
  const date_creation = new Date().getTime(); // récupère la date actuelle au format timestamp
  const DATA = {
    resume: resume.split('.'),
  };
  const CONTENU = JSON.stringify(DATA);
  const sql_insert_article = `INSERT INTO ARTICLE (TITRE, date_creation, CONTENU) VALUES (?,FROM_UNIXTIME(?), ?)`;
    
  connexion.query(sql_insert_article, [TITRE, date_creation/1000, CONTENU], (err, result) => {
    if (err) throw err;
    console.log('Nouvel article ajouté avec succès');
    console.log('ID de l\'article ajouté :', result.insertId);
    rl.close(); // fermeture de l'interface readline dans la callback de la méthode query
  });  
}
function ajouterResumeArticle(id_article, nouveauResume) {
  // Récupérer l'article correspondant à l'aide de son ID
  const sql_select_article = `SELECT * FROM ARTICLE WHERE ID = ?`;
  connexion.query(sql_select_article, [id_article], (err, result) => {
    if (err) throw err;

    // Vérifier si l'article a été trouvé
    if (result.length === 0) {
      console.log('Aucun article trouvé avec cet ID');
      return;
    }

    // Récupérer la propriété "resume" de l'article
    const resume = JSON.parse(result[0].CONTENU).resume;

    // Ajouter le nouveau résumé à la fin du tableau existant
    resume.push(nouveauResume);

    // Mettre à jour la propriété "resume" de l'article dans la base de données
    const CONTENU = JSON.stringify({resume: resume, motsClefs: []});
    const sql_update_article = `UPDATE ARTICLE SET CONTENU = ? WHERE ID = ?`;
    connexion.query(sql_update_article, [CONTENU, id_article], (err, result) => {
      if (err) throw err;

      console.log('Résumé ajouté avec succès à l\'article');
    });
  });
}
// Fonction pour insérer un nouvel article dans la table ARTICLE (CONTENU EST UN JSON)
function insertionParMotClefs(TITRE, motsCles) {
  const date_creation = new Date().getTime(); // récupère la date actuelle au format timestamp
  const resume = {
    resume: [],
    motsClefs: motsCles.split(',')
  };
  const CONTENU = JSON.stringify(DATA);
  const sql_insert_article = `INSERT INTO ARTICLE (TITRE, date_creation, CONTENU) VALUES (?,FROM_UNIXTIME(?), ?)`;
    
  connexion.query(sql_insert_article, [TITRE, date_creation/1000, CONTENU], (err, result) => {
    if (err) throw err;
    console.log('Nouvel article ajouté avec succès');
    console.log('ID de l\'article ajouté :', result.insertId);
    rl.close(); // fermeture de l'interface readline dans la callback de la méthode query
  });  
}

//AJOUT MOTSCLEFS (inserer nouveau tableau pour remplacer l'ancien)
function ajouterMotsCles(id_article, nouveauxMotsCles) {
  // Récupérer l'article correspondant à l'aide de son ID
  const sql_select_article = `SELECT * FROM ARTICLE WHERE ID = ?`;
  connexion.query(sql_select_article, [id_article], (err, result) => {
    if (err) throw err;

    // Vérifier si l'article a été trouvé
    if (result.length === 0) {
      console.log('Aucun article trouvé avec cet ID');
      return;
    }

    // Récupérer la propriété "motsClef" de l'article
    const motsClef = JSON.parse(result[0].CONTENU).motsClefs;

    // Ajouter de nouveaux mots-clés au tableau existant
    nouveauxMotsCles.forEach(motCle => {
      motsClef.push(motCle);
    });

    // Mettre à jour la propriété "motsClef" de l'article dans la base de données
    const CONTENU = JSON.stringify({resume: [], motsClefs: motsClef});
    const sql_update_article = `UPDATE ARTICLE SET CONTENU = ? WHERE ID = ?`;
    connexion.query(sql_update_article, [CONTENU, id_article], (err, result) => {
      if (err) throw err;

      console.log('Article mis à jour avec succès');
    });
  });
}

//recherche dans la base de donnee en fonction d'un mot clef
function rechercheParMotClefs(motsCles) {
   const sql = `
     SELECT * FROM ARTICLE
     WHERE JSON_CONTAINS(mots_cles, ?)`;
 
   connexion.query(sql, [`${motsCles}`], (err, result) => {
     if (err) throw err;
     console.log(`Résultats de recherche pour les mots-clés "${motsCles}":`);
     console.log(result);
   });
 }

/////////////////////////////////////////////////////////////  MAIN   /////////////////////////////////////////////////////////////////////
connexion.connect();

// Création de la table ARTICLE
const sql_create_article = `
CREATE TABLE IF NOT EXISTS ARTICLE (
   ID int(6) AUTO_INCREMENT PRIMARY KEY,
   TITRE varchar(100) DEFAULT NULL,
   date_creation DATETIME,
   date_modification DATETIME DEFAULT NULL,
   resume json
   motsclef json

)`;


// Exécution des requêtes SQL de création de tables

//Creation de la table ARTICLE
connexion.query(sql_create_article, (err) => {
   if (err) throw err;
   console.log('Table ARTICLE créée avec succès');
});



//EXEMPLE D'INSERTION : Insertion(donnees_json);
//insertion avec resume



//insertion avec mots clef


// Fermeture de la connexion à la base de données
connexion.end();
