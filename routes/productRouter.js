const express = require('express');
const productModel = require('../models/productModel');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const productRouter = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of all products
 *       500:
 *         description: Server error
 */
productRouter.get('/', async (req, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Fetching products failed', error: err.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productRouter.get('/:id', async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Fetching product failed', error: err.message });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, quantity, businessId]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               businessId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 *       500:
 *         description: Server error
 */
productRouter.post(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'manager'),
  async (req, res) => {
    const { name, description, price, quantity, businessId } = req.body;
    try {
      const product = new productModel({ name, description, price, quantity, businessId });
      await product.save();
      res.status(201).json({ message: 'Product created', product });
    } catch (err) {
      res.status(500).json({ message: 'Creation failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               businessId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productRouter.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'manager'),
  async (req, res) => {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
      res.status(200).json({ message: 'Product updated', product: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: 'Update failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productRouter.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'manager'),
  async (req, res) => {
    try {
      const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
      if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
      res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Delete failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /products/{id}/quantity:
 *   patch:
 *     summary: Purchase product by reducing quantity
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decrementBy]
 *             properties:
 *               decrementBy:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product purchased successfully
 *       400:
 *         description: Bad request (invalid quantity or out of stock)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productRouter.patch(
  '/:id/quantity',
  authMiddleware,
  authorizeRoles('customer'),
  async (req, res) => {
    const { decrementBy } = req.body;

    if (typeof decrementBy !== 'number' || decrementBy <= 0) {
      return res.status(400).json({ message: 'decrementBy must be a positive number' });
    }

    try {
      const product = await productModel.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (product.quantity === 0) {
        return res.status(400).json({ message: 'Product is out of stock' });
      }

      if (decrementBy > product.quantity) {
        return res.status(400).json({ message: `Only ${product.quantity} item(s) in stock` });
      }

      product.quantity -= decrementBy;
      await product.save();

      res.status(200).json({ message: 'Product purchased', remaining: product.quantity });
    } catch (err) {
      res.status(500).json({ message: 'Purchase failed', error: err.message });
    }
  }
);

module.exports = productRouter;