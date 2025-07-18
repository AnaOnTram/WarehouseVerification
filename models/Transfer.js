const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  forwarder: {
    type: String,
    enum: ['DHL', 'FEDEX', 'UPS', 'CRANE', 'MNX', 'AOC', 'STERLING', 'OTHERS'],
    required: true
  },
  pickerIdentity: {
    name: {
      type: String,
      required: true
    },
    idNumber: {
      type: String,
      required: true
    },
    carPlate: {
      type: String,
      required: false
    }
  },
  tagVerificationResult: {
    storageLocation: {
      type: String,
      required: true
    },
    partNumber: {
      type: String,
      required: true
    },
    serialNumber: {
      type: String,
      required: true
    },
    matched: {
      type: Boolean,
      required: true
    }
  },
  transferredAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Transfer', transferSchema);