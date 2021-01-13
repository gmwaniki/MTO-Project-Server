const {
  addrecipient,
  deleterecipient,
  selectrecipients,
  updaterecipient,
} = require("../models/recipientsModel");

module.exports.addrecipients = async (req, res) => {
  let recipients = req.body;
  let organisationid = req.session.userid;
  let organisationuuid = req.session.uuid;
  console.log(organisationid);
  try {
    let result = await addrecipient(
      recipients,
      organisationid,
      organisationuuid
    );
    res.status(200).json({ message: "done" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.selectrecipientsfororg = async (req, res) => {
  const organisationid = req.session.uuid;

  try {
    let recipientsarray = await selectrecipients(organisationid);
    res.status(200).json(recipientsarray);
  } catch (error) {
    res.status(500).send("Error occurred");
  }
};

// delete
module.exports.deleterecipient = async (req, res) => {
  const { recipientuuid } = req.body;
  try {
    await deleterecipient(recipientuuid);
    res.status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
//block
module.exports.blockrecipient = async (req, res) => {};
// update
module.exports.updaterecipient = async (req, res) => {
  try {
    let { firstname, lastname, idnumber, mobilenumber, uuid } = req.body;
    await updaterecipient({
      firstname,
      lastname,
      idnumber,
      mobilenumber,
      uuid,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports.selectrecipienttransactions = async (req, res) => {};
