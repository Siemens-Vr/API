const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const http = require('http');

exports.DwlProduct = async (req, res) => {
    cors()(req, res, async () => {
        const { email, id } = req.query;

        console.log("Email:", email);
        console.log("Product Id:", id);

        if (!email || !id) {
            return res.status(400).send('Missing required parameters');
        }
        
        try {
            // Create an axios instance for localhost requests
            const localAxios = axios.create({
                baseURL: 'https://api-database-sz4l.onrender.com',
                httpsAgent: new http.Agent({ keepAlive: true })
            });

            // Fetch product information using product ID
            const productResponse = await localAxios.get('/products', {
                params: { id }
            });

            const productData = Array.isArray(productResponse.data) ? productResponse.data[0] : productResponse.data;

            // Fetch user information using email
            const userResponse = await localAxios.get('/userMail', {
                params: { email }
            });
            const user = userResponse.data;

            if (!productData || !productData.path) {
                return res.status(404).send('Product or file path not found');
            }
            if (!user || user.length === 0 || !user[0].id) {
                return res.status(404).send('User not found');
            }

            const filePath = productData.path;
            console.log("Product file path:", filePath);

            // Check if the filePath is a localhost URL
            if (filePath.startsWith('http://localhost:5002/uploads/')) {
                // Extract filename from the URL
                const filename = path.basename(filePath);
                
                try {
                    // Fetch the file from the localhost server
                    const fileResponse = await localAxios.get(`/uploads/${filename}`, {
                        responseType: 'stream'
                    });

                    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                    res.setHeader('Content-Disposition', `attachment; filename="${productData.productName || filename}"`);

                    fileResponse.data.pipe(res);

                    fileResponse.data.on('end', async () => {
                        console.log('File downloaded successfully from localhost');

                        // Log the download in the database
                        try {
                            await localAxios.post('/newDownload', {
                                productId: productData.id,
                                userId: user[0].id
                            });
                            console.log('Download logged successfully');
                        } catch (downloadError) {
                            console.error('Error logging the download:', downloadError);
                        }
                    });

                    fileResponse.data.on('error', (error) => {
                        console.error('Error streaming file from localhost:', error);
                        if (!res.headersSent) {
                            res.status(500).send('Error during file download');
                        }
                    });
                } catch (fileError) {
                    console.error('Error fetching file:', fileError);
                    if (fileError.response && fileError.response.status === 404) {
                        return res.status(404).send('File not found on the server');
                    } else {
                        return res.status(500).send('Error fetching file from server');
                    }
                }
            } else {
                // Handle local file download
                const resolvedPath = path.resolve(filePath);
                console.log("Resolved file path:", resolvedPath);

                fs.access(resolvedPath, fs.constants.R_OK, (err) => {
                    if (err) {
                        console.error('File not accessible:', err);
                        return res.status(404).send('File not found or not accessible');
                    }

                    fs.stat(resolvedPath, (err, stats) => {
                        if (err) {
                            console.error('Error getting file stats:', err);
                            return res.status(500).send('Error processing file');
                        }

                        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                        res.setHeader('Content-Disposition', `attachment; filename="${productData.productName || 'downloaded_file.apk'}"`);
                        res.setHeader('Content-Length', stats.size);

                        const fileStream = fs.createReadStream(resolvedPath);
                        fileStream.pipe(res);

                        fileStream.on('error', (error) => {
                            console.error('Error streaming file:', error);
                            if (!res.headersSent) {
                                res.status(500).send('Error during file download');
                            }
                        });

                        fileStream.on('end', async () => {
                            console.log('Local file downloaded successfully');

                            // Log the download in the database
                            try {
                                await localAxios.post('/newDownload', {
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
            }
        } catch (error) {
            console.error('Error fetching product or user data:', error);

            if (!res.headersSent) {
                res.status(500).send('Error processing request');
            }
        }
    });
};
