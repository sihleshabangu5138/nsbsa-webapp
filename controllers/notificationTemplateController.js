const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const NotificationTemplate = require('../models/Notificationtemplate');
const ActivityLog = require('../models/Activitylog');
const moment = require('moment');
const lang = require('../config/languageconfig');
const AccessRights = require('../models/AccessRights');

exports.getNotificationTemplateList = async (req, res, next) => {
    try {
        let access_data = [];
        const access = await AccessRights.find({ "rolename": req.session.role_slug }).lean();
        const notificationTemplates = await NotificationTemplate.find().lean();
        for (const [key, value] of Object.entries(access)) {

            for (const [key1, value1] of Object.entries(value['access_type'])) {
                if (key1 == "notification") {
                    access_data = value1;
                }
            }
        };
        res.render('notification/notificationtemplate', { title: 'Notification Template', session: req.session, messages: req.flash(), accessrightdata: access_data, notificationTemplates });
    } catch (error) {
        next(error);
    }
}
exports.getAddNotificationTemplate = async (req, res) => {
    const id = req.params.id;
    if (id) {
        const myquery = { "_id": new mongoose.Types.ObjectId(id) };
        const result = await NotificationTemplate.find(myquery).lean()
        res.render('notification/addnotificationtemplate', { title: "Edit Notification Template ", data: result, id: id, session: req.session });
    } else {
        const news = [{ 'userid': '-1' }];
        res.render('notification/addnotificationtemplate', { title: "Add Notification Template ", data: news, session: req.session });
    }
}
exports.postAddNotificationTemplate = async (req, res) => {
    try {
        const id = req.body.id;
        if (id) {
            const myquery = { "_id": new mongoose.Types.ObjectId(id) };
            const updatedTemplate = {
                notificationtype: req.body.notificationtype,
                slug: req.body.slug,
                templatetitle: req.body.templatetitle,
                subject: req.body.subject,
                content: req.body.content,
                addedby: new mongoose.Types.ObjectId(req.session.user_id),
            };
            await NotificationTemplate.findByIdAndUpdate(myquery, updatedTemplate);

            // const date = Date(Date.now());
            const formatdate = moment().format("YYYY-MM-DD");
            const activityLog = {
                date: formatdate,
                module: "Notification Template",
                action: "updated template",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.templatetitle,
                status: 0,
            };

            await ActivityLog.create(activityLog);

            req.flash('success', res.__('Notification Template Updated Successfully.'));
            res.redirect('/notification/notificationtemplate');
        } else {
            const newTemplate = new NotificationTemplate({
                notificationtype: req.body.notificationtype,
                slug: req.body.slug,
                templatetitle: req.body.templatetitle,
                subject: req.body.subject,
                content: req.body.content,
                addedby: new mongoose.Types.ObjectId(req.session.user_id),
            });
            await newTemplate.save();

            const formatdate = moment().format("YYYY-MM-DD");
            const activityLog = {
                date: formatdate,
                module: "Notification Template",
                action: "inserted template",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.templatetitle,
                status: 0,
            };

            await ActivityLog.create(activityLog);

            req.flash('success', res.__('Notification Template Inserted Successfully.'));
            res.redirect('/notification/notificationtemplate');
        }
    } catch (error) {
        req.flash('error', res.__('Error occurred.'));
        res.redirect('/notification/notificationtemplate');
    }
};
