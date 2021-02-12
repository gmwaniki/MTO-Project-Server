const { pool } = require("./dbconnection");
const { gettransactiondata } = require("./contractinteraction");
const { parsePhoneNumber } = require("libphonenumber-js");

module.exports.recordtransfer = async (senderid, receiverid, txhash) => {
  if (txhash) {
    const insertsql =
      "INSERT INTO transactions(senderid,receiverid,transactionhash) VALUES($1,$2,$3) RETURNING *";
    const values = [senderid, receiverid, txhash];
    try {
      const inserttotransactiontable = await pool.query(insertsql, values);
      console.log(inserttotransactiontable.rows);
    } catch (error) {
      console.log("From insert transaction to db", error.message);
      throw new Error(error.message);
    }
  }

  return receiverid;
};
module.exports.selectuser = async (userid) => {
  const selectsql = "SELECT * FROM users WHERE userid=$1";
  const values = [userid];

  let orgdetails;
  try {
    orgdetails = await pool.query(selectsql, values);
  } catch (error) {
    throw new Error(error.message);
  }

  return orgdetails.rows[0];

  // return user as object
};

module.exports.selectrecipientsbyorguserid = async (orgid) => {
  const selectrecipientssql = "SELECT * FROM recipient WHERE organisationid=$1";
  const values = [orgid];

  let resultrows;
  try {
    resultrows = await pool.query(selectrecipientssql, values);
  } catch (error) {
    console.log("From select recipients by org", error.message);
    throw new Error(error.message);
  }
  return resultrows.rows;
};

exports.getausersinfo = async (userid) => {
  // sql1 selects the user from users table
  console.log("got userid", userid);
  const sql1 = "SELECT * FROM users WHERE userid=$1";
  const values = [userid];
  const orgsql = "SELECT * FROM organisation WHERE userid=$1";
  const merchantsql = "SELECT * FROM merchant WHERE userid=$1";
  const recipientsql = "SELECT * FROM recipient WHERE userid=$1";
  if (userid == "0") {
    return {
      name: "MTOG System",
    };
  }
  try {
    const results = await pool.query(sql1, values);
    console.log( results.rows);
    const { role } = results.rows[0];

    if (role === "Organisation") {
      let organisation_result = await pool.query(orgsql, values);
      return { name: organisation_result.rows[0].name };
    } else if (role === "Merchant") {
      let organisation_result = await pool.query(merchantsql, values);
      return {
        name: `${organisation_result.rows[0].firstname} ${organisation_result.rows[0].lastname}`,
      };
    } else if (role === "Recipient") {
      let organisation_result = await pool.query(recipientsql, values);
      return {
        name: `${organisation_result.rows[0].firstname} ${organisation_result.rows[0].lastname}`,
      };
    } else {
      return {
        name: "",
      };
    }
  } catch (error) {
    console.log(error);
  }

  // check if role is recipient,organisation,merchant
  // if one select from the respective users table
  // if recipient get firstname+lastname
  // if merchant get firstname+lastname
  // if organisation get name
  // if userid = 0 name  ==System
};

// recieves id and gets all transactions in order
// if it is get user records from token_transaction where this id is sender or
// receiver in descending order according to the timestamp
// map through each record call the gettransactions function
// and return a promise with an object with sendername,
// senderid,amount,recivername,receiverid
module.exports.getPreviousTransaction = async (userid) => {
  const sql =
    "SELECT * FROM transactions WHERE receiverid=$1 OR senderid=$1 ORDER BY timestamp DESC";
  const values = [userid];
  // console.log("Got userid", userid);

  let userresults;
  try {
    userresults = await pool.query(sql, values);
    console.log("Merchant results", userresults.rows);
  } catch (error) {
    console.log(error);
  }
  // console.log(userresults.rows);
  let userTransactionData = userresults.rows.map(
    async ({
      senderid,
      transactionhash,
      receiverid,
      timestamp,
      transactionid,
    }) => {
      let { value } = await gettransactiondata(transactionhash);
      // let usertimestamp = new Date(timestamp);
      // console.log(usertimestamp);

      let { name: sendername } = await this.getausersinfo(senderid);
      let { name: receivername } = await this.getausersinfo(receiverid);

      return {
        sendername,
        senderid,
        value,
        receivername,
        receiverid,
        timestamp,
        transactionid,
      };
    }
  );
  let data = await Promise.all(userTransactionData);
  return data;
};

// transaction("1bbdaa94-a87f-41f6-a8b8-d4daa8b1cb98");

module.exports.insertintousers = async ({
  email,
  idnumber,
  mobilenumber,
  role,
}) => {
  try {
    let useremail = email || null;
    let useridnumber = idnumber || null;

    mobilenumber = parsePhoneNumber(mobilenumber, "KE").number;

    const sql =
      "INSERT INTO users(email,idnumber,mobilenumber,role) VALUES($1,$2,$3,$4) RETURNING * ";
    const values = [useremail, useridnumber, mobilenumber, role];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.log(error.message);
    throw error.message;
  }
};
