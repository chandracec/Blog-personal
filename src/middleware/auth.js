const jwt = require("jsonwebtoken");
const authorModel = require("../model/authorModel");
const { isValidObjectId } = require("mongoose");

const SECRETE_KEY = "cvfyguhijokp567890";

const authorizationFuc = (req, res, next) => {
  try {
    const token = req.headers[`x-api-key`];
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "Provide credentials headers token" });
    const decodedToken = jwt.verify(token, SECRETE_KEY);
    req.authorId = decodedToken.authorId;
    next();
  } catch (error) {
    if (
      err.message.includes("signature") ||
      err.message.includes("token") ||
      err.message.includes("malformed")
    ) {
      return res
        .status(403)
        .send({ status: false, message: "You are not Authenticated" });
    }
    res.status(400).send({ status: false, message: error.message });
  }
};

const authorExists = async (authorId) => {
  const author = await authorModel.findById(authorId);
  if (!author) return false;
  return true;
};

const isValidValue = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const blogExist = async (blogId) => {
  const blog = await blogModel.findById(blogId);
  if (!blog) return false;
  return true;
};

const filterQueryPATH = (query) => {
  const arr = ["authorId", "category", "subcategory", "tags"];
  if (query.length > 0) {
    const drr = query.filter((x) => {
      return arr.includes(x);
    });
    if (drr.length > 0) {
      return true;
    }
    return false;
  }
  return false;
};

const authorAuthorizationCheck = async (req, res, next) => {
  try {
    const id = req.authorId;
    const blogId = req.params.blogId;
    if (blogId) {
      if (!isValidObjectId(blogId))
        return res
          .status(400)
          .send({ status: false, message: "Provide valid blog id" });
      const blog = await blogModel.findById(blogId);
      if (!blog)
        return res
          .status(404)
          .send({ status: false, message: "Provide not Found" });
      const authorId = blog.authorId;
      if (id !== authorId)
        return res
          .status(403)
          .send({ status: false, message: "You are not Authorized" });
    }
    if (req.body.authorId) {
      if (id && !isValidObjectId(id))
        return res
          .status(400)
          .send({ status: false, message: "Provide valid author id" });
      if (id != authorId) {
        return res
          .status(403)
          .send({ status: false, message: "You are not authorized" });
      }
    }
    next();
  } catch (error) {}
};
// console.log(filterQuery(isDeleted))
const authorCheckerForBlog = async (req, res, next) => {
  try {
    const id = req.body.authorId;
    if (Object.keys(req.body).length == 0)
      return res.status(400).send({ status: false, message: "Provide data" });
    if (id && !isValidObjectId(id))
      return res
        .status(400)
        .send({ status: false, message: "Provide valid author id" });
    const author = await authorModel.findById(id);
    if (!author)
      return res
        .status(404)
        .send({
          status: false,
          message: "Provide ID not Found in author database",
        });
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const verifyIdOfDeled = (req, res, next) => {
  try {
    const authorId = req.query.authorI;
    const blogId = req.params.blogId;

    if (authorId && !ObjectId.isValid(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid id" });
    }
    if (blogId && !ObjectId.isValid(blogId)) {
      return res
        .status(404)
        .send({ status: false, message: "Please enter a valid id" });
    }
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = {
  authorExists,
  authorizationFuc,
  isValidValue,
  blogExist,
  filterQueryPATH,
  authorAuthorizationCheck,
  verifyIdOfDeled,
  authorCheckerForBlog,
};
