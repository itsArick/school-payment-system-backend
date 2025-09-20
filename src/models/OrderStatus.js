import mongoose from 'mongoose';

const orderStatusSchema = new mongoose.Schema({
  collect_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  order_amount: {
    type: Number,
    required: true
  },
  transaction_amount: {
    type: Number,
    required: true
  },
  payment_mode: {
    type: String,
    required: true
  },
  payment_details: {
    type: String,
    default: ''
  },
  bank_reference: {
    type: String,
    default: ''
  },
  payment_message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  error_message: {
    type: String,
    default: 'NA'
  },
  payment_time: {
    type: Date,
    default: Date.now
  },
  // NEW EDVIRON SPECIFIC FIELDS
  edviron_collect_id: {
    type: String,
    index: true // Index for faster queries
  },
  edviron_status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED', 'PROCESSING']
  },
  edviron_response: {
    type: Object, // Store complete Edviron response for debugging
    default: {}
  },
  last_status_check: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

orderStatusSchema.index({ collect_id: 1 });
orderStatusSchema.index({ status: 1 });
orderStatusSchema.index({ payment_time: -1 });
orderStatusSchema.index({ edviron_collect_id: 1 }); // New index for Edviron ID

export default mongoose.model('OrderStatus', orderStatusSchema);
