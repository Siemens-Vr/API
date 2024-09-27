const { Pool } = require('pg');

 // Connection string provided
 const connectionString = 'postgresql://backend_owner:bvXzywN6WS4c@ep-autumn-sun-a5ojttfm.us-east-2.aws.neon.tech/Ecommerce?sslmode=require';

// Configurez les informations de connexion à votre base de données PostgreSQL
const pool = new Pool({
 // user: 'postgres', // Remplacez par votre nom d'utilisateur PostgreSQL
  //host: 'localhost',     // Remplacez par l'adresse de votre serveur PostgreSQL
  //database: 'VrSolution', // Remplacez par le nom de votre base de données
  //password: 'vRsiemens@2024', // Remplacez par votre mot de passe PostgreSQL
  //port: 5432,            // Le port par défaut pour PostgreSQL

    connectionString: connectionString,
  });
  
  async function testConnection() {
    try {
      const client = await pool.connect();
      console.log('Connected to the database');
      client.release();
    } catch (err) {
      console.error('Error connecting to the database', err);
    }
  }
  
  testConnection();
  
  
  module.exports = pool;
module.exports = pool;