const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const userRouter = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, businessId]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, employee, customer]
 *               businessId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Signup failed
 */
userRouter.post('/signup', async (req, res) => {
  const { name, email, password, role, businessId } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword, role, businessId });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin/manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users (excluding passwords)
 *       500:
 *         description: Fetching users failed
 */
userRouter.get('/', authMiddleware, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const users = await userModel.find({}, '-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Fetching users failed', error: err.message });
  }
});

module.exports = userRouter;
