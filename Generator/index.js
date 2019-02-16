#!/usr/bin/env node
const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");
const argv = require("yargs")
      .usage("Usage: $0 -n [num] -s [string] -p [num]")
      .demandOption(["s"])
      .default("n", 100)
      .alias("n", "number")
      .describe("n", "Number of matching addresses to generate")//find is more accurate
      .alias("s", "string")//TODO change to smth less dumb
      .describe("s", "String to find in addresses, supports multiple strings seperated by commas")
      .describe("p", "Minimum number of required strings to find in each address")
      .example("$0 -s '1337' | Finds addresses containing '1337'")
      .example("$0 -s '1337, b00b5' | Finds addresses containing either '1337' or 'b00b5'")
      .example("$0 -n 50 -s '1337' | Finds 50 addresses containing '1337'")
      .example("$0 -s '1337, b00b5' -p '2' | Finds addresses containing both '1337' and 'b00b5'")
      .argv;

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