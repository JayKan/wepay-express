'use strict';

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const allowedOrigins = ['http://localhost:3000'];

module.exports = app => {
	app.set('trust proxy', true);

	// server address
	app.set('host', process.env.HOST || 'localhost');
	app.set('port', process.env.PORT || 5000);

	app.use(cors());
	// app.use(cors({
	// 	origin: (origin, callback) => {
	// 		// allow requests with no origin
	// 		// (like mobile apps or curl requests)
	// 		if(!origin) return callback(null, true);
	// 		if(allowedOrigins.indexOf(origin) === -1){
	// 			const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
	// 			return callback(new Error(msg), false);
	// 		}
	// 		return callback(null, true);
	// 	},

	// 	exposedHeaders: ['Content-Length'],

	// 	credentials: true,
	// }));
  app.options('*', cors());

	// configure express to use bodyParser as middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());

	// HTTP headers
	app.disable('x-powered-by');
	app.use(helmet({ dnsPrefetchControl: false }));
	app.use(helmet.frameguard({ action: 'deny' }));
	app.use(helmet.hsts({ force: true, maxAge: 7776000000 })); // 90 days
	app.use(helmet.noSniff());
	app.use(helmet.xssFilter());
	app.use(helmet.ieNoOpen());

	app.use((req, res, next) => {
		// res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept');
    next();
	});
}