const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { parsePhoneNumber } = require("libphonenumber-js");
const { accounts } = require("../services/tokenclass");
const { v4: uuidv4 } = require("uuid");

const pool = new Pool({
  user: "e1f",
  host: "localhost",
  database: "myproject",
  password: "e1f",
  port: 5432,
});

const updateuserdetails = async (userid) => {
  const sql = `UPDATE users SET address=$1,index=$2 WHERE userid='${userid}' RETURNING *`;
  let details = await accounts(parseInt(userid));

  const values = [details.address, userid];
  try {
    let res = await pool.query(sql, values);
    return res.rows[0];
    // console.log(res.rows);
  } catch (error) {
    console.log(error);
  }
};
// upateuserdetails(5)

const signuporg = async ({ role, name, email, pass, mobilenumber }) => {
  try {
    let ismobilenumbervalid = await checkmobilenumber(mobilenumber);

    if (ismobilenumbervalid === 1) {
      return {
        result: "",
        error: "Mobile number has already been used",
      };
    } else if (ismobilenumbervalid === -1) {
      return {
        result: "",
        error: "Invalid input",
      };
    }

    const sql =
      "INSERT INTO users(role,orgname,email,password,mobilenumber,uuid) VALUES($1,$2,$3,$4,$5,$6) RETURNING * ";

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    const internationalmobilenumber = parsePhoneNumber(
      mobilenumber.toString(),
      "KE"
    ).number;
    role = "organisation";
    const uniqueid = uuidv4();
    const values = [
      role,
      name,
      email,
      hashedPassword,
      internationalmobilenumber,
      uniqueid,
    ];

    try {
      const res = await pool.query(sql, values);
      console.log("successful sign up");
      // let accountdetails = accounts(res.rows[0].userid);
      await updateuserdetails(res.rows[0].userid);
      return {
        result: res.rowCount,
        error: "",
      };
    } catch (error) {
      let errormessage = error;
      console.log(error);
      if (error.constraint == "users_email_key") {
        return {
          result: "",
          error: "Email has already been used",
        };
      } else if (error.constraint == "users_mobilenumber_key") {
        return {
          result: "",
          error: "Mobile number has already been used",
        };
      } else {
        return {
          result: "",
          error: error.detail,
        };
      }
    }
  } catch (error) {
    return {
      result: "",
      error: "Invalid Input",
    };
  }
};

const signupmerchant = async ({
  role,
  firstname,
  lastname,
  storename,
  email,
  pass,
  mobilenumber,
  id,
}) => {
  try {
    let isidvalid = await checkid(id);
    let ismobilenumbervalid = await checkmobilenumber(mobilenumber);
    if (isidvalid === 1) {
      return {
        result: "",
        error: "Id has already been used",
      };
    } else if (isidvalid === -1) {
      return {
        result: "",
        error: "Invalid input",
      };
    }
    if (ismobilenumbervalid === 1) {
      return {
        result: "",
        error: "Mobile number has already been used",
      };
    } else if (ismobilenumbervalid === -1) {
      return {
        result: "",
        error: "Invalid Mobile number ",
      };
    }

    const sql =
      "INSERT INTO users(role,firstname,lastname,storename,idnumber,email,password,mobilenumber,uuid) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *";
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);
    const internationalmobilenumber = parsePhoneNumber(
      mobilenumber.toString(),
      "KE"
    ).number;
    const uniqueid = uuidv4();
    role = "merchant";

    const values = [
      role,
      firstname,
      lastname,
      storename,
      id,
      email,
      hashedPassword,
      internationalmobilenumber,
      uniqueid,
    ];

    try {
      const res = await pool.query(sql, values);
      await updateuserdetails(res.rows[0].userid);
      return {
        result: res.rowCount,
        error: "",
      };
    } catch (error) {
      let errormessage = error.toString();

      return {
        result: "",
        error: errormessage,
      };
    }
  } catch (error) {
    return {
      result: "",
      error: "Invalid Input",
    };
  }
};
const login = async ({ email, pass }) => {
  const sql = "SELECT * FROM users WHERE email=$1 ";
  const values = [email];
  try {
    let res = await pool.query(sql, values);
    console.log(res);

    if (res.rowCount <= 0) {
      return {
        checkPassword: false,
        email: email,
        pass: pass,
        error: "No user found",
      };
    } else if (res.rowCount >= 1) {
      let checkPassword = await bcrypt.compare(pass, res.rows[0].password);
      let dbemail = res.rows[0].email;
      let mobilenumber = res.rows[0].mobilenumber;
      let role = res.rows[0].role;
      let userid = res.rows[0].userid;
      let uuid = res.rows[0].uuid;

      if (checkPassword) {
        return {
          checkPassword,
          email: dbemail,
          mobilenumber,
          error: "",
          userid,
          role,
          uuid,
        };
      } else {
        return {
          checkPassword,
          email: email,
          pass,
          error: "Incorrect credentials",
        };
      }
    }
  } catch (error) {
    console.log(error);
    return { checkPassword: false, email: email, pass: pass, error: error };
  }
};

const checkid = async (idnumber) => {
  try {
    if (idnumber.toString().length < 7 || idnumber.toString().length > 8) {
      return -1;
    }
    const sql = "SELECT * FROM users where idnumber=$1";
    const values = [idnumber];
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
const checkmobilenumber = async (mobilenumber) => {
  try {
    if (mobilenumber === "0" || mobilenumber === "") {
      return 1;
    }

    if (!parsePhoneNumber(mobilenumber.toString(), "KE").isValid()) {
      return -1;
    } else {
      const realnumber = parsePhoneNumber(mobilenumber.toString(), "KE").number;
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
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  signuporg,
  signupmerchant,
  login,
  checkid,
  checkmobilenumber,
  upateuserdetails: updateuserdetails,
};
