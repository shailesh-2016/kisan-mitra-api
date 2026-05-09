const Post = require('../models/Post');
const User = require('../models/User');

// ── POST /api/post/create ─────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { emoji, caption, image, bg } = req.body;
    if (!caption?.trim()) {
      return res.status(400).json({ success: false, message: 'Caption is required' });
    }
    const post = await Post.create({
      user:    req.user._id,
      emoji:   emoji   || '🌾',
      caption: caption.trim(),
      image:   image   || '',
      bg:      bg      || '#E8F5E9',
    });
    await post.populate('user', 'name profileImage village district');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/post/user/:id ────────────────────────────────────────────────────
const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user._id : req.params.id;
    const posts  = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage village district');

    // Attach isLiked flag for requesting user
    const myId = req.user._id.toString();
    const result = posts.map(p => ({
      ...p.toJSON(),
      isLiked: p.likes.some(id => id.toString() === myId),
    }));

    res.json({ success: true, posts: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/post/feed ────────────────────────────────────────────────────────
// Posts from people the current user follows + own posts
const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('following');
    const ids = [...(me?.following || []), req.user._id];
    const posts = await Post.find({ user: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name profileImage village district');

    const myId = req.user._id.toString();
    const result = posts.map(p => ({
      ...p.toJSON(),
      isLiked: p.likes.some(id => id.toString() === myId),
    }));

    res.json({ success: true, posts: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/post/:id/like ───────────────────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const post  = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const myId   = req.user._id.toString();
    const liked  = post.likes.some(id => id.toString() === myId);

    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== myId);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ success: true, liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/post/:id/comment ────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text required' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();
    await post.populate('comments.user', 'name profileImage');

    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/post/:id ──────────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPost, getUserPosts, getFeed, toggleLike, addComment, deletePost };
