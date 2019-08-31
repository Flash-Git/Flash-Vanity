import React, { useState } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

const Account = ({ account }) => {
  const [open, setOpen] = useState(false);

  const onClick = e => {
    setOpen(!open);
  };

  return (
    <div className="account">
      <button
        className="btn btn-light"
        style={{ display: "flex", justifyContent: "center" }}
        onClick={onClick}
      >
        <Blockie address={account.address} />
        {account.address}
      </button>
      <div>
        {open ? (
          <div className="account-dropdown">
            <span>Private Key: {account.privKey}</span>
            <a href={`https://etherscan.io/address/${account.address}`}>
              {`https://etherscan.io/address/${account.address}`}
            </a>
          </div>
        ) : (
          ""
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
