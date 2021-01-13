const { parsePhoneNumber } = require("libphonenumber-js");
const {
  checkid,
  checkmobilenumber,
  updateuserdetails,
} = require("../models/authModel");
const { accountbalance } = require("../services/tokenclass");
const { pool } = require("../services/dbconnection");
const { v4: uuidv4 } = require("uuid");
const { selectrecipientsbyorguuid } = require("../services/commondbtasks");

const addrecipient = async (recipients, organisationid, organisationuuid) => {
  // Check if input is an array
  const finalarrayofrecipients = async () => {
    try {
      // Check if it is array and has inputs
      if (Array.isArray(recipients) && recipients.length > 0) {
        let correctrecipients = recipients.reduce(
          (accumulator, recipient, index, arr) => {
            //standardize input object keys
            let correctobject = Object.keys(recipient).reduce((acc, curr) => {
              let newtitle = curr.toLowerCase().replace(/\s+/g, "");
              return {
                ...acc,
                [newtitle]: recipient[curr],
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
                `  ${Object.keys(
                  objoferrors
                ).toString()} not found at position ${index + 1}`
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
      } else {
        throw new Error("Not a valid input");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // In db we need a role,firstname,lastname,idnumber,userid,timestamp,address,index,mobilenumber,uuid

  const recipientsarray = await finalarrayofrecipients();

  recipientsarray.forEach(async (onerecipient) => {
    // Add a role
    // Add a uuid
    onerecipient = { ...onerecipient, role: "recipient", uuid: uuidv4() };
    console.log(onerecipient);

    const sql =
      "INSERT INTO users(role,firstname,lastname,idnumber,mobilenumber,uuid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [
      onerecipient.role,
      onerecipient.firstname,
      onerecipient.lastname,
      onerecipient.idnumber,
      onerecipient.mobilenumber,
      onerecipient.uuid,
    ];
    // Submit to db returning *
    const sql2 =
      "INSERT INTO organisations_recipients(orgid,recipientid,uuid,address,index,status,mobilenumber,idnumber,firstname,lastname,orguuid) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *";

    try {
      let res = await pool.query(sql, values);

      // Use db id and update account
      let updateres = await updateuserdetails(res.rows[0].userid);

      let status = "active";
      const values2 = [
        organisationid,
        updateres.userid,
        updateres.uuid,
        updateres.address,
        updateres.index,
        status,
        updateres.mobilenumber,
        updateres.idnumber,
        updateres.firstname,
        updateres.lastname,
        organisationuuid,
      ];
      let res2 = await pool.query(sql2, values2);
    } catch (error) {
      console.log(error);
    }
    //Insert into org recipients
    //orgid - From func param, recipientid,uuid,account,index,mobilenumber,idnumber -previous update
  });
};

const selectrecipients = async (orguuid) => {
  try {
    const recipientrows = await selectrecipientsbyorguuid(orguuid);
    let arrayofpromises = recipientrows.map((user) => {
      return new Promise(async (resolve, reject) => {
        resolve({
          balance: await (await accountbalance(user.index)).balance,
          uuid: user.uuid,
          firstname: user.firstname,
          lastname: user.lastname,
          idnumber: user.idnumber,
          mobilenumber: user.mobilenumber,
          status: user.status,
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
// selectrecipients(5);

const deleterecipient = async (recipientuuid) => {
  const sql = "DELETE * FROM users WHERE uuid=$1";
  // transfer all recipients funds to org funds to org

  const values = [recipientuuid];

  try {
    await pool.query(sql, values);
    return;
  } catch (error) {
    throw new Error("Error Occured while trying to delete");
  }
};

const updaterecipient = async ({
  firstname,
  lastname,
  idnumber,
  mobilenumber,
  uuid,
}) => {
  const sql =
    "UPDATE users SET firstname=$1,lastname=$2,mobilenumber=$3,idnumber=$4 WHERE uuid=$5 ";
  const values = [firstname, lastname, mobilenumber, idnumber, uuid];
  try {
    await pool.query(sql, values);
    return;
  } catch (error) {
    console.log(error);
    throw new Error("Error Occured During update");
  }
};

module.exports = {
  selectrecipients,
  addrecipient,
  deleterecipient,
  updaterecipient,
};
