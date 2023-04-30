const router = require('express').Router();
const {createBlog, getBlog, updateBlog, deleteBlogById, deleteBlogByQuery} = require('../controller/blogController');
const { createAuthor, authorLogin } = require('../controller/authorcontroller')
const { authorizationFuc, authorAuthorizationCheck, authorCheckerForBlog, verifyIdOfDeled } = require('../middleware/auth');

router.post('/authors', createAuthor)
router.post('/login', authorLogin)
router.post('/blogs', authorizationFuc,authorCheckerForBlog, createBlog)
router.get('/blogs', authorizationFuc, getBlog)
router.put('/blogs/:blogId', authorizationFuc,authorAuthorizationCheck ,updateBlog)
router.delete('/blogs/:blogId', authorizationFuc, deleteBlogById)
router.delete('/blogs', verifyIdOfDeled,authorizationFuc,authorAuthorizationCheck, deleteBlogByQuery)

module.exports = router;