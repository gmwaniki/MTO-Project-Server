const signupmodels = require("../models/authModel");

module.exports.signuporg = async (req, res) => {
  const org = req.body;

  const { error, result } = await signupmodels.signuporg(org);
  error
    ? res.status(400).json({ error, result })
    : res.status(200).json({ error, result });
};
module.exports.signupmerchant = async (req, res) => {
  const merchant = req.body;
  const result = await signupmodels.signupmerchant(merchant);
  result.error
    ? res.status(400).json({ error: result.error, result: result.result })
    : res.status(200).json({ error: result.error, result: result.result });
};

module.exports.login = async (req, res) => {
  const credentials = req.body;
  
  const user = await signupmodels.login(credentials);
  if (user.checkPassword) {
    req.session.userid = user.email;
    
    return res.status(201).json({ error: user.error });
  } else {
    const { email, error, pass } = user;
    // console.log(`My pass:`, pass);
    res.status(400).json({ email, error, pass });
  }
};
