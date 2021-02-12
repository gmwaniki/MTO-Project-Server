// will handle org independent in dash functions
const {
  getorganisationdetails,
  sendtoallrecipients,
  getRecipientTransactions,
  getOrganisationMerchants,
  getOtherMerchants,
  addmerchanttoorg,
  deletemerchantfromorg,
  sendtoarecipient,
} = require("../models/organisationmodel");

module.exports.organisationdetails = async (req, res) => {
  const orgid = req.session.userid;
  console.log(req.session);
  let orgdetails;
  try {
    orgdetails = await getorganisationdetails(orgid);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An Error Occured");
    return;
  }

  res.status(200).send(orgdetails);
};

// send to all recipients model

module.exports.sendtokenstoallrecipients = async (req, res) => {
  try {
    let results = await sendtoallrecipients(
      req.body.amount,
      req.session.userid
    );
    res.status(200).json(results);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error.message);
  }
};
module.exports.sendtokenstoarecipient = async (req, res) => {
  const orgid = req.session.userid;
  const amount = req.body.amount;
  const recipientid = req.body.recipientid;
  try {
    let result = await sendtoarecipient(amount, orgid, recipientid);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
};

module.exports.getOrgRecipientTransaction = async (req, res) => {
  let orgid = req.session.userid;
  let recipientid = req.body.recipientid;
  try {
    let results = await getRecipientTransactions(recipientid, orgid);
    res.send(results);
  } catch (error) {
    res.status(500).send("An Error Occured retreiving the data");
  }
};

module.exports.getmerchantsbyorgid = async (req, res) => {
  let orgid = req.session.userid;
  try {
    let result = await getOrganisationMerchants(orgid);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An Error Occurred on the server" });
  }
};
module.exports.getothermerchantsbyorgid = async (req, res) => {
  let orgid = req.session.userid;
  try {
    let result = await getOtherMerchants(orgid);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "An Error Occurred on the server" });
  }
};

module.exports.addmerchantoorg = async (req, res) => {
  let orgid = req.session.userid;
  let merchantid = req.body.userid;
  // console.log(merchantid);
  try {
    let result = await addmerchanttoorg(orgid, merchantid);
    res.status(200).json({ userid: result });
  } catch (error) {
    res.status(500).json({ error: "Error Occured" });
  }
};
module.exports.removemerchantfromorg = async (req, res) => {
  let orgid = req.session.userid;
  let merchantid = req.body.userid;
  try {
    let result = await deletemerchantfromorg(orgid, merchantid);
    res.status(200).json({ userid: result });
  } catch (error) {
    res.status(400).json({ error: "Error Occcurred during delete" });
  }
};
