'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const Books = require('../models/books-model.js');

const books = new Books();

router.get('/books', auth,  async(req, res, next) => {
  let allbooks = await  books.getFromField({});

  let filteredBooks = [];
  allbooks.forEach(book => {
    if(book.auth.includes(req.user.role))
      filteredBooks.push({title: book.title, author:book.author});
  });
  if(filteredBooks.length)
    res.status(200).json(filteredBooks);
  else  next({ status: 403, msg: 'You cannot access any books!'});

});

router.post('/books', auth, async(req, res, next) => {
  if(req.user.can('create')=== true) {
    try {
      await  books.create()(req.body);
      res.status(200).json('You created a book!');
    } catch(e) {
      console.error(e);
      next({status: 400, msg: e.name});
    }
  } else  next({status: 403, msg: 'You cannot create a book!'});

});
router.put('/books/:id', auth, async (req, res, next)=>{
  if(req.user.can('update') !== true)
    return next({status:403, msg:'You cannot update books!'});
  let book = await book.get(req.params.id);

  if(book && book._id){
    let newBookData = {...{
      title: null,
      author: null,
      auth: [], 
    }, ...req.body };
    try{
      await books.update(req.params.id, newBookData);
      res.status(200).json('Successfully updated book');
    } catch (e) {
      console.error(e);
      next ({status: 400, msg: 'Unable to update'});
    }
  }else next ({status: 404, msg:'Can not find this book'});

});
router.patch('/books/:id', auth,  async(req, res, next) => {
  if(req.user.can('update') !== true)
    return next({status:403, msg:'You cannot update books!'});
  let book = await books.get(req.params.id); 
  if (book && book._id){
    let newBookData = {
      ...{
        title: book.title,
        author: book.author,
        auth: book.auth,
      },
      ...req.body,
     
    };
    try {
      await books.update(req.params.id, newBookData);
      res.status(200).json('Successfully updated book');
    } catch(e){
      console.error(e);
    }
  } else  next({status: 404, msg: 'Cannot find this book'});
  
});

module.exports = router;
