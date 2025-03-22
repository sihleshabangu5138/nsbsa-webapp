var Handlebars=require( 'express-handlebars' );
const CustomFieldMeta = require('../models/CustomFieldMeta');
module.exports.register = function (options) {
	Handlebars.registerAsyncHelper('get_customedata', async function (custom_id, ref_id) {
	  const xyz = db.get();
	  console.log("In new.js");
	  try {
		const result = await CustomFieldMeta.find().lean();
		console.log("Hello mansi jkljlklkjkjkjlkjlkj");
  
		const m = {
		  title: "First Post",
		  story: {
			intro: "Before the jump",
			body: "After the jump"
		  }
		}
		return options.fn(m);
  
		const data1 = result[0].customfield_value;
		//return options.fn(this);
	  } catch (err) {
		console.error(err);
	  }
	});
  };
/* module.exports = {
      
	  get_customedata: function(custom_id,ref_id,options){
		  var xyz = db.get();
		 // var query ={custom_field_id:ObjectId(custom_id),referce_id:ObjectId(ref_id)};
		  xyz.collection("custom_field_meta").find().toArray(function(err, result) {
			  console.log("Helooo mansi jkljlklkjkjkjlkjlkj");
			
			  		 var m=  {
					  title: "First Post",
					  story: {
						intro: "Before the jump",
						body: "After the jump"
					  }
					}
				return options.fn(m);
			  var data1=result[0].customfield_value;
			   //return options.fn(this);
			   
		  });

	  },
	 
      
} */



// var dateFormat;

// import('dateformat').then((module) => {
// 	dateFormat = module.default;
//   }).catch((error) => {
// 	console.error("Error importing dateformat:", error);
//   });