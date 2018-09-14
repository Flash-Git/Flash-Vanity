/*
* Author: Flash
* Date: 14/09/2018
*/
"use strict";

let web3;
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

console.log("Generated new web3 provider");
console.log("web3.version: " + web3.version + "\n");

createAccount();

async function createAccount() {
	var key = await web3.eth.accounts.create();
	console.log("privateKey: " + key.privateKey);
	console.log("address: " + key.address);
}