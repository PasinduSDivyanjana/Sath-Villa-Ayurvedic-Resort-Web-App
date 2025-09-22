const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define booking schema
const bookingSchema = new Schema({
  b_name: {
    type: String,
    required: true,
  },
  b_email: {
    type: String,
    required: false,
  },
  b_phone: {
    type: String,
    required: true,
  },
  b_packageType: {
    type: String,
    enum: ['7 Days Package', '5 Days Package', 'Couple Package'],
    required: true,
  },
  b_packageDuration: {
    type: Number,
    required: true,
  },
  b_checkInDate: {
    type: Date,
    required: true,
  },
  b_checkOutDate: {
    type: Date,
    required: true,
  },
  b_guest: {
    type: Number,
    default: 1,
    required: true,
  },
  b_roomNumber: {
    type: Number,
    required: true,
  },
  b_occupancyType: {
    type: String,
    enum: ['Single', 'Double'],
    required: true,
  },
  b_roomPrice: {
    type: Number,
    required: true,
  },
  b_packagePrice: {
    type: Number,
    required: true,
  },
  b_totalPrice: {
    type: Number,
    required: true,
  },
  b_paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  b_createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Export model
module.exports = mongoose.model("bookingModel", bookingSchema);
