const mongoose = require('mongoose');
var dateFormat;

import('dateformat').then((module) => {
	dateFormat = module.default;
  }).catch((error) => {
	console.error("Error importing dateformat:", error);
  });

// Import Mongoose models if you haven't already
const User = require('../models/User');
const LoanType = require('../models/Loantype');
const Role = require('../models/Role');
const moment = require('moment');

module.exports = {
  getuserdata: async function (id, fieldname, callback) {
    try {
      const result = await User.find({ "_id":new mongoose.Types.ObjectId(id) });
      if (result) {
        if (fieldname === 'name') {
          const username = result[0].firstname + ' ' + result[0].lastname;
          return callback(username);
        } else {
          return callback(result[0][fieldname]);
        }
      } else {
        return callback('No User');
      }
    } catch (err) {
      console.error(err);
      return callback('Error');
    }
  },
  getloantype: async function (id, fieldname, callback) {
    try {
      const result = await LoanType.find({ "_id":new mongoose.Types.ObjectId(id) });
      if (result) {
        return callback(result[0][fieldname]);
      } else {
        return callback('No loantype');
      }
    } catch (err) {
      console.error(err);
      return callback('Error');
    }
  },
  getrole: async function (id, fieldname, callback) {
    try {
      const result = await Role.find({ "_id":new mongoose.Types.ObjectId(id) }).lean();
      if (result) {
        return callback(result[0][fieldname]);
      } else {
        return callback('No Role');
      }
    } catch (err) {
      console.error(err);
      return callback('Error');
    }
  },
  getuserrole: async function (id, callback) {
    try {
      const result = await Role.find({ "_id":new mongoose.Types.ObjectId(id)}).lean();
      if (result) {
        const rolename = result[0].role_nm;
        return callback(rolename);
      } else {
        return callback('No Role');
      }
    } catch (err) {
      console.error(err);
      return callback('Error');
    }
  },
  getdate: function (date, format) {
    // THIS USE ONLY HBS DATE FORMAT
    if (date !== '') {
      var date1 = date;
    } else {
      var date1 = new Date();
    }
    if (format !== undefined) {
      var str = format;
    } else {
      var str = 'Y-m-d';
    }
    const obj = {
      Y: 'yyyy',
      m: 'mm',
      d: 'dd',
      j: 'dd',
      F: 'mmmm',
    };
    const trans = str.replace(/Y|m|d|j|F/gi, matched => obj[matched]);
    return dateFormat(date1, trans);
  },
   formatDatesToGeneralData:function (generalDateFormate) {
  
  let originalDateFormate;
  let dates = {
    'm/d/Y': 'MM/DD/YYYY',
    'm-d-Y': 'MM-DD-YYYY',
    "d-m-Y": 'DD-MM-YYYY',
    "d/m/Y": 'DD/MM/YYYY',
    "Y-m-d": 'YYYY-MM-DD',
    "F j, Y": 'MMMM D, YYYY'
  }
  if (dates[generalDateFormate]) {
    originalDateFormate = dates[generalDateFormate];
  }
     return originalDateFormate;
 
  },
  handleInputDateOrValue: function (value, InputDateFormat, to = "db") {
   
    if (moment(value, to=="db"? InputDateFormat :"", true).isValid()) {
      if (to === "db") {
        
        return moment(value, InputDateFormat).format("YYYY-MM-DD");
        
      } else {
       
        return moment(value, "YYYY-MM-DD").format(InputDateFormat)
      }
    } else {
      console.log("Invalid date format");
      return value
     }
   }
};
