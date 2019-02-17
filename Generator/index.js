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
  .describe("p", "Minimum number of required strings to find in each address")
  .default("l", Date.now())
  .alias("l", "log")
  .describe("l", "Adds logging to the specified filename")
  .default("t", numCPUs)
  .alias("t", "threads")
  .describe("t", "Number of threads to spawn")
  .example("$0 -s '1337' | Finds addresses containing '1337'")
  .example("$0 -s '1337, b00b5' | Finds addresses containing either '1337' or 'b00b5'")
  .example("$0 -n 50 -s '1337' | Finds 50 addresses containing '1337'")
  .example("$0 -s '1337, b00b5' -p '2' | Finds addresses containing both '1337' and 'b00b5'")
  .help('h')
  .alias('h', 'help')
  .argv;

let accCount = 0;

function run() {
  if(cluster.isMaster){
    const string = cleanString();

    if(!checkCommand(string)){
      return;
    }

    console.log("\nSearching for addresses including" + (argv.p ? " " + argv.p + " of" : "") + " " + (string.split(" or ").length > 1 ? "either " : "") + string + "...\n");

    const spinner = ora("Searching for address number " + accCount + " of " + argv.n + "...");
    spinner.color = "cyan";
    spinner.start();

    let generationTotal = 0;
    let lastGeneration = 0;
    let lastTime = Date.now();

    for(let i = 0; i < argv.t; i++) {
      const worker_env = {
        stringArray: string.split(" or ")
      }
      proc = cluster.fork(worker_env);
      proc.on("message", message => {
        if(message.msg){
          if(accCount >= argv.n) {
            return;
          }
          spinner.succeed(accCount+1 + ". In address " + generationTotal + ", found " + message.msg + "\n");
          write(message.msg + "\n");
          accCount++;
          if(accCount >= argv.n) {
            cleanup();
            spinner.text = "Ending Process";
            return;
          }
          spinner.text = "Searching for address number " + accCount + " of " + argv.n + " at a rate of " + Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
          spinner.start();
        }
        if(message.incr){
          generationTotal += 500;
        }
      });
    }
    
    setInterval(() => {
      spinner.text = "Searching for address number " + accCount + " of " + argv.n + " at a rate of " + Math.floor((generationTotal-lastGeneration)/(Date.now()-lastTime)*1000) + " addresses per second...";
      lastGeneration = generationTotal;
      lastTime = Date.now();
    }, 2500);
  }else{
    generateAccounts(process.env.stringArray.split(","));
  }
}

function write(_account) {
  fs.appendFileSync("flash-vanity-" + argv.l +".txt", _account, (err) => {
    if(err){
      throw(err);
    }
  });
}

function cleanString() {
  let string = argv.s.split(" ").join("");
  return string = string.split(",").join(" or ");
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
  for(i = 0; i < _stringArray.length; i++){
    if(!isValidHex(_stringArray[i])){
      console.log("Invalid hex in " + _stringArray[i] + " at pos = [" + i + "]");
      return false;
    }
  }
  return true;
}

function cleanup() {
  for(let id in cluster.workers){
    cluster.workers[id].process.kill();
  }
  process.exit();
}

function generateAccounts(_stringArray) {
  while(true){
    account = getNewAccount();
    const scoreMsg = filter(account.address, _stringArray);
    accCount++;
    if(accCount%500 === 499){
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
    let list = [];
    for(i = 0; i < _stringArray.length; i++){
      if(address.includes(_stringArray[i].toUpperCase())){
        list.push(_stringArray[i]);
        score++;
      }
    }
    if(score >= argv.p){
      let listString = list.join(", ").toString();
      if(list.length > 1) {
        listString = listString.substring(0, listString.lastIndexOf(",")) + " and" + listString.substring(listString.lastIndexOf(",") + 1, listString.length);
      }
      return listString + " for a score of "+ score +":";
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

process.stdin.resume();

process.on('exit', cleanup.bind(null, {}));
process.on('SIGINT', cleanup.bind(null, {}));
process.on('uncaughtException', cleanup.bind(null, {}));

run();