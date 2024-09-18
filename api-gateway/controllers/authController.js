const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const apiUrl = 'http://localhost:5002/users';
const apiUrlMail = 'http://localhost:5002/usersMail';


// Register a new user
exports.register = async (req, res) => {
    const { name, lastName, sexe, age, companie, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await axios.post(apiUrl, { name, lastName, sexe, age, companie, password: hashedPassword, email });
        console.log("New user created !!")
        res.status(200).json({ message: 'User created' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
};

// Login an existing user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await axios.get(apiUrlMail,{email});
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        const userInfo = {
            id: user._id,
            email: user.email,
            username: `${user.firstName} ${user.lastName}`,
        };
        console.log("User " + userInfo.username + " connected !")
        res.status(200).json({ message: "Authentication successful!", token, user: userInfo, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
