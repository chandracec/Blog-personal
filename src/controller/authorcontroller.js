const authorModel = require("../model/authorModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");
 
const arrTitle = ["Mr", "Mrs", "Miss"];
const SECRETE_KEY = "cvfyguhijokp567890"


const createAuthor = async (req, res) => {
  try {
    const { fname, lname, email, password, title } = req.body;
    if (!req.body)
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide a body for create author",
        });
    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a First name " });
    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Last name " });
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Password" });
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Email Address" });
    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a title" });
    if (!validator.isEmail(email))
      return res
        .status(400)
        .send({ status: false, message: " Provide a valid email address" });

    if (!arrTitle.includes(title))
      return res
        .status(400)
        .send({
          status: false,
          message: `Provide a valid title that is titles ${arrTitle}`,
        });
    else {
      const findAuthor = await authorModel.findOne({ email: email });
      if (findAuthor)
        return res
          .status(400)
          .send({
            status: false,
            message: `this Email : ${email} already exist in the Database`,
          });
      const author = await authorModel.create(req.body);
      res.status(201).send({ status: true, data: author });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const authorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!req.body)
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide a Email/Password for Login author",
        });
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Password" });
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please provide a Email Address" });
    if (!validator.isEmail(email))
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide a Valid Email Address",
        });
    const findAuthor = await authorModel.findOne({
      email: email,
      password: password,
    });
    if (!findAuthor)
      return res
        .status(401)
        .send({
          status: false,
          message: `${email} and ${password} does not exist`,
        });
    else {
      const token = jwt.sign({ authorId: findAuthor._id }, SECRETE_KEY);
      res.setHeader("x-api-key", token);
      return res.status(200).send({ status: true, data: { token: token } });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authorLogin, createAuthor };
