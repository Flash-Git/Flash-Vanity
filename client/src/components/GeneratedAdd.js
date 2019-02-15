import React, { Component } from "react";
import PropTypes from "prop-types";

import Blockie from "./Blockie";

class GeneratedAdd extends Component {

  state = {

  }
  
  render(){
    return(
      <div className="generatedAdd" style={ generatedAddStyle }>
        <div style={ blockieStyle }>
          <Blockie address={ this.props.address } size="32px" />
        </div>
      </div>
    );
  }
}

const generatedAddStyle = {
  justifyContent: "center",
  background: "#8A77A8",
  color: "#fff",
  margin: "0.4rem"
}

const blockieStyle = {
  padding: "0.3rem",
  textAlign: "center",
  justifyContent: "center"
}

  //PropTypes
GeneratedAdd.propTypes = {
  address: PropTypes.string.isRequired
}

export default GeneratedAdd;