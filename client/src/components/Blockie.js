import React from "react";
import makeBlockie from "ethereum-blockies-base64";
import PropTypes from "prop-types";

const Blockie = ({ address, size = "20px" }) => (
  <img
    src={makeBlockie(address)}
    className="mx"
    width={size}
    height={size}
    alt="blockie"
  />
);

//PropTypes
Blockie.propTypes = {
  address: PropTypes.string.isRequired,
  size: PropTypes.string
};

export default Blockie;
