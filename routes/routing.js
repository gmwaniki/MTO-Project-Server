const express = require("express");

const router = express.Router();
const authcontroller = require("../controller/AuthController");
const { checksignupvalues } = require("../middleware/checksignupdetails");

router.get("/", (req, res) => {
  res.json({ message: "Hello" });
});
router.get("/bye", (req, res) => {
  res.send("Good Bye");
});
router.post("/signuporg", checksignupvalues, authcontroller.signuporg);
router.post("/signupmerchant",checksignupvalues, authcontroller.signupmerchant);

module.exports = router;
