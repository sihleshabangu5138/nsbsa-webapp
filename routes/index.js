const express = require('express');
const router = express.Router();


const accessrightRouter = require('./accessright');
const activitylogRouter = require('./activitylog');
const ajaxRouter = require('./ajaxfun');
const categoryRouter = require('./category');
const customfieldsRouter = require('./customfields');
const dashboardRouter = require('./dashboard');
const eventRouter = require('./event');
const impersonateRouter = require('./impersonateuser');
const installationRouter = require('./installation');
const loanRouter = require('./loan');
const loantypeRouter = require('./loantype');
const loginRouter = require('./login');
const notesRouter = require('./notes');
const notificationRouter = require('./notification');
const productRouter = require('./product');
const remindersRouter = require('./reminders');
const reportRouter = require('./report');
const roleRouter = require('./roles');
const ruleRouter = require('./rules');
const serviceRouter = require('./service');
const generalSettingRoter = require('./setting');
const userRouter = require('./users');


router.use(dashboardRouter);
router.use(installationRouter);
router.use(accessrightRouter);
router.use(activitylogRouter);
router.use(ajaxRouter);
router.use(categoryRouter);
router.use(customfieldsRouter);
router.use(eventRouter);
router.use(generalSettingRoter);
router.use(impersonateRouter);
router.use(loanRouter);
router.use(loantypeRouter);
router.use(loginRouter);
router.use(notesRouter);
router.use(notificationRouter);
router.use(productRouter);
router.use(remindersRouter);
router.use(roleRouter);
router.use(ruleRouter);
router.use(reportRouter);
router.use(serviceRouter);
router.use(userRouter);


module.exports = router;
