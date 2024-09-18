const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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


exports.protect = (req, res, next) => {
    const bearerToken = req.header('Authorization')
    const token = bearerToken ? bearerToken.replace('Bearer ', '') : null;
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};


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
}, this.protect, serviceDBProxy);
app.use('/api-shadow', this.protect, serviceShadowProxy);
app.use('/api-dwl', this.protect, serviceDwlProxy);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
