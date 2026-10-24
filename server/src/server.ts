// Load .env before anything reads process.env (db.ts reads MONGO_URI on import).
import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 5000);

createApp().listen(PORT, () => console.log(`Server running on port ${PORT}`));
