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
  .describe("n", "Number of matching addresses to generate")
  .default("n", 10)
  .alias("c", "count")
  .describe("c", "Score required to return address")
  .default("c", 1)
  .alias("sl", "searchLocation")
  .describe("sl", "Multipliers for where to look for string")
  .default("sl", "1, 0, 0")
  .alias("zm", "zeroMult")
  .describe("zm", "Multiplier for leading zeros")
  .default("zm", 0)
  .alias("ra", "rareAddresses")
  .describe("ra", "Toggle check for letter or number addresses")
  .default("ra", "false, false")
  .alias("d", "dynamicScore")
  .describe("d", "Toggle support for explicit score after each string entry")
  .default("d", false)
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
  .default("sa", false)
  .example("$0 -s '1337' | Finds 10 addresses starting with '1337'")
  .example("$0 -s '1337' --ra true, true | Finds 10 addresses starting with '1337' or addresses made up of only letters or addresses made up of only numbers")
  .example("$0 -s '1337' -t 1 | Finds 10 addresses starting with '1337' using only 1 thread")
  .example("$0 -s '1337, b00b5' | Finds 10 addresses starting with either '1337' or 'b00b5'")
  .example("$0 -s '1337' -n 50 | Finds 50 addresses starting with '1337'")
  .example("$0 -s 'aa' --sa true --zm 1 -c 5 | Finds 10 addresses starting with 'aa' or 'a4' or '4a' or '44' or enough leading zeros to reach score")
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

