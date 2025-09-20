# School Payment Management System - Backend

A robust RESTful API for managing school payments, transactions, and webhooks built with Express.js and MongoDB.

## 🚀 Features

- **JWT Authentication** - Secure user authentication and authorization
- **Payment Processing** - Create and manage payment transactions
- **Webhook Handling** - Real-time payment status updates
- **Transaction Management** - Comprehensive transaction tracking
- **Advanced Filtering** - Filter by school, status, date range
- **Pagination & Sorting** - Efficient data retrieval
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Data integrity and security
- **Error Handling** - Comprehensive error management
- **Database Indexing** - Optimized query performance

## 🛠 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd school-payment-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-payment?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRES_IN=7d

# Payment Gateway Credentials
PG_KEY=edvtest01
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfs
SCHOOL_ID=65b0e6293e9f76a9694d84b4
TRUSTEE_ID=65b0e552dd31950a9b41c5ba

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Start the application

#### Development mode:
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

### 5. Seed test data
```bash
npm run seed
```

## 📁 Project Structure

```
src/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── paymentController.js # Payment operations
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User model
│   ├── Order.js             # Order model
│   ├── OrderStatus.js       # Order status model
│   └── WebhookLogs.js       # Webhook logs model
├── routes/
│   ├── auth.js              # Auth routes
│   ├── payment.js           # Payment routes
│   └── index.js             # Route aggregation
└── app.js                   # Main application
scripts/
└── seedData.js              # Database seeding
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Payments
- `POST /api/create-payment` - Create payment (Protected)
- `POST /api/webhook` - Handle payment webhook (Public)

### Transactions
- `GET /api/transactions` - Get all transactions (Protected)
- `GET /api/transactions/school/:schoolId` - Get school transactions (Protected)  
- `GET /api/transaction-status/:customOrderId` - Get transaction status (Protected)

### Utility
- `GET /api/health` - Health check

## 📖 API Usage Examples

### 1. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Payment
```bash
curl -X POST http://localhost:5000/api/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "student_info": {
      "name": "John Doe",
      "id": "STU001",
      "email": "john@example.com"
    },
    "amount": 2500,
    "gateway_name": "PhonePe"
  }'
```

### 4. Get Transactions with Filters
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=10&status=success&sort=payment_time&order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Webhook Simulation
```bash
curl -X POST http://localhost:5000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": 200,
    "order_info": {
      "order_id": "ORD_1234567890",
      "order_amount": 2000,
      "transaction_amount": 2200,
      "gateway": "PhonePe",
      "bank_reference": "YESBNK222",
      "status": "success",
      "payment_mode": "upi",
      "payemnt_details": "success@ybl",
      "Payment_message": "payment success",
      "payment_time": "2025-04-23T08:14:21.945+00:00",
      "error_message": "NA"
    }
  }'
```

## 🗃 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  school_id: ObjectId,
  trustee_id: ObjectId,
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  custom_order_id: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### OrderStatus Collection
```javascript
{
  _id: ObjectId,
  collect_id: ObjectId (ref: Order),
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String (enum: ['pending', 'success', 'failed', 'cancelled']),
  error_message: String,
  payment_time: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure API endpoints
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize and validate requests
- **CORS Configuration** - Control cross-origin requests
- **Security Headers** - Helmet.js protection
- **Error Sanitization** - Prevent information leakage

## 📊 Query Features

### Pagination
```
GET /api/transactions?page=2&limit=20
```

### Sorting
```
GET /api/transactions?sort=payment_time&order=desc
```

### Filtering
```
GET /api/transactions?status=success&school_id=65b0e6293e9f76a9694d84b4
```

## 🚀 Deployment

### Using Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy:
```bash
git push heroku main
```

### Using Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
BASE_URL=https://your-app.herokuapp.com
FRONTEND_URL=https://your-frontend-url.com
```

## 📝 Testing

### Test Credentials (after seeding)
- **Admin**: admin@school.com / password123
- **User**: user@school.com / password123

### Postman Collection
Import the provided Postman collection for easy API testing.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI
   - Ensure IP whitelist includes your IP
   - Verify network connectivity

2. **JWT Token Invalid**
   - Check JWT_SECRET in environment
   - Verify token format in Authorization header
   - Ensure token hasn't expired

3. **Validation Errors**
   - Check request payload format
   - Ensure required fields are present
   - Verify data types match schema

## 📈 Performance Optimization

- **Database Indexing** - Automatic indexes on frequently queried fields
- **Aggregation Pipeline** - Efficient data joining and filtering  
- **Rate Limiting** - Prevent server overload
- **Connection Pooling** - Mongoose default connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@yourapp.com

---

**Made with ❤️ for School Payment Management**