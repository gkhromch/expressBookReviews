const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let authU = users.filter((u)=> {return (u.username==username && u.password==password) });

  if(authU.length>0) {
    return true;
  }
  else {
    return false;
  }

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.body.review;
  let user = req.session.authorization.username;

  console.log(`User: ${user}, Review: ${review}`);

  if(books.hasOwnProperty(isbn)) {
    books[isbn].reviews[user] = review;
    res.send(`Review by ${user} added for book ${isbn}`);
  }
  else { res.send("Book not found.") }
});


// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let user = req.session.authorization.username;

  if(books.hasOwnProperty(isbn)) {
    if(books[isbn].reviews.hasOwnProperty(user)) {
      delete books[isbn].reviews[user];
      res.send(`Review by ${user} deleted for book ${isbn}`);
    }
    else { res.send(`Review by ${user} for book ${isbn} does not exist`);}
  }
  else { res.send("Book not found.") }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.doesExist = doesExist;
module.exports.users = users;
