// Importer Express
const express = require('express');
const bodyParser = require('body-parser'); // Pour analyser le corps des requêtes POST
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const path = require('path');
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

const uploadPath = path.join(__dirname, 'uploads');

// Check if the uploads folder exists; if not, create it
async function ensureUploadDirectory() {
  try {
    await fs.access(uploadPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(uploadPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

// Call this function before setting up your routes
ensureUploadDirectory().catch(console.error);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Use the defined upload path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

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
async function addClient(name, lastName, gender, age, company, password, email, role) {
  try {
    const res = await pool.query(
      'INSERT INTO client(name, lastName, gender, age, company, password, email, role) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, lastName, gender, age, company, password, email, role]
    );
    console.log('New client added:', res.rows[0]);
  } catch (err) {
    console.error('Error adding client:', err);
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
         "publishDate", 
        "textures", 
        "path"
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [productName, longDescription, price, owner, model, licence, downloadSize, publishDate, textures, path]
    );
    console.log('New product added:', res.rows[0]);
  } catch (err) {
    console.error('Error adding product:', err);
    throw err; // Rethrow the error to be caught in the route handler
  }
}

// Function to update client by id
async function updateClientById(id, newData) {
  try {
    // Destructure the newData to extract the fields to update
    const { name, lastname, gender, age, company } = newData;

    // SQL update query with parameterized values
    const query = `
      UPDATE public.client
      SET name = $1, lastname = $2, gender = $3, age = $4, company = $5
      WHERE id = $6
      RETURNING *;
    `;

    const values = [name, lastname, gender, age, company, id];

    // Execute the query
    const res = await pool.query(query, values);

    return res.rows[0]; // Return the updated client
  } catch (err) {
    console.error('Error updating client:', err);
    throw err;
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

// Function to delete client by id
async function deleteClientById(id) {
  try {
    // SQL query to delete the user by id
    const query = 'DELETE FROM public.client WHERE id = $1 RETURNING *';
    const values = [id];

    // Execute the query
    const res = await pool.query(query, values);

    return res.rows[0]; // Return the deleted client
  } catch (err) {
    console.error('Error deleting client:', err);
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
    return res.rows[0];  // Return the newly added download
  } catch (err) {
    console.error('Erreur lors de l\'ajout du telechargement:', err);
    throw err;  // Rethrow the error to be caught in the route handler
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
    const { productId, userId } = req.body;  
    console.log({ productId, userId });
    const downloads = await addDownload(productId, userId);
    res.json(downloads);
  } catch (err) {
    console.error('Error adding download:', err);
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


// Function to serve files
app.get('/uploads/:filename', async (req, res) => {
  const filename = req.params.filename;
  console.log('Requested filename:', filename);

  // Use the correct base path
  const uploadsDir = '/opt/render/project/src/api-database/uploads';
  const filePath = path.join(uploadsDir, filename);

  console.log('Attempting to access file:', filePath);

  try {
    // Check if the file exists and is readable
    await fs.access(filePath, fs.constants.R_OK);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    console.log('File stats:', stats);

    // Stream the file to the response
    const fileStream = createReadStream(filePath);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);

    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).send('Error during file download');
      } else {
        res.end();
      }
    });

  } catch (err) {
    console.error('File not accessible:', err);
    res.status(404).send('File not found or not accessible');
  }
});

app.post('/product', upload.single('apkFile'), async (req, res) => {
  console.log('POST request received on /product');
  console.log('Received data:', req.body);
  console.log('Uploaded file:', req.file);

  try {
      const {
          productName, 
          longDescription, 
          price, 
          owner, 
          model, 
          licence, 
          downloadSize,
          publishDate,
          textures
      } = req.body;

      let path = ''; // Initialize apkPath here
      if (req.file) {
          path = `http://localhost:5002/uploads/${req.file.filename}`; 
      }
      console.log('APK Path:', path);

      // Pass the extracted values to addProduct
      await addProduct(
          productName, 
          longDescription, 
          price, 
          owner, 
          model, 
          licence, 
          downloadSize, 
          publishDate,
          textures, 
          path ,
      );

      res.status(200).json({ message: 'Data received successfully'});
  } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({ message: 'Server error' });
  }
});



// Update a product by ID
app.patch('/product/:id', async (req, res) => {
  const { id } = req.params; 
  console.log(`PUT request received on /product/${id}`);
  console.log('Received data:', req.body);

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

  try {
    const result = await pool.query(
      `UPDATE product
       SET "productName" = $1, 
           "longDescription" = $2, 
           "price" = $3, 
           "owner" = $4, 
           "model" = $5, 
           "licence" = $6, 
           "downloadSize" = $7, 
           "textures" = $8, 
           "path" = $9
       WHERE id = $10 
       RETURNING *`,
      [productName, longDescription, price, owner, model, licence, downloadSize, textures, path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product updated:', result.rows[0]);
    res.status(200).json({ message: 'Product updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating the product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product by ID
app.delete('/product/:id', async (req, res) => {
  const { id } = req.params; 
  console.log(`DELETE request received on /product/${id}`);

  try {
    const result = await pool.query(
      `DELETE FROM product
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product deleted:', result.rows[0]);
    res.status(200).json({ message: 'Product deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting the product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.post('/users', (req, res) => {
  console.log('Requête POST reçue sur /users');
  console.log('Données reçues :', req.body);
  try {
    const data = req.body;
    addClient(data.name, data.lastName, data.gender, data.age, data.company, data.password, data.email, data.role);
    res.status(200).json({ message: 'Données reçues avec succès', data });
  } catch (error) {
    console.error('Erreur de traitement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Define a PUT route to update the client
app.put('/updateUser/:id', async (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  if (!id || !newData) {
    return res.status(400).send('ID and newData are required');
  }

  try {
    const updatedClient = await updateClientById(id, newData); 
    if (updatedClient) {
      res.json(updatedClient); // Send back the updated client details
    } else {
      res.status(404).send('Client not found');
    }
  } catch (err) {
    res.status(500).send('Error updating client');
  }
});

// Define a DELETE route to delete the client
app.delete('/deleteUser/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('ID is required');
  }

  try {
    const deletedClient = await deleteClientById(id); // Delete the client by id
    if (deletedClient) {
      res.json({ message: 'Client deleted successfully', deletedClient });
    } else {
      res.status(404).send('Client not found');
    }
  } catch (err) {
    res.status(500).send('Error deleting client');
  }
});



// Le serveur écoute sur le port 5002
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
