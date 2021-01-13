const express = require("express");
const { paymentsuccesswebhook } = require("../controller/PaymentController");

const bodyParser = require("body-parser");

const router = express.Router();

router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  paymentsuccesswebhook
);

module.exports = router;
