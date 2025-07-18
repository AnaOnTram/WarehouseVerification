const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  mbvId: {
    type: String,
    required: true,
    unique: true
  },
  storageLocation: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'available_for_pickup', 'shipped'],
    default: 'pending'
  },
  itemType: {
    type: String,
    enum: ['EVA', 'EVERGREEN', 'OTHER'],
    required: true
  },
  forwarder: {
    type: String,
    enum: ['DHL', 'FEDEX', 'UPS', 'CRANE', 'MNX', 'AOC', 'STERLING', 'OTHERS'],
    required: false
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mbvImageUrl: {
    type: String
  },
  itemPhotos: [{
    type: String
  }],
  tagVerificationPhoto: {
    type: String
  },
  checklist: {
    itemPicked: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    sapOperationDone: {
      type: Boolean,
      default: false
    },
    packaged: {
      type: Boolean,
      default: false
    },
    photographed: {
      type: Boolean,
      default: false
    },
    forwarderBooked: {
      type: Boolean,
      default: false
    },
    placedInDesignatedArea: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  operationHistory: [{
    operation: {
      type: String,
      required: true
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }]
});

// Update the updatedAt field before saving
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);