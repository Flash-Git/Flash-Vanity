/*
* Author: Flash
* Date: 17/09/2018
*/

/*
* Flash-Vanity
*
* On hold
*/

"use strict";

const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const randomBytes = require('randombytes');

main();

function main() {
	console.log("sdfds");
}


const privateToAddress = (privateKey) => {
    const pub = secp256k1.publicKeyCreate(privateKey, false).slice(1);
    return keccak('keccak256').update(pub).digest().slice(-20).toString('hex');
};

const getRandomWallet = () => {
    const randbytes = randomBytes(32);
    return {
        address: privateToAddress(randbytes).toString('hex'),
        privKey: randbytes.toString('hex')
    };
};

const isValidVanityAddress = (address, input, isChecksum) => {
    if (!isChecksum) {
        return input === address.substr(0, input.length);
    }
    if (input.toLowerCase() !== address.substr(0, input.length)) {
        return false;
    }

    const hash = keccak('keccak256').update(address).digest().toString('hex');
    for (let i = 0; i < input.length; i++) {
        if (input[i] !== (parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i])) {
            return false;
        }
    }
    return true;
};

const toChecksumAddress = (address) => {
    const hash = keccak('keccak256').update(address).digest().toString('hex');
    let ret = '';
    for (let i = 0; i < address.length; i++) {
        ret += parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i];
    }
    return ret;
};

const getVanityWallet = (input, isChecksum, cb) => {
    input = isChecksum ? input : input.toLowerCase();
    let wallet = getRandomWallet();
    let attempts = 1;

    while (!isValidVanityAddress(wallet.address, input, isChecksum)) {
        if (attempts >= step) {
            cb({attempts});
            attempts = 0;
        }
        wallet = getRandomWallet();
        attempts++;
    }
    cb({address: '0x' + toChecksumAddress(wallet.address), privKey: wallet.privKey, attempts});
};


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
	_string.toUpperCase();//more efficient than i?
	re = /^[0-9A-F]+$/g;
	return re.test(_string);
}