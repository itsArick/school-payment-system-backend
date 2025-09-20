import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import axios from 'axios';
import Order from '../models/Order.js';
import OrderStatus from '../models/OrderStatus.js';
import WebhookLogs from '../models/WebhookLogs.js';


// export const createPayment = async (req, res) => {
//   try {
//     const { student_info, amount, gateway_name = 'Edviron', school_id } = req.body;

//     // Generate custom order ID
//     const customOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

//     // Use school_id from request, or fallback to environment variable
//     const selectedSchoolId = school_id || process.env.SCHOOL_ID;

//     console.log('Creating payment for school:', selectedSchoolId);

//     // Create order in our database first
//     const order = new Order({
//       school_id: new mongoose.Types.ObjectId(selectedSchoolId), // Use selected school
//       trustee_id: new mongoose.Types.ObjectId(process.env.TRUSTEE_ID),
//       student_info,
//       gateway_name,
//       custom_order_id: customOrderId
//     });

//     const savedOrder = await order.save();

//     // Create initial order status
//     const orderStatus = new OrderStatus({
//       collect_id: savedOrder._id,
//       order_amount: amount,
//       transaction_amount: amount,
//       payment_mode: 'pending',
//       status: 'pending',
//       payment_message: 'Payment initiated'
//     });

//     await orderStatus.save();

//     // ========================================
//     // REAL EDVIRON PAYMENT GATEWAY INTEGRATION
//     // ========================================
    
//     try {
//       // 1. Create JWT signature as per Edviron documentation
//       const jwtPayload = {
//         school_id: selectedSchoolId, // Use selected school for Edviron
//         amount: amount.toString(),
//         callback_url: `${process.env.FRONTEND_URL}/payment-callback`
//       };

//       // Sign with PG_KEY (as per documentation)
//       const signedJWT = jwt.sign(jwtPayload, process.env.PG_KEY);

//       // 2. Prepare request payload for Edviron API
//       const edvironPayload = {
//         school_id: selectedSchoolId, // Use selected school
//         amount: amount.toString(),
//         callback_url: `${process.env.FRONTEND_URL}/payment-callback`,
//         sign: signedJWT
//       };

//       console.log('Calling Edviron API with payload:', {
//         ...edvironPayload,
//         sign: 'JWT_SIGNATURE_HIDDEN'
//       });

//       // 3. Make actual API call to Edviron payment gateway
//       const edvironResponse = await axios.post(
//         'https://dev-vanilla.edviron.com/erp/create-collect-request',
//         edvironPayload,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${process.env.API_KEY}`
//           },
//           timeout: 30000
//         }
//       );

//       console.log('Edviron API Response:', edvironResponse.data);

//       // 4. Extract data from Edviron response
//       const {
//         collect_request_id,
//         collect_request_url,
//         sign: responseSign
//       } = edvironResponse.data;

//       if (!collect_request_id || !collect_request_url) {
//         throw new Error('Invalid response from Edviron API');
//       }

//       // 5. Update our order with Edviron's collect_request_id
//       await Order.findByIdAndUpdate(savedOrder._id, {
//         edviron_collect_id: collect_request_id,
//         edviron_sign: responseSign
//       });

//       // 6. Update order status with Edviron details
//       await OrderStatus.findOneAndUpdate(
//         { collect_id: savedOrder._id },
//         {
//           payment_message: 'Payment link generated successfully',
//           edviron_collect_id: collect_request_id
//         }
//       );

//       // 7. Return successful response with real payment URL
//       res.status(201).json({
//         success: true,
//         message: 'Payment initiated successfully with Edviron',
//         data: {
//           payment_url: collect_request_url,
//           order_id: customOrderId,
//           collect_id: savedOrder._id,
//           edviron_collect_id: collect_request_id,
//           amount: amount,
//           student_info: student_info,
//           school_id: selectedSchoolId // Return which school was used
//         }
//       });

//     } catch (edvironError) {
//       // Handle Edviron API errors
//       console.error('Edviron API Error:', {
//         message: edvironError.message,
//         response: edvironError.response?.data,
//         status: edvironError.response?.status
//       });
      
//       // Update order status to failed
//       await OrderStatus.findOneAndUpdate(
//         { collect_id: savedOrder._id },
//         { 
//           status: 'failed',
//           error_message: edvironError.response?.data?.message || edvironError.message,
//           payment_message: 'Failed to create payment link with Edviron'
//         }
//       );

//       return res.status(500).json({
//         success: false,
//         message: 'Failed to initiate payment with Edviron gateway',
//         error: edvironError.response?.data?.message || edvironError.message,
//         details: process.env.NODE_ENV === 'development' ? edvironError.response?.data : undefined
//       });
//     }

//   } catch (error) {
//     console.error('Payment creation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create payment',
//       error: error.message
//     });
//   }
// };





