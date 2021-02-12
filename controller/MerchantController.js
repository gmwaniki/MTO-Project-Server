const {
  maketransaction,
  completerecipienttransaction,
  merchantdetails,
  previousmerchanttransactions,
  redeemtokens,
} = require("../models/merchantmodel");

exports.merchantdetails = async (req, res) => {
  const merchantid = req.session.userid;
  try {
    const results = await merchantdetails(merchantid);
    if (results.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(200).json({
      name: results.name,
      balance: results.balance,
      userid: results.userid,
      address: results.address,
    });
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
};

exports.previoustransactions = async (req, res) => {
  const merchantid = req.session.userid;
  try {
    const transactions = await previousmerchanttransactions(merchantid);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
};
exports.redeemtokens = async (req, res) => {
  const merchantid = req.session.userid;
  const amount = req.body.amount;
  try {
    const redeem = await redeemtokens(merchantid, amount);
    if (redeem?.error) {
      res.status(400).json({ error: redeem.error });
      return;
    }
    res.status(200).json({ balance: redeem?.balance });
  } catch (error) {
    res.status(500).json({ error: "Error occurred during redeem" });
  }
};

exports.maketransaction = async (req, res) => {
  const merchantid = req.session.userid;
  const idnumber = req.body.idnumber;
  const amount = req.body.amount;
  console.log(req.session);
  try {
    const results = await maketransaction(
      merchantid,
      idnumber,
      amount.toString()
    );
    if (results?.error.length) {
      res.status(400).json({ error: results.error });
      return;
    }
    res.status(200).send("Success");
    console.log("got results");
  } catch (error) {
    console.log(error);
    //   check error message to know what to reply
    res.status(500);
  }
};

exports.completetransaction = async (req, res) => {
  const merchantid = req.session.userid;
  const token = req.body.token;
  try {
    const result = await completerecipienttransaction(token, merchantid);
    if (result?.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(200).send("success");
  } catch (error) {
    res.status(500).json({ error: "Error Occurred" });
  }
};
