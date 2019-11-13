'use strict';

const express = require('express');
const router = express.Router();
const modelFinder = require('../middleware/model-finder.js');
const PreventAuthErrors = require('../middleware/prevent-auth-errors.js');
const auth = require('../middleware/auth.js');

router.param('model', modelFinder.load);

router.get('/model/:model', PreventAuthErrors, auth,  (req, res, next) => {
  if(!req.model) next({status: 404, msg: 'Cannot find requested model'});


  let records = await req.model.getFromField({});
  console.log(records);
  let recordCount = records.length;

  let resData = {
    model: req.params.model,
    count: recordCount,
  };

  if(req.user && req.user.role === 'admin') resData.records = records;
  res.status(200).json()
});

router.get('/model/:model/:id', (req, res, next) => {});

module.exports = router;
