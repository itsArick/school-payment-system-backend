import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    console.log('Creating database indexes...');
    
    // Import models to ensure indexes are created
    // Import statements trigger model registration and index creation
    await import('../models/User.js');
    await import('../models/Order.js');
    await import('../models/OrderStatus.js');
    await import('../models/WebhookLogs.js');
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
