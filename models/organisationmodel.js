// handles all org info requests like previous transactions and org details
const {
  selectuser,
  selectrecipientsbyorguserid,
  recordtransfer,
  getPreviousTransaction,
} = require("../services/commondbtasks");
const { transferovergsn } = require("../services/contractinteraction");
const { pool } = require("../services/dbconnection");
const { sendsms } = require("../services/sendsms");
const { accountbalance } = require("../services/tokenclass");

// get organisation information
// function receiving org  returns results

module.exports.getorganisationdetails = async (orgid) => {
  let orgdetails;
  const sql = "SELECT * FROM organisation WHERE userid=$1";
  const values = [orgid];
  try {
    orgdetails = await pool.query(sql, values);
    // console.log(orgdetails.rows);
  } catch (error) {
    console.log("From select ", error.message);
    throw new Error(error.message);
  }

  const { name, userid } = orgdetails.rows[0];
  let { balance, address } = await accountbalance(userid);
  balance = parseInt(balance);

  // let balance = 0;
  // let balance =10;
  return { name, balance, address };
};

// from org to recipient transfer -> sms to recipient

module.exports.sendtoallrecipients = async (amount, orgid) => {
  // check org balance
  try {
    amount = parseInt(amount);
    const { balance } = await this.getorganisationdetails(orgid);
    if (amount > balance) {
      throw new Error("Amount is more Than Balance");
    }
    // get recipients from db
    const orgrecipients = await selectrecipientsbyorguserid(orgid);
    // get number of recipients
    const recipientslength = orgrecipients.length;
    // divide amount to per recipients
    let amountperrecipient = amount / recipientslength;

    let fullfilled = [];

    for (const { userid } of orgrecipients) {
      fullfilled.push(
        Promise.resolve({
          userid,
          transaction: await transferovergsn(orgid, userid, amountperrecipient),
        })
      );
    }
    let arrayoffullfilledpromises = await Promise.all(fullfilled);
    console.log(arrayoffullfilledpromises);

    let results = arrayoffullfilledpromises.map(async (result) => {
      // if the transaction was successful add to db

      let recipientid = await recordtransfer(
        orgid,
        result.userid,
        result.transaction.TxHash
      );
      const { mobilenumber } = await selectuser(result.userid);
      const { balance: balance2 } = await accountbalance(result.userid);
      await sendsms(
        `+${mobilenumber}`,
        `You have recived ${amountperrecipient} MTOG Tokens your new balance is ${balance2}`
      );
      return {
        userid: result.userid,
      };
    });
    let returnresults = await Promise.all(results);
    console.log(returnresults);
    return returnresults;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

module.exports.sendtoarecipient = async (amount, orgid, recipientid) => {
  try {
    amount = parseInt(amount);
    const { balance } = await this.getorganisationdetails(orgid);
    if (amount > balance) {
      throw new Error("Amount is more Than Balance");
    }
    const { mobilenumber } = await selectuser(recipientid);
    const { TxHash } = await transferovergsn(orgid, recipientid, amount);
    let recipientd = await recordtransfer(orgid, recipientid, TxHash);
    const { balance: balance2 } = await accountbalance(recipientid);
    await sendsms(
      `+${mobilenumber}`,
      `You have recived ${amount} MTOG Tokens new balance is ${balance2}`
    );
    return {
      userid: recipientid,
      balance: balance2,
    };
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

// get previous transactions for recipients

module.exports.getRecipientTransactions = async (recipientid, orgid) => {
  const sql = "SELECT * FROM recipient WHERE userid=$1 AND organisationid=$2";
  const values = [recipientid, orgid];
  try {
    let result = await pool.query(sql, values);
    // console.log(result.rows);
    if (!result.rowCount) {
      throw new Error("No user found");
    }
    let { userid } = result.rows[0];
    let transactions = await getPreviousTransaction(userid);
    return transactions;
  } catch (error) {
    console.log(error);
    throw new Error("Error Occured during action");
  }
};

exports.getOrganisationMerchants = async (organistionid) => {
  const sql =
    "select merchant.userid,merchant.firstname,merchant.lastname,merchant.storename,organisation_merchants.organisationid from merchant inner join organisation_merchants ON merchant.userid = organisation_merchants.merchantid where organisation_merchants.organisationid=$1; ";
  const values = [organistionid];

  try {
    const result = await pool.query(sql, values);
    const orgmerchants = result.rows.map(async (merchant) => {
      let transactions = await getPreviousTransaction(merchant.userid);
      return {
        id: merchant.userid,
        name: `${merchant.firstname} ${merchant.lastname}`,
        storename: merchant.storename,
        transactions: transactions.length,
      };
    });
    const listoforgmerchant = await Promise.all(orgmerchants);

    return listoforgmerchant;
  } catch (error) {
    console.log(error.message);
  }
};
exports.getOtherMerchants = async (organistionid) => {
  const sql =
    "select merchant.userid,merchant.firstname,merchant.lastname,merchant.storename,organisation_merchants.organisationid from merchant left join organisation_merchants on  merchant.userid=organisation_merchants.merchantid and organisation_merchants.organisationid=$1 where organisation_merchants.merchantid is null";

  const values = [organistionid];

  try {
    const result = await pool.query(sql, values);
    console.log("From db", result.rows);
    const orgmerchants = result.rows.map(async (merchant) => {
      let transactions = await getPreviousTransaction(merchant.userid);
      return {
        id: merchant.userid,
        name: `${merchant.firstname} ${merchant.lastname}`,
        storename: merchant.storename,
        transactions: transactions.length,
      };
    });
    const listoforgmerchant = await Promise.all(orgmerchants);
    // console.log(await Promise.all(orgmerchants));
    // console.log("From DB", result.rows);
    return listoforgmerchant;
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
};

exports.addmerchanttoorg = async (orgid, merchantid) => {
  const sql =
    "insert into organisation_merchants (merchantid,organisationid) values($1,$2) returning merchantid";
  const values = [merchantid, orgid];

  try {
    const result = await pool.query(sql, values);

    return result.rows[0].merchantid;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error Occurred");
  }
};
exports.deletemerchantfromorg = async (orgid, merchantid) => {
  const sql =
    "delete from organisation_merchants where merchantid=$1 and organisationid=$2 ";
  const values = [merchantid, orgid];

  try {
    const result = await pool.query(sql, values);
    if (result.rowCount) {
      return merchantid;
    } else {
      throw new Error("Delete unsuccessfull");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Error Occurred");
  }
};

// function receives a id checks if id is under the organisation

// if it is get user records from token_transaction where this id is sender or
// receiver in descending order according to the timestamp
// map through each record call the gettransactions function
// and return a promise with an object with sendername,
// senderid,amount,recivername,receiverid

// function in commonlogic where all transactions of a used can be returned in order
