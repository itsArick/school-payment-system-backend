import mongoose from 'mongoose';

const studentInfoSchema = {
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
};

const orderSchema = new mongoose.Schema({
  school_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  trustee_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  student_info: {
    type: studentInfoSchema,
    required: true
  },
  gateway_name: {
    type: String,
    required: true,
    default: 'Edviron'
  },
  custom_order_id: {
    type: String,
    unique: true,
    required: true
  },
  // NEW EDVIRON SPECIFIC FIELDS
  edviron_collect_id: {
    type: String,
    sparse: true, // Allow null values but ensure uniqueness when present
   index: true
  },
  edviron_sign: {
    type: String
  },
  edviron_payment_url: {
    type: String
  }
}, {
  timestamps: true
});

orderSchema.index({ custom_order_id: 1 });
orderSchema.index({ school_id: 1 });
 // New index for Edviron ID

export default mongoose.model('Order', orderSchema);
