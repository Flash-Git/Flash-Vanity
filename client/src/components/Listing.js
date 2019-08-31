import React, { useContext } from "react";

import Account from "./Account";

import AccountContext from "../context/account/AccountContext";

const Listing = () => {
  const accountContext = useContext(AccountContext);

  const { accounts } = accountContext;

  return (
    <div className="listing">
      {accounts.map(account => (
        <Account key={account.address} account={account} />
      ))}
    </div>
  );
};
export default Listing;
