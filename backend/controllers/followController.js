const User = require('../models/User');

// ── POST /api/follow/:id ──────────────────────────────────────────────────────
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId     = req.user._id.toString();

    if (targetId === myId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const target = await User.findById(targetId).select('name followers');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyFollowing = await User.exists({
      _id: myId,
      following: targetId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ success: false, message: 'Already following' });
    }

    // Atomic update — no full-document validation, safe for social-login users
    await Promise.all([
      User.updateOne({ _id: myId },     { $addToSet: { following: targetId } }),
      User.updateOne({ _id: targetId }, { $addToSet: { followers: myId } }),
    ]);

    const updated = await User.findById(targetId).select('followers');
    console.log(`[Follow] ${myId} → ${targetId}`);

    res.json({
      success: true,
      message: `Now following ${target.name}`,
      followersCount: updated.followers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/unfollow/:id ────────────────────────────────────────────────────
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId     = req.user._id.toString();

    const target = await User.findById(targetId).select('name followers');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Atomic update — no full-document validation
    await Promise.all([
      User.updateOne({ _id: myId },     { $pull: { following: targetId } }),
      User.updateOne({ _id: targetId }, { $pull: { followers: myId } }),
    ]);

    const updated = await User.findById(targetId).select('followers');

    res.json({
      success: true,
      message: `Unfollowed ${target.name}`,
      followersCount: updated.followers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ── GET /api/followers/:id ────────────────────────────────────────────────────
const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user   = await User.findById(userId)
      .populate('followers', 'name profileImage village district bio cropsGrown');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const myFollowing = (req.user.following || []).map(id => id.toString());
    const result = user.followers.map(f => {
      const obj = f.toObject ? f.toObject() : f;
      return { ...obj, isFollowing: myFollowing.includes(obj._id.toString()) };
    });

    res.json({ success: true, followers: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/following/:id ────────────────────────────────────────────────────
const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user   = await User.findById(userId)
      .populate('following', 'name profileImage village district bio cropsGrown');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const myFollowing = (req.user.following || []).map(id => id.toString());
    const result = user.following.map(f => {
      const obj = f.toObject ? f.toObject() : f;
      return { ...obj, isFollowing: myFollowing.includes(obj._id.toString()) };
    });

    res.json({ success: true, following: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/social/users — all users (except self) ──────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name profileImage village district state bio cropsGrown followers')
      .sort({ createdAt: -1 });

    const myFollowing = (req.user.following || []).map(id => id.toString());
    const result = users.map(u => ({
      ...u.toObject(),
      followersCount: u.followers.length,
      isFollowing: myFollowing.includes(u._id.toString()),
    }));

    res.json({ success: true, users: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/social/search?q=name ─────────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      _id:  { $ne: req.user._id },
    })
      .select('name profileImage village district followers')
      .limit(20);

    const myFollowing = req.user.following?.map(id => id.toString()) || [];
    const result = users.map(u => ({
      ...u.toJSON(),
      followersCount: u.followers.length,
      isFollowing: myFollowing.includes(u._id.toString()),
    }));

    res.json({ success: true, users: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing, searchUsers, getAllUsers };
