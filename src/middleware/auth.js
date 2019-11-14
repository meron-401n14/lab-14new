'use strict';

const Users = require('../models/users-model.js');
const users = new Users();
const jwt = require('jsonwebtoken');



/**
 * this takes encoded base 64 string of format username:password and finds
 * the match user from that data
 * @param { } encoded 
 */
const basicDecode = async encoded => {
  let base64 = Buffer.from(encoded, 'base64');
  let plainText = base64.toString();
  //sara:sarahpassword
  //{username: sarah, password}



  let [username, password] = plainText.split(':');
  let user = await users.getFromField({username});

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
  // if(user.length){
  //    user = user[0];
     //if(user.comparePassword(password)) return user;
     if (user.length &&  await user[0].comparePassword(password))
     return user[0];

  //return{
    // username: username,
    // password:password;
  }
};

const bearerDecrypt = token => {
  try {let tokenData= jwt.verify(token, process.env.JWT_SECRET);
  if(tokenData && tokenData.data && tokenData.data.id)
  return await users.get(tokenData.data.id)
  } catch (e){

  }
  return null;
};
/**
 * 
 * 
 */
const strictAuthHandler  = async (req, res, next) => {
  let authType, authData;

  if(!req.headers.authorization) 

 return req.authError === false ? next() : next({status: 400, msg: 'Missing request headers!');

    authSplitString = req.headers.authorization.split(/\s+/);

    if(authSplitString !==2)
    next('Incorrect format of request header');
    let authType= authSplitString[0];
    let authData = authSplitString[1];

    console.log('Request header:'  authType, authData)
  
    let user;

    if(authType === 'Basic') basicDecode(authData);
    else if(authType === 'Bearer') bearerDecrypt(authData);
    else next({status:400, msg: 'Neither Basic nor bearer request header'})

    if(user){
      req.user = user;
      req.token = user.generateToken(req.headers.timeout);
      console.log(200).json({token:})
      next();
    } else next({status:401, msg: 'Usr not found from cred' })

};



module.exports = (string) => {
  if(type === 'strict')
  return strictAuthHandler;
}