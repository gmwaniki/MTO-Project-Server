const HDWallet = require("@truffle/hdwallet-provider");

require("dotenv").config();

// let randomnumber = Math.floor(Math.random() * 10);
// console.log(randomnumber);

async function accountdetails(accountindex) {
  let wallet = new HDWallet({
    mnemonic: process.env.mnemonic.toString().trim(),
    providerOrUrl: `https://kovan.infura.io/v3/${process.env.infurakey}`,

    addressIndex: parseInt(accountindex),
    numberOfAddresses: 1,
  });
  // console.log(process.env.mnemonic);
  let address = await wallet.addresses;

  let privateKey = wallet.wallets[address]._privKey.toString("hex");
  let publicKey = wallet.wallets[address]._pubKey.toString("hex");
  // console.log(address, privateKey);
  return {
    address: address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
  // console.log(wallet);
}
// accountdetails(0).then((account) => {
//   console.log(account);
// });

module.exports = { accountdetails };
