const express = require('express');

const productModel = require('../models/productModel');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');;
const invoiceModel = require('../models/invoiceModel');
const invoiceRouter = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swaggerConfig');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create an invoice (Customer only)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business:
 *                 type: string
 *                 description: Business ID
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Validation or stock error
 *       500:
 *         description: Server error
 */
invoiceRouter.post('/', authMiddleware, authorizeRoles('customer'), async (req, res) => {
  const { products, business } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Products list is required' });
  }

  try {
    let totalAmount = 0;
    const invoiceProducts = [];

    for (let item of products) {
      const { product: productId, quantity } = item;
      const product = await productModel.findById(productId);

      if (!product || product.quantity < quantity) {
        return res.status(400).json({ message: `Product unavailable or insufficient quantity: ${productId}` });
      }

      const totalPrice = product.price * quantity;
      totalAmount += totalPrice;

      invoiceProducts.push({
        product: product._id,
        quantity,
        pricePerUnit: product.price,
        totalPrice
      });

      product.quantity -= quantity;
      await product.save();
    }

    const invoice = new invoiceModel({
      customer: req.user.userId,
      business,
      products: invoiceProducts,
      totalAmount
    });

    await invoice.save();
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Invoice creation failed', error: err.message });
  }
});

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices (Admin/Manager only)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all invoices
 *       500:
 *         description: Server error
 */
invoiceRouter.get('/', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const invoices = await invoiceModel.find()
      .populate('customer', 'name email')
      .populate('business', 'name')
      .populate('products.product', 'name');
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Fetching invoices failed', error: err.message });
  }
});

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice found
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
invoiceRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await invoiceModel.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('business', 'name')
      .populate('products.product', 'name');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (req.user.role === 'customer' && String(invoice.customer._id) !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Fetching invoice failed', error: err.message });
  }
});

module.exports = invoiceRouter;