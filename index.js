const express = require('express');
const connectDB = require('./config/db');

const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const businessRouter = require('./routes/businessRouter');
const invoiceRouter = require('./routes/invoiceRouter');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');

const app = express();
app.use(express.json());
connectDB();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Returns if the server is running
 */
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint is working!' });
});

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/users', userRouter);       // User routes
app.use('/product', productRouter); // Product routes
app.use('/business', businessRouter); // Business routes
app.use('/invoice', invoiceRouter); // Invoice routes

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Swagger docs available at http://localhost:3000/api-docs');
});
