const sqlite3 = require('sqlite3').verbose();

const isTestMode = process.env.NODE_ENV === 'test';

const dbFile = isTestMode ? './mytestapp.db' : './myapp.db';


const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.log('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if(err) {
                    console.log('Error creating users table', err);
                } else {
                    console.log('User table created or already exists.');
                }
        });
    }
});


module.exports = db;
