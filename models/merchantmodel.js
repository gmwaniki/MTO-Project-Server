const { nanoid } = require("nanoid");
const {
  recordtransfer,
  selectuser,
  getPreviousTransaction,
} = require("../services/commondbtasks");
const { transferovergsn } = require("../services/contractinteraction");
const { pool } = require("../services/dbconnection");
const { sendsms } = require("../services/sendsms");
const { accountbalance } = require("../services/tokenclass");

// get the organisation name
module.exports.merchantdetails = async (merchantid) => {
  const sql = "select * from merchant where userid=$1";
  const values = [merchantid];
  try {
    const result = await pool.query(sql, values);
    const { storename, userid } = result.rows[0];
    const { balance, address } = await accountbalance(userid);
    return { name: storename, balance, userid, address };
  } catch (error) {
    return { error: error.message };
  }
};

module.exports.previousmerchanttransactions = async (merchantid) => {
  const transactions = await getPreviousTransaction(merchantid);
  return transactions;
};

module.exports.redeemtokens = async (merchantid, amount) => {
  console.log("reddem amount", amount);
  const { balance } = await accountbalance(merchantid);
  console.log("your", balance);
  if (parseInt(balance) >= parseInt(amount)) {
    const { TxHash } = await transferovergsn(merchantid, 0, amount);
    const record = await recordtransfer(merchantid, 0, TxHash);
    const { mobilenumber } = await selectuser(merchantid);
    await sendsms(
      `+${mobilenumber}`,
      `You have just withdrawn ${amount} from your MTOG account`
    );
    const { balance: balance2 } = await accountbalance(merchantid);
    return { balance: balance2 };
  } else {
    return { error: "No sufficient funds" };
    // throw new Error("No sufficient funds");
  }
};

module.exports.maketransaction = async (
  merchantid,
  recipientidnumber,
  amount
) => {
  //
  const token = nanoid(8);
  const sql = "select * from recipient where idnumber=$1";
  const values = [recipientidnumber];
  try {
    const recipient = await pool.query(sql, values);
    if (recipient.rowCount) {
      // continue processing
      const { organisationid, mobilenumber, userid } = recipient.rows[0];
      const { balance } = await accountbalance(userid);
      // check balance
      if (balance >= parseInt(amount)) {
        console.log("enough money");
        // Continue processing
        //check if merchant id under same or as
        const merchantsql =
          "select merchant.userid,merchant.firstname,merchant.storename,merchant.lastname,organisation_merchants.organisationid from merchant inner join organisation_merchants on  merchant.userid=organisation_merchants.merchantid and organisation_merchants.organisationid=$1 and organisation_merchants.merchantid=$2 ";
        const values = [organisationid, merchantid];
        const merchantresults = await pool.query(merchantsql, values);
        if (merchantresults.rowCount) {
          // insert token into db
          console.log("Merchant under org");
          const {
            userid: merchantid,
            firstname,
            lastname,
            storename,
          } = merchantresults.rows[0];
          const inserttokenintodb =
            "insert into recipienttokens (recipientid,merchantid,token,amount) values($1,$2,$3,$4)";
          const values = [userid, merchantid, token, parseInt(amount)];
          // send otp to recipient
          const inserttoken = await pool.query(inserttokenintodb, values);
          if (inserttoken.rowCount) {
            console.log("Inserted");
            await sendsms(
              `+${mobilenumber}`,
              `Purchase started at ${storename} by ${firstname} ${lastname} your transaction code is ${token} `
            );
            return;
          } else {
            throw new Error("Error Occured inserting into db ");
          }
        } else {
          return { error: "You cannot perform this transaction" };
        }
      } else {
        // Send recipient a message
        await sendsms(
          `+${mobilenumber}`,
          ` Insufficiant balance BALANCE:${balance}`
        );
        return { error: "Error Occurred transferring" };
      }
    } else {
      return { error: "No Recipient Found" };
    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  // will recieve the merchant id from session
  // recipients idnumber
  // amount of tokens

  //  get recipient by id X
  // get recipients balance X
  // get recipients organisationX
  // select from organisation merchants where the merchant id is and recipient org id is X
  // check if merchant is in that organisation X
  // create token  save in token table
  // send message to recipient if merchant is set X
};

exports.completerecipienttransaction = async (transactioncode, merchantid) => {
  // inputs- recipient transaction code and merchants id

  const sql = "select * from recipienttokens where token=$1 and merchantid=$2";
  const values = [transactioncode, merchantid];

  try {
    let tokenresult = await pool.query(sql, values);
    if (tokenresult.rowCount) {
      const {
        timestamp,
        token,
        merchantid,
        recipientid,
        amount,
      } = tokenresult.rows[0];
      // Check if timestamp is still valid
      const tokendate = new Date(timestamp).getTime();
      const datenow = new Date().getTime();
      const timedifference = (datenow - tokendate) / 1000 / 60;
      if (timedifference < 10) {
        // perform the transfer from recipient to merchant
        let { TxHash } = await transferovergsn(recipientid, merchantid, amount);
        let transfer = await recordtransfer(recipientid, merchantid, TxHash);
        const { mobilenumber } = await selectuser(recipientid);

        const merchantsql = "select * from merchant where userid=$1";
        const merchantvalues = [merchantid];
        const { storename, firstname, lastname } = await (
          await pool.query(merchantsql, merchantvalues)
        ).rows[0];
        const { balance } = await accountbalance(recipientid);
        console.log(
          `+${mobilenumber}`,
          `Transaction at ${storename} complete new balance `
        );
        await sendsms(
          `+${mobilenumber}`,
          `Transaction at ${storename} complete new balance is ${balance}`
        );
        const deletesql =
          "delete from recipienttokens where token=$1 and merchantid=$2";
        const deletevalues = [transactioncode, merchantid];
        const deleteresult = await pool.query(deletesql, deletevalues);
      } else {
        // delete from the database
        return { error: "Code has expired" };
      }
      return;
    } else {
      return { error: "Incorrect Code" };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error occured verifying token");
  }

  // checks  for a similar code and merchantid in database
  // gets code if present and checks time
  // time limit is set to 5 minutes

  // checks for code in db where the merchants id is set and also sametoken
  //
};
