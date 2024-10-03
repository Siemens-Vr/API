const express = require('express');
const bodyParser = require('body-parser'); // Pour analyser le corps des requêtes POST
const cors = require('cors');
const app = express();
const DwlRoute = require('./routes/DwlRoute')

const corsOptions = {
  origin: 'https://react-project-delta-pied.vercel.app', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
};

app.use(cors(corsOptions));

// Middleware pour analyser le corps des requêtes POST
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, world dwl!');
});

app.use('/', DwlRoute);

app.listen(5004, () => {
  console.log('Server started on port 5004');
});
