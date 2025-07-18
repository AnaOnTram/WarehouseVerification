const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Transfer = require('../models/Transfer');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// User management routes

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      fullName,
      role: role || 'operator'
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, fullName, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user (soft delete by setting isActive to false)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the current admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

// Item management routes

// Get all items
router.get('/items', async (req, res) => {
  try {
    const { 
      status, 
      forwarder, 
      page = 1, 
      limit = 20, 
      search, 
      searchType = 'both', // 'sn', 'pn', or 'both'
      dateFrom,
      dateTo,
      showAll = 'false'
    } = req.query;
    
    const filter = {};
    
    // Date filtering - default to last 72 hours unless showAll is true or specific dates provided
    if (showAll !== 'true' && !dateFrom && !dateTo) {
      const seventyTwoHoursAgo = new Date();
      seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);
      filter.createdAt = { $gte: seventyTwoHoursAgo };
    } else if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // End of day
        filter.createdAt.$lte = endDate;
      }
    }
    
    // Status and forwarder filtering
    if (status) filter.status = status;
    if (forwarder) filter.forwarder = forwarder;
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [];
      
      if (searchType === 'sn' || searchType === 'both') {
        searchConditions.push({ serialNumber: searchRegex });
      }
      if (searchType === 'pn' || searchType === 'both') {
        searchConditions.push({ partNumber: searchRegex });
      }
      
      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }

    const items = await Item.find(filter)
      .populate('operatorId', 'username fullName')
      .populate('operationHistory.operatorId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(filter);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      filter: filter // Send back applied filter for debugging
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to retrieve items' });
  }
});

// Update item status
router.put('/items/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'processed', 'available_for_pickup', 'shipped'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = status;
    if (status === 'available_for_pickup') {
      item.processedAt = new Date();
    } else if (status === 'shipped') {
      item.shippedAt = new Date();
    }

    await item.save();

    res.json({
      message: 'Item status updated successfully',
      item: await item.populate('operatorId', 'username fullName')
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ message: 'Failed to update item status' });
  }
});

// Delete item (admin only)
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item has any associated transfers
    const transfers = await Transfer.find({ itemId: item._id });
    if (transfers.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete item with associated transfers. Please handle transfers first.' 
      });
    }

    // Delete the item
    await Item.findByIdAndDelete(req.params.id);

    // Log the deletion action
    console.log(`Item ${item.mbvId} deleted by admin ${req.user.username}`);

    res.json({ 
      message: 'Item deleted successfully',
      deletedItem: {
        mbvId: item.mbvId,
        partNumber: item.partNumber,
        serialNumber: item.serialNumber
      }
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalItems,
      pendingItems,
      processingItems,
      processedItems,
      availableItems,
      shippedItems,
      totalUsers,
      activeUsers,
      totalTransfers,
      recentTransfers
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'pending' }),
      Item.countDocuments({ status: 'processing' }),
      Item.countDocuments({ status: 'processed' }),
      Item.countDocuments({ status: 'available_for_pickup' }),
      Item.countDocuments({ status: 'shipped' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transfer.countDocuments(),
      Transfer.find()
        .populate([
          { path: 'itemId', select: 'mbvId storageLocation partNumber serialNumber' },
          { path: 'operatorId', select: 'username fullName' }
        ])
        .sort({ transferredAt: -1 })
        .limit(10)
    ]);

    // Items by forwarder
    const itemsByForwarder = await Item.aggregate([
      {
        $group: {
          _id: '$forwarder',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Items by status over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const itemsOverTime = await Item.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      stats: {
        totalItems,
        pendingItems,
        processingItems,
        processedItems,
        availableItems,
        shippedItems,
        totalUsers,
        activeUsers,
        totalTransfers
      },
      itemsByForwarder,
      itemsOverTime,
      recentTransfers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard data' });
  }
});

// Export items data to CSV
router.get('/export', async (req, res) => {
  try {
    const { 
      dateFrom,
      dateTo,
      status,
      forwarder,
      format = 'csv'
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // Date filtering
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }
    
    if (status) filter.status = status;
    if (forwarder) filter.forwarder = forwarder;
    
    // Get items with full data
    const items = await Item.find(filter)
      .populate('operatorId', 'username fullName email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get transfer data for each item
    const itemIds = items.map(item => item._id);
    const transfers = await Transfer.find({ itemId: { $in: itemIds } })
      .populate('operatorId', 'username fullName email')
      .lean();
    
    // Create lookup map for transfers
    const transferMap = {};
    transfers.forEach(transfer => {
      transferMap[transfer.itemId.toString()] = transfer;
    });
    
    // Prepare CSV data
    const csvHeaders = [
      'MBV ID',
      'Storage Location', 
      'Part Number',
      'Serial Number',
      'Item Type',
      'Status',
      'Forwarder',
      'Operator Name',
      'Operator Email',
      'Created At',
      'Updated At',
      'Processed At',
      'Shipped At',
      'Picker Name',
      'Picker ID',
      'Picker Car Plate',
      'Transfer Date',
      'Transfer Operator',
      'Tag Verification Match'
    ];
    
    const csvRows = items.map(item => {
      const transfer = transferMap[item._id.toString()];
      return [
        item.mbvId || '',
        item.storageLocation || '',
        item.partNumber || '',
        item.serialNumber || '',
        item.itemType || '',
        item.status || '',
        item.forwarder || '',
        item.operatorId ? item.operatorId.fullName : '',
        item.operatorId ? item.operatorId.email : '',
        item.createdAt ? new Date(item.createdAt).toISOString() : '',
        item.updatedAt ? new Date(item.updatedAt).toISOString() : '',
        item.processedAt ? new Date(item.processedAt).toISOString() : '',
        item.shippedAt ? new Date(item.shippedAt).toISOString() : '',
        transfer && transfer.pickerIdentity ? transfer.pickerIdentity.name : '',
        transfer && transfer.pickerIdentity ? transfer.pickerIdentity.idNumber : '',
        transfer && transfer.pickerIdentity ? (transfer.pickerIdentity.carPlate || transfer.pickerIdentity.company || '') : '',
        transfer ? new Date(transfer.transferredAt).toISOString() : '',
        transfer && transfer.operatorId ? transfer.operatorId.fullName : '',
        transfer && transfer.tagVerificationResult ? (transfer.tagVerificationResult.matched ? 'Yes' : 'No') : ''
      ];
    });
    
    // Generate CSV content
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(','))
      .join('\n');
    
    // Set response headers for download
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `warehouse_items_export_${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

module.exports = router;