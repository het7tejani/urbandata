import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const backendEnvPath = path.resolve(__dirname, '.env');
const parentEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(backendEnvPath)) {
  console.log('[DEBUG] Loading .env file from backend directory.');
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(parentEnvPath)) {
  console.log('[DEBUG] Loading .env file from parent (online) directory.');
  dotenv.config({ path: parentEnvPath });
} else {
  console.log('[DEBUG] No .env file found in common directories (online/ or online/backend/).');
}


console.log(`[DEBUG] Loaded API_KEY: ${process.env.API_KEY ? '******' + process.env.API_KEY.slice(-4) : 'undefined'}`);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined. Please ensure a .env file exists in either the /online or /online/backend directory with a valid MONGO_URI.');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(`\n--- MONGODB CONNECTION ERROR ---`);
        if (err.message.includes('bad auth')) {
            console.error('Error: Authentication failed. This is usually due to an incorrect username/password or IP whitelisting issue.');
        } else {
            console.error(`Error: ${err.message}`);
        }
        console.error('\nTroubleshooting steps:');
        console.error('1. Verify your MONGO_URI in your .env file is correct.');
        console.error('   - The format is: mongodb+srv://<username>:<password>@<cluster-url>/<database-name>');
        console.error('2. Ensure your current IP address is whitelisted in MongoDB Atlas under "Network Access".');
        console.error('3. Make sure the database user has read/write permissions.');
        console.error('--------------------------------\n');
        process.exit(1);
    }
};

connectDB();