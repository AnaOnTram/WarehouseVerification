const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const Item = require('../models/Item');
const { authenticateToken } = require('../middleware/auth');
const ocrService = require('../services/ocrService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../public/uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// Upload and process MBV image
router.post('/upload-mbv', authenticateToken, upload.single('mbvImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    await ensureUploadDir();
    
    // Save image file
    // Convert HEIF/HEIC to JPEG for storage
    let processedBuffer = req.file.buffer;
    let fileExtension = 'jpg';
    
    // Check if it's a HEIF/HEIC file and convert to JPEG
    if (req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
      processedBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 95 })
        .toBuffer();
    }
    
    const fileName = `mbv_${uuidv4()}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(__dirname, '../public/uploads', fileName);
    await fs.writeFile(filePath, processedBuffer);

    // Process image with OCR
    const { ocrText, extractedInfo } = await ocrService.processMBVImage(req.file.buffer);

    res.json({
      imageUrl: `/uploads/${fileName}`,
      ocrText,
      extractedInfo,
      success: true
    });
  } catch (error) {
    console.error('MBV upload error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Failed to process MBV image',
      error: error.message,
      details: error.stack 
    });
  }
});

// Create new item from MBV data
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { storageLocation, partNumber, serialNumber, itemType, mbvImageUrl } = req.body;

    if (!storageLocation || !partNumber || !serialNumber || !itemType) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const mbvId = `MBV_${Date.now()}_${uuidv4().substring(0, 8)}`;

    const item = new Item({
      mbvId,
      storageLocation,
      partNumber,
      serialNumber,
      itemType,
      operatorId: req.user._id,
      mbvImageUrl: mbvImageUrl || null,
      status: 'processing',
      operationHistory: [{
        operation: 'item_created',
        operatorId: req.user._id,
        details: {
          storageLocation,
          partNumber,
          serialNumber,
          itemType
        }
      }]
    });

    await item.save();

    res.status(201).json({
      message: 'Item created successfully',
      item: await item.populate('operatorId', 'username fullName')
    });
  } catch (error) {
    console.error('Item creation error:', error);
    res.status(500).json({ message: 'Failed to create item' });
  }
});

// Get all items for current operator
router.get('/my-items', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ operatorId: req.user._id })
      .populate('operatorId', 'username fullName')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Failed to retrieve items' });
  }
});

// Get item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('operatorId', 'username fullName');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Failed to retrieve item' });
  }
});

// Update item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { storageLocation, partNumber, serialNumber, itemType, forwarder, status } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user can update this item
    if (item.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = {};
    const operationDetails = {};
    
    if (storageLocation) {
      updateData.storageLocation = storageLocation;
      operationDetails.storageLocation = storageLocation;
    }
    if (partNumber) {
      updateData.partNumber = partNumber;
      operationDetails.partNumber = partNumber;
    }
    if (serialNumber) {
      updateData.serialNumber = serialNumber;
      operationDetails.serialNumber = serialNumber;
    }
    if (itemType) {
      updateData.itemType = itemType;
      operationDetails.itemType = itemType;
    }
    if (forwarder) {
      updateData.forwarder = forwarder;
      operationDetails.forwarder = forwarder;
    }
    if (status) {
      // Validate status
      if (!['pending', 'processing', 'processed', 'available_for_pickup', 'shipped'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Users can only update status to available_for_pickup from processed
      if (req.user.role !== 'admin' && status !== 'available_for_pickup') {
        return res.status(403).json({ message: 'Users can only mark items as available for pickup' });
      }
      
      if (req.user.role !== 'admin' && item.status !== 'processed') {
        return res.status(400).json({ message: 'Item must be processed before marking as available for pickup' });
      }
      
      updateData.status = status;
      operationDetails.status = status;
      
      // Set timestamps
      if (status === 'available_for_pickup') {
        updateData.processedAt = new Date();
      } else if (status === 'shipped') {
        updateData.shippedAt = new Date();
      }
    }

    // Add operation to history
    if (Object.keys(operationDetails).length > 0) {
      const operationType = forwarder ? 'forwarder_set' : 'item_updated';
      item.operationHistory.push({
        operation: operationType,
        operatorId: req.user._id,
        details: operationDetails
      });
      
      // Update the item with new data and operation history
      Object.assign(item, updateData);
      
      // Check for automatic status transition (especially important when forwarder is set)
      if (checkForStatusTransition(item)) {
        item.status = 'processed';
        item.processedAt = new Date();
        
        // Add status change to operation history
        item.operationHistory.push({
          operation: 'status_auto_updated',
          operatorId: req.user._id,
          details: {
            oldStatus: 'processing',
            newStatus: 'processed',
            reason: 'All checklist items completed and forwarder set'
          }
        });
      }
      
      await item.save();
    } else {
      // If no operation details, just update the item normally
      Object.assign(item, updateData);
      await item.save();
    }

    const updatedItem = await Item.findById(req.params.id)
      .populate('operatorId', 'username fullName');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// Helper function to check if item should transition to 'processed' status
function checkForStatusTransition(item) {
  if (item.status !== 'processing') {
    return false;
  }

  // Check if all required checklist items are completed
  const requiredItems = ['itemPicked', 'identityVerified', 'sapOperationDone', 'packaged', 'placedInDesignatedArea'];
  
  // Add photographed if item is EVA or EVERGREEN
  if (item.itemType === 'EVA' || item.itemType === 'EVERGREEN') {
    requiredItems.push('photographed');
  }
  
  // Add forwarderBooked if SAP operation is done and forwarder is set
  if (item.checklist.sapOperationDone && item.forwarder) {
    requiredItems.push('forwarderBooked');
  }
  
  const allCompleted = requiredItems.every(key => item.checklist[key] === true);
  const hasForwarder = item.forwarder && item.forwarder !== '';
  
  return allCompleted && hasForwarder;
}

// Update checklist item
router.put('/:id/checklist', authenticateToken, async (req, res) => {
  try {
    const { checklistItem, value } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.checklist[checklistItem] = value;

    // Add operation to history
    item.operationHistory.push({
      operation: 'checklist_updated',
      operatorId: req.user._id,
      details: {
        checklistItem,
        value
      }
    });

    // Check for automatic status transition
    if (checkForStatusTransition(item)) {
      item.status = 'processed';
      item.processedAt = new Date();
      
      // Add status change to operation history
      item.operationHistory.push({
        operation: 'status_auto_updated',
        operatorId: req.user._id,
        details: {
          oldStatus: 'processing',
          newStatus: 'processed',
          reason: 'All checklist items completed and forwarder set'
        }
      });
    }

    await item.save();

    res.json({
      message: 'Checklist updated successfully',
      item: await item.populate('operatorId', 'username fullName')
    });
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ message: 'Failed to update checklist' });
  }
});

// Upload item photo
router.post('/:id/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file provided' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.operatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    await ensureUploadDir();
    
    // Convert HEIF/HEIC to JPEG for storage
    let processedBuffer = req.file.buffer;
    let fileExtension = 'jpg';
    
    // Check if it's a HEIF/HEIC file and convert to JPEG
    if (req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
      processedBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 95 })
        .toBuffer();
    }
    
    const fileName = `item_${item._id}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(__dirname, '../public/uploads', fileName);
    await fs.writeFile(filePath, processedBuffer);

    item.itemPhotos.push(`/uploads/${fileName}`);
    await item.save();

    res.json({
      message: 'Photo uploaded successfully',
      photoUrl: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

module.exports = router;