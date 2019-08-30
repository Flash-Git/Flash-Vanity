import React, { Component, useState, useContext, useEffect } from "react";
import crypto from "crypto";
import { utils } from "ethers";
import PropTypes from "prop-types";

const Form = ({ setAccounts }) => {
  const onClickGenerate = e => {
    generateAccounts(20);
  };

  const onClickImport = e => {
    importAccounts();
  };

  const generateAccounts = _num => {
    const accounts = [];
    for (let i = 0; i < _num; i++) {
      accounts.push(getNewAccount());
    }
    setAccounts(accounts);
  };

  const getNewAccount = () => {
    const privKey = crypto.randomBytes(32);
    const address = "0x" + utils.computeAddress(privKey).toString("hex");
    return { address, privKey: privKey.toString("hex") };
  };

  const importAccounts = () => {};

  return (
    <div id="section-form" className="section" style={formStyle}>
      <button onClick={onClickGenerate} style={btnStyle}>
        Generate Random
      </button>
      <button onClick={onClickImport} style={btnStyle}>
        Import
      </button>
      {/* Display Form that updates a command string to get desired flash-vanity address out of generator  */}
    </div>
  );
};

const formStyle = {
  textAlign: "center",
  justifyContent: "center",
  padding: "1rem",
  margin: "1rem",
  background: "#565656",
  color: "#fff"
};

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
};

//PropTypes
Form.propTypes = {
  setAccounts: PropTypes.func.isRequired
};

export default Form;
