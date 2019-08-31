import React, { useContext } from "react";
import crypto from "crypto";
import { utils } from "ethers";

import AccountContext from "../context/account/AccountContext";

const PreForm = () => {
  const accountContext = useContext(AccountContext);

  const { addAccount, clearAccounts } = accountContext;

  const generateAccounts = _num => {
    for (let i = 0; i < _num; i++) {
      addAccount(getNewAccount());
    }
  };

  const getNewAccount = () => {
    const privKey = crypto.randomBytes(32);
    const address = utils.computeAddress(privKey);
    return { address, privKey: privKey.toString("hex") };
  };
  const onClickGenerate = e => {
    generateAccounts(20);
  };

  const onClickImport = e => {
    importAccounts();
  };

  const onClickClear = e => {
    clearAccounts();
  };

  const importAccounts = () => {};

  return (
    <div className="pre-form">
      <div className="flex-row">
        <button
          className="btn btn-primary btn-block m"
          onClick={onClickGenerate}
        >
          Generate New
        </button>
        <button className="btn btn-primary btn-block m" onClick={onClickClear}>
          Clear
        </button>
      </div>
      <button className="btn btn-dark m" onClick={onClickImport}>
        Import
      </button>
      {/* Display Form that updates a command string to get desired flash-vanity address out of generator  */}
    </div>
  );
};

export default PreForm;
