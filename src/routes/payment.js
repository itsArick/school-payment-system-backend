import express from 'express';
import {
  createPayment,
  handleWebhook,
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus,
  checkPaymentStatusWithEdviron,
  handleWebhookGet //$ CHANGED
} from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';
import { createPaymentValidation } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/create-payment
// @desc    Create a new payment with Edviron gateway
// @access  Private
router.post('/create-payment', auth, createPaymentValidation, createPayment);

// @route   POST /api/webhook
// @desc    Handle webhook from payment gateway (POST payloads)
// @access  Public
router.post('/webhook', handleWebhook);

// @route   GET /api/webhook
// @desc    Handle redirect callback from Edviron (GET query params)
// @access  Public
router.get('/webhook', handleWebhookGet); //$ CHANGED

// @route   GET /api/transactions
// @desc    Get all transactions with pagination and filters
// @access  Private
router.get('/transactions', auth, getAllTransactions);

// @route   GET /api/transactions/school/:schoolId
// @desc    Get transactions by school ID
// @access  Private
router.get('/transactions/school/:schoolId', auth, getTransactionsBySchool);

// @route   GET /api/transaction-status/:customOrderId
// @desc    Get transaction status by custom order ID
// @access  Private
router.get('/transaction-status/:customOrderId', auth, getTransactionStatus);

// NEW ROUTE - Check status directly with Edviron
// @route   GET /api/check-edviron-status/:customOrderId
// @desc    Check payment status directly with Edviron API
// @access  Private
router.get('/check-edviron-status/:customOrderId', auth, checkPaymentStatusWithEdviron);

export default router;
