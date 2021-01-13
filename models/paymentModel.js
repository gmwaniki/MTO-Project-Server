const Stripe = require("stripe");
require("dotenv").config();
const stripe = Stripe(process.env.stripekey);
const { pool } = require("../services/dbconnection");
const { transfer } = require("../services/tokenclass");
const { v4: uuidv4 } = require("uuid");

const productsjson = require("../products.json");
const { recordtransfer, selectuser } = require("../services/commondbtasks");

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

// model to transfer tokens and poulate transactions table for system to organisation

module.exports.paymentfromwebhook = async (receiveruuid, amount) => {
  //get user details from the database
  let organisation;

  try {
    organisation = await selectuser(receiveruuid);
  } catch (error) {
    if (error) {
      console.log(`from Select`, error);
    }
  }

  let receiverindex = parseInt(organisation.index);
  let txhash;
  try {
    txhash = await transfer(0, receiverindex, amount);
  } catch (error) {
    console.log(`From Transfer:`, error);
  }

  await recordtransfer(0, receiveruuid, txhash).catch((error) =>
    console.log(error)
  );

  // let sendername = "MTOG System";
  // let senderrole = "system";
  // let senderuuid = 0;
  // let recivername = organisation.rows[0].orgname;
  // let receiverrole = organisation.rows[0].role;
  // let tuid = uuidv4();

  // if (txhash) {
  //   const insertsql =
  //     "INSERT INTO token_transactions(sender_name,sender_role,sender_uuid,receiver_name,receiver_role,receiver_uuid,txhash,tuid) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *";
  //   const values = [
  //     sendername,
  //     senderrole,
  //     senderuuid,
  //     recivername,
  //     receiverrole,
  //     receiveruuid,
  //     txhash,
  //     tuid,
  //   ];
  //   try {
  //     const inserttotransactiontable = await pool.query(insertsql, values);
  //     console.log(inserttotransactiontable.rows);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // get index and pass it to transfer function with amount and sender index as 0
  // on transaction hash insert into token transactions table
  // Sender name is MTOG System sender_role is system  senderuuid =0 receivername=orgname role=org,receiveruuid =uuid hashis txhash,timestamp,tuid =uuid
};

// from org to recipient transfer -> sms to recipient

// from recipient to merchant -> sms verification code
// from merchant to system
