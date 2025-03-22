'use strict';

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

const connectToDatabase = async(db_username, db_pass, db_host, dbname) => {

  let mongoDbUrl;
  if (db_username && db_pass && db_host && dbname) {
    // mongoDbUrl = `mongodb://${db_username}:${db_pass}@${db_host}/${dbname}?authSource=admin`;
    mongoDbUrl = `mongodb://127.0.0.1:27017/${dbname}`;
  } else {
    const {
      DB_USERNAME,
      DB_PASSWORD,
      DB_HOST,
      DB_DATABASE,
    } = process.env;

    // mongoDbUrl = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_DATABASE}?authSource=admin`;
    mongoDbUrl = `mongodb://127.0.0.1:27017/${DB_DATABASE}`;
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
const checkConnection = async(db_username, db_pass, db_host, dbname) => {
  try {
    // const mongoDbUrl = `mongodb://${db_username}:${db_pass}@${db_host}/${dbname}?authSource=admin`
    const mongoDbUrl = `mongodb://127.0.0.1:27017/${dbname}`
    await mongoose.connect(mongoDbUrl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      autoIndex: false, // Prevent automatic index creation
    });

    const db = mongoose.connection;

    db.on('error', (err) => {
      console.error('Error connecting to MongoDB:', err);
      mongoose.connection.close();
    });
    

    console.log(mongoose.connection.readyState)
    const success = db.readyState === 1;

    // Disconnect from MongoDB
    mongoose.connection.close();  

    return { success };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);

    if (
      error instanceof mongoose.Error &&
      error.name === 'MongoServerError' &&
      error.code === 18
    ) {
      // Authentication failed, return an error response
      return { error: 'Authentication failed. Please check your credentials.' };
    }

    // For other errors, throw the error to propagate it to the caller
    return { error: 'Error connecting to MongoDB. Please check your connection settings.' };
  }
}


module.exports = {
  connectToDatabase,
  checkConnection,
};
// const checkConnection = async(db_username, db_pass, db_host, dbname) => {

//   try {
//     const mongoDbUrl = `mongodb://${db_username}:${db_pass}@${db_host}/${dbname}`
//     console.log(mongoDbUrl)
//     const connection = mongoose.createConnection(mongoDbUrl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     connection.on('error', (err) => {
//       console.error('Error connecting to MongoDB:', err);
//     });

//     connection.once('open', () => {
//       console.log('Connected to the MongoDB database');
//     });
    
//     console.log(connection.readyState)
//     return connection;
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//     if (error instanceof mongoose.Error && error.name === 'MongoServerError' && error.code === 18) {
//       // Authentication failed, return an error response
//       return { error: 'Authentication failed. Please check your credentials.' };
//     }
//     // For other errors, throw the error to propagate it to the caller
//     throw error;
//   }
// }



//set the database username & password
//    mongo

//    use $database name

//    use admin

// db.createUser({
// user: "root",
// pwd: "rootpassword",
// roles: ["readWrite", "dbAdmin"]
// })

// exit