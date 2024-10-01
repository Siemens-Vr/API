const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your React app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protect middleware
exports.protect = (req, res, next) => {
    const bearerToken = req.header('Authorization');
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

// Proxy setup for different services
app.use('/api-database', createProxyMiddleware({ 
    target: 'https://api-database-sz4l.onrender.com', // Your database service
    changeOrigin: true,
    pathRewrite: { '^/api-database': '' }, // Rewrite path if necessary
}));

app.use('/api-shadow', createProxyMiddleware({ 
    target: 'http://localhost:5003', // Your shadow service
    changeOrigin: true,
    pathRewrite: { '^/api-shadow': '' }, // Rewrite path if necessary
}));

app.use('/api-dwl', createProxyMiddleware({ 
    target: 'https://api-dwl.onrender.com', // Your download service
    changeOrigin: true,
    pathRewrite: { '^/api-dwl': '' }, // Rewrite path if necessary
}));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
