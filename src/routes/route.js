const router = require('express').Router();
const {
  createBlog,
  getBlog,
  updateBlog,
  deleteBlogById,
  deleteBlogByQuery
} = require('../controller/blogController');
const {
  createAuthor,
  authorLogin
} = require('../controller/authorcontroller');
const {
  authorizationFunc,
  authorAuthorizationCheck,
  authorCheckerForBlog,
  verifyIdOfDeleted
} = require('../middleware/auth');

// Create a new author
router.post('/authors', createAuthor);

// Author login
router.post('/login', authorLogin);

// Create a new blog
router.post(
  '/blogs',
  authorizationFunc,
  authorCheckerForBlog,
  createBlog
);

// Get blogs
router.get('/blogs', authorizationFunc, getBlog);

// Update a blog
router.put(
  '/blogs/:blogId',
  authorizationFunc,
  authorAuthorizationCheck,
  updateBlog
);

// Delete a blog by ID
router.delete('/blogs/:blogId', authorizationFunc, deleteBlogById);

// Delete blogs by query
router.delete(
  '/blogs',
  verifyIdOfDeleted,
  authorizationFunc,
  authorAuthorizationCheck,
  deleteBlogByQuery
);

module.exports = router;