function masterRun() {
  let string = inputArg.s;
  let rareAdds = inputArg.ra;
  let searchLoc = inputArg.sl;
  let score = inputArg.c;

  const cleanString = _string => {
    try{
      return _string.toLowerCase().split(" ").join("");
    }catch(e){
      console.log("Inputs failed cleaning:");
      console.log(_string);
      throw e;
    }
  }

  //Clean strings
  try{
    string = cleanString(string);
    rareAdds = cleanString(rareAdds);
    searchLoc = cleanString(searchLoc);
    score = 16**score;
  }catch(e){
    //console.log(e);
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
    let newString = [];
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
  const stringList = string.split(",").sort();
  string = stringList.join(",")

  //Short string
  const shortString = () => {
    if(stringList.length > 3){
      let shortStringList = [];
      for(let i = 0; i < 3; i++){
        shortStringList.push(stringList[i]);
      }
    return shortStringList.join(" or ");
    }
    return stringList.join(" or ");
  };

  const searchMsg = "Searching for addresses reaching a score of" + (score > 0 ? " " + score + " in" : "") + " " + 
    (stringList.length > 1 ? "either " : "") + shortString() + "...\n"
  
  console.log("\n"+ searchMsg);

  const spinner = ora("Searching for address number " + 1 + " of " + inputArg.n + "...");
  spinner.color = "cyan";
  spinner.start();

  write(searchMsg);

  startWorkers(spinner, string, { rareAdds, searchLoc, zeroMult: inputArg.zm, dynScore: inputArg.d, score });
}

function generateAccounts() {
  const newStringArray = JSON.parse(process.env.string);

  const args = {
    rareAdds: process.env.rareAdds.split(","),
    searchLoc: process.env.searchLoc.split(","),
    zeroMult: process.env.zeroMult,
    dynScore: process.env.dynScore,
    score: process.env.score
  }

  //Convert args
  for(let i = 0; i < args.rareAdds.length; i++) args.rareAdds[i] = args.rareAdds[i] === "true" ? true : false;
  for(let i = 0; i < args.searchLoc.length; i++) args.searchLoc[i] = +args.searchLoc[i];
  args.dynScore = args.dynScore === "true" ? true : false;
  args.score = +args.score;
  
  //Total number of generated accounts
  let accGened = 0;
  
  while(true){
    const account = getNewAccount();
    
    accGened++;
    
    if(accGened%5000 === 4999){
      process.send({
        incr: true
      });
    }
    
    const resultMsg = filter(account.address, newStringArray, args);
    if(resultMsg === false) continue;

    process.send({
      msg: (resultMsg + "\nAddress: " + account.address + ", Key: " + account.privKey)
    });
  }
}

function checkMatch(_letterObj, _address, _index, _longestString = false) {//is using boolean better than empty string?
  if(_letterObj.createdString[1] > 0) _longestString = _letterObj.createdString;

  for(let i = 0; i < _letterObj.letters.length; i++){
    if(_address[_index] !== _letterObj.letters[i]) continue;
    return checkMatch(_letterObj.nextLetters[i], _address, _index+1, _longestString);
  }
  return _longestString;
}

function filter(_address, _newStringArray, _args) {
  //Remove 0x
  address = _address.substring(2);

  let score = 1;
  let list = [];

  if(_args.rareAdds[0]){
    if(isValidNum(address)) return generateListString("number", ["number"]);
  }
  if(_args.rareAdds[1]){
    if(isValidTxt(address)) return generateListString("letter", ["number"]);
  }

  const handleMatch = (_index, _match) => {
    if(!_match) return false;
    
    list.push(_match[0]);
    if(_index === 0){
      if(_args.searchLoc[0] > 0) score = _match[1]*_args.searchLoc[0];//Apply start of string bonus
      else score*=_match[1];
      return true;
    }
    score*=_match[1];
    return true;
  }
  
  handleMatch(0, checkMatch(_newStringArray, address, 0));
  
  if(_args.zeroMult > 0){
    if(score === 1){
      const zeros = setZeroMult(address);
      if(zeros > 1){//2 zeros for a byte (doesn't take into account strings starting with 0)
        list.push("zeros");
        score = 16**(zeros*_args.zeroMult);
        handleMatch(zeros, checkMatch(_newStringArray, address, zeros));
      }else score--;
    }
  }

  if(score < _args.score) return false;

  return generateListString(score, list);
}

//Old check
function checkChar(_address, _index, _stringArray) {
  let newArray = [];
  for(let i = 0; i < _stringArray.length; i++){
    const string = _stringArray[i][0];
    if(string.length+_index >= _address.length) continue;
    let removed = false;
    for(let j = 0; j < string.length; j++){
      if(_address[_index+j] !== string[j]){
        removed = true;
        break;
      }
    }
    if(!removed) newArray.push(_stringArray[i]);
  }
  if(newArray.length === 0) return false;

  let highScore = ["", 1]; 
  for(let i = 0; i < newArray.length; i++){
    if(newArray[i][1] > highScore[1]) highScore = newArray[i];
  }
  return highScore;
}

function setZeroMult(_address) {
  for(let i = 0; i < _address.length; i++){
    if(_address[i] !== "0") return i;
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

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index+1);
}

//TODO make it work both ways
function genSimilars(_string) {
  const newString = _string;
  const aeList = [];
  for(let i = 0; i < newString.length; i++){
    if(newString[i] === "a"){
      aeList.push(["a", "a", "4", i]);
    }else if(newString[i] === "e"){
      aeList.push(["e", "e", "3", i]);
    }else if(newString[i] === "b"){
      aeList.push(["b", "b", "6", i]);
    }
  }
  //Imcrement through the possibilities in the same way that you increment base 2 numbers
  const newList = gen(aeList, 0, []);
  let completeList = [newString];
  
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

  if(_index === aeList.length) return _newList;

  //Check _index bit
  if(aeList[_index][0] === aeList[_index][1]){
    aeList[_index][0] = aeList[_index][2]; //Flip next bit to new value

    for(let i = 0; i < _index; i++){ //Unflip previous bits
      aeList[i][0] = aeList[i][1];
    }
    _newList.push(aeList); //Add new combination
    _index = 0;
  }else _index++; //Check next bit
  
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
* RUN CLEANING AND CHECKS
* TODO
*/

//TODO
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

function LetterObj() {
  this.createdString = "";
  this.letters = [];
  this.nextLetters = [];
}

function makeObj(_index, _strings, _createdString = ["", 0]) {
  const letterObj = new LetterObj();
  letterObj.createdString = _createdString;

  if(_strings.length === 0) return letterObj;

  const splitStrings = (_index, _strings) => {
    let counter = 0;
    let outputArr = [[]];
    let currentChar = _strings[0][0][_index];

    for(let i = 0; i < _strings.length; i++){
      if(_strings[i][0][_index] === currentChar){
        outputArr[counter].push(_strings[i]);
      }else{
        counter++;
        outputArr.push([_strings[i]]);
        currentChar = _strings[i][0][_index];
      }
    }
    return outputArr;
  }

  //Split strings into arrays where all characters up to and including _index are the same
  const splitArr = splitStrings(_index, _strings);
  //Loop through each character's array
  for(let i = 0; i < splitArr.length; i++){
    //Add each character into this object's letter array
    letterObj.letters.push(splitArr[i][0][0][_index]);

    let createdString = ["", 0];
    //innerList is the array of strings that still need to be placed
    let innerList = [];

    //If the first element's length matches the index, it is a created string
    if(splitArr[i][0][0].length-1 === _index){
      createdString = splitArr[i][0];
    }

    //Loop through every string in the character array
    for(let j = 0; j < splitArr[i].length; j++){
      //inner is the full string
      let inner = splitArr[i][j];
      //still needs to be placed
      if(j > 0 || createdString[0] === "") innerList.push(inner);
    }
    //We go AGAIN
    letterObj.nextLetters.push(makeObj(_index+1, innerList, createdString));
  }
	return letterObj;
}

function startWorkers(_spinner, _string, _args) {
  //Successfully generated addresses
  let accCount = 0;
  
  let generationTotal = 0;
  let lastGeneration = 0;
  let lastTime = Date.now();

  let stringArray = _string.split(",");
  //Set scores in array
  for(let i = 0; i < stringArray.length; i++){
    stringArray[i] = stringArray[i].split("-");
    stringArray[i][1] = +stringArray[i][1];
  }
  let newString = JSON.stringify(makeObj(0, stringArray));

  for(let i = 0; i < inputArg.t; i++){
    const worker_env = {
      string: newString,
      rareAdds: _args.rareAdds,
      searchLoc: _args.searchLoc,
      zeroMult: _args.zeroMult,
      dynScore: _args.dynScore,
      score: _args.score
    }
    try{
      proc = cluster.fork(worker_env);
    }catch(e){
      console.log("Error: ");
      console.log(e);
      return;
    }
    proc.on("message", message => {
      if(message.msg){
        if(accCount >= inputArg.n){
          return;
        }
        _spinner.succeed(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        write(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        accCount++;
        if(accCount >= inputArg.n){
          cleanup();
          _spinner.text = "Ending Process";
          return;
        }
        _spinner.text = "Searching for address " + (accCount+1) + " of " + inputArg.n + " at a rate of " + 
          Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
          _spinner.start();
      }
      if(message.incr){
        generationTotal += 5000;
      }
    });
  }

  setInterval(() => {
    _spinner.text = "Searching for number " + (accCount+1) + " of " + inputArg.n + " at a rate of " + 
      Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
    lastGeneration = generationTotal;
    lastTime = Date.now();
  }, inputArg.r);
}


/*
* WRITE
*
*/

function write(_account) {
  fs.appendFileSync("flash-vanity-" + inputArg.l +".txt", _account, (err) => {
    if(err){
      console.log("Error writing to file:");
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