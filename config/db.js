const mongoose = require('mongoose');
require('dotenv').config();


async function connectDB() {
    const uri = `${process.env.MONGO_URI}`;

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to DB for business`);
    } catch (error) {
        console.error(`Error connecting to DB for business`, error);
    }
}

module.exports = connectDB;