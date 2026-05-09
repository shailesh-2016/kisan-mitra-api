const express = require('express');
const router  = express.Router();
const {
  createPost, getUserPosts, getFeed,
  toggleLike, addComment, deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// All routes require auth
router.use(protect);

// POST   /api/post/create          — create a new post
router.post('/create', createPost);

// GET    /api/post/feed            — get feed (following + own posts)
router.get('/feed', getFeed);

// GET    /api/post/user/:id        — get posts by user (use 'me' for own)
router.get('/user/:id', getUserPosts);

// POST   /api/post/:id/like        — toggle like on a post
router.post('/:id/like', toggleLike);

// POST   /api/post/:id/comment     — add comment to a post
router.post('/:id/comment', addComment);

// DELETE /api/post/:id             — delete own post
router.delete('/:id', deletePost);

module.exports = router;
