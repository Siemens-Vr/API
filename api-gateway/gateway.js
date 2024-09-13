const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const cors = require('cors');

// Charger les variables d'environnement
dotenv.config();

const app = express();


const corsOptions = {
  origin: 'http://localhost:3002', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello, world gateway!');
});

// Middleware pour parser les JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const serviceDBProxy = createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: {
    '^/api-database': '', 
  },
});

// Configuration des proxys
const serviceShadowProxy = createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: {
    '^/api-shadow': '', 
  },
});

const serviceDwlProxy = createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: {
    '^/api-dwl': '', 
  },
});

// Rediriger les requêtes
app.use('/api-database', (req, res, next) => {
  console.log(`Request Method: ${req.method}, Request Path: ${req.path}`);
  next();
}, serviceDBProxy);
app.use('/api-shadow', serviceShadowProxy);
app.use('/api-dwl', serviceDwlProxy);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
