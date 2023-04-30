const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post("/", async (req, res, _next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
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
  // console.log('in /authors/stats');
  // const authorInfo = req.params.authorInfo;
  // oh no, use {} for params!!
  const { authorInfo } = req.query;
  const authorId = req.params.authorId;
  console.log('id: ', req.params.authorId);
  console.log('query: ', req.query);
  console.log('in route: URL: ', req.originalUrl);
  console.log('3: ', req.path);
  console.log('4: ', req.headers);
  console.log('5: ', req.body);
  console.log('6: ', req.params);
  console.log('7: ', req.subdomains);
  // ooooooh, should just return ALLLLL authors' STATS!!
  const stats = await bookDAO.getAuthorStats();
  console.log(stats);
  // res.json(stats[stats.length - 1]);
  res.json(stats);
  /*
  if (authorInfo) {
    // const stats = bookDAO.getFullAuthorStats(authorId);
    const stats = null;
    res.json(stats);
  } else {
    const stats = bookDAO.getAuthorStats(authorId);
    res.json(stats);
  }
  */
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