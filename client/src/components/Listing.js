import React from "react";
import PropTypes from "prop-types";

import Account from "./Account";

const Listing = ({ accounts }) => (
  <div id="section-listing" className="section" style={listingStyle}>
    {accounts.map(account => (
      <Account key={account.address} account={account} />
    ))}
  </div>
);

const listingStyle = {
  textAlign: "center",
  justifyContent: "center",
  padding: "1rem",
  margin: "1rem",
  background: "#565656",
  color: "#fff"
};

//PropTypes
Listing.propTypes = {
  accounts: PropTypes.array.isRequired
};

export default Listing;
