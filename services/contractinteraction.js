const Web3 = require("web3");
require("dotenv").config();
const web3 = new Web3(`https://rinkeby.infura.io/v3/${process.env.infurakey}`);
const accountinfo = require("./accountcreation");
const BN = require("bignumber.js");
const GSN = require("@opengsn/gsn");
const {
  resolveConfigurationGSN,
} = require("@opengsn/gsn/dist/src/relayclient/GSNConfigurator");
const Tx = require("ethereumjs-tx").Transaction;
let forwarder = "0x956868751Cc565507B3B58E53a6f9f41B56bed74";

let paymaster = "0x55440b5df49de101072f8969D7B8cBFbF17AE186";

const contractabi = require("./MyToken.json");

const contract = new web3.eth.Contract(
  contractabi.abi,
  contractabi.networks[4].address
);
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
  return balance;
}

async function transfer(send, receive, amount) {
  let senderDetails = await accountinfo.accountdetails(send);
  let receiverDetails = await accountinfo.accountdetails(receive);

  let senderAddress = senderDetails.address[0].toString();
  let senderPrivateKey = Buffer.from(senderDetails.privateKey, "hex");
  let receiverAddress = receiverDetails.address[0];
  let amounttosend = await web3.utils.toWei(amount.toString(), "ether");

  let count = await web3.eth.getTransactionCount(senderAddress);

  let txObject = {
    nonce: web3.utils.toHex(count),
    to: "0x1c3760cB2bA5719F7A095D382293ac3C0C6F91c7",
    gasPrice: web3.utils.toHex(3 * 1e9),
    gasLimit: web3.utils.toHex(3000000),
    value: "0x0",
    data: contract.methods.transfer(receiverAddress, amounttosend).encodeABI(),
    chainId: "4",
  };

  let tx = new Tx(txObject, { chain: "rinkeby", hardfork: "petersburg" });
  tx.sign(senderPrivateKey);
  let serializedtx = tx.serialize();

  try {
    await web3.eth.sendSignedTransaction("0x" + serializedtx.toString("hex"));
  } catch (error) {
    if (error) {
      return {
        status: 0,
        Message: "",
        Error: error.message,
      };
    }
  }
}

async function contractinfo(senderindex, receiverindex) {
  const config = await resolveConfigurationGSN(web3.currentProvider, {
    paymasterAddress: paymaster,
    forwarderAddress: forwarder,
  });
  let provider = new GSN.RelayProvider(web3.currentProvider, config);

  let sender = accountinfo.accountdetails(senderindex);
  let receiver = accountinfo.accountdetails(receiverindex);
  let senderaddress = (await sender).address[0];
  let receiveraddress = (await receiver).address[0];
  let receiverprivateKey = (await receiver).privateKey;
  let senderprivateKey = (await sender).privateKey;
  let senderBufferprivateKey = Buffer.from(senderprivateKey, "hex");
  let receiverBufferprivateKey = Buffer.from(receiverprivateKey, "hex");
  let senderaccounttoaddtoprovider = {
    address: senderaddress,
    privateKey: senderBufferprivateKey,
  };
  let receiveraccounttoaddtoprovider = {
    address: receiveraddress,
    privateKey: receiverBufferprivateKey,
  };
  provider.addAccount(senderaccounttoaddtoprovider);
  provider.addAccount(receiveraccounttoaddtoprovider);

  web3.setProvider(provider);
  let transferamount = BN("2e18");
  let balance = await contract.methods
    .transfer(receiveraddress, transferamount)
    .send({ from: senderaddress, gas: 1e6 });
  console.log(balance.toString());
  //   let balance = await mytokencontractinstance.methods
  //     .balanceOf(receiveraddress)
  //     .call();
  //   console.log(balance);
}
contractinfo(0, 2);

module.exports = {
  getTotalTokenSupply,
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getBalanceOf,
  transfer,
};
