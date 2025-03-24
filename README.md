# Rune Slayer Shop Website

A dynamic shop website that automatically displays products based on images in the images folder.

## Setup Instructions

1. Install Node.js if you haven't already (https://nodejs.org/)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your product images to the `images` folder
   - Supported formats: JPG, JPEG, PNG, GIF
   - Image filenames will be used as product names (spaces will be added automatically)
4. Update the seller's Discord username in `script.js` (replace 'YOUR_DISCORD_USERNAME' with your actual Discord username)
5. Start the server:
   ```bash
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`

## Features

- Automatically displays all images from the images folder as products
- Responsive design that works on all devices
- One-click Discord username copy for easy contact
- Dynamic stock count display
- Modern and clean user interface

## Customization

- Edit `styles.css` to modify the website's appearance
- Update the stock count logic in `server.js` to integrate with your actual inventory system
- Modify the product card layout in `script.js` to add more product information 