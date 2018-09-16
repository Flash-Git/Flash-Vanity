/*
* Author: Flash
* Date: 16/09/2018
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
	//download('file text', 'myfilename.txt', 'text/plain');
}

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
		if(i < 251){
			if(i % 250 != 0){
				loop(++i);
		}else{
			setTimeout(function(){
				loop(1)
				}, 1);
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
		console.log("Public: " + addressObj.publicKey + ", Private: " + addressObj.privateKey + ", Counter: " + counter);
		counter++;
		if(counter > 5000){
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
function disabled(_on){
	document.forms[0].button.disabled = on ? "disabled" : '';
}

// Function to download data to a file
function download(_data, _filename, _type) {
	var file = new Blob([_data], {type: _type});
	if(window.navigator.msSaveOrOpenBlob){//IE10+
		window.navigator.msSaveOrOpenBlob(file, _filename);
	}else{//Others
		const temp = document.createElement("temp"), url = URL.createObjectURL(file);
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