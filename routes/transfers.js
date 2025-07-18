const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const Item = require('../models/Item');
const Transfer = require('../models/Transfer');
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

// Get items available for pickup by forwarder
router.get('/available/:forwarder', authenticateToken, async (req, res) => {
  try {
    const { forwarder } = req.params;
    
    const items = await Item.find({
      forwarder: forwarder.toUpperCase(),
      status: 'available_for_pickup'
    })
    .populate('operatorId', 'username fullName')
    .sort({ processedAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get available items error:', error);
    res.status(500).json({ message: 'Failed to retrieve available items' });
  }
});

// Get all forwarders with available items
router.get('/forwarders', authenticateToken, async (req, res) => {
  try {
    const forwarders = await Item.aggregate([
      {
        $match: { 
          status: 'available_for_pickup',
          forwarder: { $ne: null, $exists: true }
        }
      },
      {
        $group: {
          _id: '$forwarder',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(forwarders);
  } catch (error) {
    console.error('Get forwarders error:', error);
    res.status(500).json({ message: 'Failed to retrieve forwarders' });
  }
});

// Process tag for verification (step 1 - OCR and comparison)
router.post('/process-tag/:itemId', authenticateToken, upload.single('tagPhoto'), async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Tag photo is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available_for_pickup') {
      return res.status(400).json({ message: 'Item is not available for pickup' });
    }

    // Process tag photo with OCR
    const { ocrText, extractedInfo } = await ocrService.processMBVImage(req.file.buffer);

    // Fuzzy matching function for strings (allows minor OCR variations)
    const fuzzyMatch = (str1, str2, threshold = 0.8) => {
      if (!str1 || !str2) return false;
      
      // Exact match
      if (str1 === str2) return true;
      
      // Remove spaces and compare
      const clean1 = str1.replace(/\s+/g, '').toUpperCase();
      const clean2 = str2.replace(/\s+/g, '').toUpperCase();
      if (clean1 === clean2) return true;
      
      // Calculate similarity ratio
      const longer = clean1.length > clean2.length ? clean1 : clean2;
      const shorter = clean1.length > clean2.length ? clean2 : clean1;
      
      if (longer.length === 0) return true;
      
      let matches = 0;
      for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matches++;
      }
      
      const similarity = matches / longer.length;
      return similarity >= threshold;
    };

    // Verify extracted information matches item record with fuzzy matching
    const storageMatch = fuzzyMatch(extractedInfo.storageLocation, item.storageLocation, 0.8);
    const partMatch = fuzzyMatch(extractedInfo.partNumber, item.partNumber, 0.9);
    const serialMatch = fuzzyMatch(extractedInfo.serialNumber, item.serialNumber, 0.9);
    
    const overallMatch = storageMatch && partMatch && serialMatch;
    
    console.log('Tag verification comparison:', {
      storage: { extracted: extractedInfo.storageLocation, expected: item.storageLocation, match: storageMatch },
      part: { extracted: extractedInfo.partNumber, expected: item.partNumber, match: partMatch },
      serial: { extracted: extractedInfo.serialNumber, expected: item.serialNumber, match: serialMatch },
      overallMatch: overallMatch
    });

    // Save the tag photo temporarily
    await ensureUploadDir();
    let processedBuffer = req.file.buffer;
    let fileExtension = 'jpg';
    
    if (req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif') {
      const sharp = require('sharp');
      processedBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: 95 })
        .toBuffer();
    }
    
    const fileName = `tag_temp_${itemId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(__dirname, '../public/uploads', fileName);
    await fs.writeFile(filePath, processedBuffer);

    res.json({
      success: true,
      ocrText,
      comparison: {
        storage: { extracted: extractedInfo.storageLocation, expected: item.storageLocation, match: storageMatch },
        part: { extracted: extractedInfo.partNumber, expected: item.partNumber, match: partMatch },
        serial: { extracted: extractedInfo.serialNumber, expected: item.serialNumber, match: serialMatch },
        overallMatch: overallMatch
      },
      tagPhotoUrl: `/uploads/${fileName}`,
      item: {
        storageLocation: item.storageLocation,
        partNumber: item.partNumber,
        serialNumber: item.serialNumber
      }
    });
  } catch (error) {
    console.error('Tag processing error:', error);
    res.status(500).json({ message: 'Failed to process tag photo' });
  }
});

// Complete transfer (step 2 - after manual verification)
router.post('/complete-transfer/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { pickerName, pickerId, carPlate, tagPhotoUrl, verificationOverride } = req.body;

    if (!pickerName || !pickerId) {
      return res.status(400).json({ message: 'Picker name and ID are required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'available_for_pickup') {
      return res.status(400).json({ message: 'Item is not available for pickup' });
    }

    // Move the temporary tag photo to permanent location
    const finalFileName = `tag_${itemId}_${Date.now()}.jpg`;
    const tempFilePath = path.join(__dirname, '../public', tagPhotoUrl);
    const finalFilePath = path.join(__dirname, '../public/uploads', finalFileName);
    
    try {
      await fs.rename(tempFilePath, finalFilePath);
    } catch (error) {
      console.error('Error moving tag photo:', error);
      // If rename fails, keep the original path
    }

    // Create transfer record
    const transfer = new Transfer({
      itemId: item._id,
      operatorId: req.user._id,
      forwarder: item.forwarder,
      pickerIdentity: {
        name: pickerName,
        idNumber: pickerId,
        carPlate: carPlate || null
      },
      tagVerificationResult: {
        storageLocation: item.storageLocation,
        partNumber: item.partNumber,
        serialNumber: item.serialNumber,
        matched: !verificationOverride // true if no override needed, false if overridden
      }
    });

    await transfer.save();

    // Update item status
    item.status = 'shipped';
    item.shippedAt = new Date();
    item.tagVerificationPhoto = `/uploads/${finalFileName}`;
    await item.save();

    res.json({
      message: 'Transfer completed successfully',
      transfer: await transfer.populate([
        { path: 'itemId', select: 'mbvId storageLocation partNumber serialNumber' },
        { path: 'operatorId', select: 'username fullName' }
      ])
    });
  } catch (error) {
    console.error('Tag verification error:', error);
    res.status(500).json({ message: 'Failed to verify tag and complete transfer' });
  }
});

// Get transfer history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate([
        { path: 'itemId', select: 'mbvId storageLocation partNumber serialNumber' },
        { path: 'operatorId', select: 'username fullName' }
      ])
      .sort({ transferredAt: -1 });

    res.json(transfers);
  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({ message: 'Failed to retrieve transfer history' });
  }
});

// Get transfer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate([
        { path: 'itemId', select: 'mbvId storageLocation partNumber serialNumber' },
        { path: 'operatorId', select: 'username fullName' }
      ]);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({ message: 'Failed to retrieve transfer' });
  }
});

module.exports = router;