// Payment creation
export const createPayment = async (req, res) => {
  try {
    const { student_info, amount, gateway_name = 'Edviron' } = req.body;
    const customOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const order = new Order({
      school_id: new mongoose.Types.ObjectId(process.env.SCHOOL_ID),
      trustee_id: new mongoose.Types.ObjectId(process.env.TRUSTEE_ID),
      student_info,
      gateway_name,
      custom_order_id: customOrderId
    });
    const savedOrder = await order.save();

    const orderStatus = new OrderStatus({
      collect_id: savedOrder._id,
      order_amount: amount,
      transaction_amount: amount,
      payment_mode: 'pending',
      status: 'pending',
      payment_message: 'Payment initiated'
    });
    await orderStatus.save();

    // REAL EDVIRON PAYMENT GATEWAY INTEGRATION
    try {
      const jwtPayload = {
        school_id: process.env.SCHOOL_ID,
        amount: amount.toString(),
        callback_url: `${process.env.BASE_URL}/api/webhook`
      };
      const signedJWT = jwt.sign(jwtPayload, process.env.PG_KEY);

      const edvironPayload = {
        school_id: process.env.SCHOOL_ID,
        amount: amount.toString(),
        callback_url: `${process.env.BASE_URL}/api/webhook`,
        sign: signedJWT
      };
      console.log('Calling Edviron API with payload:', {
        ...edvironPayload,
        sign: 'JWT_SIGNATURE_HIDDEN'
      });
      const edvironResponse = await axios.post(
        'https://dev-vanilla.edviron.com/erp/create-collect-request',
        edvironPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`
          },
          timeout: 30000
        }
      );
      console.log('Edviron API Response:', edvironResponse.data);
      const {
        collect_request_id,
        collect_request_url,
        sign: responseSign
      } = edvironResponse.data;
      if (!collect_request_id || !collect_request_url) {
        throw new Error('Invalid response from Edviron API');
      }
      await Order.findByIdAndUpdate(savedOrder._id, {
        edviron_collect_id: collect_request_id,
        edviron_sign: responseSign
      });
      await OrderStatus.findOneAndUpdate(
        { collect_id: savedOrder._id },
        {
          payment_message: 'Payment link generated successfully',
          edviron_collect_id: collect_request_id
        }
      );
      res.status(201).json({
        success: true,
        message: 'Payment initiated successfully with Edviron',
        data: {
          payment_url: collect_request_url,
          order_id: customOrderId,
          collect_id: savedOrder._id,
          edviron_collect_id: collect_request_id,
          amount: amount,
          student_info: student_info
        }
      });
    } catch (edvironError) {
      console.error('Edviron API Error:', {
        message: edvironError.message,
        response: edvironError.response?.data,
        status: edvironError.response?.status
      });
      await OrderStatus.findOneAndUpdate(
        { collect_id: savedOrder._id },
        { 
          status: 'failed',
          error_message: edvironError.response?.data?.message || edvironError.message,
          payment_message: 'Failed to create payment link with Edviron'
        }
      );
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment with Edviron gateway',
        error: edvironError.response?.data?.message || edvironError.message,
        details: process.env.NODE_ENV === 'development' ? edvironError.response?.data : undefined
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};






// Edviron payment status
export const checkPaymentStatusWithEdviron = async (req, res) => {
  try {
    const { customOrderId } = req.params;
    const order = await Order.findOne({ custom_order_id: customOrderId });
    if (!order || !order.edviron_collect_id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or no Edviron collect ID'
      });
    }
    const jwtPayload = {
      school_id: process.env.SCHOOL_ID,
      collect_request_id: order.edviron_collect_id
    };
    const signedJWT = jwt.sign(jwtPayload, process.env.PG_KEY);
    const statusUrl = `https://dev-vanilla.edviron.com/erp/collect-request/${order.edviron_collect_id}?school_id=${process.env.SCHOOL_ID}&sign=${signedJWT}`;
    const statusResponse = await axios.get(statusUrl, { timeout: 30000 });
    console.log('Edviron Status Response:', statusResponse.data);
    if (statusResponse.data.status) {
      const mappedStatus = mapEdvironStatusToOurStatus(statusResponse.data.status);
      await OrderStatus.findOneAndUpdate(
        { collect_id: order._id },
        {
          status: mappedStatus,
          transaction_amount: statusResponse.data.amount || 0,
          payment_message: `Status from Edviron: ${statusResponse.data.status}`,
          payment_time: mappedStatus === 'success' ? new Date() : undefined
        }
      );
    }
    res.json({
      success: true,
      data: {
        custom_order_id: customOrderId,
        collect_id: order._id,
        edviron_collect_id: order.edviron_collect_id,
        edviron_status: statusResponse.data.status,
        mapped_status: mapEdvironStatusToOurStatus(statusResponse.data.status),
        amount: statusResponse.data.amount,
        details: statusResponse.data.details
      }
    });
  } catch (error) {
    console.error('Edviron status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status with Edviron',
      error: error.message
    });
  }
};

// Helper function
export const mapEdvironStatusToOurStatus = (edvironStatus) => {
  switch (edvironStatus?.toUpperCase()) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
    case 'PROCESSING':
      return 'pending';
    case 'FAILED':
    case 'CANCELLED':
      return 'failed';
    default:
      return 'pending';
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook:', webhookData);
    const webhookLog = new WebhookLogs({
      webhook_data: webhookData,
      status: webhookData.status,
      order_id: webhookData.order_info?.order_id,
      processed: false
    });
    await webhookLog.save();
    const { order_info } = webhookData;
    if (!order_info || !order_info.order_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook data: missing order information'
      });
    }
    let order = await Order.findOne({ custom_order_id: order_info.order_id });
    if (!order) {
      order = await Order.findOne({ edviron_collect_id: order_info.order_id });
    }
    if (!order) {
      webhookLog.processing_error = 'Order not found';
      await webhookLog.save();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    const updateData = {
      order_amount: order_info.order_amount,
      transaction_amount: order_info.transaction_amount,
      payment_mode: order_info.payment_mode,
      payment_details: order_info.payemnt_details || order_info.payment_details,
      bank_reference: order_info.bank_reference,
      payment_message: order_info.Payment_message || order_info.payment_message,
      status: order_info.status,
      error_message: order_info.error_message || 'NA',
      payment_time: order_info.payment_time ? new Date(order_info.payment_time) : new Date()
    };
    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      updateData,
      { new: true, upsert: true }
    );
    webhookLog.processed = true;
    await webhookLog.save();
    console.log(`Webhook processed successfully for order: ${order_info.order_id}`);
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    if (req.body?.order_info?.order_id) {
      await WebhookLogs.findOneAndUpdate(
        { order_id: req.body.order_info.order_id, processed: false },
        { processing_error: error.message },
        { sort: { createdAt: -1 } }
      );
    }
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};




