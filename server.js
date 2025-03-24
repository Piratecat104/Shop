const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Function to extract stock count from filename
function getStockFromFilename(filename) {
    const match = filename.match(/_(\d+)\.(jpg|jpeg|png|gif)$/i);
    return match ? parseInt(match[1]) : 0;
}

// Function to get product name from filename
function getProductNameFromFilename(filename) {
    return filename.replace(/_\d+\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ');
}

// API endpoint to get products
app.get('/api/products', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error('Error reading images directory:', err);
            return res.status(500).json({ error: 'Error reading products' });
        }

        // Filter for image files and create product objects
        const products = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => ({
                imagePath: `/images/${file}`,
                stockCount: getStockFromFilename(file),
                filename: file
            }));

        res.json(products);
    });
});

// API endpoint to update stock
app.post('/api/stock', express.json(), (req, res) => {
    const { oldFilename, newStock } = req.body;
    
    if (!oldFilename || typeof newStock !== 'number') {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const productName = getProductNameFromFilename(oldFilename);
    const extension = oldFilename.split('.').pop();
    const newFilename = `${productName.replace(/\s+/g, '_')}_${newStock}.${extension}`;
    
    const oldPath = path.join(imagesDir, oldFilename);
    const newPath = path.join(imagesDir, newFilename);

    try {
        fs.renameSync(oldPath, newPath);
        res.json({ success: true, newFilename });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 