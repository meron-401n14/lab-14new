'use strict';

const Users = require('../models/users-model.js');
const users = new Users();
const jwt = require('jsonwebtoken');



/**
 * this takes encoded base 64 string of format username:password and finds
 * the match user from that data
 * @param {string }  encoded - base64 string
 * @returns {object}     -found users from our database
 */
const basicDecode = async encoded => {
  let base64 = Buffer.from(encoded, 'base64');
  let plainText = base64.toString();
  //sara:sarahpassword
  //{username: sarah, password: sarahpassword}



  let [username, password] = plainText.split(':');
  let user = await users.getFromField({username});
  
  // if it's an empty array, we won't hit this
  // otherwise, we want to get to the object at index 0
  if(user.length){
    let isSamePassword = await user[0].comparePassword(password);
    if(isSamePassword) return user[0];
    else{
      let newUser = await users.create({username: username, password: password});
      return newUser;

    }
  }

  // if its an empty array, we wont hit this
  //otherwise, we want to get to the object at index 0

};


const bearerDecrypt = async token => {
  try {
    let tokenData= jwt.verify(token, process.env.JWT_SECRET);

    if(tokenData && tokenData.data && tokenData.data.id)

      return  await users.get(tokenData.data.id);
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * This function takes in a request header authorization (either basic or bearer) and finds a user.
 * It also has a lot of error handling built in
 * @param {string}          authorization.headers.required  our authorization string
 * @return {object}                                          The found user in req.user
 * @param {function}   next [description]
 * @return {string}                                     A TOKEN for the user in req.token
 * 
 */
module.exports = async (req, res, next) => {
  //what is one thing we need to do here 
 

  if(!req.headers.authorization) 

    return req.authError === false 
      ? next() 
      : next({status: 400, msg: 'Missing request headers!'});

  // Split up the header auth string based on space
  // ['Basic', 'kdlfkrofjofjoofosd=']
  // ['Bearer', 'i0nkh04bj3bjwb']

  let   authSplitString = req.headers.authorization.split(/\s+/);
  console.log('req error:', req.authError);

  if(authSplitString !==2)
    return req.authError === false
      ? next()
      : next({status: 400, msg: 'Incorrect format of request header'});

  let authType= authSplitString[0];
  let authData = authSplitString[1];

  //console.log('Request header:'  authType, authData)
  
  let user;

  if(authType === 'Basic') user = await basicDecode(authData);
  else if(authType === 'Bearer') user = await  bearerDecrypt(authData);
  else 
    return  req.authError === false
      ? next()
      : next({status:400, msg: 'Neither Basic nor Bearer request header'});

  // console.log('Returned User from decode/decrypt', user);
  if(user){
    req.user = user;
    req.token = user.generateToken(req.headers.timeout);
    //console.log('our created token', req.token);
    return next();
  } else 
    return req.authError === false
      ? next()
      : next({status: 401, msg: 'User not found from credentitals'});
    
};



