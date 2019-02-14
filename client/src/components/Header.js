import React, { Component } from "react";
import makeBlockie from "ethereum-blockies-base64";
import PropTypes from "prop-types";

class Header extends Component {
  render(){
    return(
      <header id="section-header" className="section" style={ headerStyle }>
        <h2>Flash-Vanity </h2>
        { this.props.connected === true ? 
          <img src={makeBlockie(window.ethereum.selectedAddress)} width="32px" height="32px" alt="blockie" style={{ marginLeft:"1em", marginTop:"1.15em" }} />
        : "" }
      </header>
    );
  }
}

const headerStyle = {
  display: "flex",
  background: "#333",
  color: "#fff",
  textAlign: "center",
  justifyContent: "center",
  padding: "0.2rem"
}

//PropTypes
Header.propTypes = {
  connected: PropTypes.bool.isRequired
}

export default Header;