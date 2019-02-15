import React, { Component } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

class Header extends Component {

  blockie = () => {
    if(!this.props.connected){
      return "";
    }
    return <Blockie address={ window.ethereum.selectedAddress } size="32px" />;
  }

  render(){
    return(
      <header id="section-header" className="section" style={ headerStyle }>
        <h2>Flash-Vanity </h2> &nbsp; <h2>{ this.blockie() }</h2>
      </header>
    );
  }
}

const headerStyle = {
  display: "flex",
  flexDirection: "row",
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