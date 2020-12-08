const signupmodels = require("../models/authModel");

module.exports.signuporg = async (req, res) => {
  const org = req.body;

  const result = await signupmodels.signuporg(org);
  result.error
    ? res.status(400).json({ error: result.error, result: result.result })
    : res.status(200).json({ error: result.error, result: result.result });
};
module.exports.signupmerchant = async (req, res) => {
  const merchant = req.body;
  const result = await signupmodels.signupmerchant(merchant);
  result.error
    ? res.status(400).json({ error: result.error, result: result.result })
    : res.status(200).json({ error: result.error, result: result.result });
};

module.exports.login = async (req, res) => {};
