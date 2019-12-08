'use strict';

const { startDB, stopDB } = require('./supertester.js');
const Users = require('../src/models/users-model.js');
const Roles = require('../src/models/roles-model.js');
const Books = require('../src/models/books-model.js');
const server = require('../src/server.js').server;
const supertester = require('./supertester.js');


const mockRequest = supertester.server(server);
process.env.JWT_SECRET = 'test-secret';


let users = {
  admin: {
    username: 'sarah',
    password: 'sarahpassword',
    email: 'sarah@email.com',
    role: 'admin',
  },
  editor: {
    username: 'bill',
    password: 'billpassword',
    email: 'bill@email.com',
    role: 'editor',
  },
  user: {
    username: 'rene',
    password: 'renepassword',
    email: 'rene@email.com',
    role: 'user',
  },
};

let roles = {
  admin: {
    role: 'admin',
    capabilities: ['create', 'read', 'update', 'delete', 'superuser'],
  },
  editor: { role: 'editor', capabilities: ['create', 'read', 'update'] },
  user: { role: 'user', capabilities: ['read'] },
};

let books = {
  all: {
    title: 'Alice in Wonderland',
    auth: ['admin', 'editor', 'user'],
  },
  some: {
    title: 'Hamlet',
    auth: ['admin', 'editor'],
  },
  few: {
    title: 'Brave New World',
    auth: ['admin'],
  },
};

beforeAll(async done => {
  let usersDB = new Users();
  let rolesDB = new Roles();
  let booksDB = new Books();
  await startDB();
  await usersDB.create(users.admin);
  await usersDB.create(users.editor);
  await usersDB.create(users.user);
  await rolesDB.create(roles.admin);
  await rolesDB.create(roles.editor);
  await rolesDB.create(roles.user);
  await booksDB.create(books.all);
  await booksDB.create(books.some);
  await booksDB.create(books.few);
  done();
});

afterAll(stopDB);

/* describe('xxx', () => {
  it('xxx', () => { }); 
}); */



describe('auth.js  requires correct request headers', ()=>{
  let validBasicAuth = Buffer.from( users.admin.username + ':' + users.admin.password).toString('base64');
  let invalidBasicAuth = 'Basic' + Buffer.from('wrong').toString('base64');
  let newUserBasicAuth = 'Basic' + Buffer.from('sonia:soniapassword').toString('base64');

  it ('throws error when the request header is missing', async () => {
    let response = await mockRequest 
    .post('/signin');
    .set('Content-Type', 'application/json ')
    .set('Accept', 'application/json')
    .set('Authorization', 'Wrong blah')

expect(response.status).toBe(400);
expect(response.body.error).toBe('Missing Basic nor Bearer request header');


  });
});
