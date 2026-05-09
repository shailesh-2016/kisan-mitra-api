const express = require('express');
const router  = express.Router();
const {
  followUser, unfollowUser,
  getFollowers, getFollowing, searchUsers, getAllUsers,
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// POST   /api/social/follow/:id      — follow a user
router.post('/follow/:id', followUser);

// POST   /api/social/unfollow/:id    — unfollow a user
router.post('/unfollow/:id', unfollowUser);

// GET    /api/social/followers/:id   — get followers list (use 'me' for own)
router.get('/followers/:id', getFollowers);

// GET    /api/social/following/:id   — get following list (use 'me' for own)
router.get('/following/:id', getFollowing);

// GET    /api/social/users           — get all users (for farmers screen)
router.get('/users', getAllUsers);

// GET    /api/social/search?q=name   — search farmers
router.get('/search', searchUsers);

module.exports = router;
