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

var w;

function startWorker(vanityStrings, vanityStringsLength, limit, caseSensitive) {
    if(typeof(Worker) !== "undefined") {
        w = new Worker("js/worker.js");

		/*
		w.addEventListener('message', function(e) {
	      count += e.data;
	      console.log('worker count: ', e.data);
	    }, false);
	    */

	    w.postMessage([vanityStrings,vanityStringsLength,limit,caseSensitive]);


        w.onmessage = function(event) {
        	console.log("msg: " + event.data);
        };
    } else {
        console.log("Sorry! No Web Worker support");
    }
}

function stopWorker() {
    w.terminate();
    w = undefined;
}

//UI
function handleSettings(_checkbox) {
	if(_checkbox === 0){
		if(document.forms[0].checkAll.checked === true){
			document.forms[0].checkStart.checked = true;
			document.forms[0].checkEnd.checked = true;
			return;
		}
	}else{
		if(document.forms[0].checkStart.checked === false || end === false){
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
	startWorker(vanityStrings, vanityStringsLength, limit, caseSensitive);
	
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
	_string.toUpperCase();
	re = /^[0-9A-F]+$/g;
	return re.test(_string);
}