//$ CHANGED: Added GET webhook handler for Edviron callback redirects
export const handleWebhookGet = async (req, res) => {
  try {
    const { EdvironCollectRequestId, status, reason } = req.query;

    if (!EdvironCollectRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Missing EdvironCollectRequestId in query params'
      });
    }

    // Try to find the order
    const order = await Order.findOne({ edviron_collect_id: EdvironCollectRequestId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for given EdvironCollectRequestId'
      });
    }

    // Update order status
    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      {
        status: status ? status.toLowerCase() : 'failed',
        error_message: reason || null,
        payment_message: `Updated via GET callback with status: ${status}`,
        payment_time: new Date()
      },
      { new: true, upsert: true }
    );

    // Log this GET callback as well
    const webhookLog = new WebhookLogs({
      webhook_data: req.query,
      status: status,
      order_id: EdvironCollectRequestId,
      processed: true
    });
    await webhookLog.save();

    console.log(`GET webhook processed for EdvironCollectRequestId: ${EdvironCollectRequestId}`);

    res.json({
      success: true,
      message: 'Webhook GET callback processed successfully'
    });
  } catch (error) {
    console.error('Webhook GET error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook GET',
      error: error.message
    });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'payment_time',
      order = 'desc',
      status,
      school_id
    } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'desc' ? -1 : 1;
    const matchConditions = {};
    if (school_id) {
      matchConditions.school_id = new mongoose.Types.ObjectId(school_id);
    }
    let statusMatch = {};
    if (status) {
      statusMatch['status_info.status'] = status;
    }
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      { $unwind: '$status_info' },
      { $match: statusMatch },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_time: '$status_info.payment_time',
          payment_mode: '$status_info.payment_mode',
          student_name: '$student_info.name',
          bank_reference: '$status_info.bank_reference',
          edviron_collect_id: 1
        }
      },
      { $sort: { [sort]: sortOrder } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];
    const result = await Order.aggregate(pipeline);
    const transactions = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(totalCount / limitNum),
          total_count: totalCount,
          has_next: pageNum < Math.ceil(totalCount / limitNum),
          has_prev: pageNum > 1,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get transactions by school
export const getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const pipeline = [
      { $match: { school_id: new mongoose.Types.ObjectId(schoolId) } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      { $unwind: '$status_info' },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$status_info.order_amount',
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_time: '$status_info.payment_time',
          student_name: '$student_info.name',
          payment_mode: '$status_info.payment_mode',
          edviron_collect_id: 1
        }
      },
      { $sort: { payment_time: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];
    const result = await Order.aggregate(pipeline);
    const transactions = result[0].data;
    const totalCount = result[0].totalCount[0]?.count || 0;
    res.json({
      success: true,
      data: {
        transactions,
        total: totalCount,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(totalCount / limitNum),
          total_count: totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get school transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school transactions',
      error: error.message
    });
  }
};

// Get transaction status
export const getTransactionStatus = async (req, res) => {
  try {
    const { customOrderId } = req.params;
    const order = await Order.findOne({ custom_order_id: customOrderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    const status = await OrderStatus.findOne({ collect_id: order._id });
    res.json({
      success: true,
      data: {
        custom_order_id: customOrderId,
        collect_id: order._id,
        edviron_collect_id: order.edviron_collect_id,
        status: status?.status || 'pending',
        payment_time: status?.payment_time,
        order_amount: status?.order_amount,
        transaction_amount: status?.transaction_amount,
        payment_mode: status?.payment_mode,
        payment_message: status?.payment_message,
        bank_reference: status?.bank_reference
      }
    });
  } catch (error) {
    console.error('Get transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction status',
      error: error.message
    });
  }
};
