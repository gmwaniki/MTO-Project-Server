// const { ProjectToken } = require("./services/tokenclass");

// let Token = new ProjectToken();

const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const pool = new Pool({
  user: "e1f",
  host: "localhost",
  database: "myproject",
  password: "e1f",
  port: 5432,
});

const cors = require("cors");

app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    name: "userscookie",
    secret: "whoami",
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    resave: false,
  })
);
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const allroutes = require("./routes/routing");
app.use("/", allroutes);

app.listen(3636, () => {
  console.log("listening on port 3636");
});
