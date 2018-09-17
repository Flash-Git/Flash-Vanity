/*
* Author: Flash
* Date: 17/09/2018
*/

/*
* Flash-Vanity
*
* Single Process Vanity Keypair Generation
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

//UI
function handleSettings(_checkbox) {
	if(_checkbox === 0){
		const all = document.forms[0].checkAll.checked;
		if(all === true){
			document.forms[0].checkStart.checked = true;
			document.forms[0].checkEnd.checked = true;
			return;
		}
	}
	if(_checkbox === 1){
		const start = document.forms[0].checkStart.checked;
		const end = document.forms[0].checkEnd.checked;
		if(start === false || end === false){
			document.forms[0].checkAll.checked = false;
		}
	}
}

function buttonClick() {
	const vanityStrings = document.forms[0].vanityStrings.value.split(" ");
	const vanityStringsLength = vanityStrings.length;
	const limit = document.forms[0].limit.value;
	const caseSensitive = document.forms[0].caseSensitive.checked;

	for(let i = 0; i < vanityStringsLength; i++){
		if(!isValidHex(vanityStrings[i])){
			console.error("Error at i = " + i + ", " + vanityStrings[i]);
			return;
		}
	}
	console.log("Input: " + vanityStrings.toString());
	console.log("Searching for address...");

	disableButton();

	(function loop(_i = 0){
		if(findMatches(vanityStrings, vanityStringsLength, caseSensitive)){
			counter++;
		}
		if(counter < limit){
			if(_i % 250 !== 0){
				loop(++_i);
			}else{
				setTimeout(
					function(){
						loop(++_i);
					}, 1
				);
			}
		}else{
			console.log("Finished generation");
			reset();
			download(addressKeyPairs, "VanityKeyPairs.txt", "text/plain");
		}
	}(0));
}

function reset() {
	counter = 0;
	enableButton();
}

function disableButton() {
	const button = document.forms[0].button;
	button.disabled = true;
	button.className = "buttonDisabled";
	button.value = "Generating...";
}

function enableButton(){
    const button = document.forms[0].button;
	button.disabled = false;
	button.className = "button";
	button.value = "Generate";
}

function AddressObj(_publicKey, _privateKey, _name = "Default") {
	this.publicKey = _publicKey;
	this.privateKey = _privateKey;
	this.name = _name;
}

function isValidHex(_string) {
	let re;
	re = /^[0-9A-F]+$/ig;
	return re.test(_string);
}

let counter = 0;
let addressKeyPairs = "";

function findMatches(_vanityStrings, _vanityStringsLength, _caseSensitive) {
	const addressObj = createAccount();

	if(!_caseSensitive){
		for(let i = 0; i < _vanityStringsLength; i++){
			if(!addressObj.publicKey.toUpperCase().includes(_vanityStrings[i].toUpperCase())){
				continue;
			}
			console.log("Public: " + addressObj.publicKey + ", Private: " + addressObj.privateKey + ", Counter: " + counter);
			addressKeyPairs += (addressObj.publicKey + " " + addressObj.privateKey + " " + addressObj.name + "\n");
			return true;
		}
	}else{
		for(let i = 0; i < _vanityStringsLength; i++){
			if(!addressObj.publicKey.includes(_vanityStrings[i])){
				continue;
			}
			console.log("Public: " + addressObj.publicKey + ", Private: " + addressObj.privateKey + ", Counter: " + counter);
			addressKeyPairs += (addressObj.publicKey + " " + addressObj.privateKey + " " + addressObj.name + "\n");
			return true;
		}
	}
	return false;
}

function createAccount() {
	const account = web3.eth.accounts.create();
	return new AddressObj(account.address, account.privateKey);
}

// Function to download data to a file
function download(_data, _filename, _type) {
	var file = new Blob([_data], {type: _type});
	if(window.navigator.msSaveOrOpenBlob){//IE10+
		window.navigator.msSaveOrOpenBlob(file, _filename);
	}else{//Others
		var temp = document.createElement("a"), url = URL.createObjectURL(file);
		temp.href = url;
		temp.download = _filename;
		document.body.appendChild(temp);
		temp.click();
		setTimeout(function(){
			document.body.removeChild(temp);
			window.URL.revokeObjectURL(url);  
		}, 0);
	}
}