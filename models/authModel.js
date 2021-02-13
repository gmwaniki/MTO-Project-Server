// const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { parsePhoneNumber } = require("libphonenumber-js");

const { insertintousers } = require("../services/commondbtasks");
const { pool } = require("../services/dbconnection");
const { accountdetails } = require("../services/accountcreation");

const signuporg = async ({ name, email, password, mobilenumber }) => {
  const userdata = await insertintousers({
    email,
    idnumber: "",
    mobilenumber,
    role: "Organisation",
  });

  // console.log(userdata);

  const sql =
    "INSERT INTO organisation(userid,name,email,password,mobilenumber,role,address) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING * ";

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const values = [
    userdata.userid,
    name,
    userdata.email,
    hashedPassword,
    userdata.mobilenumber,
    userdata.role,
    (await accountdetails(userdata.userid)).address,
  ];

  try {
    const res = await pool.query(sql, values);
    return {
      result: res.rowCount,
      error: "",
    };
  } catch (error) {
    console.log(error);

    return {
      result: "",
      error: error.detail,
    };
  }
};

const signupmerchant = async ({
  firstname,
  lastname,
  storename,
  email,
  password,
  mobilenumber,
  idnumber,
}) => {
  const userdata = await insertintousers({
    email,
    idnumber,
    mobilenumber,
    role: "Merchant",
  });

  const sql =
    "INSERT INTO merchant(userid,firstname,lastname,storename,idnumber,mobilenumber,email,password,address) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *";
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const values = [
    userdata.userid,
    firstname,
    lastname,
    storename,
    userdata.idnumber,
    userdata.mobilenumber,
    userdata.email,
    hashedPassword,
    (await accountdetails(userdata.userid)).address,
  ];

  try {
    const res = await pool.query(sql, values);
    return {
      result: res.rowCount,
      error: "",
    };
  } catch (error) {
    return {
      result: "",
      error: error.message,
    };
  }
};

const login = async ({ email, password }) => {
  // frist sql select role,userid,email from users
  // second sql select email,password where email=$1 from org union sql select email,password where email=$1 from merchant
  const sql = "SELECT * FROM users WHERE email=$1 ";
  const values = [email];
  const orgsql = "SELECT email,password FROM organisation WHERE email=$1 ";
  const merchantsql = "SELECT email,password FROM merchant WHERE email=$1";
  try {
    let res = await pool.query(sql, values);

    let comparepassword = async (userpassword, password) => {
      return await bcrypt.compare(password, userpassword);
    };
    let userpassword;

    if (res.rowCount === 1) {
      let { role, email, mobilenumber, userid } = res.rows[0];
      if (role === "Organisation") {
        let organisation_result = await pool.query(orgsql, values);
        let { password } = organisation_result.rows[0];
        userpassword = password;
      } else if (role === "Merchant") {
        let organisation_result = await pool.query(merchantsql, values);
        let { password } = organisation_result.rows[0];
        userpassword = password;
      } else {
        return {
          checkPassword: false,
          email,
          password,
          error: "Incorrect credentials",
        };
      }
      if (await comparepassword(userpassword, password)) {
        return {
          checkPassword: true,
          email,
          mobilenumber,
          error: "",
          userid,
          role,
        };
      } else {
        return {
          checkPassword: false,
          email,
          password,
          error: "Incorrect credentials",
        };
      }
    } else {
      return {
        checkPassword: false,
        email,
        password,
        error: "Incorrect credentials",
      };
    }
  } catch (error) {
    console.log(error);
    return { checkPassword: false, email: email, password, error: error };
  }
};

const checkid = async (idnumber) => {
  if (typeof idnumber !== "string") {
    return -1;
  }
  // console.log(idnumber.length);
  if (idnumber.length < 7 || idnumber.length > 8) {
    // console.log("caught here");
    return -1;
  }

  const sql = "SELECT * FROM users where idnumber=$1";
  const values = [idnumber];
  try {
    let res = await pool.query(sql, values);
    // console.log(res.rowCount);
    if (res.rowCount >= 1) {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    return -1;
  }
};

// should check if it is a valid kenyan mobilenumber,check if number has already been used
// return true if used,false if not, -1 error
const checkmobilenumber = async (mobilenumber) => {
  try {
    if (typeof mobilenumber !== "string") {
      return 1;
    }

    // if (mobilenumber === "0" || mobilenumber === "") {
    //   return 1;
    // }

    if (!parsePhoneNumber(mobilenumber, "KE").isValid()) {
      return -1;
    }

    const realnumber = parsePhoneNumber(mobilenumber, "KE").number;
    const sql = "SELECT * FROM users where mobilenumber=$1";
    const values = [realnumber];

    try {
      let res = await pool.query(sql, values);
      if (res.rowCount >= 1) {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      return -1;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
const checkemail = async (email) => {
  // console.log(email);
  const sql = "SELECT * FROM users WHERE email=$1";
  const values = [email];
  // pool.query(sql).then((data) => console.log(data));

  try {
    let res = await pool.query(sql, values);
    // console.log(;
    if (res.rowCount >= 1) {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return -1;
  }
};

module.exports = {
  signuporg,
  signupmerchant,
  login,
  checkid,
  checkmobilenumber,

  checkemail,
};
