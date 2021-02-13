const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./services/dbconnection").pool;
const port = process.env.PORT || 3636;
const cors = require("cors");
if (process.env.NODE_ENV == "dev") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(
  session({
    store: new pgSession({
      pool,
    }),
    name: "userscookie",
    secret: "whoami",
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    },
    resave: true,
  })
);
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
    exposedHeaders: ["set-cookie"],
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
