const jwt = require("jsonwebtoken");
const authorModel = require("../model/authorModel");
const { isValidObjectId } = require("mongoose");

const SECRETE_KEY = "cvfyguhijokp567890";

// Middleware to check authorization
const authorizationFunc = (req, res, next) => {
  try {
    const token = req.headers["x-api-key"];
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "Provide credentials headers token" });

    const decodedToken = jwt.verify(token, SECRETE_KEY);
    req.authorId = decodedToken.authorId;
    next();
  } catch (error) {
    if (
      error.message.includes("signature") ||
      error.message.includes("token") ||
      error.message.includes("malformed")
    ) {
      return res
        .status(403)
        .send({ status: false, message: "You are not Authenticated" });
    }
    res.status(400).send({ status: false, message: error.message });
  }
};

// Check if value is valid (not undefined, null, or an empty string)
const isValidValue = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
 
// Check if query contains valid paths
const filterQueryPATH = (query) => {
  const arr = ["authorId", "category", "subcategory", "tags"];
  if (query.length > 0) {
    const filteredQuery = query.filter((x) => {
      return arr.includes(x);
    });
    if (filteredQuery.length > 0) {
      return true;
    }
    return false;
  }
  return false;
};

// Middleware to check author authorization for a specific blog
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
  } catch (error) {
    // Handle errors
  }
};

// Middleware to check author existence for a blog
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

// Middleware to verify IDs for deletion
const verifyIdOfDeleted = (req, res, next) => {
  try {
    const authorId = req.query.authorId;
    const blogId = req.params.blogId;

    if (authorId && !ObjectId.isValid(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid author ID" });
    }
    if (blogId && !ObjectId.isValid(blogId)) {
      return res
        .status(404)
        .send({ status: false, message: "Please enter a valid blog ID" });
    }
    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  authorizationFunc,
  isValidValue,
  filterQueryPATH,
  authorAuthorizationCheck,
  verifyIdOfDeleted,
  authorCheckerForBlog,
};
