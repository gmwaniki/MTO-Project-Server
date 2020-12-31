const Web3 = require("web3");
require("dotenv").config();
const web3 = new Web3(`https://kovan.infura.io/v3/${process.env.infurakey}`);
const accountinfo = require("./accountcreation");

const GSN = require("@opengsn/gsn");
const abidecoder = require("abi-decoder");

// change depending to network
// current Rinkeby

let paymaster = "0x9bfa154d75C91CdEe372A5f343579c9717817c13";

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
  console.log(name);
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
    config: { paymasterAddress: paymaster },
  }).init();

  let sender = accountinfo.accountdetails(senderindex);
  let receiver = accountinfo.accountdetails(receiverindex);
  let senderaddress = (await sender).address[0];
  let receiveraddress = (await receiver).address[0];
  let receiverprivateKey = (await receiver).privateKey;
  let senderprivateKey = (await sender).privateKey;

  provider.addAccount(receiverprivateKey);
  provider.addAccount(senderprivateKey);

  await web3.setProvider(provider);

  let sendintransferamount = await web3.utils.toWei(
    transferamount.toString(),
    "ether"
  );
  let balance = await contract.methods
    .transfer(receiveraddress, sendintransferamount)
    .send({ from: senderaddress, gas: 1e6 });

  console.log(balance.events.Transfer);
  console.log(balance.events.Transfer.transactionHash);
  console.log(balance.events.Transfer.returnValues);
  console.log(balance.events.Transfer.returnValues.from);

  return {
    TxHash: balance.events.Transfer.transactionHash,
    from: balance.events.Transfer.returnValues.from,
    fromIndex: senderindex,
    toIndex: receiverindex,
    to: balance.events.Transfer.returnValues.to,
    value: await web3.utils.fromWei(
      balance.events.Transfer.returnValues.value,
      "ether"
    ),
  };
  // console.log(myobj);
  // return myobj;
}
// transferovergsn(0, 3, 1);

const gettransactiondata = async (hash) => {
  const receipt = await web3.eth.getTransactionReceipt(hash.toString());

  const decodedlogs = await abidecoder.decodeLogs(receipt.logs);

  return {
    from: decodedlogs[1].events[0].value,
    to: decodedlogs[1].events[1].value,
    value: await web3.utils.fromWei(decodedlogs[1].events[2].value, "ether"),
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
