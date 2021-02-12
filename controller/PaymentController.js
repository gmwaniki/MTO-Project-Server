const {
  getPaymentIntent,
  paymentfromwebhook,
} = require("../models/paymentModel");

const endpointsecret = "whsec_xOIjfs5dfjlILXVc7jRq93vW8W2mmanN";
const stripe = require("stripe")(process.env.stripekey);

module.exports.paymentIntent = async (req, res) => {
  let orgid = req.session.userid;
  const { intent, error } = await getPaymentIntent(req.body, orgid);
  if (!error) {
    res.json({ client_secret: intent, error });
  } else {
    res.status(400).json({ client_secret: intent, error });
  }
};

module.exports.paymentsuccesswebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointsecret);
  } catch (error) {
    res.status(400).send(`Webhook Error:${error.message}`);
  }

  res.json({ received: true });
  console.log(event);
  let amount = parseInt(event.data.object.amount_received) / 100;
  let userid = event.data.object.charges.data[0].metadata.userid;
  let email = event.data.object.charges.data[0].billing_details.email;
  console.log(`Amount`, amount);
  console.log(`userid`, userid);
  console.log(`Email`, email);
  const result = await paymentfromwebhook(userid, amount).catch((error) => {
    console.log(`From controller:`, error);
  });
};
