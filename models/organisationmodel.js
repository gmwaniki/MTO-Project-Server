// handles all org info requests like previous transactions and org details
const {
  selectuser,
  selectrecipientsbyorguuid,
  recordtransfer,
} = require("../services/commondbtasks");
const { pool } = require("../services/dbconnection");
const { accountbalance, transfer } = require("../services/tokenclass");

// get organisation information
// function receiving org uuid returns results

module.exports.getorganisationdetails = async (orguuid) => {
  let orgdetails;
  try {
    orgdetails = await selectuser(orguuid);
  } catch (error) {
    console.log("From select ", error.message);
    throw new Error(error.message);
  }

  const { orgname, index } = orgdetails;
  let { balance } = await accountbalance(index);
  balance = parseInt(balance);
  // let balance =10;
  return { orgname, balance };
};

// from org to recipient transfer -> sms to recipient

module.exports.sendtoallrecipients = async (amount, orguuid, orgid) => {
  // check org balance
  try {
    amount = parseInt(amount);
    const { balance } = await this.getorganisationdetails(orguuid);
    if (amount > balance) {
      throw new Error("Amount is more Than Balance");
    }
    // get recipients from db
    const orgrecipients = await selectrecipientsbyorguuid(orguuid);
    // get number of recipients
    const recipientslength = orgrecipients.length;
    // divide amount to per recipients
    let amountperrecipient = parseInt(amount) / recipientslength;

    let fullfilled = [];

    // for every function call we must specify the recipientid

    for (const { recipientid, uuid } of orgrecipients) {
      let txhash = await transfer(orgid, recipientid, amountperrecipient);
      fullfilled = [...fullfilled, { txhash, recipientid, uuid }];
    }
    console.log("The fullfilled", fullfilled);

    let results = fullfilled.map(async (result) => {
      // if the transaction was successful add to db

      let recipientuuid = await recordtransfer(
        orguuid,
        result.uuid,
        result.txhash
      );
      return {
        userid: result.uuid,
      };
    });
    // console.log(results);
    return results;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  // add transaction to database
  // use Promise.allsettled to get know of any rejects
  // reuturn an array of all promises resolved and rejected
};

// sendtoallrecipients(10, "313a2336-2201-49c3-a322-bf64703061b4", 1145).then(
//   (result) => {
//     result.forEach((async (user) => console.log(await user)));
//   }
// );
