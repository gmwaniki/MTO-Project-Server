const authmodel = require("../models/authModel");

module.exports.signuporg = async (req, res) => {
  const { error, result } = await authmodel.signuporg({ ...req.body });
  error
    ? res.status(400).json({ error, result })
    : res.status(200).json({ error, result });
};
module.exports.signupmerchant = async (req, res) => {
  const result = await authmodel.signupmerchant({ ...req.body });
  result.error
    ? res.status(400).json({ error: result.error, result: result.result })
    : res.status(200).json({ error: result.error, result: result.result });
};

module.exports.login = async (req, res) => {
  const user = await authmodel.login({ ...req.body });
  if (user.checkPassword) {
    req.session.userid = user.userid;
    req.session.role = user.role;
    req.session.email = user.email;

    return res.status(200).json({ error: user.error, role: user.role });
  } else {
    const { email, error, password } = user;
    // console.log(`My pass:`, pass);
    res.status(400).json({ email, error, password });
  }
};

//Check userid in form validate
module.exports.checkid = async (req, res) => {
  res.status(200).send("Success");
};
module.exports.checkmobilenumber = async (req, res) => {
  res.status(200).send("Success");
};
module.exports.checkemail = async (req, res) => {
  res.status(200).send("Success");
};
