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
    let errormessage = error.toString();

    return {
      result: "",
      error: errormessage,
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

module.exports = {
  signuporg,
  signupmerchant,
};
