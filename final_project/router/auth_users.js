const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (e.g., not already taken)
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

// Authenticate user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Register function (optional, if done in another file)
const registerUser = (username, password) => {
  if (isValid(username)) {
    users.push({ username, password });
    return true;
  }
  return false;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username },
      "access",
      { expiresIn: '1h' }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User logged in successfully." });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Save or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review by user not found" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
