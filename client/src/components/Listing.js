import React, { Component } from "react";
import PropTypes from "prop-types";

import Account from "./Account";

class Listing extends Component {
  state = {};

  render() {
    return (
      <div id="section-listing" className="section" style={listingStyle}>
        {this.props.accounts.map(account => (
          <Account key={account.privKey} account={account} />
        ))}
      </div>
    );
  }
}

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
  connected: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired
};

export default Listing;
