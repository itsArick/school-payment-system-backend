# School Payment Management System - Backend

A robust RESTful API for managing school payments, transactions, and webhooks built with Express.js and MongoDB.

## Live Demo
- **Backend API**: [https://school-payment-system-backend.onrender.com](https://school-payment-system-backend.onrender.com)
- **Frontend**: [https://school-payment-system-frontend.vercel.app](https://school-payment-system-frontend.vercel.app)

---

## Features

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

## Tech Stack

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

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

## Quick Start

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
MONGODB_URI=mongodbURL

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

## Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with test data
npm test           # Run tests (if configured)
```

## Project Structure

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

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/create-payment` | Create payment | Yes |
| POST | `/api/webhook` | Handle payment webhook | No |

### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/transactions` | Get all transactions | Yes |
| GET | `/api/transactions/school/:schoolId` | Get school transactions | Yes |
| GET | `/api/transaction-status/:customOrderId` | Get transaction status | Yes |

### Utility
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |

## API Usage Examples

### 1. User Registration
```bash
curl -X POST https://school-payment-system-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. User Login
```bash
curl -X POST https://school-payment-system-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Payment
```bash
curl -X POST https://school-payment-system-backend.onrender.com/api/create-payment \
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
curl -X GET "https://school-payment-system-backend.onrender.com/api/transactions?page=1&limit=10&status=success&sort=payment_time&order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Webhook Simulation
```bash
curl -X POST https://school-payment-system-backend.onrender.com/api/webhook \
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

## Database Schema

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

## Security Features

- **JWT Authentication** - Secure API endpoints
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize and validate requests
- **CORS Configuration** - Control cross-origin requests
- **Security Headers** - Helmet.js protection
- **Error Sanitization** - Prevent information leakage

## Query Features

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

## Deployment

### Render Deployment (Current Setup)

**Environment Variables for Production:**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
BASE_URL=https://school-payment-system-backend.onrender.com
FRONTEND_URL=https://school-payment-system-frontend.vercel.app
PG_KEY=your-payment-gateway-key
API_KEY=your-api-key
SCHOOL_ID=your-school-id
TRUSTEE_ID=your-trustee-id
```

**Deployment Steps:**
1. Connect GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all required environment variables
6. Deploy

### Alternative Deployment Platforms

#### Railway
1. Connect GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Heroku
1. Create Heroku app
2. Set environment variables using Heroku CLI or dashboard
3. Deploy using Git:
```bash
git push heroku main
```

## Testing

### Test Credentials (after seeding)
- **Admin**: admin@school.com / password123
- **User**: user@school.com / password123

### API Testing
Use tools like Postman, Insomnia, or curl to test the endpoints. The API includes comprehensive error handling and validation.

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGODB_URI format and credentials
   - Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0 for cloud deployment
   - Verify network connectivity

2. **JWT Token Invalid**
   - Verify JWT_SECRET is set correctly in environment variables
   - Check token format in Authorization header: `Bearer <token>`
   - Ensure token hasn't expired (check JWT_EXPIRES_IN setting)

3. **CORS Errors**
   - Verify FRONTEND_URL matches your frontend deployment URL
   - Check CORS configuration in app.js
   - Ensure credentials are properly handled

4. **Payment Gateway Issues**
   - Verify API_KEY, PG_KEY, SCHOOL_ID, and TRUSTEE_ID are correct
   - Check payment gateway documentation for required parameters
   - Test webhook endpoints with proper payload format

5. **Render Deployment Issues**
   - Check build logs in Render dashboard
   - Verify all environment variables are set
   - Ensure PORT is set to 10000 for Render compatibility

## Performance Optimization

- **Database Indexing** - Automatic indexes on frequently queried fields
- **Aggregation Pipeline** - Efficient data joining and filtering
- **Rate Limiting** - Prevent server overload
- **Connection Pooling** - Mongoose default connection pooling
- **Error Caching** - Efficient error handling and logging

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request



## Support

For support and questions:
- Create an issue in the repository
- Check API documentation at `/api/health`
- Contact the development team

---

**Made for School Payment Management**
