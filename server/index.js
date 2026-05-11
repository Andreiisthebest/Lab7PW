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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
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
 *     security: []
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
 *     security: []
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
 *     security: []
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


// --- JWT Middleware ---
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Token expired or invalid" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: "Authorization header missing" });
    }
};

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (req.user && (req.user.role === 'ADMIN' || req.user.permissions.includes(requiredPermission))) {
            next();
        } else {
            res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }
    };
};

// --- Mock Database for Destinations ---
let destinations = [];
let currentId = 1;

// --- CRUD API for Destinations ---

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: Get all destinations (with pagination)
 *     tags: [Destinations]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: A list of destinations
 */
app.get('/api/destinations', authenticateJWT, checkPermission('READ'), (req, res) => {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 50;

    const data = destinations.slice(skip, skip + limit);
    res.json({
        total: destinations.length,
        skip,
        limit,
        data
    });
});

/**
 * @swagger
 * /api/destinations/{id}:
 *   get:
 *     summary: Get a single destination by ID
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Destination object
 *       404:
 *         description: Not found
 */
app.get('/api/destinations/:id', authenticateJWT, checkPermission('READ'), (req, res) => {
    const dest = destinations.find(d => d.id == req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });
    res.json(dest);
});

/**
 * @swagger
 * /api/destinations:
 *   post:
 *     summary: Create a new destination
 *     tags: [Destinations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
app.post('/api/destinations', authenticateJWT, checkPermission('WRITE'), (req, res) => {
    const newDest = { id: currentId++, ...req.body };
    destinations.push(newDest);
    res.status(201).json(newDest);
});

/**
 * @swagger
 * /api/destinations/{id}:
 *   put:
 *     summary: Update an existing destination
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated destination object
 *       404:
 *         description: Not found
 */
app.put('/api/destinations/:id', authenticateJWT, checkPermission('WRITE'), (req, res) => {
    const index = destinations.findIndex(d => d.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: "Destination not found" });

    destinations[index] = { ...destinations[index], ...req.body };
    res.json(destinations[index]);
});

/**
 * @swagger
 * /api/destinations/{id}:
 *   delete:
 *     summary: Delete a destination
 *     tags: [Destinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
app.delete('/api/destinations/:id', authenticateJWT, checkPermission('DELETE'), (req, res) => {
    const index = destinations.findIndex(d => d.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: "Destination not found" });

    destinations.splice(index, 1);
    res.json({ message: "Deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
