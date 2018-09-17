/*
* Author: Flash
* Date: 17/09/2018
*/

let counter = 0;
let addressKeyPairs = "";

function work(vanityStrings, vanityStringsLength, limit, caseSensitive) {

	console.log("Input: " + vanityStrings.toString());
	const date = new Date();
	const startTime = date.getTime();
	let lastTime = startTime;
	let lastCounter = 0;
	console.log("Searching for address...");


	(function loop(_i = 0){
		if(findMatches(vanityStrings, vanityStringsLength, caseSensitive)){
			counter++;
			const newDate = new Date();
			const perSec = (newDate.getTime() - lastTime)/(_i - lastCounter) * 1000;

			console.log("Addresses per second: " + perSec);
			lastTime = newDate.getTime()
			lastCounter = _i;
		}
		if(counter < limit){
			if(_i % 50 !== 0){
				loop(++_i);
			}else{
				setTimeout(
					function(){
						loop(++_i);
					}, 0.1
				);
			}
		}else{
			postMessage(5);
			console.log("Finished generation");
			reset();
			download(addressKeyPairs, "VanityKeyPairs.txt", "text/plain");
		}
	}(0));
}

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

self.addEventListener('message', function(e) {
	console.log(e.data[0]);
	work(e.data[0], e.data[1], e.data[2], e.data[3]);
	//self.postMessage("cunt");
}, false);