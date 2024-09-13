const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env variables
dotenv.config();

const app = express();
app.use(express.json());


const allowedOrigins = ['http://localhost:4000'];
app.use(cors({
    origin: allowedOrigins,   // Autoriser les origines spécifiées
    credentials: true         // Autoriser l'envoi des cookies si nécessaire
}));


// Routes
const baseUrl = process.env.BASE_URL;
const authRoutes = require('./authRoutes');


app.use(`${baseUrl}/auth`, authRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});