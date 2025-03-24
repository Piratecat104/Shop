// Discord button functionality
document.getElementById('discordButton').addEventListener('click', function(e) {
    e.preventDefault();
    // Replace this with the seller's Discord username
    const discordUsername = 'YOUR_DISCORD_USERNAME';
    
    // Copy to clipboard
    navigator.clipboard.writeText(discordUsername).then(() => {
        // Show feedback to user
        const button = this;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy Discord username:', err);
    });
});

// Admin mode functionality
let adminMode = false;
let adminKeySequence = '';
const ADMIN_KEY = 'admin123'; // Change this to your desired admin key

document.addEventListener('keydown', (e) => {
    adminKeySequence += e.key;
    if (adminKeySequence.length > ADMIN_KEY.length) {
        adminKeySequence = adminKeySequence.slice(1);
    }
    if (adminKeySequence === ADMIN_KEY) {
        adminMode = !adminMode;
        adminKeySequence = '';
        loadProducts(); // Reload products to show/hide admin controls
        showToast(adminMode ? 'Admin mode enabled' : 'Admin mode disabled');
    }
});

// Toast notification function
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Function to create a product card
function createProductCard(imagePath, stockCount, filename) {
    const productName = filename.split('_').slice(0, -1).join(' ').replace(/_/g, ' ');
    
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let stockHtml = `
        <p class="stock-info">
            <i class="fas fa-box"></i>
            In Stock: ${stockCount}
        </p>
    `;
    
    if (adminMode) {
        stockHtml = `
            <div class="stock-edit">
                <p class="stock-info">
                    <i class="fas fa-box"></i>
                    In Stock: ${stockCount}
                </p>
                <div class="stock-controls">
                    <button onclick="updateStock('${filename}', ${stockCount - 1})" title="Decrease stock">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${stockCount}" 
                           onchange="updateStock('${filename}', this.value)"
                           min="0"
                           title="Set stock amount">
                    <button onclick="updateStock('${filename}', ${stockCount + 1})" title="Increase stock">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${imagePath}" alt="${productName}" class="product-image">
            <div class="product-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${productName}</h3>
            ${stockHtml}
        </div>
    `;
    
    // Add click handler for image zoom
    const imageContainer = card.querySelector('.product-image-container');
    imageContainer.addEventListener('click', () => {
        showImageModal(imagePath, productName);
    });
    
    return card;
}

// Function to update stock
async function updateStock(oldFilename, newStock) {
    try {
        // Since we're on GitHub Pages, we'll just update the local display
        const product = products.find(p => p.filename === oldFilename);
        if (product) {
            product.stockCount = parseInt(newStock);
            loadProducts(); // Reload products to show updated stock
            showToast(`Stock updated: ${getProductNameFromFilename(oldFilename)} - ${newStock}`);
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showToast('Error updating stock', 5000);
    }
}

// Function to get product name from filename
function getProductNameFromFilename(filename) {
    return filename.split('_').slice(0, -1).join(' ').replace(/_/g, ' ');
}

// Function to load products
async function loadProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = ''; // Clear existing products
    
    try {
        // Use the products array from products.js
        products.forEach(product => {
            const card = createProductCard(product.imagePath, product.stockCount, product.filename);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 5000);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `;
    }
}

// Image modal functionality
function showImageModal(imagePath, productName) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${imagePath}" alt="${productName}">
            <h3>${productName}</h3>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add show class after a small delay to trigger the animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal when clicking outside or on close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.className === 'close-modal') {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300); // Wait for the fade-out animation
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function closeModal(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.removeEventListener('keydown', closeModal);
            }, 300);
        }
    });
}

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts); 