#!/usr/bin/env node
const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const ora = require("ora");
const fs = require("fs");
const inputArg = require("yargs")
  .usage("Usage: $0 -s [string] -n [num] -d [num] -l [string] -h")
  .alias("s", "string")
  .describe("s", "String to find in addresses, supports multiple strings seperated by commas")
  .demandOption(["s"])
  .alias("n", "number")
  .describe("n", "Number of matching addresses to generate")//find is more accurate
  .default("n", 10)
  .alias("score", "scoreThreshold")//old c
  .describe("score", "Score required to return address")
  .default("score", 0)
  .alias("sl", "searchLocation")
  .describe("sl", "Multipliers for where to look for string")
  .default("sl", "1, 0, 0")
  .alias("0m", "0Multiplier")
  .describe("0m", "Multiplier per leading 0")
  .default("0m", 0)
  .alias("ra", "rareAddresses")
  .describe("ra", "Toggle check for letter or number addresses")
  .default("ra", "false, false")
  .alias("d", "dynamicScore")
  .describe("d", "Toggle support for explicit score after each string entry")
  //.default("d", false)
  .alias("l", "log")
  .describe("l", "Adds logging to the specified filename")
  .default("l", Date.now())
  .alias("t", "threads")
  .describe("t", "Number of threads to spawn")
  .default("t", numCPUs)
  .alias("r", "refreshTime")
  .describe("r", "Sets refresh time on spinner in ms")
  .default("r", 2000)
  .alias("sa", "similar addresses")
  .describe("sa", "Toggle generation of similar strings")
  //.default("sa", false)
  .example("$0 -s '1337' | Finds addresses containing '1337'")
  .example("$0 -s '1337, b00b5' | Finds addresses containing either '1337' or 'b00b5'")
  .example("$0 -n 50 -s '1337' | Finds 50 addresses containing '1337'")
  //.example("$0 -s '1337, b00b5' -p '2' | Finds addresses containing both '1337' and 'b00b5'")
  .help("h")
  .alias("h", 'help')
  .argv;

function run() {
  if(cluster.isMaster){
    masterRun();
  }else{
    generateAccounts();
  }
}


/*
 * RUN MASTER
 *
*/


function cleanString(_string) {
  return _string.toLowerCase().split(" ").join("");
}

function masterRun() {
  let string = inputArg.s;
  let rareAdds = inputArg.ra;
  let searchLoc = inputArg.sl;

  //Clean strings
  try{
    string = cleanString(string);
    rareAdds = cleanString(inputArg.ra);
    searchLoc = cleanString(inputArg.sl);
  }catch(e){
    console.log("Inputs failed cleaning:");
    console.log(e);
    return;
  }

  //Check command
  try{

  }catch(e){
    console.log("Command failed check:");
    console.log(e);
    return;
  }

  //Add scores
  if(!inputArg.d){
    //Add score based on rarity
    let stringList = string.split(",");
    if(stringList.length === 0){
      string = string + "-" + 16**string.length;
    }else{
      for(let i = 0; i < stringList.length; i++){
        stringList[i] = stringList[i] + "-" + 16**stringList[i].length;
      }
      string = stringList.join(",");
    }
  }

  //Generate similars
  if(inputArg.sa){
    const stringList = string.split(",");
    for(let i = 0; i < stringList.length; i++){
      const split = stringList[i].split("-");
      const genArray = genSimilars(split[0]);
      for(let i = 0; i < genArray.length; i++){
        newString.push(genArray[i] + "-" + split[1]);
      }
    }
    string = newString.join(",");
  }

  //Sort string
  string = () => {
    
  }

  const stringList = string.split(",");

  //Join first 3 entries for output log
  const shortString = () => {
    if(stringList.length > 3){
      let shortStringList = [];
      for(let i = 0; i < 3; i++){
        shortStringList.push(stringList[i]);
      }
      return shortStringList.join(" or ");
    }
    return stringList.join(" or ");
  }

  const searchMsg = "Searching for addresses including" + (argv.score > 0 ? " " + argv.score + " of" : "") + " " + 
    (stringList.length > 1 ? "either " : "") + shortString + "...\n"
  
  console.log("\n"+ searchMsg);

  const spinner = ora("Searching for address number " + 1 + " of " + argv.n + "...");
  spinner.color = "cyan";
  spinner.start();

  write(searchMsg);

  startWorkers(spinner, string, [rareAdds, searchLoc, inputArg.r0, inputArg.d]);
}

function generateAccounts() {
  const stringArray = process.env.string.split(",");

  //Total number of generated accounts
  let accGened = 0;

  //Set scores in array
  for(let i = 0; i < stringArray.length; i++){
    stringArray[i] = stringArray[i].split("-");
    stringArray[i][1] = +stringArray[i][1];
  }
  
  while(true){
    const account = getNewAccount();
    
    accGened++;
    
    if(accGened%500 === 499){
      process.send({
        incr: true
      });
    }
    
    const resultMsg = filter(account.address, stringArray, []);
    if(resultMsg === ""){
      continue;
    }

    process.send({
      msg: (resultMsg + "\nAddress: " + account.address + ", Key: " + account.privKey)
    });
  }
}

