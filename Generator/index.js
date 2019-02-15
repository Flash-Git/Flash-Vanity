const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");

function generateAccounts(_num) {
  const accounts = [];
  for(let i = 0; i < _num; i++){
    accounts.push(getNewAccount());
    console.log("Address: " + accounts[i].address + ", Key: " + accounts[i].privKey);
  }
}

function getNewAccount() {
  const privKey = crypto.randomBytes(32);
  const address = "0x" + ethUtils.privateToAddress(privKey).toString("hex");
  return { address, privKey: privKey.toString("hex") };
}

generateAccounts(500);