const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      pricePerUnit: { type: Number , required: true },
      totalPrice: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  invoiceNumber: { type: String, unique: true, required: true }
});

invoiceSchema.pre('validate', async function (next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now();
    this.invoiceNumber = `INV-${timestamp}`;
  }
  next();
});

const invoiceModel = mongoose.model('Invoice', invoiceSchema);

module.exports = invoiceModel;
