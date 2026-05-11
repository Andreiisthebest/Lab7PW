const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT signing (In production, use environment variables)
const SECRET_KEY = 'my_super_secret_demo_key';

app.use(cors());
app.use(express.json());

// --- Swagger Configuration ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Destinations API',
            version: '1.0.0',
            description: 'A CRUD API for managing tourist destinations with JWT authentication',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    // Files containing Swagger annotations
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Basic health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running successfully.
 */
app.get('/ping', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// --- JWT Token Generation Endpoint ---

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Generate a JWT with roles/permissions via query parameters
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: The role to embed in the JWT (e.g., ADMIN, WRITER, VISITOR)
 *       - in: query
 *         name: permissions
 *         schema:
 *           type: string
 *         description: Comma-separated permissions (e.g., READ,WRITE)
 *     responses:
 *       200:
 *         description: Successfully generated JWT (valid for 1 minute)
 */
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

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Generate a JWT with roles/permissions via request body
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: WRITER
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["READ", "WRITE"]
 *     responses:
 *       200:
 *         description: Successfully generated JWT (valid for 1 minute)
 */
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
