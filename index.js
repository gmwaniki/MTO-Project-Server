const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const port = process.env.PORT || 3636;
const cors = require("cors");
require("dotenv").config();
if (process.env.NODE_ENV == "dev") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

const pool = new Pool({
  user: `${process.env.user}`,
  host: `${process.env.host}`,
  database: `${process.env.database}`,
  password: `${process.env.password}`,
  port: process.env.port,
  ssl: process.env.NODE_ENV == "production" ? true : false,
});

app.set("trust proxy", 1);

app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    name: "userscookie",
    secret: "whoami",
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
    resave: false,
  })
);

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://lucid-clarke-bacf58.netlify.app",
    ],
  })
);

app.use(express.urlencoded({ extended: true }));

const allapproutes = require("./routes/routing");
app.use("/api", express.json(), allapproutes);
const webhookroutes = require("./routes/webhooks");
app.use("/webhook", webhookroutes);

let server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
module.exports = server;
