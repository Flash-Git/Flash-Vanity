/*
* Author: Flash
* Date: 15/09/2018
*/

"use strict";

let web3;
try{
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	console.log("Generated new web3 provider");
	console.log("web3.version: " + web3.version);
}catch(e){
	console.error("Exiting program: " + e);
	throw new Error("");
}

main();

function main() {	

}

function handleSettings(checkbox) {
	if(checkbox===0){
		const all = document.forms[0].checkAll.checked;
		if(all==true){
			document.forms[0].checkStart.checked = true;
			document.forms[0].checkEnd.checked = true;
			return;
		}
	}

	if(checkbox===1){
		const start = document.forms[0].checkStart.checked;
		const end = document.forms[0].checkEnd.checked;
		if(start===false||end==false){
			document.forms[0].checkAll.checked = false;
		}
	}
}

function buttonClick() {
	const vanityStrings = document.forms[0].vanityStrings.value.split(" ");
	for (var i = 0; i < vanityStrings.length; i++){
		if(!isValidHex(vanityStrings[i])){
			console.error(vanityStrings[i]);//TODO handle invalid strings
		}
	}
}

function createAccount() {
	let account = web3.eth.accounts.create();
	console.log("privateKey: " + account.privateKey);
	console.log("address: " + account.address);
}

function isValidHex(_string) {
    if (!_string.length) return true;
    _string = _string.toUpperCase();
    let re = /^[0-9A-F]+$/g;
    return re.test(_string);
}
