const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello");
});
router.get("/bye", (req, res) => {
  res.send("Good Bye");
});

module.exports = router;
