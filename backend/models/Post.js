const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:    { type: String, required: true, trim: true, maxlength: 300 },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  emoji:   { type: String, default: '🌾' },
  caption: { type: String, required: true, trim: true, maxlength: 300 },
  image:   { type: String, default: '' },          // optional image URL
  bg:      { type: String, default: '#E8F5E9' },   // background color for emoji posts
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
}, { timestamps: true });

// Virtual: likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// Virtual: comments count
postSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
