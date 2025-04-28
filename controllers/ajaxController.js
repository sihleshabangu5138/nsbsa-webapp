'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const Mail = require('../config/email');
const functions = require('../helpers/function');
const moment = require('moment');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const Users = require('../models/User');
const NotificationTemplate = require('../models/Notificationtemplate');
const LoanDetails = require('../models/LoanDetails');
const EmiDetails = require('../models/Emi_details');
const NotificationBadges = require('../models/Notification_badges');
const Role = require('../models/Role');
const CustomField = require('../models/Customfields');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Event = require('../models/Events');
const CategoryType = require('../models/CategoryTypes');
const Reminder = require('../models/Reminder');
const Loantype = require('../models/Loantype');
const Rule = require('../models/Rule');
const Notes = require('../models/Notes');
const ActivityLog = require('../models/Activitylog');
const Generalsetting = require('../models/GeneralSetting');
const Setting = require('../models/Settings');
// const lang = require('../config/languageconfig');
const countriesData = require('../public/data/countries.json');
const statesData = require('../public/data/states.json');
const citiesData = require('../public/data/cities.json');
const { connectToDatabase } = require('../config/config');
const { checkConnection } = require('../config/config');
const { MongoClient } = require('mongodb');
const AmortizeJS = require('amortizejs').Calculator;
const Stripe = require('stripe');


/* GET users listing. */
exports.getViewUser = async (req, res, next) => {
	try {
		let matchQuery = {};
		if (req.session.admin_access === 1) {
			matchQuery = { status: 1 };
		} else {


			if (req.session.access_rights && req.session.access_rights.user && req.session.access_rights.user.owndata) {
				matchQuery = { $and: [{ status: 1, _id: new mongoose.Types.ObjectId(req.session.user_id) }] }
			}
			else {
				matchQuery = {
					status: 1
				};
				if (req.session.admin_access !== 1) {
					// If admin access is 0, hide users with admin role
					matchQuery['role_nm.role_slug'] = { $ne: 'admin' };
				}
			}
		}
		const tt = await Users.findOne(matchQuery);
		//   if (req.session.admin_access !== 1) {
		// 	matchQuery['role_nm.admin_access'] = 0;
		//   }
		const users = await Users.aggregate([
			{
				$lookup: {
					from: Role.collection.name,
					localField: 'role',
					foreignField: '_id',
					as: 'role_nm',
				},
			},
			{
				$unwind: '$role_nm',
			},
			{
				$match: matchQuery,
			},
		]);
		const result = users.map((user) => {
			user.birthdate = functions.getdate(user.birthdate, req.session.generaldata.date_format);
			const country = countriesData.countries.find(c => c.id === user.country);
			user.country = country ? country.name : '';

			// Replace state ID with its name
			const stateId = user.state ? user.state.toString() : ''; // Ensure state is a string
			const state = statesData.states.find(s => s.id === stateId);
			user.state = state ? state.name : '';

			// Replace city ID with its name
			const cityId = user.city ? user.city.toString() : ''; // Ensure city is a string
			const city = citiesData.cities.find(c => c.id === cityId);
			user.city = city ? city.name : '';

			return user;
		});


		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getTotalUserList = async (req, res, next) => {
	try {

		let matchQuery = {};
		if (req.session.admin_access == 1) {
			matchQuery = {}


		} else {
			if (req.session.access_rights && req.session.access_rights.user && req.session.access_rights.user.owndata) {
				matchQuery = { _id: new mongoose.Types.ObjectId(req.session.user_id) }
			}
			else {
				matchQuery = {};

				if (req.session.admin_access !== 1) {

					// If admin access is 0, hide users with admin role
					matchQuery['role_nm.role_slug'] = { $ne: 'admin' };
				}
			}
		}
		const users = await Users.aggregate([
			{
				$lookup: {
					from: Role.collection.name,
					localField: 'role',
					foreignField: '_id',
					as: 'role_nm',
				},
			},
			{
				$unwind: '$role_nm',
			},
			{
				$match: matchQuery,
			},
		]);
		const result = users.map((user) => {
			user.birthdate = functions.getdate(user.birthdate, req.session.generaldata.date_format);
			const country = countriesData.countries.find(c => c.id === user.country);
			user.country = country ? country.name : '';

			// Replace state ID with its name
			// const stateId = user.state ? user.state.toString() : ''; // Ensure state is a string
			// const state = statesData.states.find(s => s.id === stateId);
			// user.state = state ? state.name : '';

			// // Replace city ID with its name
			// const cityId = user.city ? user.city.toString() : ''; // Ensure city is a string
			// const city = citiesData.cities.find(c => c.id === cityId);
			// user.city = city ? city.name : '';

			return user;
		});

		// // const result = await Users.findOne(query);
		// const result = await Users.find(matchQuery).lean();

		// let users = result.map((user) => {
		// 	user.birthdate = functions.getdate(user.birthdate, req.session.generaldata.date_format);
		// 	return user;
		// })
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
}
exports.getDeactivateUser = async (req, res, next) => {
	try {
		// const query = { status: 0 };
		let matchQuery;

		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.deactiveuser && req.session.access_rights.deactiveuser.owndata) {


				matchQuery = { $and: [{ status: 0, _id: new mongoose.Types.ObjectId(req.session.user_id) }] }
			} else {
				matchQuery = {
					status: 0
				};
			}
		}
		else {
			matchQuery = {
				status: 0
			};

		}

		// const result = await Users.findOne(query);
		const result = await Users.find(matchQuery).lean();
		const result_final = result.map((user) => {
			user.birthdate = functions.getdate(user.birthdate, req.session.generaldata.date_format);

			return user;
		});
		res.json(result_final);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};


exports.getDelete = async (req, res) => {
	try {
		const id = req.query._id;

		if (id === "65731827d0b92a5bcb33cfb7") {
			return res.json({ result: "deep", message: "Admin Can Not be Deleted!" });
		}
		const myquery = { "_id": new mongoose.Types.ObjectId(id) };

		const newvalues = {
			$set: {
				status: 0,
			},
		};

		await Users.updateOne(myquery, newvalues);

		const formatdate = moment().format("YYYY-MM-DD");
		// const useresult = await Users.findOne(myquery);
		const useresult = await Users.find(myquery).lean();
		const notification = await NotificationTemplate.find({ templatetitle: "user deleted" }).lean();

		for (const [key, value] of Object.entries(notification)) {
			for (const [key1, value1] of Object.entries(useresult)) {
				const message = value.content;
				const subject = value.subject;
				const Obj = {
					'_USERFIRSTNAME_': value1.firstname,
					'_USERLASTNAME_': value1.lastname,
					'_DATETIME_': formatdate,
					'_newline_': '<br>',
					'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
					'_systemname_': req.session.generaldata.com_name,
				};
				const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_tab_|_systemname_/gi, (matched) => {
					return Obj[matched];
				});
				const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_tab_|_systemname_/gi, (matched) => {
					return Obj[matched];
				});
				Mail.sendMail(value1.email, subtrans, trans);
			}
		}

		res.json(true);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getDeleteLoan = async (req, res) => {
	try {
		const id = req.query._id;
		const myquery = { "_id": new mongoose.Types.ObjectId(id) };
		const newvalues = {
			$set: {
				status: 0,
			},
		};

		await LoanDetails.updateOne(myquery, newvalues);
		await EmiDetails.deleteMany({ "loan_id": new mongoose.Types.ObjectId(id) });

		res.json(true);
	} catch (err) {
		console.error(err);
		res.json(false);
	}
};

exports.getDeleteNotification = async (req, res) => {
	try {
		// if (!mongoose.Types.ObjectId.isValid(req.query.notivalue)) {
		// 	return res.json(false);
		// }
		// await NotificationBadges.deleteMany({ "_id": new mongoose.Types.ObjectId(req.query.notivalue) });
		// req.session.noticount -= 1;
		const myquery = {
			"_id": new mongoose.Types.ObjectId(req.query.notivalue)
		};

		const newvalues = {
			$set: {
				status: 0,
			}
		};

		await NotificationBadges.findByIdAndDelete(myquery);
		const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id) };
		const querys = { $and: [{ status: 1 }, { "user": new mongoose.Types.ObjectId(req.session.user_id) }] };
		const notiresult = await NotificationBadges.find(noquery).sort({ createdAt: -1 }).lean();
		const adminnoti = await NotificationBadges.find().sort({ createdAt: -1 }).lean();
		const activenoti = await NotificationBadges.countDocuments(querys);
		const adminnoticount = await NotificationBadges.countDocuments({});

		if (req.session.admin_access == 1) {
			req.session.noti = adminnoti;
			req.session.noticount = adminnoticount;
		} else {
			req.session.noti = notiresult;
			req.session.noticount = activenoti;
		}
		res.json(true);
	} catch (err) {
		console.error(err);
		res.json(false);
	}
};

