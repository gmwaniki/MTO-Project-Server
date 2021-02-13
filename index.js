const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const port = process.env.PORT || 3636;
const cors = require("cors");
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

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://nervous-pare-0c4a83.netlify.app",
    ],
    exposedHeaders: ["set-cookie"],
  })
);
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
      httpOnly: true,
      sameSite: "lax",
    },
    resave: false,
    proxy: true,
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
