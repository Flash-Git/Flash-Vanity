#!/usr/bin/env node
const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");
const argv = require('yargs').argv;

//const filteredAdds = [];

function generateAccounts(_num, _string) {
  _string = _string.split(" ").join("");
  _string = _string.split(",").join(" or ");
  
  const stringArray = _string.split(" or ");
  
  if(!typeof(_num) === "number" && _num > 0){
    console.log("Invalid number: " + _num);
    return;
  }

  if(!checkString(stringArray)){
    return;
  }

  if(stringArray.length > 1){
    console.log("Searching for addresses including either " + _string + "...");
  } else {
    console.log("Searching for addresses including " + _string + "...");
  }

  for(let i = 0; i < _num; i++){
    account = getNewAccount()
    if(filter(account.address, stringArray) === true){
      //filteredAdds.push(account);
      console.log("Address: " + account.address + ", Key: " + account.privKey);
    }
  }
}

function checkString(_stringArray) {
  for(i = 0; i < _stringArray.length; i++){
    if(!isValidHex(_stringArray[i])){
      console.log("Invalid hex in " + _stringArray[i] + " at pos = [" + i + "]");
      return false;
    }
  }
  return true;
}

function isValidHex(_string) {
  let re = /^[0-9A-F]+$/g;
	return re.test(_string.toUpperCase());
}

function getNewAccount() {
  const privKey = crypto.randomBytes(32);
  const address = "0x" + ethUtils.privateToAddress(privKey).toString("hex");
  return { address, privKey: privKey.toString("hex") };
}

function filter(_address, _stringArray) {
  address = _address.toUpperCase();
  for(i = 0; i < _stringArray.length; i++){
    if(address.includes(_stringArray[i].toUpperCase())){
      return true;
    }
  }
  return false;
}

generateAccounts(argv.n, argv.s);