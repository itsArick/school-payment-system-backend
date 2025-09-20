import express from 'express';
import authRoutes from './auth.js';
import paymentRoutes from './payment.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/', paymentRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;
