import React, { Component } from "react";
import makeBlockie from "ethereum-blockies-base64";
import PropTypes from "prop-types";

class Blockie extends Component {
  
  render() {
    return <img src={makeBlockie(this.props.address)} width={ this.props.size } height= { this.props.size } alt="blockie" style={ blockieStyle } />;
  }
}

const blockieStyle = {
  display: "block",
  marginLeft: "auto",
  marginRight: "auto"
}

//PropTypes
Blockie.propTypes = {
  address: PropTypes.string.isRequired,
  size: PropTypes.string
}

export default Blockie;