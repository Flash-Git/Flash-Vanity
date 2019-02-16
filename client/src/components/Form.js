import crypto from "crypto";

import React, { Component } from "react";
import PropTypes from "prop-types";
const ethUtils = require("ethereumjs-util");

class Form extends Component {

  state = {
  }
  
  onClick = (e) => {
    this.generateAccounts(50);
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

  render(){
    return(
      <div id="section-form" className="section" style={ formStyle }>
        <button onClick={ this.onClick } >Generate</button>
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

//PropTypes
Form.propTypes = {
  setAccounts: PropTypes.func.isRequired
}

export default Form;