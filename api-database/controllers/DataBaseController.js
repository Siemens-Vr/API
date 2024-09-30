const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('../db');


const apiUrl = 'http://localhost:5002/users';



// Register a new user
exports.register = async (req, res) => {
    const { name, lastName, gender, age, company, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await axios.post(apiUrl, { name, lastName, gender, age, company, password: hashedPassword, email });
        console.log("New user created !!")
        res.status(200).json({ message: 'User created' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
};


async function getClientByEmail(email) {
    try {
        
        // Parameterized query to prevent SQL injection
        const query = 'SELECT * FROM public.client WHERE email = $1';
        const values = [email]; // Define the values array

        // Execute the query with parameters
        const res = await pool.query(query, values);
        
        // Return the rows
        return res.rows;
    } catch (err) {
        console.error('Erreur lors de la récupération des clients:', err);
        throw err; // Rejeter l'erreur pour la gestion ultérieure
    }
}



// Login an existing user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getClientByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });
        console.log(user[0])
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        const userInfo = {
            id: user[0].id,
            email: user[0].email,
            username: `${user[0].name} ${user[0].lastname}`,
        };
        console.log("User " + userInfo.username + " connected !")
        console.log(userInfo)
        res.status(200).json({ message: "Authentication successful!", token, user: userInfo, refreshToken});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
};
