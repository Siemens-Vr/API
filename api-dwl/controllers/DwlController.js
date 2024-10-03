const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

exports.DwlProduct = async (req, res) => {
    cors()(req, res, async () => {
        const { email, id } = req.query;

        console.log("Email:", email);
        console.log("Product Id:", id);

        if (!email || !id) {
            return res.status(400).send('Missing required parameters');
        }

        try {
            // Fetch product information using product ID
            const productResponse = await axios.get('https://api-database-sz4l.onrender.com/products', {
                params: { id }
            });

            const productData = Array.isArray(productResponse.data) ? productResponse.data[0] : productResponse.data;

            // Fetch user information using email
            const userResponse = await axios.get('https://api-database-sz4l.onrender.com/userMail', {
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

            // Check if the filePath is a Google Drive URL
            if (filePath.includes('drive.google.com')) {
                console.log('Google Drive link detected. Sending URL to frontend.');
                return res.status(200).json({ url: filePath });
            }

            // Check if the filePath is a remote URL (http/https)
            if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
                // Handle remote file download
                const fileRequest = https.get(filePath, (fileResponse) => {
                    if (fileResponse.statusCode !== 200) {
                        console.error('Remote file not accessible. Status code:', fileResponse.statusCode);
                        // Send URL to the frontend to handle opening in a new tab if error occurs
                        return res.status(200).json({ url: filePath });
                    }

                    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                    res.setHeader('Content-Disposition', `attachment; filename="${productData.productName || 'downloaded_file.apk'}"`);

                    fileResponse.pipe(res); // Pipe the remote file directly to the response

                    fileResponse.on('end', async () => {
                        console.log('File downloaded successfully from remote URL');

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

                    fileResponse.on('error', (error) => {
                        console.error('Error streaming remote file:', error);
                        if (!res.headersSent) {
                            return res.status(500).send('Error during remote file download');
                        }
                    });
                });

                // Handle connection errors (e.g., ECONNRESET)
                fileRequest.on('error', (error) => {
                    console.error('Error downloading the remote file:', error);
                    if (!res.headersSent) {
                        return res.status(500).send('Error downloading the file');
                    }
                });

            } else {
                // Handle local file download as before
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
            }

        } catch (error) {
            console.error('Error fetching product or user data:', error);

            // Ensure no additional responses are sent after headers
            if (!res.headersSent) {
                res.status(500).send('Error processing request');
            }
        }
    });
};
