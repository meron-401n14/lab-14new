'use strict';

const express = require('express');
const router = express.Router();
const modelFinder = require('../middleware/model-finder.js');
const PreventAuthErrors = require('../middleware/prevent-auth-errors.js');
const auth = require('../middleware/auth.js');

router.param('model', modelFinder.load);

/**
 * this route will print out details about a model
 * @route GET /model/:model
 * @group model/:model - data printed about a specific model
 * @param {string}  : model - The name of the model in our database
 * @security bearerAuth (optional)
 * @returns {object} 200 - An object containing the model name, count of records and 
 * (if the user is an admin ) the actual records
 * @returns {Error}   500 - when the given model is not found.
 */

router.get('/model/:model', PreventAuthErrors, auth,  async (req, res, next) => {
  console.log('Model route has a user?', req.user);
  if(!req.model) next({status: 404, msg: 'Cannot find requested model'});

  let records = await req.model.getFromField({});
  let recordCount = records.length;
  

  //console.log(records);

  let resData = {
    model: req.params.model,
    count: recordCount,
  };

  if(req.user && req.user.role === 'admin') resData.records = records;
  res.status(200).json(resData);
});

/**
 * this route returns a single record in a specified model
 * @route GET /model/:model/:id
 * @group model/:model - Data printed about a specific model
 * @param {string} model.params.required - The name of the model we want to use
 * @param {string} id.params.required - The id of the record we are trying to.
 * @security bearerAuth - Admin role required
 * @returns {object} 200 - the record we found
 * @returns {Error} 403- if  the user is not of role admin
 * @returns {Error} 404 - if  the record was not found
 * */
router.get('/model/:model/:id', auth, async(req, res, next) => {
  // only admins can access this route
  // auth is required 

  if(req.user.role === 'admin') {

    let record =  await req.model.get(req.params.id);

    if(record && record._id) res.status(200).json(record);
  
    else next({status: 404, msg: 'Unable to find record'});
  } else next({status: 403, msg: 'Forbidden to access this route'});

  // send error
});

module.exports = router;
