import { Schema, model } from 'mongoose';

const webhookLogsSchema = new Schema({
  webhook_data: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  order_id: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  processing_error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create index for order_id
webhookLogsSchema.index({ order_id: 1 });
webhookLogsSchema.index({ processed: 1 });

export default model('WebhookLogs', webhookLogsSchema);
