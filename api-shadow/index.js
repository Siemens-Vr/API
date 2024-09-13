// Importer Express
const express = require('express');
const app = express();

// Définir une route GET de base
app.get('/', (req, res) => {
  res.send('Hello, world shadow!');
});

// Le serveur écoute sur le port 5002
const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Serveur Express en écoute sur le port ${PORT}`);
});