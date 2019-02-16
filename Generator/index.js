#!/usr/bin/env node
const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");
const argv = require('yargs').argv;

//const filteredAdds = [];

function generateAccounts() {
  _string = argv.s.split(" ").join("");
  _string = _string.split(",").join(" or ");
  
  const stringArray = _string.split(" or ");
  
  if(!typeof(argv.n) === "number" && argv.n > 0){
    console.log("Invalid number: " + argv.n);
    return;
  }

  if(!checkString(stringArray)){
    return;
  }

  console.log("Searching for addresses including" + (argv.p ? " " + argv.p + " of" : "") + " " + (stringArray.length > 1 ? "either " : "") + _string + "...");

  for(let i = 0; i < argv.n; i){
    account = getNewAccount()
    if(filter(account.address, stringArray) === true){
      i++;
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
  
  if(argv.p){
    let score = 0;
    for(i = 0; i < _stringArray.length; i++){
      if(address.includes(_stringArray[i].toUpperCase())){
        score++;
      }
    }
    if(score >= argv.p){
      console.log("Score: " + score);
      return true;
    }
    return false;
  }

  for(i = 0; i < _stringArray.length; i++){
    if(address.includes(_stringArray[i].toUpperCase())){
      return true;
    }
  }
  return false;
}

generateAccounts();