const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'manager', 'employee' , 'customer'], default: 'customer' },
  businessId :{type:mongoose.Schema.Types.ObjectId, ref: 'Business', default: null}

});



const userModel = mongoose.model('User', userSchema);

module.exports = userModel;