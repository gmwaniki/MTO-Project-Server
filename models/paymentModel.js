const Stripe = require("stripe");
const stripe = Stripe(process.env.stripekey);

const productsjson = require("../products.json");

module.exports.getPaymentIntent = async ({ productname }, orgid) => {
  let price = parseInt(productsjson[productname]?.price || 0);
  if (!price) {
    return { intent: "", error: "No price Match" };
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      // 250000
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
