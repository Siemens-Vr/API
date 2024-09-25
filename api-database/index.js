// Importer Express
const express = require('express');
const bodyParser = require('body-parser'); // Pour analyser le corps des requêtes POST
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DataBaseRoutes = require('./routes/DatabaseRoute')
const pool = require('./db');
const dotenv = require('dotenv')

require('dotenv').config();

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
};

app.use(cors(corsOptions));

// Middleware pour analyser le corps des requêtes POST
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api-database', DataBaseRoutes);

// Exemple de fonction pour obtenir tous les clients
 async function getClient() {
  try {
    const res = await pool.query('SELECT * FROM client');
    return res.rows; // Retourne les résultats de la requête
  } catch (err) {
    console.error('Erreur lors de la récupération des clients:', err);
    throw err; // Rejeter l'erreur pour la gestion ultérieure
  }
}

 async function getProduct() {
  try {
    const res = await pool.query('SELECT * FROM product');
    return res.rows; // Retourne les résultats de la requête
  } catch (err) {
    console.error('Erreur lors de la récupération des products:', err);
    throw err; // Rejeter l'erreur pour la gestion ultérieure
  }
}

 async function getDownload() {
  try {
    const res = await pool.query('SELECT * FROM download');
    return res.rows; // Retourne les résultats de la requête
  } catch (err) {
    console.error('Erreur lors de la récupération des downloads:', err);
    throw err; // Rejeter l'erreur pour la gestion ultérieure
  }
}

// Exemple de fonction pour ajouter un nouvel employé
 async function addClient(name, lastName, gender, age, company, password, email) {
  try {
    const res = await pool.query(
      'INSERT INTO client(name, lastName, gender, age, company, password, email) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, lastName, gender, age, company, password, email]
    );
    console.log('Nouvel client ajouté:', res.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du client:', err);
  }
}

 async function addProduct(name, price) {
  try {
    const res = await pool.query(
      'INSERT INTO product(name, price) VALUES($1, $2) RETURNING *',
      [name, price]
    );
    console.log('Nouveau product ajouté:', res.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un product:', err);
  }
}

 async function addDownload(id_product, id_client) {
  try {
    const res = await pool.query(
      'INSERT INTO download(client_id, product_id) VALUES($1, $2) RETURNING *',
      [id_client, id_product]
    );
    console.log('Nouvel telechargement ajouté:', res.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du telechargement:', err);
  }
}

// Définir une route GET pour obtenir les clients
app.get('/usersMail', async (req, res) => {
  try {
    const data = req.body;
    const clients = await getClientByEmail(data.email); // Attendre la résolution de la promesse
    res.json(clients); // Envoyer les résultats comme JSON
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des clients');
  }
});

app.get('/users', async (req, res) => {
  try {
    const clients = await getClient(); // Attendre la résolution de la promesse
    res.json(clients); // Envoyer les résultats comme JSON
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des clients');
  }
});


app.get('/download', async (req, res) => {
  try {
    const downloads = await getDownload(); // Attendre la résolution de la promesse
    res.json(downloads); // Envoyer les résultats comme JSON
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des downloads');
  }
});

app.get('/product', async (req, res) => {
  try {
    const products = await getProduct(); // Attendre la résolution de la promesse
    res.json(products); // Envoyer les résultats comme JSON
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des products');
  }
});

app.post('/product', (req, res) => {
  console.log('Requête POST reçue sur /product');
  console.log('Données reçues :', req.body);
  try {
    const data = req.body;
    res.status(200).json({ message: 'Données reçues avec succès', data });
    addProduct(data.name, data.price);
  } catch (error) {
    console.error('Erreur de traitement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


app.post('/users', (req, res) => {
  console.log('Requête POST reçue sur /users');
  console.log('Données reçues :', req.body);
  try {
    const data = req.body;
    addClient(data.name, data.lastName, data.gender, data.age, data.company, data.password, data.email);
    res.status(200).json({ message: 'Données reçues avec succès', data });
  } catch (error) {
    console.error('Erreur de traitement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Le serveur écoute sur le port 5002
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Serveur Express en écoute sur le port ${PORT}`);
});