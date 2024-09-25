const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Charger les variables d'environnement
dotenv.config();

const app = express();


const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React app's URL
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

app.get('/api-database', async (req, res) => {
  try {
    console.log('test');
    const response = await axios.get('http://localhost:5002/api-database');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch api-database' });
  }
});


app.get('/api-shadow', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5003/api-shadow');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch api-shadow' });
  }
});

app.get('/api-dwl', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5004/api-dwl');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch api-dwl' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
