const { errorformatter } = require("../services/commontasks");
const { validationResult } = require("express-validator");
const checkforvalidationerrors = (req, res, next) => {
  const errorsinreq = validationResult(req).formatWith(errorformatter);
  // console.log(errorsinreq.mapped());

  if (!errorsinreq.isEmpty()) {
    res.status(400).json(errorsinreq.mapped());
    return;
  }
  next();
};

module.exports = { checkforvalidationerrors };
