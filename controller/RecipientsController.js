const recipientsmodel = require("../models/recipientsModel");

module.exports.addrecipients = async (req, res) => {
  let recipients = req.body;
  let result = await recipientsmodel.addrecipient(recipients);
  res.status(200).json({ message: "done" });
};
