const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Your Discord bot token - replace this with your actual token
const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
// Your Discord user ID - replace this with your actual Discord ID
const ADMIN_ID = 'YOUR_DISCORD_ID';

// Function to get stock from filename
function getStockFromFilename(filename) {
    const match = filename.match(/_(\d+)\.(jpg|jpeg|png|gif)$/i);
    return match ? parseInt(match[1]) : 0;
}

// Function to get product name from filename
function getProductNameFromFilename(filename) {
    return filename.replace(/_\d+\.(jpg|jpeg|png|gif)$/i, '').replace(/_/g, ' ');
}

// Function to list all products
function listProducts() {
    const imagesDir = path.join(__dirname, 'images');
    const files = fs.readdirSync(imagesDir);
    
    let message = '**Current Stock:**\n';
    files
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .forEach(file => {
            const stock = getStockFromFilename(file);
            const name = getProductNameFromFilename(file);
            message += `${name}: ${stock} in stock\n`;
        });
    
    return message;
}

// Function to update stock
function updateStock(filename, newStock) {
    const imagesDir = path.join(__dirname, 'images');
    const oldPath = path.join(imagesDir, filename);
    
    if (!fs.existsSync(oldPath)) {
        return { success: false, message: 'Product not found!' };
    }

    const productName = getProductNameFromFilename(filename);
    const extension = filename.split('.').pop();
    const newFilename = `${productName.replace(/\s+/g, '_')}_${newStock}.${extension}`;
    const newPath = path.join(imagesDir, newFilename);

    try {
        fs.renameSync(oldPath, newPath);
        return { success: true, message: `Stock updated! ${productName}: ${newStock}` };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, message: 'Failed to update stock!' };
    }
}

// Discord bot commands
client.on('messageCreate', async message => {
    // Only respond to commands from the admin
    if (message.author.id !== ADMIN_ID) return;

    // Ignore bot messages
    if (message.author.bot) return;

    const command = message.content.toLowerCase();

    // List all products
    if (command === '!stock') {
        message.reply(listProducts());
    }

    // Update stock
    if (command.startsWith('!updatestock')) {
        const args = command.split(' ');
        if (args.length !== 3) {
            message.reply('Usage: !updatestock <filename> <new_stock>');
            return;
        }

        const filename = args[1];
        const newStock = parseInt(args[2]);

        if (isNaN(newStock)) {
            message.reply('Please provide a valid number for stock!');
            return;
        }

        const result = updateStock(filename, newStock);
        message.reply(result.message);
    }

    // Help command
    if (command === '!help') {
        const helpMessage = `
**Available Commands:**
\`!stock\` - List all products and their current stock
\`!updatestock <filename> <new_stock>\` - Update stock for a product
\`!help\` - Show this help message

**Adding New Products:**
Upload an image with the filename format: \`product_name_stock_number.jpg\`
Example: \`dragon_sword_5.jpg\`
        `;
        message.reply(helpMessage);
    }
});

// Handle image uploads
client.on('messageCreate', async message => {
    // Only process attachments from the admin
    if (message.author.id !== ADMIN_ID) return;

    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const filename = attachment.name;

        // Check if it's an image file
        if (/\.(jpg|jpeg|png|gif)$/i.test(filename)) {
            // Check if filename follows the correct format
            if (filename.match(/_(\d+)\.(jpg|jpeg|png|gif)$/i)) {
                message.reply('Product added successfully!');
            } else {
                message.reply('Please use the correct filename format: product_name_stock_number.jpg');
            }
        }
    }
});

// Start the bot
client.login(TOKEN); 