const HDWallet = require("@truffle/hdwallet-provider");
const path = require("path");


require("dotenv").config();

async function accountdetails(accountindex) {
  let wallet;
  accountindex = parseInt(accountindex);
  try {
    wallet = new HDWallet({
      mnemonic: {
        phrase: `${process.env.mnemonic}`,
      },
      providerOrUrl: `wss://kovan.infura.io/ws/v3/${process.env.infurakey}`,
      addressIndex: accountindex,
      numberOfAddresses: 1,
      pollingInterval: 10000,
    });
    // console.log(wallet);
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
  // console.log("Account index", accountindex);
  let testaddress = wallet?.getAddress(accountindex);

  const address = testaddress || Object.keys(wallet.wallets)[0];
  // console.log("The address", address);
  // console.log(address);
  let privateKey = wallet.wallets[address].privateKey.toString("hex");
  let publicKey = wallet.wallets[address].publicKey.toString("hex");

  // console.log("The private key", privateKey);

  return {
    address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
}
// accountdetails(49);

// accountdetails(11);

module.exports = { accountdetails };
