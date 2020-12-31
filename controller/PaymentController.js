const { getPaymentIntent } = require("../models/paymentModel");

module.exports.paymentIntent = async (req, res) => {
  let orgid = req.session.uuid;
  const { intent, error } = await getPaymentIntent(req.body, orgid);
  if (!error) {
    res.json({ client_secret: intent, error });
  } else {
    res.status(400).json({ client_secret: intent, error });
  }
};

module.exports.paymentsuccesswebhook = (req, res) => {
  res.json({ received: true });
  console.log(req.body);
  let amount = req.body.data.object.amount_received;
  let uuid = req.body.data.object.charges.data[0].metadata.userid;
  let email = req.body.data.object.charges.data[0].billing_details.email;
  console.log(`Amount`, amount);
  console.log(`uuid`, uuid);
  console.log(`Email`, email);
};
