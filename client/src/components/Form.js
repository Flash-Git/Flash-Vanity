import React, { useContext } from "react";
import crypto from "crypto";
import { utils } from "ethers";

import AccountContext from "../context/account/AccountContext";

const Form = () => {
  const accountContext = useContext(AccountContext);

  const { addAccount } = accountContext;

  const generateAccounts = _num => {
    for (let i = 0; i < _num; i++) {
      addAccount(getNewAccount());
    }
  };

  const getNewAccount = () => {
    const privKey = crypto.randomBytes(32);
    const address = "0x" + utils.computeAddress(privKey).toString("hex");
    return { address, privKey: privKey.toString("hex") };
  };
  const onClickGenerate = e => {
    generateAccounts(20);
  };

  const onClickImport = e => {
    importAccounts();
  };

  const importAccounts = () => {};

  return (
    <div id="section-form" className="section">
      <button onClick={onClickGenerate}>Generate Random</button>
      <button onClick={onClickImport}>Import</button>
      {/* Display Form that updates a command string to get desired flash-vanity address out of generator  */}
    </div>
  );
};

export default Form;
