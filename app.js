`use strict`
const express = require('express');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const hbs = require('express-handlebars');
const initialzeRoutes = require('./routes');
const flash = require('express-flash');
const createError = require('http-errors');

app.use(flash());

app.set('view engine', 'hbs');
global.__basedir = __dirname;
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '/views/layouts/'),
  partialsDir: path.join(__dirname, '/views/partial/'),
  usersDir: path.join(__dirname, '/views/users/'),
  roleDir: path.join(__dirname, '/views/role/'),
  loanDir: path.join(__dirname, '/views/loan/'),
  generalsettingsDir: path.join(__dirname, '/views/generalsettings/'),
  reminderDir: path.join(__dirname, '/views/reminder/'),
  notificationDir: path.join(__dirname, '/views/notification/'),
  customfieldsDir: path.join(__dirname, '/views/customfields/'),
  accessrightsDir: path.join(__dirname, '/views/accessrights/'),
  categoriesDir: path.join(__dirname, '/views/category/'),
  serviceDir: path.join(__dirname, '/views/service/'),
  activitylogDir: path.join(__dirname, '/views/activitylog/'),
  productDir: path.join(__dirname, '/views/product/'),
  noteDir: path.join(__dirname, '/views/notes/'),
  impersonateDir: path.join(__dirname, '/views/impersonate/'),
  eventsDir: path.join(__dirname, '/views/events/'),
  reportDir: path.join(__dirname, '/views/report'),
  notificationlistDir: path.join(__dirname + '/views/notificationlist'),
  helpers: require('./helpers/handlebars'),
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(initialzeRoutes);
app.use(function (req, res, next) {
  next(createError(404, "This page doesnot exist."));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: 'errorlayout', statuscode: err.statusCode });
});

const port = process.env.PORT || 5555;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
