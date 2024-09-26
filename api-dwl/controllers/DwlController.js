const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.DwlProduct = async (req, res) => {
    const { email, productName } = req.query;

    try {
        // Fetch product information based on productName
        const productResponse = await axios.get('http://localhost:5002/product', {
            params: { productName }
        });
        const product = productResponse.data;  // Access the product data
        
        // Fetch user information based on email
        const userResponse = await axios.get('http://localhost:5002/userMail', {
            params: { email }
        });
        const user = userResponse.data;  // Access the user data

        // Ensure product is available and has a valid file path
        if (!product || !product[0].path) {
            return res.status(404).send('Product or file path not found');
        }

        const filePath = path.resolve(product[0].path);  // Resolve the absolute path to the file

        // Check if the file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File not found:', err);
                return res.status(404).send('File not found');
            }

            // Send the file for download
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error during file download:', err);
                    return res.status(500).send('Error during file download');
                }
                console.log('File downloaded successfully');
                res.sendFile(filePath);
                return res ;
            });
        });
        const dwlValidation = await axios.post('http://localhost:5002/newDownload', {
            params: { productId:product[0].id, userId: user[0].id }
        });
        
    } catch (error) {
        console.error('Error fetching product or user data:', error);
        res.status(500).send('Error processing request');
    }
};
