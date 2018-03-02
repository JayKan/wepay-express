'use strict';

const express = require('express');
const api = express.Router();
const paypal = require('paypal-rest-sdk');
const logger = require('winston');

paypal.configure({
  'mode': 'sandbox',
  'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
  'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM',
  'headers' : {
    'custom': 'header'
  }
});

const MERCHANT_INFO = {
  "merchant_info": {
    "email": "PPX.DevNet-facilitator@gmail.com",
    "first_name": "Jie",
    "last_name": "Bar",
    "business_name": "Medical Professionals, LLC",
    "phone": {
      "country_code": "001",
      "national_number": "5032141716"
    },
    "address": {
      "line1": "1234 Main St.",
      "city": "Portland",
      "state": "OR",
      "postal_code": "97217",
      "country_code": "US"
    },
    "tax_inclusive": false,
  }
};

const updatedInvoiceJson = Object.assign({}, MERCHANT_INFO, {
  "billing_info": [ // needs to be updated
    {
      "email": "jakan@paypal.com",
      "first_name": "JAYYYY",
      "last_name": "UPDATTED"
    }
  ],
  "items": [{
    "name": "Sutures",
    "quantity": 400.0,
    "unit_price": {
      "currency": "USD",
      "value": 5
    }
  }],
  "shipping_info": {
    "first_name": "Jay",
    "last_name": "Kan",
    "business_name": "Not applicable",
    "phone": {
        "country_code": "001",
        "national_number": "5039871234"
    },
    "address": {
        "line1": "1234 Broad St.",
        "city": "Portland",
        "state": "OR",
        "postal_code": "97216",
        "country_code": "US"
    }
  },
  "total_amount": {
      "currency": "USD",
      "value": "2000.00"
  }
});

module.exports = app => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  api.post('/get', (req, res) => {
    const { id } = req.body;

    paypal.invoice.get(id, (error, invoice) => {
      if (error) {
        logger.info(error.response);
        throw error;
      } else {
        return res.json(invoice);
      }
    });
  });

  api.post('/create', (req, res) => {
    const { name, description, price, imageUrl } = req.body;
    const payload = Object.assign({}, MERCHANT_INFO, {
      items: [{
        name,
        description,
        imageUrl,
        quantity: 1,
        unit_price: {
          currency: 'USD',
          value: price
        }
      }],
      note: imageUrl || ''
    });

    paypal.invoice.create(payload, (error, invoice) => {
      if (error) {
        logger.info(error.response);
        throw error;
      } else {
        return res.json(invoice);
      }
    });
  });

  api.post('/update', (req, res) => {
    const {
      id,
      items
    } = req.body;
    const updated_invoice = Object.assign({}, updatedInvoiceJson, {
      id,
      items
    });

    paypal.invoice.update(id, updated_invoice, (error, invoice) => {
      if (error) {
        logger.info(error.response);
        throw error;
      } else {
        // change invoice from draft to `payable` state upon success update
        paypal.invoice.send(id, (error, data) => {
          if (error) {
            logger.info(error.response);
            throw error;
          } else {
            // redirect upon  httpStatusCode == 202
            return res.json(data);
          }
        });
      }
    });
  });

  api.post('/list', (req, res) => {
    const {
      email,
      recipient_first_name,
      recipient_last_name
    } = req.body;

    paypal.invoice.search({
      email,
      recipient_first_name,
      recipient_last_name
    }, (error, invoices) => {
      if (error) {
        logger.info(error.response);
        throw error;
      } else {
        return res.json(invoices);
      }
    });
  });

  api.post('/cancel', (req, res) => {
    const { id } = req.body;
    const options = {
      "subject": "Canceling cleaning service",
      "note": "Testing",
      "send_to_merchant": false,
      "send_to_payer": false,
      "cc_emails": [
        "jakan@paypal.com"
      ]
    };

    paypal.invoice.cancel(id, options, (error, data) => {
      if (error) {
        logger.info(error.response);
        throw error;
      } else {
        return res.json(data);
      }
    });
  });

  app.use('/api/invoicing/invoices', api);
};