function filter(_address, _stringArray, _args) {
  //Remove 0x
  address = _address.substring(2);

  let score = 0;
  let baseMult = 0;
  let list = [];

  if(_args.raNum){
    if(isValidNum(address)) return generateListString("number", list);
  }
  if(_args.raLetter){
    if(isValidTxt(address)) return generateListString("letter", list);
  }

  if(_args.zeroMult > 0){
    baseMult = setZeroMult(address, _args.zeroMult);
  }

  if(_args.searchLoc){

  }
  
  //Return if it passes score requirement
  if(!passTally(score, list, _preci[0])){
    return false;
  }

  return generateListString(score, list);
}

function setZeroMult(_address, _mult) {
  for(let i = 0; i < 10; i++){
    if(!_address[i] === "0") break;
    //increase mult
  }

}

function generateListString(_score, _list) {
  let listString = _list.join(", ").toString();
  if(_list.length > 1){
    listString = listString.substring(0, listString.lastIndexOf(", ")) + " and" + 
      listString.substring(listString.lastIndexOf(", ") + 1, listString.length);
  }
  return listString + " for a score of " + _score + ":";
}


/*
 * GEN SIMILARS
 *
*/

String.prototype.replaceAt = (index, replacement) => {
  return this.substr(0, index) + replacement+ this.substr(index+1);
}

function genSimilars(_string) {
  const newString = _string;
  const aeList = [];
  for(let i = 0; i < newString.length; i++){
    if(newString[i] === "a"){
      aeList.push(["a", "a", "4", i]);
    } else if(newString[i] === "e"){
      aeList.push(["e", "e", "3", i]);
    }
  }
  //Imcrement through the possibilities in the same way that you increment base 2 numbers
  const newList = gen(aeList, 0, []);
  const completeList = [newString];
  
  for(let i = 0; i < newList.length; i++){
    const aeWordList = newList[i];
    let string = newString;
    for(let j = 0; j < aeWordList.length; j++){
      const aeLetterList = aeWordList[j];
      string = string.replaceAt(aeLetterList[3], aeLetterList[0]);
    }
    completeList.push(string);
  }
  return completeList;
}

function gen(_aeList, _index, _newList) {
  const aeList = JSON.parse(JSON.stringify(_aeList));

  if(_index === aeList.length){
      return _newList;
  }

  //Check _index bit
  if(aeList[_index][0] === aeList[_index][1]){
    aeList[_index][0] = aeList[_index][2]; //Flip next bit to new value

    for(let i = 0; i < _index; i++){ //Unflip previous bits
      aeList[i][0] = aeList[i][1];
    }
    _newList.push(aeList); //Add new combination
    _index = 0;
  }else{
    _index++; //Check next bit
  }
  return gen(aeList, _index, _newList);
}


/*
 * ACCOUNT GENERATION
 *
*/

function getNewAccount() {
  const privKey = crypto.randomBytes(32);
  const address = "0x" + ethUtils.privateToAddress(privKey).toString("hex");
  return { address, privKey: privKey.toString("hex") };
}


/*
 * FILTER
 *
*/

function checkWithP(_address, _stringArray, _score, _list, _preci) {
  let startIndex = 0;
  for(let i = 0; i < _stringArray.length; i++){
    const includedStr = checkIncludes(_address, _stringArray[i][0]);
    if(includedStr === false){
      continue;
    }
    _list.push(includedStr);

    if(_address.indexOf(includedStr) === startIndex){//Is at start of address
      _score *= 1.5;
      _score += 2 * _stringArray[i][1];//doubles points
      startIndex += includedStr.length;
      continue;
    }
    _score += +_stringArray[i][1];
  }

  //Increase score by -p [2] if there are enough vanity strings according to -p [1]
  if(_list.length >= _preci[1]){
    _score += (+_preci[2] + _list.length - _preci[1]);
  }
  return [_score, _list];
}

function checkIncludes(_address, _string) {
  if(address.includes(_string)){//contains sub
    return _string;
  }
  return false;
}

function checkWithoutP(_score, _list) {
  for(let i = 0; i < _stringArray.length; i++){
    if(address.includes(_stringArray[i])){
      _list.push(_stringArray[i]);
      _score++;
    }
  }
  return [_score, _list];
}

function passTally(_score, _list, _vanityBar) {
  if(_score < argv.c){
    if(argv.p == "undefined"){
      return false;
    }else if(_list.length < _vanityBar){//Return if address passes contains at least -p[0] vanity strings
      return false;
    }
  }
  return true;
}


/*
* RUN CLEANING AND CHECKS
*
*/


