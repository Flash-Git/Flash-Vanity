import React, { useState } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

const Account = ({ account }) => {
  const [open, setOpen] = useState(false);

  const onClick = e => {
    setOpen(!open);
  };

  return (
    <div className="generatedAdd">
      <Blockie address={account.address} size="30px" />
      <a href={`https://etherscan.io/address/ ${account.address}`}>
        {account.address}
      </a>
      <div>
        {open ? (
          <span>{account.privKey}</span>
        ) : (
          <button onClick={onClick}>Show Private Key</button>
        )}
      </div>
    </div>
  );
};

//PropTypes
Account.propTypes = {
  account: PropTypes.object.isRequired
};

export default Account;
