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
	for(let i = 0; i < vanityStrings.length; i++){
		if(!isValidHex(vanityStrings[i])){
			console.error("Error at i = " + i + ", " + vanityStrings[i]);//TODO handle invalid strings
			return;
		}
	}
	console.log(vanityStrings);

	disabled(true);
	(function loop(i){
	    findMatches(vanityStrings);
	    if(i<251){
	    	if(i%250 != 0){
	    		loop(++i);
	    	}else{
		        setTimeout(function(){
		            loop(1)
		        },1);
		    }
	    }else{
	    	console.log("Finished loop");
	        disabled(false);
	    }
	}(0));
}

function AddressObj(_publicKey, _privateKey, _name = "") {
    this.publicKey = _publicKey;
    this.privateKey = _privateKey;
    this.name = _name;
}

function isValidHex(_string) {
    if (!_string.length) return true;
    _string = _string.toUpperCase();
    let re = /^[0-9A-F]+$/g;
    return re.test(_string);
}

let counter = 0;

function findMatches(_vanityStrings) {
	const addressObj = createAccount();
	for(let i = 0; i < _vanityStrings.length; i++){
		if(!addressObj.publicKey.includes(_vanityStrings[i])){
			continue;
		}
		console.log("Counter: " + counter + ", " + addressObj.publicKey + addressObj.privateKey);
		counter++;
		if(counter>5000){
			throw Error("Finished");
		}
	}
}

function createAccount() {
	const account = web3.eth.accounts.create();
	const addressObj = new AddressObj(account.address, account.privateKey);
	return addressObj;
}

//button toggle
function disabled(on){
	document.forms[0].button.disabled = on ? 'disabled' : '';
}