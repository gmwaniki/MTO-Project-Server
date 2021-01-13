// will handle org independent in dash functions
const {
  getorganisationdetails,
  sendtoallrecipients,
} = require("../models/organisationmodel");

module.exports.organisationdetails = async (req, res) => {
  const orguuid = req.session.uuid;
  let orgdetails;
  try {
    orgdetails = await getorganisationdetails(orguuid);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An Error Occured");
  }

  res.status(200).send(orgdetails);
};

// send to all recipients model

module.exports.sendtokenstoallrecipients = async (req, res) => {
  let amount, orguuid, orgid;
  amount = req.body.amount;
  orguuid = req.session.uuid;
  orgid = req.session.userid;

  try {
    let results = await sendtoallrecipients(amount, orguuid, orgid);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error Occured while sending");
  }
};