function checkCommand(_string) {
  if(!typeof(argv.n) === "number" && argv.n > 0){
    console.log("Invalid number: " + argv.n);
    return false;
  }
  if(!checkString(_string.split(" or "))){
    return false;
  }
  return true;
}

function checkString(_stringArray) {  
  for(let i = 0; i < _stringArray.length; i++){
    if(argv.p){
      let entry = _stringArray[i].split("-");

      if(entry.length !== 2){
        console.log("Invalid entry length of " + entry + " at pos = [" + i + "]");
        return false;
      }
      if(typeof(+entry[1]) !== "number"){
        console.log("Invalid type of " + entry[1] + " at pos = [" + i + "]");
        return false;
      }
      if(!isValidHex(entry[0])){
        console.log("Invalid hex in " + entry[0] + " at pos = [" + i + "]");
        return false;
      }
      continue;
    }

    if(!isValidHex(_stringArray[i])){
      console.log("Invalid hex in " + _stringArray[i] + " at pos = [" + i + "]");
      return false;
    }
  }
  return true;
}


/*
* FORK WORKER PROCESSES
*
*/

function startWorkers(_spinner, _string, _args) {
  //Successfully generated addresses
  let accCount = 0;
  
  let generationTotal = 0;
  let lastGeneration = 0;
  let lastTime = Date.now();

  for(let i = 0; i < argv.t; i++){
    const worker_env = {
      string: _string,
      args: _args
    }
    proc = cluster.fork(worker_env);
    proc.on("message", message => {
      if(message.msg){
        if(accCount >= argv.n){
          return;
        }
        _spinner.succeed(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        write(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        accCount++;
        if(accCount >= argv.n){
          cleanup();
          _spinner.text = "Ending Process";
          return;
        }
        _spinner.text = "Searching for address " + (accCount+1) + " of " + argv.n + " at a rate of " + 
          Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
          _spinner.start();
      }
      if(message.incr){
        generationTotal += 500;
      }
    });
  }

  setInterval(() => {
    _spinner.text = "Searching for number " + (accCount+1) + " of " + argv.n + " at a rate of " + 
      Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
    lastGeneration = generationTotal;
    lastTime = Date.now();
  }, argv.r);
}


/*
* WRITE
*
*/

function write(_account) {
  fs.appendFileSync("flash-vanity-" + argv.l +".txt", _account, (err) => {
    if(err){
      console.log(err);
      cleanup();
    }
  });
}


/*
* REGEX
*
*/

function isValidHex(_string) {
  let re = /^[0-9a-f]+$/g;
  return re.test(_string);
}

function isValidNum(_string) {
  let re = /^[0-9]+$/g;
//  if(!re.test(_string.substring(0, 5))){
//    return false;
//  }
	return re.test(_string);
}

function isValidTxt(_string) {
  let re = /^[a-f]+$/g;
//  if(!re.test(_string.substring(0, 5))){//TODO test whether or not this actually boosts performance
//    return false;
//  }
	return re.test(_string);
}


/*
* END
*
*/

function cleanup() {
  for(let id in cluster.workers){
    cluster.workers[id].process.kill();
  }
  process.exit();
}

process.stdin.resume();

process.on("exit", cleanup.bind(null, {}));
process.on("SIGINT", cleanup.bind(null, {}));
process.on("uncaughtException", cleanup.bind(null, {}));

run();

// let strings = [[aaa5, 0], [aaa4, 0], [aab2, 0], [aa68, 0], [bab2, 0], [bac9, 0], [cac9, 0], [dadd, 0], [dadf, 0]];


// //create list of index 0s
// let strings0 = [aaa5, bab2, cac9];

// let strings = [[a, [aa, [aaa, [aaa5, aaa4]], [aab2, aa68]]], [ba, [bab2, bac9]], [cac9], [dad, [dadd, dadf]]];
// strings[0] = [a, [aa, [aaa, [aaa5, aaa4]], [aab2, aa68]]];
// strings[0][0] = a;
// strings[0][1] = [aa, [aaa, [aaa5, aaa4]], [aab2, aa68]];
// strings[0][1][0] = aa;
// strings[0][1][1] = [aaa, [aaa5, aaa4]];
// strings[0][1][2] = [aab2, aa68];
// -strings[0][1][2][0] = aab2;
// -strings[0][1][2][1] = aa68;
// strings[0][1][1][0] = aaa;
// strings[0][1][1][1] = [aaa5, aaa4];
// -strings[0][1][1][1][0] = aaa5;
// -strings[0][1][1][1][1] = aaa4;
// strings[1] = [ba, [bab2, bac9]];
// strings[1][0] = ba;
// strings[1][1] = [bab2, bac9];
// -strings[1][1][0] = bab2;
// -strings[1][1][1] = bac9;
// strings[2] = [cac9];
// strings[3] = [dad, [dadd, dadf]];