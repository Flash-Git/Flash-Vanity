import React, { Component } from "react";
import Web3 from "web3";

import Header from "./components/Header";
import Web3Status from "./components/Web3Status";
import Listing from "./components/Listing";
import Form from "./components/Form";

import "./App.css";

class App extends Component {

  state = {
    connected: false,
    accounts: []
  }

  updateConnectionStatus = () => {
    try{
      if(!window.web3.utils.isAddress(window.ethereum.selectedAddress)){
        this.setState({ connected: false });
        return 2;
      }
    }catch(e){
      this.setState({ connected: false });
      return 1;
    }
    this.setState({ connected: true });
    return 0;
  }

  enableWeb3 = () => {
    const connection = this.updateConnectionStatus();
    //Check whether the DApp has an open connection to the Ethereum blockchain
    if(connection === 0) return;
        
    //Check if user's window has a window.ethereum currently available
    if(typeof window.ethereum === "undefined"){
      alert("Please install MetaMask");
      return;
    }

    //Attempt to open a connection to the Ethereum blockchain
    //Old const web3 = new Web3(window.web3.currentProvider);
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable()
    .then(accounts => this.updateConnectionStatus())
    .catch(e => {
      if(e !== "User rejected provider access"){
        alert("There was an issue signing you in. Please check console for error");
        console.log("Error:\n" + e);
        return;
      }
    });
  }

  setAccounts = (accounts) => {
    this.setState({ accounts });
  }

  render(){
    return(
      <div className="App">
        <Header connected={ this.state.connected } />
        <Web3Status enableWeb3={ this.enableWeb3 } connected={ this.state.connected } />
        <Form setAccounts={ this.setAccounts } />
        <Listing connected={ this.state.connected } accounts={ this.state.accounts } />
      </div>
    );
  }
}

export default App;