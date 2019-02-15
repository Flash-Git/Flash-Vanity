const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");

//const filteredAdds = [];

function generateAccounts(_num) {
  for(let i = 0; i < _num; i++){
    account = getNewAccount()
    if(filter(account.address) === true){
      //filteredAdds.push(account);
      console.log("Address: " + account.address + ", Key: " + account.privKey);
    }
  }
}

function getNewAccount() {
  const privKey = crypto.randomBytes(32);
  const address = "0x" + ethUtils.privateToAddress(privKey).toString("hex");
  return { address, privKey: privKey.toString("hex") };
}

function filter(_address) {
  if(!_address.toUpperCase().includes("f1a57".toUpperCase())){
    return false;
  }
  return true;
}

generateAccounts(50000);