const { accountdetails } = require("../services/accountcreation");
const {
  getTokenName,
  getBalanceOf,
  transferovergsn,
  getTotalTokenSupply,
  gettransactiondata,
  getTokenDecimals,
} = require("../services/contractinteraction");

// const { accountbalance } = require("../services/tokenclass");
// let ex = require("chai").expect;
let assert = require("chai").assert;

describe("should get an account", function () {
  it("should request account from the blockchain", async function () {
    const account = await accountdetails(0);
    assert.isObject(account);
    assert.isString(account.address);
  });
});

describe("should get balance of an account", function () {
  it("should get the token balance of an account on the blockchain", async function () {
    const { address } = await accountdetails(0);
    const balance = await getBalanceOf(address);
    assert.isString(balance);
  });
});

describe("should get transaction data once given a transaction hash", function () {
  it("should get transaction information given a transaction hash", async function () {
    const transactionhash =
      "0x143f1229f354fc26af178a4ab06c4568811ee58f2aa27f683aa08a6d58c48a90";
    const previoustransaction = await gettransactiondata(transactionhash);
    assert.isObject(previoustransaction);
    assert.isAbove(parseInt(previoustransaction.value), 0);
  });
});
describe("should check token details", function () {
  it("Should check if total token supply is equal to initially deployed", async function () {
    const tokensupply = await getTotalTokenSupply();

    assert.equal(tokensupply, "10000000000000000000000000000");
  });
  it("Should check token decimal places", async function () {
    const decimals = await getTokenDecimals();
    assert.equal(decimals, 18);
  });
  it("should check token name", async function () {
    const name = await getTokenName();
    assert.equal(name, "Mtoken");
  });
});

describe("Should test the transfer of tokens", function () {
  it("Should transfer tokens between accounts", async function () {
    const transfer = await transferovergsn(0, 1, 1);
    assert.equal(transfer.value, "1");
  });
});
