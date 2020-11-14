const { ProjectToken } = require("./services/tokenclass");

let Token = new ProjectToken();

// async function totalSupply() {
//   let details = await Token.contractdetails();
//   console.log(details);
// }
// totalSupply();

async function transfer() {
  let transfer = await Token.transfer(0, 1, 1000);
  console.log(transfer);
}
transfer();
