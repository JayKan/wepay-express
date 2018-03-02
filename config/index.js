'use strict';

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

module.exports = app => {
	app.set('trust proxy', true);

	// server address
	app.set('host', process.env.HOST || 'localhost');
	app.set('port', process.env.PORT || 5000);

	// configure express to use bodyParser as middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());

	// HTTP headers
	app.disable('x-powered-by');
	app.use(helmet({ dnsPrefetchControl: false }));
	app.use(helmet.frameguard({ action: 'deny' }));
	app.use(helmet.hsts({ force: true, maxAge: 7776000000 })); // 90 days
	app.use(helmet.noSniff());
	app.use(helmet.xssFilter());
	app.use(helmet.ieNoOpen());


}