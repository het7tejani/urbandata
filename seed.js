import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Product from './models/productModel.js';
import User from './models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment Variable Loading ---
const backendEnvPath = path.resolve(__dirname, '.env');
const parentEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(backendEnvPath)) {
  console.log('[DEBUG] Seeder: Loading .env file from backend directory.');
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(parentEnvPath)) {
  console.log('[DEBUG] Seeder: Loading .env file from parent (online) directory.');
  dotenv.config({ path: parentEnvPath });
} else {
  console.log('[DEBUG] Seeder: No .env file found in common directories.');
}

const adminPassword = 'admin123'; // Changed password for reset

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined. Please ensure a .env file exists for seeding in either the /online or /online/backend directory.');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // --- Ensure a clean slate for the admin user ---
        const adminEmail = 'admin@urbanpantry.com';
        console.log(`Checking for existing admin user with email: ${adminEmail}`);
        
        // Delete any existing admin user to ensure a fresh start and prevent hashing issues
        await User.deleteMany({ email: adminEmail });
        console.log(`Removed any old admin users to ensure a clean state.`);

        // Create a new admin user. The pre-save hook in the User model will hash the password correctly.
        console.log('Creating a new, clean admin user...');
        const adminUser = await User.create({
            fullName: 'Admin User',
            username: 'admin',
            email: adminEmail,
            password: adminPassword, // Pass the PLAIN text password here; the model will hash it.
            role: 'admin'
        });

        console.log('\n--- ADMIN USER CREDENTIALS (FRESHLY CREATED) ---');
        console.log(`Email:    ${adminUser.email}`);
        console.log(`Password: ${adminPassword}`);
        console.log('The admin user has been successfully reset. Please use these credentials.');
        console.log('--------------------------------------------------\n');
        
        // Check if other data exists. This part remains non-destructive.
        const productCount = await Product.countDocuments();
        if (productCount > 0) {
            console.log('Existing products found. Skipping any sample data seeding to protect your data.');
        } else {
             console.log('No products found. The admin dashboard is ready for you to add new content.');
        }

    } catch (err) {
        console.error('Error during database seeding:', err.message);
    } finally {
        // Disconnect from the database
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedDB();