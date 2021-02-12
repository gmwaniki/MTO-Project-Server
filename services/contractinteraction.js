const Web3 = require("web3");
require("dotenv").config();

const web3 = new Web3(`https://kovan.infura.io/v3/${process.env.infurakey}`);

const accountinfo = require("./accountcreation");

const GSN = require("@opengsn/gsn");
const abidecoder = require("abi-decoder");

// change depending to network
// current Kovan

let paymaster = "0x964c26832AaA07279dE868846DC1bF4B9cDf5693";

// change on redeploy
const contractabi = require("./MyToken.json");

const contract = new web3.eth.Contract(
  contractabi.abi,
  contractabi.networks[42].address
);
abidecoder.addABI(contractabi.abi);
// const mypaymasterabi = require("./MyPaymaster.json").abi
// const paymastercontract = new web3.eth.Contract(mypaymasterabi);

async function getTotalTokenSupply() {
  let totalSupply = await contract.methods.totalSupply().call();
  return totalSupply;
}
async function getTokenName() {
  let name = await contract.methods.name().call();
  return name;
}
async function getTokenSymbol() {
  let symbol = await contract.methods.symbol().call();
  return symbol;
}
async function getTokenDecimals() {
  let decimals = await contract.methods.decimals().call();
  return decimals;
}

async function getBalanceOf(address) {
  let balance = await contract.methods.balanceOf(address.toString()).call();
  // console.log(web3.utils.fromWei(balance.toString(), "ether"));
  return balance;
}

async function transferovergsn(senderindex, receiverindex, transferamount) {
  let provider = await GSN.RelayProvider.newProvider({
    provider: web3.currentProvider,
    config: {
      paymasterAddress: paymaster,
      loggerConfiguration: { logLevel: "error" },
    },
  }).init();

  let sender = await accountinfo.accountdetails(senderindex);
  let receiver = await accountinfo.accountdetails(receiverindex);
  let senderaddress = sender.address;
  let receiveraddress = receiver.address;
  let receiverprivateKey = receiver.privateKey;
  let senderprivateKey = sender.privateKey;

  provider.addAccount(receiverprivateKey);
  provider.addAccount(senderprivateKey);

  await web3.setProvider(provider);

  let sendintransferamount = await web3.utils.toWei(
    transferamount.toString(),
    "ether"
  );
  let receipt = await contract.methods
    .transfer(receiveraddress, sendintransferamount)
    .send({ from: senderaddress, gas: 1e6 });

  return new Promise(async (resolve, reject) => {
    resolve({
      TxHash: receipt.events.Transfer.transactionHash,
      from: receipt.events.Transfer.returnValues.from,
      fromIndex: senderindex,
      toIndex: receiverindex,
      to: receipt.events.Transfer.returnValues.to,
      value: await web3.utils.fromWei(
        receipt.events.Transfer.returnValues.value,
        "ether"
      ),
    });
  });
  // console.log(myobj);
  // return myobj;
}
let results = async () => {
  let arrayofrequests = [{ sender: 0, receiver: 3, amount: 1 }];
  let mypromises = [];
  let result;
  try {
    for (const myobj of arrayofrequests) {
      mypromises.push(
        await transferovergsn(myobj.sender, myobj.receiver, myobj.amount)
      );
    }
    result = await Promise.all(mypromises);
  } catch (error) {
    console.log(error.message);
  }

  console.log(result);
};
// results();

const gettransactiondata = async (hash) => {
  const receipt = await web3.eth.getTransactionReceipt(hash.toString());

  const decodedlogs = await abidecoder.decodeLogs(receipt.logs);
  // console.log(decodedlogs[0].events);

  return {
    from: decodedlogs[0].events[0].value,
    to: decodedlogs[0].events[1].value,
    value: await web3.utils.fromWei(decodedlogs[0].events[2].value, "ether"),
  };
};

// gettransactiondata(
//   "0x32bf0ac134d88fe0cf658a5b9c93a39d14454764bde6b4a07a6d3ae293e6d4ae"
// ).then((results) => console.log(results));

// getBalanceOf("0x76df2fa76677e6e143bf05bdb7f324fe43d1e11d");

module.exports = {
  getTotalTokenSupply,
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getBalanceOf,
  transferovergsn,
  gettransactiondata,
};