exports.getRoles = async (req, res) => {
	try {
		const result = await Role.find({ status: 0 }).lean();
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getCustomFields = async (req, res) => {
	try {
		const result = await CustomField.find({}).lean();

		for (const [key, value] of Object.entries(result)) {
			result[key].valids = (value.validation).toString();
		}

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getCategory = async (req, res) => {
	try {
		let query;
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.category && req.session.access_rights.category.owndata) {
				query = { "addedby": req.session.user_id }
			} else {
				query = {}
			}

		} else {
			query = {}
		}
		const result = await Category.find(query).lean();
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getService = async (req, res) => {
	// try {
	// 	const result_final = [];
	// 	let result;
	// 	if (req.session.admin_access === 0) {
	// 		if (req.session.access_rights && req.session.access_rights.service && req.session.access_rights.service.owndata) {
	// 			console.log("seervise own data ---------------------")
	// 			result = await Service.find({ "addedby": req.session.user_id });
	// 			console.log("servise own -------",result)
	// 			for (const value of result) {
	// 				const userIdObject = new mongoose.Types.ObjectId(req.session.user_id);
	// 				if (value.assigned_staff && Array.isArray(value.assigned_staff) && value.assigned_staff.some(id => id && id.equals && id.equals(userIdObject))) {
	// 					result_final.push(value);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	else {
	// 		// result_final.push(...result);
	// 		console.log("admin access data ---------------------")
	// 		result = await Service.find({}).populate('assigned_staff', 'username').lean();
	// 		result_final.push(result)
	// 	}
	// 	// console.log("rF-----------------", result_final)
	// 	res.json(result_final);
	// } catch (err) {
	// 	console.error(err);
	// 	res.status(500).json({ error: 'An error occurred' });
	// }

	try {
		const result_final = [];
		const result = await Service.find({}).populate('assigned_staff', 'username').lean();
		if (req.session.admin_access === 0) {
			if (req.session.access_rights && req.session.access_rights.service && req.session.access_rights.service.owndata) {
				for (const value of result) {
					console.log(value)
					const userIdObject = new mongoose.Types.ObjectId(req.session.user_id);
					if (value.assigned_staff && Array.isArray(value.assigned_staff) && value.assigned_staff.some(staff => staff?._id?.equals(userIdObject))) {
						result_final.push(value);
					}

				}
			} else {
				result_final.push(...result);
			}
		}
		else {
			result_final.push(...result);
		}
		res.json(result_final);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};


exports.getProduct = async (req, res) => {
	try {
		let result;
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata) {
				result = await Product.find({
					"addedby": new mongoose.Types.ObjectId(req.session.user_id)
				})
			} else {
				result = await Product.find({}).lean();
			}

		} else {
			result = await Product.find({}).lean();

		}
		console.log(result)
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getEvents = async (req, res) => {

	try {
		const result_final = [];
		const result = await Event.find({}).populate("addedby", "username").lean();
		if (req.session.admin_access == 0) {
			if (
				req.session.access_rights &&
				req.session.access_rights.events &&
				req.session.access_rights.events.owndata
			) {


				for (const value of result) {

					const role = await Role.findOne(
						new mongoose.Types.ObjectId(req.session.role)
					);
					if (role.role_nm == "Staff") {

						if (value.eventfor == "all") {

							result_final.push(value);
						} else if (value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {

							result_final.push(value);
						} else if (value.addedby && value.addedby?.["_id"].equals(new mongoose.Types.ObjectId(req.session.user_id))) {

							result_final.push(value);
						}
					} else {
						if (
							value.eventfor == "all" ||
							value.eventfor.equals(
								new mongoose.Types.ObjectId(req.session.role)
							)
						) {

							result_final.push(value);
						}
					}
				}
			} else {

				result_final.push(...result);
			}
		} else {


			result_final.push(...result);
		}

		const generalDateFormate = req.session.generaldata.date_format
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
		//   let finalResult = result_final.map((result) => {

		// 	  result.startdate = moment(result.startdate, ['DD-MM-YYYY', 'MM-DD-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).format("YYYY-MM-DD");
		// 	  result.enddate = moment(result.enddate, ['DD-MM-YYYY', 'MM-DD-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).format("YYYY-MM-DD");



		// 	  return result
		//   });
		let InputdateFormate = ['DD-MM-YYYY', 'MM-DD-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
		let formateDateToGenerelData = result_final.map((result) => {

			result.startdate = moment(result.startdate, InputdateFormate).format(originalDateFormate);
			result.enddate = moment(result.enddate, InputdateFormate).format(originalDateFormate);
			return result
		});

		res.json(formateDateToGenerelData);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "An error occurred" });
	}
};

exports.getMapEvents = async (req, res) => {

	try {
		// if(req.session.admin_access === "1" || req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.view){
		const result_final = [];
		const result = await Event.find({}).lean();
		console.log("admin:", req.session.admin_access);
		if (req.session.admin_access == 0) {
			if (
				req.session.access_rights &&
				req.session.access_rights.events &&
				req.session.access_rights.events.owndata
			) {
				console.log("own access");
				for (const value of result) {
					const role = await Role.findOne(
						new mongoose.Types.ObjectId(req.session.role)
					);
					if (role.role_nm == "Staff") {
						if (
							value.eventfor == "all" ||
							value.eventfor.equals(
								new mongoose.Types.ObjectId(req.session.role)
							) ||
							(value.addedby &&
								value.addedby.equals(
									new mongoose.Types.ObjectId(req.session.user_id)
								))
						) {
							console.log("Pushing value:", value);
							if (
								req.session.access_rights &&
								req.session.access_rights.events &&
								req.session.access_rights.events.view
							) {
								result_final.push(value);
							}
						}
					} else {
						if (
							value.eventfor == "all" ||
							value.eventfor.equals(
								new mongoose.Types.ObjectId(req.session.role)
							)
						) {
							console.log("Pushing value:", value);
							if (
								req.session.access_rights &&
								req.session.access_rights.events &&
								req.session.access_rights.events.view
							) {
								result_final.push(value);
							}
						}
					}
				}
			} else {
				if (
					req.session.access_rights &&
					req.session.access_rights.events &&
					req.session.access_rights.events.view
				) {
					result_final.push(...result);
				}
			}
		} else {
			result_final.push(...result);
		}

		const generalDateFormate = req.session.generaldata.date_format
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

		const data = result_final.map((element) => {

			const startDate = moment(element.startdate, [originalDateFormate, 'DD-MM-YYYY', 'MM-DD-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true);
			const endDate = moment(element.enddate, [originalDateFormate, 'DD-MM-YYYY', 'MM-DD-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], true);

			const formattedStartDate = startDate.format('YYYY-MM-DD');
			endDate.add(1, 'days');  // Add one day to end date
			const formattedEndDate = endDate.format('YYYY-MM-DD');
			console.log(formattedStartDate, "------------------", formattedEndDate);
			return {
				title: element.eventtitle,
				start: formattedStartDate,
				end: formattedEndDate,
				color: "darkcyan",
				description: element.eventdetail,
				venue: element.eventvenue,
				event_id: element._id

			};
		}).filter(Boolean);

		res.json(data);
		// console.log("data", data);
		// }
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "An error occurred" });
	}
};

exports.getAddCategoryType = async (req, res) => {
	try {
		const data = { category_type: req.body.cat_type };
		console.log("req.body.cat_type", data);
		await CategoryType.create(data);
		res.json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getReminder = async (req, res) => {
	try {
		const result = await Reminder.find({}).lean();
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getLoanTypeList = async (req, res) => {
	try {
		const result = await Loantype.find({}).lean();
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getRules = async (req, res) => {
	try {
		let result;
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata) {
				result = await Rule.find({ "addedby": req.session.user_id })
			} else {

				result = await Rule.find({}).lean();
			}
		} else {

			result = await Rule.find({}).lean();
		}
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getNotes = async (req, res) => {
	try {
		const result = await Notes.find({}).lean();

		for (const [key, value] of Object.entries(result)) {

			result[key].obj = value.note.toString();
			if (value.fileattach === "") {
				result[key].object = "No files attached";
			} else {
				result[key].object = value.fileattach.toString();
			}
		}
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getNotificationTemplate = async (req, res) => {
	try {
		const result = await NotificationTemplate.find({}).lean();
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getRulesDelete = async (req, res) => {
	try {
		const id = req.query._id;
		const result = await Rule.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
		if (result.deletedCount === 0) {
			res.json(false);
		} else {
			res.json(true);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getLoanTypeDelete = async (req, res) => {
	try {
		const id = req.query._id;
		const result = await Loantype.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
		if (result.deletedCount === 0) {
			res.json(false);
		} else {
			res.json(true);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getEventsDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const event = await Event.findOne({ "_id": new mongoose.Types.ObjectId(id) });

		if (!event) {
			return res.status(404).json({ error: 'Event not found' });
		}

		const currentDate = moment().format('YYYY-MM-DD');
		const startDate = moment(event.startdate).format('YYYY-MM-DD');
		const endDate = moment(event.enddate).format('YYYY-MM-DD');
		const isEventCompleted = event.duration === 'one day'
			? startDate < currentDate
			: endDate < currentDate;
		console.log("cdate :", currentDate);
		console.log("sdate :", startDate);
		console.log("edate :", endDate);
		if (isEventCompleted) {
			// Event is already completed, skip mail sending
			console.log('Event is already completed. Skipping mail sending.');
		} else {
			const eventfor = event.eventfor;

			if (eventfor === 'all') {
				// const users = await Users.findOne({ status: 1 });
				const users = await Users.find({ status: 1 }).lean();

				if (event.duration === 'one day') {
					const notification = await NotificationTemplate.find({ templatetitle: 'one day event deleted' }).lean();

					for (const [key, value] of Object.entries(notification)) {
						console.log("value", value)
						for (const [key1, value1] of Object.entries(users)) {
							console.log("value1", value1);
							const message = value.content;
							const subject = value.subject;
							const Obj = {
								'_USERFIRSTNAME_': value1.firstname,
								'_USERLASTNAME_': value1.lastname,
								'_EVENTDURATION_': event.duration,
								'_EVENTSTARTDATE_': event.startdate,
								'_EVENTENDDATE_': event.enddate,
								'_EVENTNAME_': event.eventtitle,
								'_EVENTVENUE_': event.eventvenue,
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_': req.session.generaldata.com_name,
							};
							const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							console.log("trans", trans);
							console.log("subtrans", subtrans);
							Mail.sendMail(value1.email, subtrans, trans);
						}
					}
				} else {
					const notification = await NotificationTemplate.find({ templatetitle: 'multiple day event deleted' }).lean();

					for (const [key, value] of Object.entries(notification)) {
						console.log("value", value)
						for (const [key1, value1] of Object.entries(users)) {
							console.log("value1", value1);
							const message = value.content;
							const subject = value.subject;
							const Obj = {
								'_USERFIRSTNAME_': value1.firstname,
								'_USERLASTNAME_': value1.lastname,
								'_EVENTDURATION_': event.duration,
								'_EVENTSTARTDATE_': event.startdate,
								'_EVENTENDDATE_': event.enddate,
								'_EVENTNAME_': event.eventtitle,
								'_EVENTVENUE_': event.eventvenue,
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_': req.session.generaldata.com_name,
							};
							const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							console.log("trans", trans);
							console.log("subtrans", subtrans);
							Mail.sendMail(value1.email, subtrans, trans);
						}
					}
				}
			} else {
				// const users = await Users.findOne({ role: eventfor, status: 1 });
				const users = await Users.find({ role: new mongoose.Types.ObjectId(eventfor), status: 1 }).lean();

				if (event.duration === 'one day') {
					const notification = await NotificationTemplate.find({ templatetitle: 'one day event deleted' }).lean();
					console.log("notification", notification);
					for (const [key, value] of Object.entries(notification)) {
						console.log("value", value)
						for (const [key1, value1] of Object.entries(users)) {
							console.log("value1", value1);
							const message = value.content;
							const subject = value.subject;
							const Obj = {
								'_USERFIRSTNAME_': value1.firstname,
								'_USERLASTNAME_': value1.lastname,
								'_EVENTDURATION_': event.duration,
								'_EVENTSTARTDATE_': event.startdate,
								'_EVENTENDDATE_': event.enddate,
								'_EVENTNAME_': event.eventtitle,
								'_EVENTVENUE_': event.eventvenue,
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_': req.session.generaldata.com_name,
							};
							const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							console.log("trans", trans);
							console.log("subtrans", subtrans);
							Mail.sendMail(value1.email, subtrans, trans);
						}
					}
				} else {
					const notification = await NotificationTemplate.find({ templatetitle: 'multiple day event deleted' }).lean();

					for (const [key, value] of Object.entries(notification)) {
						console.log("value", value)
						for (const [key1, value1] of Object.entries(users)) {
							console.log("value1", value1);
							const message = value.content;
							const subject = value.subject;
							const Obj = {
								'_USERFIRSTNAME_': value1.firstname,
								'_USERLASTNAME_': value1.lastname,
								'_EVENTDURATION_': event.duration,
								'_EVENTSTARTDATE_': event.startdate,
								'_EVENTENDDATE_': event.enddate,
								'_EVENTNAME_': event.eventtitle,
								'_EVENTVENUE_': event.eventvenue,
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_': req.session.generaldata.com_name,
							};
							const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
								return Obj[matched];
							});
							console.log("trans", trans);
							console.log("subtrans", subtrans);
							Mail.sendMail(value1.email, subtrans, trans);
						}
					}
				}
			}
		}

		const result = await Event.deleteOne({ "_id": new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getCustomFieldDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const result = await CustomField.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getNotesDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const result = await Notes.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getCategoryDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const result = await Category.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.postClearLog = async (req, res) => {
	try {
		const date = Date(Date.now());
		const formatdate = moment(date).format("YYYY-MM-DD");
		if (req.session.admin_access == 1) {
			await ActivityLog.deleteMany({});

			const myobjs = {
				module: "Log",
				date: formatdate,
				action: "cleared",
				user: new mongoose.Types.ObjectId(req.session.user_id),
				item: "activitylog",
			};

			const result = await ActivityLog.create(myobjs);

			if (result.insertedCount === 1) {
				res.json(true);
			} else {
				res.json(false);
			}
		} else {
			res.json(false);
		}

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getServiceDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const result = await Service.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getProductDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const result = await Product.deleteOne({ "_id": new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getRolesDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const myquery = { _id: new mongoose.Types.ObjectId(id) };
		const result = await Role.deleteOne(myquery);

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getReminderDelete = async (req, res) => {
	try {
		const id = req.query._id;

		const myquery = { "_id": new mongoose.Types.ObjectId(id) };
		const result = await Reminder.deleteOne(myquery);

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getLoanList = async (req, res) => {
	try {
		const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();

		let query;
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata) {
				if (role.role_nm === "Staff") {
					query = { $and: [{ status: 1, approvestatus: 1, createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };
				} else {
					query = { $and: [{ status: 1, approvestatus: 1, user: new mongoose.Types.ObjectId(req.session.user_id) }] };
				}
			} else {
				query = { $and: [{ status: 1, approvestatus: 1 }] };
			}
		} else {
			query = { $and: [{ status: 1, approvestatus: 1 }] };
		}

		const result = await LoanDetails.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: Loantype.collection.name,
					localField: "loantype",
					foreignField: "_id",
					as: "loan",
				},
			},
			{
				$lookup: {
					from: Users.collection.name,
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$lookup: {
					from: "emi_details",
					localField: "_id",
					foreignField: "loan_id",
					as: "emiDetails",
				},
			},
			{
				$addFields: {
					loan: { $arrayElemAt: ["$loan", 0] },
					user: { $arrayElemAt: ["$user", 0] },
					emiDetails: { $ifNull: ["$emiDetails", []] },
					emiDetailsArrearCount: {
						$size: {
							$filter: {
								input: "$emiDetails",
								as: "emi",
								cond: { $gt: [{ $toDouble: "$$emi.arrearamount" }, 0] },
							},
						},
					},
					emiDetailsArrearSum: {
						$sum: {
							$map: {
								input: {
									$filter: {
										input: "$emiDetails",
										as: "emi",
										cond: { $gt: [{ $toDouble: "$$emi.arrearamount" }, 0] },
									},
								},
								as: "emi",
								in: { $toDouble: "$$emi.arrearamount" },
							},
						},
					},
				},
			},
			{
				$addFields: {
					loanStatus: {
						$let: {
							vars: {
								arrearCount: "$emiDetailsArrearCount",
								statusMap: [
									{ value: 0, status: "Up To Date" },
									{ value: 1, status: "1 Month Arrear" },
									{ value: 2, status: "2 Month Arrear" },
									{ value: 3, status: "3 or More Month Arrear" },
								],
							},
							in: {
								$cond: {
									if: { $gte: ["$$arrearCount", 3] },
									then: "3 or More Month Arrear",
									else: {
										$arrayElemAt: [
											{
												$filter: {
													input: "$$statusMap",
													as: "status",
													cond: { $eq: ["$$status.value", "$$arrearCount"] },
												},
											},
											0,
										],
									},
								},
							},
						},
					},
				}

			},
			{
				$project: {
					emiDetails: 0,
				},
			},
		]);

		const formattedResult = result.map(loan => {
			loan.loanStatus = loan.loanStatus.status || loan.loanStatus;
			return loan;
		});

		res.json(formattedResult);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.emiPendingReport = async (req, res) => {
	try {
		const date = moment().format("YYYY-MM-DD");
		let currentDateFormate = functions.formatDatesToGeneralData(req.session.generaldata.date_format);
		let query;
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.pendingemilist && req.session.access_rights.pendingemilist.owndata) {
				const role = await Role.findOne({ _id: req.session.role });
				if (role.role_nm == "Staff") {
					query = {
						$and: [{
							date: {
								$lt: date
							}
						}, {
							status: 0, createdby: new mongoose.Types.ObjectId(req.session.user_id)
						}]
					};
				}
				else {
					query = {
						$and: [{
							date: {
								$lt: date
							}
						}, {
							status: 0, user_id: new mongoose.Types.ObjectId(req.session.user_id)
						}]
					};
				}
				console.log("own data");
			} else {
				query = {
					$and: [{
						date: {
							$lt: date
						}
					}, {
						status: 0
					}]
				};
				console.log("view data")
			};
		} else {
			query = {
				$and: [{
					date: {
						$lt: date
					}
				}, {
					status: 0
				}]
			};
			console.log("no data")
		};
		const emiDetails = await EmiDetails.aggregate([
			{
				$lookup: {
					from: LoanDetails.collection.name,
					localField: "loan_id",
					foreignField: "_id",
					as: "loan"
				}
			},
			{
				$unwind: "$loan"
			},
			{
				$lookup: {
					from: Users.collection.name,
					localField: "user_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$unwind: "$user"
			},
			{
				$lookup: {
					from: LoanDetails.collection.name,
					localField: "loan_id",
					foreignField: "_id",
					as: "loanDetails"
				}
			},
			{
				$unwind: "$loanDetails"
			},
			{
				$addFields: {
					"createdby": "$loanDetails.createdby"
				}
			},
			{
				$match: query
			}
		]);

		emiDetails.forEach((ele) => {
			ele.date = moment(ele.date, "YYYY-MM-DD").format(currentDateFormate);
			return ele;
		})


		res.json(emiDetails)
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
}
exports.getTotalLoan = async (req, res, next) => {
	try {
		let query;
		const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.totalloanlist && req.session.access_rights.totalloanlist.owndata) {
				if (role.role_nm === "Staff") {
					query = { $and: [{ status: 1, createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };
				}
				else {
					query = { $and: [{ status: 1, user: new mongoose.Types.ObjectId(req.session.user_id) }] };
				}
			} else {
				query = { $and: [{ status: 1 }] };
			}
		} else {
			query = { $and: [{ status: 1 }] };
		}
		// const query = { $and: [{ status: 1 }] };

		const result = await LoanDetails.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: Loantype.collection.name,
					localField: "loantype",
					foreignField: "_id",
					as: "loan",
				},
			},
			{
				$lookup: {
					from: Users.collection.name,
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$addFields: {
					loan: { $arrayElemAt: ["$loan", 0] },
					user: { $arrayElemAt: ["$user", 0] },
				},
			},
		]);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
}

exports.getDisApproveLoan = async (req, res, next) => {
	try {
		let query;
		const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();
		if (req.session.admin_access !== 1) {
			if (req.session.access_rights && req.session.access_rights.disapproveloanlist && req.session.access_rights.disapproveloanlist.owndata) {
				if (role.role_nm === "Staff") {
					query = { $and: [{ status: 1, approvestatus: 0, createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };
				}
				else {
					query = { $and: [{ status: 1, approvestatus: 0, user: new mongoose.Types.ObjectId(req.session.user_id) }] };
				}
			} else {
				query = { $and: [{ status: 1, approvestatus: 0 }] };
			}
		}
		else {
			query = { $and: [{ status: 1, approvestatus: 0 }] };
		}
		// const query = { status: 1, approvestatus: 0 };

		const result = await LoanDetails.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: Loantype.collection.name,
					localField: "loantype",
					foreignField: "_id",
					as: "loan",
				},
			},
			{
				$lookup: {
					from: Users.collection.name,
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$addFields: {
					loan: { $arrayElemAt: ["$loan", 0] },
					user: { $arrayElemAt: ["$user", 0] },
				},
			},
		]);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getLoanListDelete = async (req, res, next) => {
	try {
		const id = req.query._id;

		const result = await LoanDetails.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getNotificationDelete = async (req, res, next) => {
	try {
		const id = req.query._id;

		const result = await NotificationTemplate.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

		if (result.deletedCount === 1) {
			res.json(true);
		} else {
			res.json(false);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getLoanTypeDesc = async (req, res, next) => {
	try {
		const id = req.query.loanid;
		const myquery = { "_id": new mongoose.Types.ObjectId(id) };

		const result = await Loantype.find(myquery).lean();

		res.json({ loantype: result });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.getUserName = async (req, res, next) => {
	try {
		const username = req.query.username;
		console.log("username:", username);
		let userId = req.query.userId;
		console.log("user id:", userId);

		const userIdIsValid = userId && mongoose.Types.ObjectId.isValid(userId);

		userId = userIdIsValid ? new mongoose.Types.ObjectId(userId) : null;

		const query = { username };

		if (userIdIsValid) {
			query._id = { $ne: userId };
		}

		// const query = { username, _id: { $ne:new mongoose.Types.ObjectId(userId) } };
		const result = await Users.find(query).lean();
		console.log("result:", result);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getPanNum = async (req, res, next) => {
	try {
		const pannumber = req.query.pannumber;
		console.log("pannumber:", pannumber);
		let userId = req.query.userId;
		console.log("user id:", userId);
		const userIdIsValid = userId && mongoose.Types.ObjectId.isValid(userId);

		userId = userIdIsValid ? new mongoose.Types.ObjectId(userId) : null;

		const query = { pannumber };

		if (userIdIsValid) {
			query._id = { $ne: userId };
		}
		const result = await Users.find(query).lean();
		console.log("result:", result);

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getDuplicateEmail = async (req, res) => {
	try {
		const email = req.query.email;
		console.log("email:", email);
		let userId = req.query.userId;
		console.log("user id:", userId);
		const userIdIsValid = userId && mongoose.Types.ObjectId.isValid(userId);

		userId = userIdIsValid ? new mongoose.Types.ObjectId(userId) : null;

		const query = { email };

		if (userIdIsValid) {
			query._id = { $ne: userId };
		}
		const result = await Users.find(query).lean();
		res.json(result);

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getAccNum = async (req, res, next) => {
	try {
		const accountnumber = req.query.accountnumber;
		console.log("accountnumber:", accountnumber);
		let userId = req.query.userId;
		console.log("user id:", userId);
		const userIdIsValid = userId && mongoose.Types.ObjectId.isValid(userId);

		userId = userIdIsValid ? new mongoose.Types.ObjectId(userId) : null;

		const query = { accountnumber };

		if (userIdIsValid) {
			query._id = { $ne: userId };
		}
		const result = await Users.find(query).lean();

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.getBarcode = async (req, res, next) => {
	try {
		const skubarcode = req.query.skubarcode;
		console.log("skubarcode:", skubarcode);
		let userId = req.query.userId;
		console.log("user id:", userId);
		const userIdIsValid = userId && mongoose.Types.ObjectId.isValid(userId);

		userId = userIdIsValid ? new mongoose.Types.ObjectId(userId) : null;

		const query = { skubarcode };

		if (userIdIsValid) {
			query._id = { $ne: userId };
		}
		const result = await Product.find(query).lean();

		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.postAddRole = async (req, res) => {
	try {
		const id = req.body.id;
		const name1 = req.body.name;

		if (id) {
			const myquery = { "_id": new mongoose.Types.ObjectId(id) };
			let value = 0;

			if (name1 === 'allow_access') {
				value = req.body.allow_access === 'checked' ? 1 : 0;
			} else {
				value = req.body.admin_access === 'checked' ? 1 : 0;
			}

			const newvalues = { $set: { [name1]: value } };

			await Role.updateOne(myquery, newvalues);
		} else {
			const myobj = {
				role_nm: req.body.role_nm,
				role_slug: req.body.role_slug,
				role_desc: req.body.role_desc,
				admin_access: req.body.admin_access,
				allow_access: req.body.allow_access
			};

			await Role.insertOne(myobj);
			res.redirect('/role/roles');
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};
exports.postApproveLoan = async (req, res) => {
	try {
		const id = req.body.id;
		if (id) {
			const myquery = { "_id": new mongoose.Types.ObjectId(id) };
			let value;
			const name1 = req.body.name;
			if (name1 == 'approvestatus') {
				if ('checked' == req.body.approvestatus) {
					value = 1;

					const result = await LoanDetails.findOne(myquery);
					const userid = result.user;
					const iduser = new mongoose.Types.ObjectId(userid);
					const loantype = result.loantype;
					const typeid = new mongoose.Types.ObjectId(loantype);
					const formatdate = moment().format("YYYY-MM-DD");
					// const resultuser = await Users.findOne(iduser);
					const resultuser = await Users.findOne(iduser);
					const notification = await NotificationTemplate.find({ templatetitle: "Loan Approved" }).lean();
					const typeloan = await Loantype.findOne(typeid);
					for (const [key, value] of Object.entries(notification)) {
						const message = value.content;
						const subject = value.subject;
						const Obj = {
							'_USERFIRSTNAME_': resultuser.firstname,
							'_USERLASTNAME_': resultuser.lastname,
							'_DATETIME_': formatdate,
							'_LOANTYPE_': typeloan.type,
							'_newline_': '<br>',
							'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							'_systemname_': req.session.generaldata.com_name,
						};
						const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_LOANTYPE_|_tab_|_systemname_/gi, function (matched) {
							return Obj[matched];
						});

						Mail.sendMail(resultuser.email, subject, trans);
					};

				} else {
					value = 0;


				}
				const newValues = {
					$set: {
						approvestatus: value
					}
				};
				await LoanDetails.updateOne(myquery, newValues);
				console.log('Session before:', req.session.flash);
				req.flash('success', res.__(value == 1 ? 'Loan Approved Successfully.' : 'Loan Disapproved Successfully.'));
				console.log('Session After:', req.session.flash);
				res.redirect('/loan/loanlist');
			}
		}
	} catch (err) {
		console.log(err)
		req.flash('error', res.__('Error occurred.'));
		res.redirect('/loan/loanlist');

	}
}
exports.postLoanPaid = async (req, res) => {
	try {
		const id = req.body.id;
		if (id) {
			const myquery = { "_id": new mongoose.Types.ObjectId(id) };
			let value;
			const name1 = req.body.name;
			if (name1 == 'loanpaid') {
				if ('checked' == req.body.loanpaid) {
					value = 1;

					const result = await LoanDetails.findOne(myquery);
					const userid = result.user;
					const iduser = new mongoose.Types.ObjectId(userid);
					const loantype = result.loantype;
					const typeid = new mongoose.Types.ObjectId(loantype);
					const formatdate = moment().format("YYYY-MM-DD");
					// const resultuser = await Users.findOne(iduser);
					const resultuser = await Users.findOne(iduser);
					const notification = await NotificationTemplate.find({ templatetitle: "Loan Paid" }).lean();
					const typeloan = await Loantype.findOne(typeid);
					for (const [key, value] of Object.entries(notification)) {
						const message = value.content;
						const subject = value.subject;
						const Obj = {
							'_USERFIRSTNAME_': resultuser.firstname,
							'_USERLASTNAME_': resultuser.lastname,
							'_DATETIME_': formatdate,
							'_LOANTYPE_': typeloan.type,
							'_newline_': '<br>',
							'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							'_systemname_': req.session.generaldata.com_name,
						};
						const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_LOANTYPE_|_tab_|_systemname_/gi, function (matched) {
							return Obj[matched];
						});

						Mail.sendMail(resultuser.email, subject, trans);
					};

				} else {
					value = 0;


				}
				const newValues = {
					$set: {
						loanpaid: value
					}
				};
				await LoanDetails.updateOne(myquery, newValues);
				console.log('Session before:', req.session.flash);
				req.flash('success', res.__(value == 1 ? 'Loan Paid status change Successfully.' : 'Loan Paid status change Successfully.'));
				console.log('Session After:', req.session.flash);
				res.redirect('/loan/loanlist');
			}
		}
	} catch (err) {
		console.log(err)
		req.flash('error', res.__('Error occurred.'));
		res.redirect('/loan/loanlist');

	}
}
exports.postState = async (req, res) => {
	const id = req.body.countryId;

	fs.readFile('public/data/states.json', (err, data) => {
		if (err) {
			console.error(err);
			res.status(500).json({ error: 'An error occurred.' });
			return;
		}

		const jsonData = data;
		const jsonParsed = JSON.parse(jsonData);
		const states = jsonParsed.states;
		const statedata = [];

		for (const [key, value] of Object.entries(states)) {
			if (id == value.country_id) {
				const data_push = {
					"name": value.name,
					"id": value.id,
					"country_id": value.country_id,
				}
				statedata.push(data_push);
			}
		}

		res.json({ state: statedata });
	});
};
exports.postCity = (req, res) => {
	const id = req.body.stateId;
	fs.readFile('public/data/cities.json', (err, data) => {
		if (err) {
			return res.status(500).json({ error: 'An error occurred' });
		}
		const jsonData = data;
		const jsonParsed = JSON.parse(jsonData);
		const cities = jsonParsed.cities;
		const citydata = [];

		for (const [key, value] of Object.entries(cities)) {
			if (id == value.state_id) {
				const data_push = {
					"name": value.name,
					"id": value.id,
					"state_id": value.state_id,
				}
				citydata.push(data_push);
			}
		}
		res.json({ city: citydata });
	});
};
exports.postCcode = (req, res) => {
	const id = req.body.countryId;
	fs.readFile('public/data/countries.json', (err, data) => {
		if (err) {
			return res.status(500).json({ error: 'An error occurred' });
		}
		const jsonData = data;
		const jsonParsed = JSON.parse(jsonData);
		const countries = jsonParsed.countries;
		const countrydata = [];

		for (const [key, value] of Object.entries(countries)) {

			const data_push = {
				"id": value.id,
				"phoneCode": value.phoneCode,
			}
			countrydata.push(data_push);
		}
		res.json({ country: countrydata });
	});
};

exports.getVersion = async (req, res, next) => {
	try {
		const nodeVersion = process.version;
		const requiredVersion = "v26.16.0";  // Replace with your required Node.js version
		console.log(nodeVersion);

		res.json({ version: nodeVersion, requiredVersion });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'An error occurred' });
	}
};

exports.connectDatabase = async (req, res, next) => {
	const db_username = req.body.db_username;
	const db_pass = req.body.db_pass;
	const db_host = req.body.db_host;
	const dbname = req.body.dbname;
	const pkey = req.body.pkey;

	console.log(db_username, db_pass, db_host, dbname);
	try {
		const envData = fs.readFileSync('.env', 'utf8');
		if (envData.includes('DB_DATABASE')) {
			// .env file is not empty, assume the connection is already established
			console.log(".env file already exists with data. Skipping database connection check.");
			res.status(200).json({ success: true, message: ".env file already exists with data." });
			return;
		}
	} catch (error) {
		console.error("Error reading .env file:", error);
	}
	try {
		// Update .env file
		await connectToDatabase(db_username, db_pass, db_host, dbname);

		const envData = `
        DB_USERNAME=${db_username}
        DB_PASSWORD=${db_pass}
        DB_HOST=${db_host}
        DB_DATABASE=${dbname}
		MAIL_USER=
MAIL_PASS=
		`.trim().replace(/^[ \t]+/gm, "");
		// DATABASE_CONNECTION=true
		// INSTALLATION_COMPLETED=false

		fs.writeFileSync(".env", envData.trim());
		console.log("Updated .env file");

		// Connect to the database
		console.log("Connected to the database with new credentials");
		const installation = Setting({
			dbConnect: "true",
			installation: "false",
			pkey: pkey
		})
		installation.save();
	} catch (error) {
		console.error("Error connecting to the database:", error);
		// Handle the error here, send an appropriate response, or call 'next' with the error
		// For example, you might want to send a 500 Internal Server Error response
		res.status(500).json({ error: "Internal Server Error" });
		// Or call 'next' to pass the error to the next middleware or route handler
		// next(error);
	}

}

exports.postCheckdbConnect = async (req, res) => {
	const { dbname, db_username, db_pass, db_host } = req.body;
	// console.log(dbname, db_username, db_pass, db_host);

	try {
		// Connect to MongoDB
		const mongoURI = `mongodb+srv://${db_username}:${db_pass}@${db_host}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;

		const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
		console.log('Connecting to MongoDB...');
		await client.connect();
		console.log('Connected to MongoDB');
		// List all databases and check if the specified database already exists
		const databaseList = await client.db().admin().listDatabases();
		const databaseExists = databaseList.databases.some(db => db.name === dbname);

		// Close the MongoDB connection
		await client.close();
		console.log('Disconnected from MongoDB');

		if (databaseExists) {
			// If the database exists, send a message to the client
			res.status(200).json({ exists: true, message: 'Database already exists' });
		} else {
			// If the database does not exist, check the connection
			const connectionResult = await checkConnection(db_username, db_pass, db_host, dbname);

			console.log('Connection result:', connectionResult.success, connectionResult.message);

			if (connectionResult.success) {
				// If the connection is successful, send a success response
				res.status(200).json({ success: true, message: 'Database does not exist, connection successful' });
			} else {
				// If the connection fails, send an error response
				res.status(500).json({ success: false, message: connectionResult.message });
			}
		}
	} catch (error) {
		console.error('Error checking existing database or connecting:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.postEmiCalculator = async (req, res) => {
	const { loan_amount, rate, year } = req.body;
	const month = year * 12;
	const date = new Date();
	const formatdate = moment(date).format("YYYY-MM-DD");

	const mortgage = AmortizeJS.calculate({
		method: 'mortgage',
		apr: rate,
		balance: loan_amount,
		loanTerm: month,
		startDate: formatdate,
	});

	const { periodicPayment: monthly_emi, totalPayment: total_payment, totalInterest } = mortgage;

	const result = {
		loan_amount: Math.round(loan_amount),
		monthly_emi: Math.round(monthly_emi),
		total_payment: Math.round(total_payment),
		totalInterest: Math.round(totalInterest)
	};


	res.json({
		data: result
	});
};

exports.verifyPurchaseKey = async (req, res) => {
	const { purchaseCode, email } = req.body;
	try {
		// const domainName = "ews.niftysol.com";
		const hostname = req.get('host');
		const parsedUrl = new URL('http://' + hostname);
		const domainName = parsedUrl.hostname;
		console.log("🚀 ~ exports.verifyPurchaseKey=domainName ~ response:", domainName)
		if (domainName === 'ews.niftysol.com' ||
			domainName === 'localhost'
		) {
			// If the request is from 'ews.niftysol.com', send a success response directly
			return res.status(200).json({ success: true, message: 'Request from exception domain, purchase key verified' });
		}
		if (req.session.purchaseVerified) {
			// If yes, return without processing the request again
			return;
		}

		// Make a request to Envato API to verify the purchase code
		const response = await axios.post(`https://license.dasinfomedia.com/admin/api/license/register`, {
			pkey: purchaseCode,
			domain: domainName,
			email: email,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		});
		console.log("🚀 ~ exports.verifyPurchaseKey=async ~ response:", response.data)

		// Assuming the response contains purchase data
		const purchaseData = response.data;

		switch (purchaseData.data) {
			case "0":
				// Send a success response if the purchase code is valid
				req.session.purchaseVerified = true;
				return res.status(200).json({ success: true, message: 'Purchase key verified and registerd successfully', purchaseData });
			case "1":
				// Send an error response if purchase code is invalid
				return res.status(200).json({ success: false, message: 'Entered Purchase key is invalid !', data: '1' });
			case "2":
				// Send an error response if license already registered
				return res.status(200).json({ success: false, message: 'Purchase key is already in use with a different domain', data: '2' });
			case "3":
				// Send an error response if failed to register license
				return res.status(500).json({ success: false, message: 'Failed to register license', data: '3' });
			case "4":
				// savePurchaseKeyToEnv(purchaseCode);
				// Send an error response if license already registered with the same domain
				return res.status(200).json({ success: true, message: 'Purchase key verified successfully', data: '4' });
			default:
				// Handle unexpected response data
				return res.status(500).json({ success: false, message: 'Unexpected response from the server', data: '' });
		}
	} catch (error) {
		// Send an error response if there's any issue with the verification process
		console.error('Error verifying purchase key:', error);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

exports.createCheckoutSession = async (req, res) => {
	const { amount, emiid } = req.body; // Amount in cents

	try {
		const generalSettings = await Generalsetting.findOne({}).lean();
		const stripe = Stripe(generalSettings.stripe_secret_key || null);
		console.log("generalSettings.stripe_secret_key", generalSettings.stripe_secret_key)
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [{
				price_data: {
					currency: 'INR',
					product_data: {
						name: 'EMI Payment',
					},
					unit_amount: amount * 100, // Convert to cents
				},
				quantity: 1,
			}],
			mode: 'payment',
			success_url: `${req.protocol}://${req.get('host')}/loan/loanlist?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${req.protocol}://${req.get('host')}/loan/loanlist?status=failed`,
			metadata: {
				emi_id: emiid
			}
		});
		res.json({ id: session.id });
	} catch (error) {

		console.error('Error creating checkout session:', error.message);
		console.log(error.message.includes("Invalid API Key provided"), "1")
		console.log(error.message == ("Invalid API Key provided"), "2")
		if (error.message.includes("Invalid API Key provided")) {
			req.flash("error", "Please enter a valid Stripe Secret key.");

		} else {
			req.flash("error", error.message);
		}
		const errorMessage = res.__(error.message);
		return res.status(500).json({ error: errorMessage });


	}
};
