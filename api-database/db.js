const { Pool } = require('pg');

// Configurez les informations de connexion à votre base de données PostgreSQL
const pool = new Pool({
  user: 'postgres', // Remplacez par votre nom d'utilisateur PostgreSQL
  host: 'localhost',     // Remplacez par l'adresse de votre serveur PostgreSQL
  database: 'VrSolution', // Remplacez par le nom de votre base de données
  password: 'vRsiemens@2024', // Remplacez par votre mot de passe PostgreSQL
  port: 5432,            // Le port par défaut pour PostgreSQL
});

module.exports = pool;