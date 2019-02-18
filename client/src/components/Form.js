import crypto from "crypto";

import React, { Component } from "react";
import PropTypes from "prop-types";
const ethUtils = require("ethereumjs-util");

class Form extends Component {

  state = {
  }
  
  onClickGenerate = (e) => {
    this.generateAccounts(20);
  }
  
  onClickImport = (e) => {
    this.importAccounts();
  }

  generateAccounts = (_num) => {
    const accounts = [];
    for(let i = 0; i < _num; i++){
      accounts.push(this.getNewAccount());
    }
    this.props.setAccounts(accounts);
  }

  getNewAccount = () => {
    const privKey = crypto.randomBytes(32);
    const address = "0x" + ethUtils.privateToAddress(privKey).toString("hex");
    return { address, privKey: privKey.toString("hex") };
  }

  importAccounts = () => {

  }

  render(){
    return(
      <div id="section-form" className="section" style={ formStyle }>
        <button onClick={ this.onClickGenerateRandom } style={ btnStyle }>Generate Random</button>
        <button onClick={ this.onClickImport } style={ btnStyle }>Import</button>
        {/* Display Form that updates a command string to get desired flash-vanity address out of generator  */}
      </div>
    );
  }
}

const formStyle = {
  textAlign: "center",
  justifyContent: "center",
  padding: "1rem",
  margin: "1rem",
  background: "#565656",
  color: "#fff"
}

const btnStyle = {
  background: "#666482",
  padding: "0.8rem 1rem",
  border: "none",
  borderRadius: "3%",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  margin: "1rem",
  marginRight: "3rem",
  minWidth: "10rem"
}

//PropTypes
Form.propTypes = {
  setAccounts: PropTypes.func.isRequired
}

export default Form;