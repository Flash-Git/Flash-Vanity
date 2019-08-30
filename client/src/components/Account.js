import React, { Component } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

const Account = ({ account }) => {
  return (
    <div className="generatedAdd" style={generatedAddStyle}>
      <div style={{ width: "2em", float: "left", margin: "0.1rem" }}>
        <Blockie address={account.address} size="30px" />
      </div>
      <div
        style={{
          width: "22em",
          float: "left",
          marginLeft: "0.2rem",
          borderRight: "solid"
        }}
      >
        <a href={"https://etherscan.io/address/" + account.address}>
          {account.address}
        </a>
      </div>
      <div style={{ width: "34em", float: "left", marginLeft: "0.2rem" }}>
        {account.privKey}
      </div>
      <div style={{ width: "2em", float: "left", margin: "0.1rem" }}>
        <Blockie address={account.address} size="30px" />
      </div>
    </div>
  );
};

const generatedAddStyle = {
  display: "flex",
  justifyContent: "center",
  background: "#49494B",
  color: "#fff",
  margin: "0.4rem"
};

//PropTypes
Account.propTypes = {
  account: PropTypes.object.isRequired
};

export default Account;
