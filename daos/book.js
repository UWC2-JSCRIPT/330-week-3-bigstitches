const mongoose = require('mongoose');
// const author = require('../models/author');
const Book = require('../models/book');
// Book.createIndexes({ ISBN: 1 }, { unique: true });


module.exports = {};

module.exports.getAuthorStats = async (authorInfo) => {
  // authorInfo is boolean
  if (!authorInfo) {
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
  } else {
    return Book.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId', // field in the book collection
          // not working here, as type "String" != "ObjectId", we can search by any field but not "_id"
          foreignField: '_id', // field in the author collection
          as: 'author_docs'
        }
      },
      { 
        $group: { 
          _id: '$authorId',
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' },
          author: { $push: '$author_docs' }
        } 
      },
      {
        $unwind: '$author'
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          // suppress the id field
          _id: 0,
          author: 1,
          authorId: '$_id',
          averagePageCount: 1,
          numBooks: 1,
          titles: 1
        }
      }
    ]);
  }
}

module.exports.search = async (page, perPage, query) => {
  if (query) {
    const books = await Book.find({ $text: { $search: query } }).limit(perPage).skip(perPage*page).lean();
    return books;
  } else {
    // return all if no query
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
    console.log(created.ISBN);
    return created;

/*
    created.validate(async(bookData)=>{
      let isbn = bookData.ISBN;
      const ISBN_Count = await mongoose.models.books.countDocuments({isbn})
      return !ISBN_Count
    }, 'ISBN already exits')
    */
    // const tester = await Book.validate();
    // console.log('validated results: ',tester);
    //let err = created.validateSync();
    //assert.equal(error.errors['eggs'].message,'Too few eggs');
    //assert.ok(!error.errors['bacon']);
    //assert.equal(error.errors['drink'].message,'`Milk` is not a valid enum value for path `drink`.');
    //if (err) {
    //  throw new BadDataError(err.message);
    //} else {
    //  console.log(created.ISBN, ': ', err);
    //  return created;
    //}
  } catch (e) {
    console.log(e);
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;


/*


        "$unionWith": {
          "coll": author,
          "pipeline": [{"$match": { _id: { $toObjectId: "$authorId" } }}] // => ReferenceError: authorId is not defined
          // "pipeline": [{"$match": { _id: $authorId }}] // => ReferenceError: $authorId is not defined
          // "pipeline": [{"$match": { _id: '$authorId' }}] // => MongoServerError: $unionWith stage without explicit collection must have a pipeline with $documents as first stage
          // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId(authorId) }}] // => ReferenceError: authorId is not defined
          // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId($authorId) }}] // => ReferenceError: $authorId is not defined
          // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId('$authorId') }}] // => BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
        }

      {
        //$match: { authorId: new mongoose.Types.ObjectId('$authorId')} // => BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
        // $match: { authorId: ObjectId('$authorId')} // => ReferenceError: ObjectId is not defined
        //$match: { authorId: ObjectId('authorId')}
        //$match: { authorId: ObjectId($authorId)}
        //$match: { authorId: ObjectId(authorId)}
        //$match: { authorId: new mongoose.Types.ObjectId('authorId')}
        //$match: { authorId: new mongoose.Types.ObjectId($authorId)}
        // $match: { authorId: {$toObjectId : authorId}}
      },
      {
        $lookup: {
          from: 'author',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author_docs'
        }
      }





      { $lookup: {
          from: 'author',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author_docs'
        }
      },
      { $match: { authorId: new mongoose.Types.ObjectId(author_docs._id),} }




          return Book.aggregate([{
      "$unionWith": {
        "coll": author,
        // "pipeline": [{"$match": { _id: authorId }}] // => ReferenceError: authorId is not defined
        // "pipeline": [{"$match": { _id: $authorId }}] // => ReferenceError: $authorId is not defined
        // "pipeline": [{"$match": { _id: '$authorId' }}] // => MongoServerError: $unionWith stage without explicit collection must have a pipeline with $documents as first stage
        // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId(authorId) }}] // => ReferenceError: authorId is not defined
        // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId($authorId) }}] // => ReferenceError: $authorId is not defined
        // "pipeline": [{"$match": { _id: new mongoose.Types.ObjectId('$authorId') }}] // => BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
      }
    }]);


            /*
        $lookup: {
          from: 'author',
          // localField: 'authorId', // field in the book collection
          // foreignField: '_id', // field in the author collection
          pipeline: [
            { $match: { _id: mongoose.Types.ObjectId(authorId)}}
          ],
          as: 'author_docs'
        }
        */
        /*
        $lookup: {
          from: 'author',
          // localField: 'authorId',
          // foreignField: '_id',
          pipeline: [
            { $match: {'_id': { $toObjectId: 'authorId' } }}
          ],
          as: 'author_docs'
        }

        /*
        $lookup: {
          from: 'authors',
          // set variable 'bookAuthId' to Type ObjectID
          let: { bookAuthorId:  { $toObjectId: '$authorId'} },
          pipeline: [
            // bookAuthorId equals the author's collection '_id' variable
            { $match: { $expr: [ { _id: '$$bookAuthorId' } ]}},
            // keep it small for now
            { $project: { _id: 1 }}
          ],
          as: 'author_docs'
        }
        */


