const {
  addrecipient,
  deleterecipient,
  selectrecipients,
  updaterecipient,
} = require("../models/recipientsModel");

module.exports.addrecipients = async (req, res) => {
  // res.status(200).send("we arrived");

  let recipients = req.body;
  let organisationid = req.session.userid;
  try {
    let result = await addrecipient(recipients, organisationid);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports.selectrecipientsfororg = async (req, res) => {
  const organisationid = req.session.userid;

  try {
    let recipientsarray = await selectrecipients(organisationid);
    res.status(200).json(recipientsarray);
  } catch (error) {
    res.status(400).send("Error occurred");
  }
};

// delete
module.exports.deleterecipient = async (req, res) => {
  const { recipientid } = req.body;
  const organisationid = req.session.userid;
  try {
    console.log("started deleting");
    const results = await deleterecipient(recipientid, organisationid);
    res.status(200).send();
    return;
  } catch (error) {
    res.status(400).send(error.message);
    return;
  }
};
//block
module.exports.blockrecipient = async (req, res) => {};
// update
module.exports.updaterecipient = async (req, res) => {
  try {
    let { firstname, lastname, idnumber, mobilenumber, userid } = req.body;
    let isupdated = await updaterecipient({
      firstname,
      lastname,
      idnumber,
      mobilenumber,
      userid,
    });

    res.send(isupdated).status(200);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports.selectrecipienttransactions = async (req, res) => {};
