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

//  async function getProduct(name) {
//   try {
//         // Parameterized query to prevent SQL injection
//         const query = 'SELECT * FROM product WHERE name = $1';
//         const values = [name]; // Define the values array

//         // Execute the query with parameters
//         const res = await pool.query(query, values);
//     return res.rows; // Retourne les résultats de la requête
//   } catch (err) {
//     console.error('Erreur lors de la récupération des products:', err);
//     throw err; // Rejeter l'erreur pour la gestion ultérieure
//   }
// }
async function getProducts() {
  try {
    const res = await pool.query('SELECT * FROM product');
    console.log('Fetched products:', res.rows); // Log fetched products
    return res.rows;
  } catch (err) {
    console.error('Erreur lors de la récupération des products:', err);
    throw err;
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



async function getClientByEmail(email) {
  try {
      
      // Parameterized query to prevent SQL injection
      const query = 'SELECT * FROM public.client WHERE email = $1';
      const values = [email]; // Define the values array

      // Execute the query with parameters
      const res = await pool.query(query, values);
      
      // Return the rows
      return res.rows;
  } catch (err) {
      console.error('Erreur lors de la récupération des clients:', err);
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

async function addProduct(
  productName, 
  longDescription, 
  price, 
  owner, 
  model, 
  licence, 
  downloadSize, 
  textures, 
  path
) {
  try {
    const res = await pool.query(
      `INSERT INTO product(
        "productName", 
        "longDescription", 
        "price", 
        "owner", 
        "model", 
        "licence", 
        "downloadSize", 
        "textures", 
        "path"
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [productName, longDescription, price, owner, model, licence, downloadSize, textures, path]
    );
    console.log('Nouveau product ajouté:', res.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un product:', err);
  }
}

async function getProductById(id) {
  try {
    const res = await pool.query('SELECT * FROM product WHERE id = $1', [id]); // Use parameterized query to prevent SQL injection
    console.log('Fetched product:', res.rows); // Log fetched product
    return res.rows.length > 0 ? res.rows[0] : null; // Return the first product or null if not found
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    throw err;
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
app.get('/userMail', async (req, res) => {
  try {
    const clients = await getClientByEmail(req.query.email); // Attendre la résolution de la promesse
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


app.post('/newDownload', async (req, res) => {
  try {
    const data = req.body.params;
    console.log(data)
    const downloads = await addDownload(data.productId, data.userId); // Attendre la résolution de la promesse
    res.json(downloads); // Envoyer les résultats comme JSON
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des downloads');
  }
});


// app.get('/product', async (req, res) => {
//   try {
//     const products = await getProduct(req.query.productName); // Attendre la résolution de la promesse
//     res.json(products); // Envoyer les résultats comme JSON
//   } catch (err) {
//     res.status(500).send('Erreur lors de la récupération des products');
//   }
// });

app.get('/product', async (req, res) => {
  try {
    const products = await getProducts(); // Fetch products
    if (!products) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.status(200).json(products); 
  } catch (err) {
    console.error('Error fetching products:', err); 
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/products', async (req, res) => {
  const { id } = req.query; // Get id from query parameters

  try {
    let product;
    if (id) {
      product = await getProductById(id); // Fetch product by ID
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
    } else {
      const products = await getProducts(); // Fetch all products if no ID is provided
      if (!products) {
        return res.status(404).json({ message: 'No products found' });
      }
      return res.status(200).json(products);
    }
    res.status(200).json(product); // Return the fetched product
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



app.post('/product', (req, res) => {
  console.log('Requête POST reçue sur /product');
  console.log('Données reçues :', req.body);
  try {
    const {
      productName, 
      longDescription, 
      price, 
      owner, 
      model, 
      licence, 
      downloadSize, 
      textures, 
      path
    } = req.body;

    // Pass the extracted values to addProduct
    addProduct(
      productName, 
      longDescription, 
      price, 
      owner, 
      model, 
      licence, 
      downloadSize, 
      textures, 
      path
    );

    res.status(200).json({ message: 'Données reçues avec succès', data: req.body });
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
  console.log(`Express server listening on port ${PORT}`);
});