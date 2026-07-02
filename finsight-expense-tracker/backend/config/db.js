const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Database Configuration
// Uses DATABASE_URL (PostgreSQL) in production, falls back to SQLite for local dev
let sequelize;

if (process.env.DATABASE_URL) {
    // Production: PostgreSQL via Render/Neon/Supabase
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Local development: SQLite
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './finsight_db.sqlite',
        logging: false
    });
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
        console.log(`${dbType} Connected...`);

        // Load all models and their relationships
        require('../models');

        // Sync models (alter: true for first deploy to create tables, then set to false)
        const syncOptions = process.env.NODE_ENV === 'production' 
            ? { alter: true }  // Creates/updates tables on first deploy
            : { alter: false };
        await sequelize.sync(syncOptions);

        console.log('Database synced');

    } catch (error) {
        console.error('Error connecting to Database:', error);
        console.error('Make sure credentials and connection string are correct');
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
