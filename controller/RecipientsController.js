const recipientsmodel = require("../models/recipientsModel");

module.exports.addrecipients = async (req, res) => {
  let recipients = req.body;
  let organisationid = req.session.userid;
  console.log(organisationid);
  try {
    let result = await recipientsmodel.addrecipient(recipients, organisationid);
    res.status(200).json({ message: "done" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.selectrecipientsfororg = async (req, res) => {
  const organisationid = req.session.userid;

  try {
    let recipientsarray = await recipientsmodel.selectrecipients(
      organisationid
    );
    res.status(200).json(recipientsarray);
  } catch (error) {
    res.status(400).json({ error: "Error occurred" });
  }
};

// delete
module.exports.deleterecipient = async (req, res) => {};
//block
module.exports.blockrecipient = async (req, res) => {};
// update
module.exports.updaterecipient = async (req, res) => {};
