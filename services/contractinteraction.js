const Web3 = require("web3");
require("dotenv").config();
const web3 = new Web3(`https://rinkeby.infura.io/v3/${process.env.infurakey}`);
const accountinfo = require("./accountcreation");

const Tx = require("ethereumjs-tx").Transaction;

const contractabi = require("./MyToken.json");

const contract = new web3.eth.Contract(
  contractabi.abi,
  "0x601B9A502441fcD137c49Dddd16aC51011c2e727",
  {
    from: "0x76df2fa76677e6e143bf05bdb7f324fe43d1e11d",
  }
);

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
  web3.eth.getTransactionCount(senderAddress, (error, count) => {
    const txObject = {
      from: senderAddress,
      nonce: web3.utils.toHex(count),
      to: "0x601B9A502441fcD137c49Dddd16aC51011c2e727",
      gasPrice: web3.utils.toHex(3 * 1e9),
      gasLimit: web3.utils.toHex(3000000),
      value: "0x0",
      data: contract.methods
        .transfer(receiverAddress, amounttosend)
        .encodeABI(),
      chainId: "4",
    };

    let tx = new Tx(txObject, { chain: "rinkeby", hardfork: "petersburg" });
    tx.sign(senderPrivateKey);
    let serializedtx = tx.serialize();

    let sentransaction = async () => {
      try {
        let receipt = await web3.eth.sendSignedTransaction(
          "0x" + serializedtx.toString("hex")
        );
      } catch (error) {
        console.log(error);
      }
    };
    sentransaction();
  });

  return {
    sender: senderAddress,
    receiver: receiverAddress,
    senderPrivateKey: senderPrivateKey,
  };
}

module.exports = {
  getTotalTokenSupply,
  getTokenName,
  getTokenSymbol,
  getTokenDecimals,
  getBalanceOf,
  transfer,
};
