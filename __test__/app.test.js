const request = require('supertest');

const app = require('../app');
const db = require('../database')

// Create test users tables
function initializeTestDatabase(database) {
    return new Promise((resolve, reject) => {
        database.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Insert Test users data on database
function insertTestUsers(database) {
    return new Promise((resolve, reject) => {
        const stmt = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)');

        const testUsers = [
            ['John Doe', 'john@example.com'],
            ['Jane Smith', 'jane@example.com']
        ];
        
        testUsers.forEach(user => {
            stmt.run(user[0], user[1]);
        });

        stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Drop test tables on database
function dropUserTables(database) {
    return new Promise((resolve, reject) => {
        database.run(`DROP TABLE users`, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Test Suite
describe('User API', () => {

    // Run before each test run
    beforeEach( async () => {
        await new Promise((resolve, reject) => {
            initializeTestDatabase(db)
            .then(() => insertTestUsers(db))
            .then(resolve)
            .catch(reject);
        });

    });
    
    // Run after each test finish run
    afterEach(async () => {
        await dropUserTables(db)
    });
    

    // Test GET all users
    test('GET /users should return all users', async () => {
        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(200);
        expect(response.body.users).toHaveLength(2);
        expect(response.body.users[0]).toHaveProperty('name');
        expect(response.body.users[0]).toHaveProperty('email');
    });


    // Test POST user creation
    test('POST /users should create a new user', async () => {
        const newUser = { 
        name: 'Alice Johnson', 
        email: 'alice@example.com' 
        };

        const response = await request(app)
        .post('/users')
        .send(newUser);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('userId');
        expect(response.body.message).toBe('User created successfully');
    }); 

    // Test POST user creation with missing data
    test('POST /users should fail with incomplete data', async () => {
        const incompleteUser = { name: 'Incomplete User' };

        const response = await request(app)
        .post('/users')
        .send(incompleteUser);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    // Test GET single user
    test('GET /users/:id should return a single user', async () => {
        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.user).toHaveProperty('name', 'John Doe');
        expect(response.body.user).toHaveProperty('email', 'john@example.com');
    });

    // Test PUT user update
    test('PUT /users/:id should update a user', async () => {
        const updatedUser = { 
        name: 'John Updated', 
        email: 'johnupdated@example.com' 
        };

        const response = await request(app)
        .put('/users/1')
        .send(updatedUser);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User updated successfully');

        // Verify update
        const verifyResponse = await request(app).get('/users/1');
        expect(verifyResponse.body.user.name).toBe('John Updated');
        expect(verifyResponse.body.user.email).toBe('johnupdated@example.com');
    });

     // Test DELETE user
    test('DELETE /users/:id should delete a user', async () => {
        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');

        // Verify deletion
        const verifyResponse = await request(app).get('/users/1');
        expect(verifyResponse.statusCode).toBe(404);
    });
});


