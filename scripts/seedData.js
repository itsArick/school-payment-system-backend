// scripts/seedData.js (ES module version with better Edviron ID handling)
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import OrderStatus from '../src/models/OrderStatus.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      OrderStatus.deleteMany({})
    ]);

    // Drop existing indexes to recreate them properly
    try {
      await Order.collection.dropIndexes();
      console.log('Dropped existing indexes');
    } catch (err) {
      console.log('No indexes to drop or error dropping indexes:', err.message);
    }

    // Create test users
    console.log('Creating test users...');
    const testUsers = await User.create([
      {
        email: 'admin@school.com',
        password: 'password123',
        role: 'admin'
      },
      {
        email: 'user@school.com',
        password: 'password123',
        role: 'user'
      }
    ]);
    console.log('Test users created:', testUsers.length);

    // Create dummy orders and statuses with better Edviron integration
    console.log('Creating dummy transactions with Edviron data...');
    const statuses = ['success', 'pending', 'failed'];
    const edvironStatuses = ['SUCCESS', 'PENDING', 'FAILED'];
    const gateways = ['Edviron', 'PhonePe', 'Paytm', 'Razorpay'];
    const paymentModes = ['upi', 'card', 'netbanking', 'wallet'];
    const schools = [
      '65b0e6293e9f76a9694d84b4', // school IDs from credentials
      '65b0e6293e9f76a9694d84b5',
      '65b0e6293e9f76a9694d84b6',
      '65b0e6293e9f76a9694d84b7'
    ];

    const orders = [];
    const orderStatuses = [];

    for (let i = 1; i <= 50; i++) {
      const customOrderId = `ORD_${Date.now()}_${i}`;
      const amount = Math.floor(Math.random() * 10000) + 500;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const edvironStatus = edvironStatuses[statuses.indexOf(status)];
      const gateway = gateways[Math.floor(Math.random() * gateways.length)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const schoolId = schools[Math.floor(Math.random() * schools.length)];

      // Generate Edviron collect_request_id ONLY for Edviron gateway (avoid null duplicates)
      let edvironCollectId = null;
      let edvironSign = null;
      let edvironPaymentUrl = null;
      if (gateway === 'Edviron') {
        edvironCollectId = `edv_${Math.random().toString(36).substr(2, 24)}`;
        edvironSign = `mock_jwt_signature_${i}`;
        edvironPaymentUrl = `https://dev-vanilla.edviron.com/payment/${edvironCollectId}`;
      }

      const order = {
        school_id: new mongoose.Types.ObjectId(schoolId),
        trustee_id: new mongoose.Types.ObjectId(process.env.TRUSTEE_ID || '65b0e552dd31950a9b41c5ba'),
        student_info: {
          name: `Student ${i}`,
          id: `STU${String(i).padStart(4, '0')}`,
          email: `student${i}@school.com`
        },
        gateway_name: gateway,
        custom_order_id: customOrderId
      };

      if (edvironCollectId) {
        order.edviron_collect_id = edvironCollectId;
        order.edviron_sign = edvironSign;
        order.edviron_payment_url = edvironPaymentUrl;
      }

      orders.push(order);
    }

    // Insert orders one by one to handle any duplicate issues gracefully
    const savedOrders = [];
    for (let i = 0; i < orders.length; i++) {
      try {
        const savedOrder = await Order.create(orders[i]);
        savedOrders.push(savedOrder);
      } catch (err) {
        console.log(`Skipping order ${i + 1} due to error:`, err.message);
      }
    }
    console.log('Orders created:', savedOrders.length);

    // Create order statuses
    for (let i = 0; i < savedOrders.length; i++) {
      const order = savedOrders[i];
      const amount = Math.floor(Math.random() * 10000) + 500;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const edvironStatus = edvironStatuses[statuses.indexOf(status)];
      const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];

      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const orderStatus = {
        collect_id: order._id,
        order_amount: amount,
        transaction_amount: amount + Math.floor(Math.random() * 50),
        payment_mode: paymentMode,
        payment_details: status === 'success' ? `${paymentMode}@success` : '',
        bank_reference: status === 'success' ? `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}` : '',
        payment_message: status === 'success' ? 'Payment successful' :
                         status === 'pending' ? 'Payment processing' : 'Payment failed',
        status: status,
        error_message: status === 'failed' ? 'Transaction declined by bank' : 'NA',
        payment_time: randomDate,
        last_status_check: randomDate
      };

      if (order.edviron_collect_id) {
        orderStatus.edviron_collect_id = order.edviron_collect_id;
        orderStatus.edviron_status = edvironStatus;
        orderStatus.edviron_response = {
          status: edvironStatus,
          amount: amount,
          details: { payment_method: paymentMode },
          last_updated: randomDate
        };
      }

      orderStatuses.push(orderStatus);
    }

    await OrderStatus.insertMany(orderStatuses);
    console.log('Order statuses created:', orderStatuses.length);

    // Counts
    const edvironCount = savedOrders.filter(o => o.gateway_name === 'Edviron').length;
    const successCount = orderStatuses.filter(os => os.status === 'success').length;
    const pendingCount = orderStatuses.filter(os => os.status === 'pending').length;
    const failedCount = orderStatuses.filter(os => os.status === 'failed').length;

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Admin: admin@school.com / password123');
    console.log('User: user@school.com / password123');
    console.log(`\n📊 Transaction Summary:`);
    console.log(`├── Total: ${savedOrders.length} transactions`);
    console.log(`├── Edviron: ${edvironCount} transactions`);
    console.log(`├── Success: ${successCount} transactions`);
    console.log(`├── Pending: ${pendingCount} transactions`);
    console.log(`└── Failed: ${failedCount} transactions`);
    console.log(`\n🏫 Schools: ${schools.length} different school IDs`);
    console.log(`💳 Payment gateways: ${gateways.join(', ')}`);
    console.log('\n🔧 Next Steps:');
    console.log('1. Start frontend: cd ../school-payment-frontend && npm run dev');
    console.log('2. Test Create Payment page with real Edviron API');
    console.log('3. Use Status Check to verify transactions');

    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

await seedData();
