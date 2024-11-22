const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;


// middelware
app.use(express.json());


// Routes
// Get all users
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message})
            return;
        } 

        res.json({ users: rows });
    });
});

// Add a new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email ) {
        return res.status(400).json({ error: 'Name and email are required'});
    }

    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
        if(err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'User created successfully',
            userId: this.lastID
        });
    });
});


// Get a single user by ID
app.get('/users/:id', (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [ req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row){
            return res.status(404).json({ message: 'User not found'});
        }

        

        res.json({ user: row });
    });
});


// Update a user by ID
app.put('/users/:id', (req, res) => {
    const { name, email } = req.body

    db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User updated successfully' });
        }
    );
});


// Delete a user by ID
app.delete('/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', req.params.id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    });
});

// Export app for testing
module.exports = app;

// Start the server only if not in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Global error handler 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV == 'production' ? {} : err.stack
    });
});


