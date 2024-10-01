const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

exports.DwlProduct = async (req, res) => {
    cors()(req, res, async () => {
        const { email, id } = req.query;

        console.log("Email:", email);
        console.log("Product Id:", id);

        if (!email || !id) {
            return res.status(400).send('Missing required parameters');
        }

        try {
            // Fetch product information using id
            const productResponse = await axios.get('https://api-database-sz4l.onrender.com/products', {
                params: { id }
            });

            const productData = Array.isArray(productResponse.data) ? productResponse.data[0] : productResponse.data;

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

            console.log("Product file path:", productData.path);

            if (productData.path.startsWith('http')) {
                // Handle downloading and serving the remote file
                return downloadFileFromUrl(productData.path, productData.fileName || 'downloaded_file.apk', res);
            }

            // Assume local file
            const filePath = path.resolve(productData.path);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('File not found:', err);
                    return res.status(404).send('File not found');
                }

                res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                res.setHeader('Content-Disposition', `attachment; filename="${productData.fileName || 'downloaded_file.apk'}"`);

                res.download(filePath, (err) => {
                    if (err) {
                        console.error('Error during file download:', err);
                        return res.status(500).send('Error during file download');
                    }
                    console.log('File downloaded successfully');
                });
            });

            await axios.post('https://api-database-sz4l.onrender.com/newDownload', {
                params: { productId: productData.id, userId: user[0].id }
            });

        } catch (error) {
            console.error('Error fetching product or user data:', error);
            res.status(500).send('Error processing request');
        }
    });
};
const downloadFileFromUrl = async (fileUrl, fileName, res) => {
    try {
        console.log('Downloading file from URL:', fileUrl);

        let fileId = extractFileIdFromUrl(fileUrl);
        if (!fileId) {
            throw new Error('Invalid Google Drive link. Could not extract file ID.');
        }

        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        const fileResponse = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const contentType = fileResponse.headers['content-type'];
        console.log('Content-Type:', contentType);

        if (contentType.includes('text/html')) {
            const warningPageHtml = fileResponse.data.toString('utf8');
            console.log('Received HTML content. Checking for download warning...');
            
            if (warningPageHtml.includes('Google Drive - Download warning')) {
                console.log('Google Drive download warning detected. Attempting to fetch confirmation link.');
                const confirmationToken = extractConfirmationToken(warningPageHtml);
                
                if (confirmationToken) {
                    console.log('Confirmation token found:', confirmationToken);
                    const confirmedDownloadUrl = `https://drive.google.com/uc?export=download&confirm=${confirmationToken}&id=${fileId}`;
                    
                    const confirmedResponse = await axios({
                        url: confirmedDownloadUrl,
                        method: 'GET',
                        responseType: 'stream',
                        maxRedirects: 5,
                    });

                    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                    confirmedResponse.data.pipe(res);
                } else {
                    console.error('Warning page content:', warningPageHtml);
                    throw new Error('Could not extract confirmation token from warning page.');
                }
            } else {
                console.error('Unexpected HTML content:', warningPageHtml);
                throw new Error('Received unexpected HTML content instead of file download.');
            }
        } else {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.end(fileResponse.data);
        }
    } catch (err) {
        console.error('Error downloading remote file:', err.message);
        res.status(500).send('Error downloading file: ' + err.message);
    }
};

const extractFileIdFromUrl = (url) => {
    const match = url.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/);
    return match ? (match[1] || match[2]) : null;
};
const extractConfirmationToken = (html) => {
    const matches = html.match(/confirm=([0-9A-Za-z\-_]+)/);
    return matches ? matches[1] : null;
};