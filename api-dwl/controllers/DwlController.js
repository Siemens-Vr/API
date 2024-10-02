const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

exports.DwlProduct = async (req, res) => {
    cors()(req, res, async () => {
        const { email, id } = req.query;

        console.log("Email:", email);
        console.log("Product Id:", id);

        // Check if email and product ID are provided
        if (!email || !id) {
            return res.status(400).send('Missing required parameters');
        }

        try {
            // Fetch product information using product ID
            const productResponse = await axios.get('https://api-database-sz4l.onrender.com/products', {
                params: { id }
            });

            // Extract product data, assuming it's in an array format
            const productData = Array.isArray(productResponse.data) ? productResponse.data[0] : productResponse.data;

            // Fetch user information using email
            const userResponse = await axios.get('https://api-database-sz4l.onrender.com/userMail', {
                params: { email }
            });
            const user = userResponse.data;

            // Validate product and user data
            if (!productData || !productData.path) {
                return res.status(404).send('Product or file path not found');
            }
            if (!user || user.length === 0 || !user[0].id) {
                return res.status(404).send('User not found');
            }

            console.log("Product file path:", productData.path);

            // Handle local file download
            const filePath = path.resolve(productData.path);
            console.log("Resolved file path:", filePath);

            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    console.error('File not accessible:', err);
                    return res.status(404).send('File not found or not accessible');
                }

                // Get file stats
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error('Error getting file stats:', err);
                        return res.status(500).send('Error processing file');
                    }

                    // Set headers
                    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                    res.setHeader('Content-Disposition', `attachment; filename="${productData.productName || 'downloaded_file.apk'}"`);
                    res.setHeader('Content-Length', stats.size);

                    // Create a read stream and pipe it to the response
                    const fileStream = fs.createReadStream(filePath);
                    fileStream.pipe(res);

                    fileStream.on('error', (error) => {
                        console.error('Error streaming file:', error);
                        if (!res.headersSent) {
                            res.status(500).send('Error during file download');
                        }
                    });

                    fileStream.on('end', async () => {
                        console.log('File downloaded successfully');

                        // Log the download in the database
                        try {
                            await axios.post('https://api-database-sz4l.onrender.com/newDownload', {
                                productId: productData.id,
                                userId: user[0].id
                            });
                            console.log('Download logged successfully');
                        } catch (downloadError) {
                            console.error('Error logging the download:', downloadError);
                        }
                    });
                });
            });

        } catch (error) {
            console.error('Error fetching product or user data:', error);
            if (!res.headersSent) {
                return res.status(500).send('Error processing request');
            }
        }
    });
};
