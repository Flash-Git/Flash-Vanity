import React, { Component } from "react";
import PropTypes from "prop-types";

const Web3Status = ({ enableWeb3, connected }) => {
  const onClick = () => {
    enableWeb3();
  };

  return (
    <div id="section-web3Status" className="section" style={web3StatusStyle}>
      <button
        onClick={onClick}
        style={{
          ...btnStyle,
          ...(connected ? btnStyleSent : btnStyleUnsent)
        }}
      >
        {connected ? "Connected" : "Connect to Web3"}
      </button>
    </div>
  );
};

const web3StatusStyle = {
  textAlign: "center",
  justifyContent: "center",
  background: "#888"
};

const btnStyle = {
  padding: "6px 26px",
  border: "none",
  borderRadius: "5%",
  color: "#fff",
  fontWeight: "bold"
};

const btnStyleUnsent = {
  background: "#660000",
  cursor: "pointer"
};

const btnStyleSent = {
  background: "#441111"
};

//PropTypes
Web3Status.propTypes = {
  connected: PropTypes.bool.isRequired,
  enableWeb3: PropTypes.func.isRequired
};

export default Web3Status;
