const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let doesExist = require("./auth_users.js").doesExist;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(`username ${username}, password ${password}`);

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

//Retrive books as if from db (with a delay)
async function getBooksAsync() {
  return new Promise((resolve)=>{
    setTimeout(()=> {
      resolve(books);
    }, 3000);
  })
}

// Get the book list available in the shop - ASYNC
public_users.get('/', async function (req, res) {
    let booksPromise = getBooksAsync();

    booksPromise.then((booksFromDb) => {
      res.send(JSON.stringify(booksFromDb));
    })
});

// Get book details based on ISBN - ASYNC
public_users.get('/isbn/:isbn', async function (req, res) {
  let isbn = req.params.isbn;
  let booksPromise = getBooksAsync();

  booksPromise.then((booksFromDb) => {
    if(booksFromDb[isbn]) {
      res.send(JSON.stringify(booksFromDb[isbn], null, 4));
    }
    else {res.send(`ISBN ${isbn} not found.`);}
  })
 });
  
// Get book details based on author - ASYNC
public_users.get('/author/:author', async function (req, res) {
  let author = req.params.author;
  let bookByAuthor = {};
  let booksPromise = getBooksAsync();
  
  booksPromise.then((booksFromDb) => {
    for (let key in booksFromDb) {
      if(booksFromDb[key].author == author) {
        bookByAuthor[key] = booksFromDb[key];
      }
    }
    res.send(JSON.stringify(bookByAuthor, null, 4));
  })
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  let title = req.params.title;
  let bookByTitle = {};
  let booksPromise = getBooksAsync();
  
  booksPromise.then((booksFromDb) => {
    for (let key in booksFromDb) {
        if(booksFromDb[key].title == title) {
          bookByTitle[key] = booksFromDb[key];
        }
      }
      res.send(JSON.stringify(bookByTitle, null, 4));
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;

  if(books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews));
  }
  else {res.send(`ISBN ${isbn} not found.`);}
});

module.exports.general = public_users;
