'use strict';
const express = require('express');
const router = express.Router();
const i18n = require('i18n');

i18n.configure({
  locales: [
    'en', 'zh', 'hi', 'es', 'ar', 'bn', 'pt', 'ru',
    'ja', 'pa', 'de', 'ko', 'fr', 'tr', 'te', 'mr',
    'ta', 'ur', 'gu', 'th', 'ml', 'it', 'pl', 'uk',
    'bg', 'el', 'hu', 'nl', 'id', 'tl', 'sw', 'sr',
    'sk', 'sl', 'hy', 'mn', 'ky', 'kk', 'ku', 'tg',
    'af', 'az', 'rw', 'mg', 'ms', 'ne', 'ny', 'sd',
    'st', 'zu', 'xh', 'tk', 'ka', 'kan', 'nb','sq',
    'sv', 'be', 'lv', 'ga', 'lb', 'bs', 'ht', 'or',
    'hr', 'fi', 'et', 'da', 'ca', 'cs', 'gl', 'gd',
    'mt', 'cy', 'sm', 'fy', 'is', 'yo', 'qu', 'mk',
    'km', 'ps', 'ro', 'he', 'lt'],
  cookie: 'locale',
  directory: "./locales",
  register: global,
  extension: '.json',
  logDebugFn: function (msg) {
  }, 

  // setting of log level WARN - default to require('debug')('i18n:warn')
  logWarnFn: function (msg) {
  },

  // setting of log level ERROR - default to require('debug')('i18n:error')
  logErrorFn: function (msg) {
  },
  api: {
    '__': '__',  // now req.__ becomes req.__
    '__n': '__n' // and req.__n can be called as req.__n
  }
});

module.exports = i18n;
