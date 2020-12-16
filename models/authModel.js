const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: "e1f",
  host: "localhost",
  database: "myproject",
  password: "e1f",
  port: 5432,
});
const signuporg = async ({ role, name, email, pass, mobilenumber }) => {
  const sql =
    "INSERT INTO users(role,orgname,email,password,mobilenumber) VALUES($1,$2,$3,$4,$5) ";

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(pass, salt);

  const values = [role, name, email, hashedPassword, mobilenumber];

  try {
    const res = await pool.query(sql, values);
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
  const sql =
    "INSERT INTO users(role,firstname,lastname,storename,idnumber,email,password,mobilenumber) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ";
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(pass, salt);
  const values = [
    role,
    firstname,
    lastname,
    storename,
    id,
    email,
    hashedPassword,
    mobilenumber,
  ];

  try {
    const res = await pool.query(sql, values);
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
};
const login = async ({ email, pass }) => {
  const sql = "SELECT * FROM users WHERE email=$1 ";
  const values = [email];
  try {
    let res = await pool.query(sql, values);

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

      if (checkPassword) {
        return { checkPassword, email: dbemail, mobilenumber, error: "" };
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

module.exports = {
  signuporg,
  signupmerchant,
  login,
};
