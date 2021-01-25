const HDWallet = require("@truffle/hdwallet-provider");

require("dotenv").config();

async function accountdetails(accountindex) {
  // let wallet = new HDWallet({
  //   mnemonic: { phrase: process.env.mnemonic },
  //   providerOrUrl: `https://kovan.infura.io/v3/${process.env.infurakey}`,

  //   addressIndex: parseInt(accountindex),
  //   numberOfAddresses: 1,
  // });
  // console.log(wallet);
  let wallet;
  try {
    wallet = new HDWallet({
      mnemonic: {
        phrase: `${process.env.mnemonic}`,
      },
      providerOrUrl: `https://kovan.infura.io/v3/${process.env.infurakey}`,
      pollingInterval: 10000,
    });
    // console.log(wallet);
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }

  let address = wallet.getAddress(accountindex);

  let privateKey = wallet.wallets[address].privateKey.toString("hex");
  let publicKey = wallet.wallets[address].publicKey.toString("hex");

  return {
    address: address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
}

// accountdetails(0);

module.exports = { accountdetails };
