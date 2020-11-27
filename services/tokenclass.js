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
    let addressinfo = await this.accounts(index);
    let address = addressinfo.address;

    let accountBalance = await contractinteraction.getBalanceOf(address);
    let balance = await web3.utils.fromWei(accountBalance, "ether");
    return { balance: balance, address: address };
  }

  async transfer(sender, receiver, amount) {
    let transfer = await contractinteraction.transfer(sender, receiver, amount);
    return transfer;
  }
}

module.exports = { ProjectToken };
