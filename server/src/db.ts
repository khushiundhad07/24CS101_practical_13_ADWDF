import mongoose from 'mongoose';

// Read from .env (see .env.example). Defaults to a local database for this practical.
export const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/awdf_p13';

/**
 * A dedicated connection rather than mongoose.connect(): the combined repo server loads several
 * practicals into one process, and each must keep its own database and its own `Task` model.
 */
export const db = mongoose.createConnection(MONGO_URI);

db.on('connected', () => console.log(`MongoDB connected (${db.name})`));
db.on('error', (err) => console.error('MongoDB connection error:', err.message));
