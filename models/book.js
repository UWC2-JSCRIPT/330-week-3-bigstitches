// differnce between index and test; i've seen bookSchema.index({ title: 'text' });
// but i think instructor mentioned can only use one type of index once you start???
// index help when creating new vs xxx.index({fjdlfjd})
// postman, test didn't call my routes until i did in postman, weird?
const mongoose = require('mongoose');

const Author = require('./author');

const bookSchema = new mongoose.Schema({
  // title: { type: String, required: true },
  // title: { type: String, required: true, text: true, index: true },
  title: { type: String, required: true, index: true },
  genre: { type: String, index: true },
  ISBN: { type: String, required: true, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: Author, required: true, index: true },
  blurb: { type: String, index: true },
  publicationYear: { type: Number, required: true },
  pageCount: { type: Number, required: true }
});

//bookSchema.index({ title: 'text', authorId: 1 });
bookSchema.index({ title: 'text', blurb: 'text', genre: 'text' });
// bookSchema.index({ authorId: 1 });
// order matters
// bookSchema.index({ authorId: 1 });
// cant do this; cant use conditional with strung
// bookSchema.index({ authorId: 1, title: 1 });

module.exports = mongoose.model("books", bookSchema);