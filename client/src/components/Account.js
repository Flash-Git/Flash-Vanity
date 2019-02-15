import React, { Component } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

class Account extends Component {

  state = {

  }
  
  render(){
    return(
      <div className="generatedAdd" style={ generatedAddStyle }>
        <div style={{ width: "2em", float: "left", margin: "0.1rem" }}> <Blockie address={ this.props.account.address } size="30px" /></div>
        <div style={{ width: "22em", float: "left", marginLeft: "0.2rem", borderRight: "solid" }}>
          <a href={"https://etherscan.io/address/" + this.props.account.address}>{ this.props.account.address }</a></div>
        <div style={{ width: "34em", float: "left", marginLeft: "0.2rem" }}>{ this.props.account.privKey }</div>
        <div style={{ width: "2em", float: "left", margin: "0.1rem" }}> <Blockie address={ this.props.account.address } size="30px" /></div>
      </div>
    );
  }
}

const generatedAddStyle = {
  display: "flex",
  justifyContent: "center",
  background: "#49494B",
  color: "#fff",
  margin: "0.4rem"
}

  //PropTypes
Account.propTypes = {
  account: PropTypes.object.isRequired
}

export default Account;