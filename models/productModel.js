const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdAt: { type: Date, default: Date.now }
});

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;