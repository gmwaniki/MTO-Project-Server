const HDWallet = require("truffle-hdwallet-provider");
require("dotenv").config();

// let randomnumber = Math.floor(Math.random() * 10);
// console.log(randomnumber);

async function accountdetails(accountindex) {
  let wallet = new HDWallet(
    process.env.mnemonic,
    "http://127.0.0.1:7545" ||
      `https://rinkeby.infura.io/v3/${process.env.infurakey}`,
    accountindex
  );

  let address = await wallet.addresses;

  let privateKey = wallet.wallets[address]._privKey.toString("hex");
  let publicKey = wallet.wallets[address]._pubKey.toString("hex");
  // console.log(address, privateKey);
  return {
    address: address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
}
// accountdetails(0);

module.exports = { accountdetails };
