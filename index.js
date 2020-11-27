const { ProjectToken } = require("./services/tokenclass");

let Token = new ProjectToken();

// async function totalSupply() {
//   let details = await Token.contractdetails();
//   console.log(details);
// }
// totalSupply();

async function transfer(System, Mwaniki, amount) {
  let transfer = await Token.transfer(System, Mwaniki, amount);
  console.log(transfer);
}
transfer(2, 0, 1000);

// async function balance() {
//   let balance = await Token.accountbalance(5);
//   console.log(balance);
// }
// balance();
