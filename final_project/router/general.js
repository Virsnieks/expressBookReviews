const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
// getting all books using Promise
public_users.get('/', (req, res) => {
  new Promise((resolve, reject) => {
    
    setTimeout(() => {
      if (books) {
        resolve(books);
      } else {
        reject("No books found");
      }
    }, 500); // 500ms delay
  })
    .then(bookData => {
      res.status(200).json(bookData);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});


// Get book details based on ISBN with promise
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found with this ISBN");
    }
  })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ message: error }));
});

  
// Get book details based on author with promise
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(
      book => book.author.toLowerCase() === author
    );
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found by this author");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({ message: error }));
});


// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(
      book => book.title.toLowerCase() === title
    );
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found with this title");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({ message: error }));
});


//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for this book." });
  }
});

module.exports.general = public_users;
