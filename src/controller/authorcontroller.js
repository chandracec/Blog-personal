const authorModel = require("../model/authorModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const validTitles = ["Mr", "Mrs", "Miss"];
const SECRET_KEY = "cvfyguhijokp567890";

// Create a new author
const createAuthor = async (req, res) => {
  try {
    const { fname, lname, email, password, title } = req.body;

    // Validate request body
    if (!req.body) {
      return res.status(400).send({
        status: false,
        message: "Please provide a body for creating an author",
      });
    }

    // Validate required fields
    if (!fname) {
      return res.status(400).send({
        status: false,
        message: "Please provide a first name",
      });
    }
    if (!lname) {
      return res.status(400).send({
        status: false,
        message: "Please provide a last name",
      });
    }
    if (!password) {
      return res.status(400).send({
        status: false,
        message: "Please provide a password",
      });
    }
    if (!email) {
      return res.status(400).send({
        status: false,
        message: "Please provide an email address",
      });
    }
    if (!title) {
      return res.status(400).send({
        status: false,
        message: "Please provide a title",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).send({
        status: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate title
    if (!validTitles.includes(title)) {
      return res.status(400).send({
        status: false,
        message: `Please provide a valid title from the following options: ${validTitles}`,
      });
    } else {
      const foundAuthor = await authorModel.findOne({ email });
      if (foundAuthor) {
        return res.status(400).send({
          status: false,
          message: `The email address '${email}' already exists in the database`,
        });
      }

      // Create the author
      const author = await authorModel.create(req.body);
      res.status(201).send({ status: true, data: author });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// Author login
const authorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!req.body) {
      return res.status(400).send({
        status: false,
        message: "Please provide an email and password to log in as an author",
      });
    }
    if (!password) {
      return res.status(400).send({
        status: false,
        message: "Please provide a password",
      });
    }
    if (!email) {
      return res.status(400).send({
        status: false,
        message: "Please provide an email address",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).send({
        status: false,
        message: "Please provide a valid email address",
      });
    }

    // Find the author by email and password
    const foundAuthor = await authorModel.findOne({ email, password });
    if (!foundAuthor) {
      return res.status(401).send({
        status: false,
        message: "Invalid email or password",
      });
    } else {
      // Generate JWT token
      const token = jwt.sign({ authorId: foundAuthor._id }, SECRET_KEY);
      res.setHeader("x-api-key", token);
      return res.status(200).send({ status: true, data: { token } });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authorLogin, createAuthor };
