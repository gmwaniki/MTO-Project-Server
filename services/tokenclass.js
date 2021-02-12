const contractinteraction = require("./contractinteraction");
const accountinfo = require("./accountcreation");
const Web3 = require("web3");
const web3 = new Web3();

class ProjectToken {
  async contractdetails() {
    let totalSupply = await web3.utils.fromWei(
      await contractinteraction.getTotalTokenSupply(),
      "ether"
    );

    let tokenSymbol = await contractinteraction.getTokenSymbol();
    let tokenName = await contractinteraction.getTokenName();
    let tokenDecimals = await contractinteraction.getTokenDecimals();

    return {
      totalSupply: parseInt(totalSupply).toLocaleString(),
      tokenSymbol: tokenSymbol,
      tokenDecimals: tokenDecimals,
      tokenName: tokenName,
    };
  }

  async accounts(index) {
    let account = await accountinfo.accountdetails(index);

    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
    };
  }

  async accountbalance(index) {
    let addressinfo = await accountinfo.accountdetails(parseInt(index));
    let address = addressinfo.address;

    let accountBalance = await contractinteraction.getBalanceOf(address);
    accountBalance = accountBalance.toString();
    let balance = await web3.utils.fromWei(accountBalance, "ether");
    return { balance: balance, address: address };
  }

  async transfer(senderindex, receiverindex, amount) {
    // this function returns a transaction hash
    let { TxHash } = await contractinteraction.transferovergsn(
      senderindex,
      receiverindex,
      amount
    );
    return TxHash;
  }
}

module.exports = new ProjectToken();
