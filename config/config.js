'use strict';

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

const connectToDatabase = async () => {
  let mongoDbUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;

  if (!mongoDbUrl) {
    console.error('MongoDB connection string is not defined in the environment variables.');
    return { error: 'MongoDB connection string is not defined.' };
  }
  try {
    await mongoose.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.on('error', (err) => {
      console.error('Error connecting to MongoDB:', err);
    });

    db.once('open', () => {
      console.log('Connected to the MongoDB database');
    });

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (error instanceof mongoose.Error && error.name === 'MongoServerError' && error.code === 18) {
      // Authentication failed, return an error response
      return { error: 'Authentication failed. Please check your credentials.' };
    }
    else if (error instanceof mongoose.Error && error.name === 'MongoTimeoutError') {
      // Handle timeout error
      console.error('MongoDB connection timed out. Please check your connection settings.');
    }

    if (error.name === 'MongoNotConnectedError') {
      console.error('MongoDB client is not connected. Ensure a successful connection before running operations.');
      // return { error: 'MongoDB client is not connected.' };
    }

    // For other errors, throw the error to propagate it to the caller
    throw error;
  }
};


const checkConnection = async (db_username, db_pass, db_host, dbname) => {
  const mongoURI = `mongodb+srv://${db_username}:${db_pass}@${db_host}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    const connection = await mongoose.createConnection(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return new Promise((resolve, reject) => {
      connection.on('error', (err) => {
        console.error('Error connecting to MongoDB:', err);
        reject({ success: false, message: 'Failed to connect to MongoDB: ' + err.message });
      });

      connection.once('open', () => {
        console.log('Connected to the MongoDB database');
        connection.close(); // Important: close after checking
        resolve({ success: true, message: 'Connection successful' });
      });
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return { success: false, message: error.message };
  }
};


// db.createUser({
//   user: "root",
//   pwd: "rootpassword",
//   roles: ["readWrite", "dbAdmin"]
// })

module.exports = {
  connectToDatabase,
  checkConnection,
};

// exit