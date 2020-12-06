// const { ProjectToken } = require("./services/tokenclass");

// let Token = new ProjectToken();

const allroutes = require("./routes/routing");

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", allroutes);

// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "e1f",
//   host: "localhost",
//   database: "myproject",
//   password: "e1f",
//   port: 5432,
// });
// // pool.connect((err, client, done) => {
// //   if (err) {
// //     console.log(error);
// //   } else {
// //     console.log("connected to db");
// //     pool
// //       .query("SELECT * FROM test ")
// //       .then((res) => {
// //         console.log(res);
// //       })
// //       .catch((err) => {
// //         console.log(err);
// //       });
// //   }
// // });

// app.get("/", (req, res) => {
//   res.send("hello");
// });

// app.post("/signuporg", (req, res, next) => {
//   let name = req.body.name;
//   let email = req.body.email;
//   try {
//     pool.query(`INSERT INTO test (name,email) VALUES('${name}','${email}')`);
//   } catch (error) {
//     if (error) {
//       next(error);
//     }
//     console.log(error);
//   }
// });

app.listen(3535, () => {
  console.log("listening on port 3535");
});
