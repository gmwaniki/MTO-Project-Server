const { pool } = require("./dbconnection");
const { v4: uuidv4 } = require("uuid");

module.exports.recordtransfer = async (senderuuid, receiveruuid, txhash) => {
  let sendername;
  let senderrole;
  let receivername;
  let receiverrole;

  if (senderuuid === 0) {
    sendername = "MTOG System";
    senderrole = "system";
  } else {
    let user = await this.selectuser(senderuuid);
    if (user.role === "organisation") {
      sendername = user.orgname;
      senderrole = user.role;
    } else if (user.role === "recipient" || user.role === "merchant") {
      sendername = user.firtname + " " + user.lastname;
      senderrole = user.role;
    }
  }

  if (receiveruuid === 0) {
    recivername = "MTOG System";
    receiverrole = "system";
  } else {
    let user = await this.selectuser(receiveruuid);
    if (user.role === "organisation") {
      receivername = user.orgname;
      receiverrole = user.role;
    } else if (user.role === "recipient" || user.role === "merchant") {
      receivername = user.firstname + " " + user.lastname;
      receiverrole = user.role;
    }
  }

  let tuid = uuidv4();

  if (txhash) {
    const insertsql =
      "INSERT INTO token_transactions(sender_name,sender_role,sender_uuid,receiver_name,receiver_role,receiver_uuid,txhash,tuid) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *";
    const values = [
      sendername,
      senderrole,
      senderuuid,
      receivername,
      receiverrole,
      receiveruuid,
      txhash,
      tuid,
    ];
    try {
      const inserttotransactiontable = await pool.query(insertsql, values);
      console.log(inserttotransactiontable.rows);
    } catch (error) {
      console.log("From insert transaction to db", error.message);
      throw new Error(error.message);
    }
  }

  // if senderuuid is 0 it is system transfer
  // if txhash
  // insert into  db
  return receiveruuid;
};
module.exports.selectuser = async (uuid) => {
  const selectsql = "SELECT * FROM users WHERE uuid=$1";
  const values = [uuid];

  let orgdetails;
  try {
    orgdetails = await pool.query(selectsql, values);
  } catch (error) {
    throw new Error(error.message);
  }

  return orgdetails.rows[0];

  // return user as object
};

module.exports.selectrecipientsbyorguuid = async (orguuid) => {
  const selectrecipientssql =
    "SELECT * FROM organisations_recipients WHERE orguuid=$1";
  const values = [orguuid];

  let resultrows;
  try {
    resultrows = await pool.query(selectrecipientssql, values);
  } catch (error) {
    console.log("From select recipients by org", error.message);
    throw new Error(error.message);
  }
  return resultrows.rows;
};
