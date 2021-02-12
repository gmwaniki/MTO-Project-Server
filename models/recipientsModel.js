const { parsePhoneNumber } = require("libphonenumber-js");
const {
  checkid,
  checkmobilenumber,
  updateuserdetails,
} = require("../models/authModel");
const { accountbalance } = require("../services/tokenclass");
const { pool } = require("../services/dbconnection");

const {
  selectrecipientsbyorguserid,
  selectuser,
  insertintousers,
  recordtransfer,
} = require("../services/commondbtasks");
const { accountdetails } = require("../services/accountcreation");
const { transferovergsn } = require("../services/contractinteraction");

const addrecipient = async (recipients, organisationid) => {
  // Check if input is an array
  const finalarrayofrecipients = async () => {
    try {
      // Check if it is array and has inputs
      let correctrecipients = recipients.reduce(
        (accumulator, recipient, index, arr) => {
          //standardize input object keys
          let correctobject = Object.keys(recipient).reduce((acc, current) => {
            let newtitle = current.toLowerCase().replace(/\s+/g, "");
            return {
              ...acc,
              [newtitle]: recipient[current],
            };
          }, {});

          let arrayofvals = [
            "firstname",
            "idnumber",
            "lastname",
            "mobilenumber",
          ];

          let objoferrors = arrayofvals.reduce((acc, curr) => {
            // for each iteration we will check whether the arrayofval item is in the object keys array
            let ifinclude = Object.keys(correctobject).includes(curr);

            if (!ifinclude) {
              return {
                ...acc,
                [curr]: false,
              };
            } else {
              return acc;
            }
          }, {});

          let isobjoferrorsempty = () => {
            for (const key in objoferrors) {
              return false;
            }
            return true;
          };

          if (!isobjoferrorsempty()) {
            throw new Error(
              `  ${Object.keys(objoferrors).toString()} not found at position ${
                index + 1
              }`
            );
          }
          // Creates and object with only needed values
          const nextcorrrectobject = {
            firstname: correctobject.firstname.toString().trim(),
            lastname: correctobject.lastname.toString().trim(),
            idnumber: correctobject.idnumber.toString().trim(),
            mobilenumber: correctobject.mobilenumber.toString().trim(),
          };

          return [
            ...accumulator,
            {
              ...nextcorrrectobject,
              mobilenumber: parsePhoneNumber(
                nextcorrrectobject.mobilenumber,
                "KE"
              ).number,
            },
          ];
        },
        []
      );

      /* checks for firstname,lastnmae,idnumber and mobilenumber params */
      const issetrrors = correctrecipients.reduce(
        (accumulator, current, index, array) => {
          if (current.firstname.length === 0) {
            let error = `Error at  user ${index} firstname is too short`;
            accumulator = [...accumulator, error];
          }
          if (current.lastname.length === 0) {
            let error = `Error at  user ${index} lastname is too short`;
            accumulator = [...accumulator, error];
          }
          if (current.idnumber.length > 8 || current.idnumber.length < 7) {
            let error = `Error at  user ${index} invalid id number`;
            accumulator = [...accumulator, error];
          }
          if (!parsePhoneNumber(current.mobilenumber, "KE").isValid()) {
            let error = `Error at  user ${index} invalid mobile number`;
            accumulator = [...accumulator, error];
          }
          return accumulator;
        },
        []
      );
      if (issetrrors.length) {
        throw new Error(issetrrors);
      }

      let arrayofid = [];
      let arrayofmobilenumbers = [];
      let mobilenumberdictionary;
      let iddictionary;
      correctrecipients.forEach((recipient) => {
        arrayofid = [...arrayofid, recipient.idnumber];
        arrayofmobilenumbers = [
          ...arrayofmobilenumbers,
          recipient.mobilenumber,
        ];
      });

      //Dictionary of idnumber and mobilenumbers and the number of instances in the array
      const dictionarymobile = (accumulator, mobilenumber) => ({
        ...accumulator,
        [mobilenumber]: (accumulator[mobilenumber] || 0) + 1,
      });
      const dictionaryid = (accumulator, idnumber) => ({
        ...accumulator,
        [idnumber]: (accumulator[idnumber] || 0) + 1,
      });
      // An object with all mobilenumbers and the number of instances of each mobile number
      mobilenumberdictionary = arrayofmobilenumbers.reduce(
        dictionarymobile,
        {}
      );
      iddictionary = arrayofid.reduce(dictionaryid, {});
      // checks for duplicate mobile numbers in the array
      const duplicatemobilenumbers = () => {
        return Object.keys(mobilenumberdictionary).filter(
          (value) => mobilenumberdictionary[value] > 1
        );
      };
      // checks for duplicate id numbers in the array
      const duplicateids = () => {
        return Object.keys(iddictionary).filter(
          (value) => iddictionary[value] > 1
        );
      };

      const usedidnumbers = duplicateids();
      const usednumbers = duplicatemobilenumbers();

      // checks if there are any duplicates by checking array length

      if (usedidnumbers.length || usednumbers.length) {
        let myerror = usedidnumbers.length
          ? `Duplicate Id: ${usedidnumbers}`
          : "";

        let mobileerror = usednumbers.length
          ? ` Duplicate mobilenumbers: ${usednumbers}`
          : "";

        throw new Error(myerror + mobileerror);
      }
      // check if mobilenumber is already in the db
      let usedindbmobilenumbers = [];
      for (const iterator of correctrecipients) {
        const ismobilenumberused = await checkmobilenumber(
          iterator.mobilenumber
        );
        if (ismobilenumberused === 1) {
          usedindbmobilenumbers.push(iterator.mobilenumber);
        }
      }

      //check if idnumber is already in the db
      let usedindbidnumberss = [];
      for (const iterator of correctrecipients) {
        const isidnumberused = await checkid(iterator.idnumber);
        if (isidnumberused === 1) {
          usedindbidnumberss.push(iterator.idnumber);
        }
      }

      if (usedindbidnumberss.length || usedindbmobilenumbers.length) {
        let iderror = usedindbidnumberss.length
          ? `These Id's have been used ${usedindbidnumberss}`
          : "";

        let mobileerror = usedindbmobilenumbers.length
          ? ` These mobilenumbers have been used : ${usedindbmobilenumbers}`
          : "";

        throw new Error(iderror + mobileerror);
      } else {
        return correctrecipients;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // In db we need a role,firstname,lastname,idnumber,userid,timestamp,address,index,mobilenumber

  const recipientsarray = await finalarrayofrecipients();

  let finalresult = recipientsarray.map(async (onerecipient) => {
    // Add a role

    // for each recipient they should be added to the users table
    // then added to recipients table
    const { firstname, lastname, idnumber, mobilenumber } = onerecipient;
    const userdata = await insertintousers({
      email: "",
      idnumber,
      mobilenumber,
      role: "Recipient",
    });
    const sql =
      "INSERT INTO recipient(userid,organisationid,firstname,lastname,idnumber,mobilenumber,address) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *";
    const values = [
      userdata.userid,
      organisationid,
      firstname,
      lastname,
      userdata.idnumber,
      userdata.mobilenumber,
      (await accountdetails(userdata.userid)).address,
    ];
    // Submit to db returning *
    try {
      let res = await pool.query(sql, values);

      return new Promise(async (resolve, reject) => {
        resolve({
          firstname: res.rows[0].firstname,
          lastname: res.rows[0].lastname,
          mobilenumber: parsePhoneNumber(res.rows[0].mobilenumber, "KE").number,
          idnumber: res.rows[0].idnumber.toString(),
          userid: userdata.userid,
          balance: await (await accountbalance(userdata.userid)).balance,
        });
      });
    } catch (error) {
      console.log(error);
    }

    //Insert into org recipients
    //orgid - From func param, recipientid,account,index,mobilenumber,idnumber -previous update
  });
  let resultpromise = await Promise.all(finalresult);
  return resultpromise;
};

const selectrecipients = async (orguserid) => {
  try {
    const recipientrows = await selectrecipientsbyorguserid(orguserid);
    let arrayofpromises = recipientrows.map((user) => {
      return new Promise(async (resolve, reject) => {
        resolve({
          balance: await (await accountbalance(user.userid)).balance,
          firstname: user.firstname,
          lastname: user.lastname,
          idnumber: user.idnumber.toString(),
          mobilenumber: parsePhoneNumber(user.mobilenumber, "KE").number,
          userid: user.userid,
          address: await (await accountdetails(user.userid)).address,
        });
      });
    });
    let promiseresult = await Promise.all(arrayofpromises);
    console.log("From Promise all", promiseresult);
    return promiseresult;
  } catch (error) {
    console.log(error);
    throw new Error("Error Occured selecting");
  }
};

const deleterecipient = async (recipientid, orgid) => {
  const sql =
    "UPDATE users SET idnumber=null,mobilenumber=null  WHERE userid=$1";
  const sql2 =
    "UPDATE recipient SET idnumber=null,mobilenumber=null,organisationid=null  WHERE userid=$1";
  // transfer all recipients funds to org funds to org

  const values = [recipientid];

  try {
    console.log("Getting balance");
    const { balance } = await accountbalance(recipientid);
    if (parseInt(balance) > 0) {
      const { TxHash } = await transferovergsn(recipientid, orgid, balance);
      console.log("transferring");
      const id = await recordtransfer(recipientid, orgid, TxHash);
    }

    let results = await pool.query(sql, values);
    await pool.query(sql2, values);
    if (results.rowCount) {
      console.log("inserting into db");
      return 1;
    } else {
      throw new Error("Error Occured while trying to delete");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error Occured while trying to delete");
  }
};

const updaterecipient = async ({
  firstname,
  lastname,
  idnumber,
  mobilenumber,
  userid,
}) => {
  // needs two queries on to update users table and another to update recipients table
  const sql =
    "UPDATE users SET idnumber=$1,mobilenumber=$2 WHERE userid=$3 RETURNING *";
  const values = [idnumber, mobilenumber, userid];
  const sql2 =
    "UPDATE recipient SET firstname=$1,lastname=$2 WHERE userid=$3 RETURNING *";
  const values2 = [firstname, lastname, userid];
  try {
    let result = await pool.query(sql, values);
    let result2 = await pool.query(sql2, values2);
    const { mobilenumber, idnumber } = result.rows[0];
    const { firstname, lastname } = result2.rows[0];
    return {
      firstname,
      lastname,
      mobilenumber: parsePhoneNumber(mobilenumber, "KE").number,
      idnumber: idnumber.toString(),
      userid,
    };
  } catch (error) {
    console.log(error);
    throw new Error("An error occured during the update");
  }
};

module.exports = {
  selectrecipients,
  addrecipient,
  deleterecipient,
  updaterecipient,
};
