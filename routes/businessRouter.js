const express = require('express');
const businessModel = require('../models/businessModel');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const businessRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Businesses
 *   description: Business management routes
 */

/**
 * @swagger
 * /business:
 *   post:
 *     summary: Register a new business (Admin only)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Business registered
 *       500:
 *         description: Registration failed
 */
businessRouter.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    const { name, address, phone, email } = req.body;
    try {
      const business = new businessModel({
        name,
        address,
        phone,
        email,
        owner: req.user._id
      });
      await business.save();
      res.status(201).json({ message: 'Business registered', business });
    } catch (err) {
      res.status(500).json({ message: 'Business registration failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /business:
 *   get:
 *     summary: Get all businesses (Admin/Manager only)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of businesses
 *       500:
 *         description: Fetching failed
 */
businessRouter.get(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'manager'),
  async (req, res) => {
    try {
      const businesses = await businessModel.find().populate('owner', 'name email');
      res.status(200).json(businesses);
    } catch (err) {
      res.status(500).json({ message: 'Fetching businesses failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /business/{id}:
 *   get:
 *     summary: Get business by ID (Admin/Manager only)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business found
 *       404:
 *         description: Not found
 *       500:
 *         description: Fetching failed
 */
businessRouter.get(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'manager'),
  async (req, res) => {
    try {
      const business = await businessModel.findById(req.params.id).populate('owner', 'name email');
      if (!business) return res.status(404).json({ message: 'Business not found' });
      res.status(200).json(business);
    } catch (err) {
      res.status(500).json({ message: 'Fetching business failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /business/{id}:
 *   put:
 *     summary: Update business by ID (Admin only)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Business updated
 *       404:
 *         description: Business not found
 *       500:
 *         description: Update failed
 */
businessRouter.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const updatedBusiness = await businessModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBusiness) return res.status(404).json({ message: 'Business not found' });
      res.status(200).json({ message: 'Business updated', business: updatedBusiness });
    } catch (err) {
      res.status(500).json({ message: 'Update failed', error: err.message });
    }
  }
);

/**
 * @swagger
 * /business/{id}:
 *   delete:
 *     summary: Delete business by ID (Admin only)
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business deleted
 *       404:
 *         description: Business not found
 *       500:
 *         description: Delete failed
 */
businessRouter.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const deletedBusiness = await businessModel.findByIdAndDelete(req.params.id);
      if (!deletedBusiness) return res.status(404).json({ message: 'Business not found' });
      res.status(200).json({ message: 'Business deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Delete failed', error: err.message });
    }
  }
);

module.exports = businessRouter;
