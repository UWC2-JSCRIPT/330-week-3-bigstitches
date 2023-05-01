const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post("/", async (req, res, _next) => {
  const book = req.body;
  // console.log(book);
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else if (e.code === 11000 ) {
        res.status(400).send(`${e.keyValue} is not unique`);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Read - search all books
router.get("/search", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  // console.log(query);
  const searchResults = await bookDAO.search(page, perPage, query);
  res.json(searchResults);
});

// Read - transaction stats
router.get("/authors/stats", async (req, res, next) => {
  const { authorInfo } = req.query;
  const stats = await bookDAO.getAuthorStats(authorInfo);
  res.json(stats);
});


// Read - single book
router.get("/:id", async (req, res, _next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

// Read - all books
router.get("/", async (req, res, _next) => {
  //console.log(req.query);
  let { authorId } = req.query;
  let { page, perPage } = req.query;
  //let { search } = req.query;
  //console.log(search, " ", req.originalUrl);
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;

  if ( authorId != undefined ) {
    const books = await bookDAO.getAllByAuthor(authorId, page, perPage);
    res.json(books);
  } else {
    const books = await bookDAO.getAll(page, perPage);
    res.json(books);
  }
});

// Update
router.put("/:id", async (req, res, _next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, _next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;