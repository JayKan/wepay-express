'use strict';

const express = require('express');
const logger = require('winston');

const app = express();

require('./config')(app);
require('./api')(app);

app.listen(app.get('port'), app.get('host'), error => {
  if (error) {
    logger.error(error);
  } else {
    logger.info(`Server is listening ${app.get('host')}:${app.get('port')}`);
  }
})