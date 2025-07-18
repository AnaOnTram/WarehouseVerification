# Warehouse Verification System

A comprehensive asset transfer verification system for warehouse operations, featuring OCR-powered MBV processing, workflow management, and mobile-optimized interface.

## Features

### Core Functionality
- **User Authentication**: Role-based access control (Operator/Admin)
- **MBV Processing**: Upload and OCR processing of Material Booking Vouchers
- **Information Extraction**: AI-powered extraction of storage location, part number, and serial number
- **Workflow Management**: Complete checklist-based processing workflow
- **Transfer Verification**: Tag verification system for item transfers
- **Mobile Optimization**: Apple-style responsive design for mobile devices

### User Roles
- **Operator**: Can upload MBVs, process items, and handle transfers
- **Admin**: Full system access including user management and dashboard

### Process Flow
1. **MBV Upload**: Upload MBV image → OCR processing → Information extraction
2. **Item Processing**: Manual verification → Checklist completion → Status updates
3. **Transfer Management**: Forwarder selection → Tag verification → Transfer completion

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Mistral API key
- OpenRouter (Or any other LLM Service Provider) API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WarehouseVerification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` file with your configuration:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/warehouse_verification
   JWT_SECRET=your_jwt_secret_here
   OPENROUTER_API_KEY=your_openrouter_api_key
   MISTRAL_OCR_API_KEY=your_mistral_ocr_api_key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Create Admin User**
   ```bash
   node -e "
   const mongoose = require('mongoose');
   const User = require('./models/User');
   require('dotenv').config();
   
   mongoose.connect(process.env.MONGODB_URI).then(async () => {
     const admin = new User({
       username: 'admin',
       email: 'admin@example.com',
       password: 'admin123',
       fullName: 'System Administrator',
       role: 'admin'
     });
     await admin.save();
     console('Admin user created');
     process.exit(0);
   });
   "
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Items
- `POST /api/items/upload-mbv` - Upload MBV image
- `POST /api/items/create` - Create new item
- `GET /api/items/my-items` - Get user's items
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `PUT /api/items/:id/checklist` - Update checklist
- `POST /api/items/:id/photo` - Upload item photo

### Transfers
- `GET /api/transfers/forwarders` - Get forwarders with available items
- `GET /api/transfers/available/:forwarder` - Get available items by forwarder
- `POST /api/transfers/verify-tag/:itemId` - Verify tag and complete transfer
- `GET /api/transfers/history` - Get transfer history
- `GET /api/transfers/:id` - Get transfer details

### Admin
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user
- `GET /api/admin/items` - Get all items
- `PUT /api/admin/items/:id/status` - Update item status
- `GET /api/admin/dashboard` - Get dashboard statistics

## Usage Guide

### For Operators

1. **Login**
   - Use your assigned username and password
   - System will remember your session

2. **Upload MBV**
   - Navigate to "Upload MBV"
   - Take photo or select MBV image
   - Review extracted information
   - Modify if necessary
   - Select item type and forwarder
   - Click "Create Item"

3. **Process Items**
   - Go to "My Items"
   - Select item to process
   - Complete checklist in order:
     - Pick item from storage
     - Verify item identity and integration
     - Complete SAP operation
     - Package item
     - Photograph item (if required)
     - Book forwarder/courier
     - Place in designated area
   - Mark as available for pickup

4. **Handle Transfers**
   - Navigate to "Transfers"
   - Select forwarder
   - Choose item for transfer
   - Enter picker information
   - Take photo of item tag
   - Verify tag matches item record
   - Complete transfer

### For Admins

1. **User Management**
   - Create new operator accounts
   - Manage user roles and permissions
   - Deactivate users if needed

2. **System Overview**
   - View dashboard statistics
   - Monitor item processing status
   - Track transfer history
   - Generate reports
