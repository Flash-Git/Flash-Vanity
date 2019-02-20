#!/usr/bin/env node
const crypto = require("crypto");
const ethUtils = require("ethereumjs-util");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const ora = require("ora");
const fs = require("fs");
const argv = require("yargs")
  .usage("Usage: $0 -n [num] -s [string] -p [num] -l [string] -h")
  .default("n", 100)
  .alias("n", "number")
  .describe("n", "Number of matching addresses to generate")//find is more accurate
  .alias("s", "string")//TODO change to smth less dumb
  .describe("s", "String to find in addresses, supports multiple strings seperated by commas")
  .demandOption(["s"])
  .alias("p", "precision")
  .describe("p", "Toggle support for score after each string entry")
  .alias("c", "combo")
  .describe("c", "minimum number of required strings to find in each address")
  .default("l", Date.now())
  .alias("l", "log")
  .describe("l", "Adds logging to the specified filename")
  .default("t", numCPUs)
  .alias("t", "threads")
  .describe("t", "Number of threads to spawn")
  .default("r", 5000)
  .alias("r", "refreshTime")
  .describe("r", "Sets refresh time on spinner in ms")
  .alias("a", "similar")
  .describe("a", "Toggle similar string matches")
  .example("$0 -s '1337' | Finds addresses containing '1337'")
  .example("$0 -s '1337, b00b5' | Finds addresses containing either '1337' or 'b00b5'")
  .example("$0 -n 50 -s '1337' | Finds 50 addresses containing '1337'")
  .example("$0 -s '1337, b00b5' -p '2' | Finds addresses containing both '1337' and 'b00b5'")
  .help("h")
  .alias("h", 'help')
  .argv;

function run() {
  if(cluster.isMaster){
    masterRun();
  }else{
    generateAccounts(process.env.stringArray.split(","));
  }
}

function generateAccounts(_stringArray) {
  if(argv.p){
    for(let i = 0; i <_stringArray.length; i++){
      _stringArray[i] = _stringArray[i].split("-");
      _stringArray[i][1] = +_stringArray[i][1];
    }
  }

  //Total generated accounts
  let accGened = 0;
  while(true){
    account = getNewAccount();
    const scoreMsg = filter(account.address, _stringArray,  argv.p ? process.env.preci.split(",") : [""]);
    accGened++;
    if(accGened%500 === 499){
      process.send({
        incr: true
      });
    }
    if(scoreMsg === false){
      continue;
    }
    process.send({
      msg: (scoreMsg + "\nID: " + process.pid + ", Address: " + account.address + ", Key: " + account.privKey)
    });
  }
}

function filter(_address, _stringArray, _preci) {
  //Remove 0x
  address = _address.substring(2);

  if(argv.c == "undefined"){
    for(i = 0; i < _stringArray.length; i++){
      if(address.includes(_stringArray[i])){
        return _stringArray[i];
      }
      if(isValidNum(address)){
        return _stringArray[i];
      }else if(isValidTxt(address)){
        return _stringArray[i];
      }
    }
    return false;
  }

  let score = 0;  
  let list = [];

  if(isValidNum(address)){
    score += 10;
  }else if(isValidTxt(address)){//At 50 addresses per seonc, it will take an average of 69338 years for this to be true
    score += 1000000000000000000;
  }else{
    //Count address score
    if(argv.p){
      [score, list] = checkWithP(address, _stringArray, score, list, _preci);
    }else{
      [score, list] = checkWithoutP(address, _stringArray, score, list);
    }

    //Return if it passes score requirement
    if(!passTally(score, list, _preci[0])){
      return false;
    }
  }
  return generateListString(score, list);
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
 * RUN MASTER
 *
*/

function masterRun() {
  //Clean -s
  const string = cleanString();
  let preci;

  if(argv.p){
    preci = cleanPreci();
  }

  if(!checkCommand(string)){
    return;
  }

  if(argv.a){
    string = genSimilars(string);
    console.log("INCOMING");
    console.log(string);
    exit(0);
  }

  console.log("\nSearching for addresses including" + (argv.c ? " " + argv.c + " of" : "") + " " + 
    (string.split(" or ").length > 1 ? "either " : "") + string + "...\n");

  const spinner = ora("Searching for address number " + 1 + " of " + argv.n + "...");
  spinner.color = "cyan";
  spinner.start();

  write("Searching for addresses including" + (argv.c ? " " + argv.c + " of" : "") + " " + 
  (string.split(" or ").length > 1 ? "either " : "") + string + "...\n");

  startWorkers(spinner, string, preci);
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement+ this.substr(index+1);
}

function genSimilars(_string) {
  const newString = "atee";
  const aeList = [];
  for(let i = 0; i < newString.length; i++){
    if(newString[i] === "a"){
      aeList.push(["a", "a", "4", i]);
    } else if(newString[i] === "e"){
      aeList.push(["e", "e", "3", i]);
    }
  }
  //I imcrement through the possibilities in the same way that you increment base 2 numbers
  const newList = gen(aeList, 0, []);
  console.log(newList);
  const completeList = [newString];
  
  for(let i = 0; i < newList.length; i++){
    const aeWordList = newList[i];
    //console.log("aeWordList: newList["+i+"]: " + newList[i]);
    let string = newString;
    for(let j = 0; j < aeWordList.length; j++){
      const aeLetterList = aeWordList[j];
      //console.log("aeLetterList: aeWordList["+j+"]: " + aeWordList[j]);
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
  let checkedStart = false; 
  for(let i = 0; i < _stringArray.length; i++){
    const included = checkIncludes(_address, _stringArray[i][0]);
    if(included === false){
      continue;
    }
    _list.push(included);

    if(!checkedStart){//TODO test whether or not this actually boosts performance
      if(_address.indexOf(included) === 0){//Is at start of address
        _score += 2 * _stringArray[i][1];//doubles points
        checkedStart = true;
        continue;
      }
    }
    _score += _stringArray[i][1];
  }

  //Increase score by -p [2] if there are enough vanity strings according to -p [1]
  if(_list.length >= _preci[1]){
    _score += (+_preci[2] + _list.length - _preci[1]);
  }
  return [_score, _list];
}


function count(_string, _char) {
  const re = new RegExp(_char, "gi");
  return _string.match(re).length;
 }

function checkIncludes(_address, _string) {

  if(argv.a){


    return false;
  }
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

function cleanString() {
  let string = argv.s.split(" ").join("");
  return string.toLowerCase().split(",").join(" or ");
}

function cleanPreci() {
  return argv.p.toLowerCase().split(" ").join("");
}

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
      const entry = _stringArray[i].split("-");
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

function startWorkers(_spinner, _string, _preci) {
  //Successfully generated addresses
  let accCount = 0;
    
  let generationTotal = 0;
  let lastGeneration = 0;
  let lastTime = Date.now();

  for(let i = 0; i < argv.t; i++) {
    const worker_env = {
      stringArray: _string.split(" or "),
      preci: _preci
    }
    proc = cluster.fork(worker_env);
    proc.on("message", message => {
      if(message.msg){
        if(accCount >= argv.n) {
          return;
        }
        _spinner.succeed(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        write(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
        accCount++;
        if(accCount >= argv.n) {
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
  if(!re.test(_string.substring(0, 5))){
    return false;
  }
	return re.test(_string.substring(5));
}

function isValidTxt(_string) {
  let re = /^[a-f]+$/g;
  if(!re.test(_string.substring(0, 5))){//TODO test whether or not this actually boosts performance
    return false;
  }
	return re.test(_string.substring(5));
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
console.log("SORCERY? : " + i);
