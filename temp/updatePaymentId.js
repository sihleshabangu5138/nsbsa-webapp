// scripts/updatePaymentId.js
const mongoose = require('mongoose');
const EmiDetails = require('../models/Emi_details'); // Adjust the path as necessary

async function updatePaymentId() {
  try {
    await mongoose.connect('mongodb://localhost:27017/EWS3', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await EmiDetails.updateMany(
      { paymentid: { $exists: false } }, // Find documents without paymentid
      { $set: { paymentid: 'pi_3QLHV5IGXFfElmD91IJwiFXW' } } // Set a default value or generate one
    );

    console.log(`Updated ${result.nModified} documents.`);
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePaymentId();

//run this file if you want the paymentid in emi_details collection