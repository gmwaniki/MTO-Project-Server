const Stripe = require("stripe");
require("dotenv").config();
const stripe = Stripe(process.env.stripekey);



const productsjson = require("../products.json");
const { recordtransfer, selectuser } = require("../services/commondbtasks");
const { transferovergsn } = require("../services/contractinteraction");

module.exports.getPaymentIntent = async ({ productname }, orgid) => {
  let price = parseInt(productsjson[productname]?.price || 0);
  if (!price) {
    return { intent: "", error: "No price Match" };
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: "kes",
      metadata: { integration_check: "accept_a_paymant", userid: orgid },
    });

    if (paymentIntent.amount >= 250000) {
      return { intent: paymentIntent.client_secret, error: "" };
    }
  } catch (error) {
    console.log(error);
    return { intent: "", error: error.message };
  }

  return { intent: "", error: "No price Match" };
};

// model to transfer tokens and poulate transactions table for system to organisation

module.exports.paymentfromwebhook = async (receiverid, amount) => {
  
  let receiveraccountid = parseInt(receiverid);
  let txhash;
  try {
    let { TxHash } = await transferovergsn(0, receiveraccountid, amount);
    txhash = TxHash;
  } catch (error) {
    console.log(`From Transfer:`, error);
  }

  await recordtransfer(0, receiverid, txhash).catch((error) =>
    console.log(error)
  );
};

// from org to recipient transfer -> sms to recipient

// from recipient to merchant -> sms verification code
// from merchant to system
