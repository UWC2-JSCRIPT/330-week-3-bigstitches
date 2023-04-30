const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAuthorStats = async () => {
//  authorInfo is boolean
//  module.exports.getAuthorStats = async (authorInfo) => {
  console.log('IN GET AUTHOR DAOS: ');
  return Book.aggregate([
    { $group: { 
        _id: '$authorId',
        averagePageCount: { $avg: '$pageCount' },
        numBooks: { $sum: 1 },
        titles: { $push: '$title' }
      } 
    },
    {
      $project: {
        // suppress the id field
        _id: 0,
        authorId: '$_id',
        averagePageCount: '$averagePageCount',
        numBooks: '$numBooks',
        titles: '$titles'
      }
    }
  ]);

  // $addToSet

  // console.log( { $match: { authorId: new mongoose.Types.ObjectId(authorHex)} });
  /*
  return ( await Book.aggregate([
    // { $match: { authorId: new mongoose.Types.ObjectId(authorId),_id: new mongoose.Types.ObjectId(authorId)} },
    { $match: { authorId: new mongoose.Types.ObjectId(authorHex)} },
    //{ $match: { authorId: new mongoose.Types.ObjectId(authorId),_id: new mongoose.Types.ObjectId(authorId)} },
    //{ $match: { authorId: new mongoose.Types.ObjectId(authorId),_id: new mongoose.Types.ObjectId(authorId)} },
    // author, avg page count, num of books, titles
    // { $group: { authorId: '$authorId', averagePageCount: { $sum: '$pageCount' }, numBooks: { $sum: '$ISBN'} } }
  ]))[0]
  */
}

module.exports.getFullAuthorStats = (authorId) => {
  console.log( { $match: { authorId: new mongoose.Types.ObjectId(authorId)} });
  return Book.aggregate([
    { $match: { authorId: new mongoose.Types.ObjectId(authorId),} },
    { $lookup: {
      from: 'author',
      localField: 'title',
      foreignField: 'testBooks',
      as: 'titles'
    }},
    { $lookup: {
      from: 'author',
      localField: 'name',
      foreignField: 'savedAuthors',
      as: 'author'
    }},
    // author, avg page count, num of books, titles, names
    { $group: { _id: '$userId', count: { $sum: 1 }, sum: { $sum: '$charge'} } }
  ])
}

module.exports.search = async (page, perPage, query) => {
  if (query) {
    // Book.index;
    // Book.createIndexes({title: "text"});
    // unknown top level $title, changed back to 'title'
    // try { $text: { $search: query }} from https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/text/
    // must use $text, can't use $text?
    // CastError: Cast to ObjectId failed for value "1" (type number) at path "authorId" for model "books"
    // return Book.find({ authorId: 1, $text: { $search: query } }).limit(perPage).skip(perPage*page).lean();
    // get rid of author id in index
    // return ( await Book.find({ authorId, $text: { $search: query } }).limit(perPage).skip(perPage*page).lean())[0]
    // return null;
    // console.log('in query', query);
    const books = await Book.find({ $text: { $search: query } }).limit(perPage).skip(perPage*page).lean();
    // console.log('book', books, ' length: ', books.length);
    return books;
  } else {
    // return all
    return Book.find().limit(perPage).skip(perPage*page).lean();
  }
}

// module.exports.getAll = (userId, page, perPage) => {
module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getAllByAuthor = (authorId, page, perPage) => {
  // return Book.find().limit(perPage).skip(perPage*page).lean();
  return Book.find({ authorId }).limit(perPage).skip(perPage*page).lean();
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;