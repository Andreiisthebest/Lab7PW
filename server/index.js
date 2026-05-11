const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT signing (In production, use environment variables)
const SECRET_KEY = 'my_super_secret_demo_key';

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/ping', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// --- JWT Token Generation Endpoint ---

// GET /token: Role/permissions passed as query parameters
// Example: http://localhost:3000/token?role=ADMIN&permissions=READ,WRITE
app.get('/token', (req, res) => {
    const { role, permissions } = req.query;
    
    const payload = {
        role: role || 'VISITOR',
        permissions: permissions ? permissions.split(',') : ['READ']
    };

    // Sign the JWT with a 1 minute expiration for demo purposes
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1m' });
    res.json({ token, expires_in: '1 minute', payload });
});

// POST /token: Role/permissions passed as JSON in the body
// Example Body: { "role": "WRITER", "permissions": ["READ", "WRITE"] }
app.post('/token', (req, res) => {
    const { role, permissions } = req.body;
    
    const payload = {
        role: role || 'VISITOR',
        permissions: permissions || ['READ']
    };

    // Sign the JWT with a 1 minute expiration
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1m' });
    res.json({ token, expires_in: '1 minute', payload });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
