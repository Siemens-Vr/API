const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Route pour le téléchargement de fichiers
app.get('/', (req, res) => {
    const filePath = './FilesDwl/EV 70 FPS.apk'; // Chemin vers votre fichier
  
    // Vérifiez si le fichier existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Fichier non trouvé:', err);
        return res.status(404).send('Fichier non trouvé');
      }
      
      // Envoyer le fichier pour téléchargement
      res.download(filePath, (err) => {
        if (err) {
          console.error('Erreur lors du téléchargement:', err);
          res.status(500).send('Erreur lors du téléchargement');
        }
      });
    });
  });

app.listen(5004, () => {
  console.log('Serveur démarré sur le port 5004');
});
