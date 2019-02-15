import React, { Component } from "react";
import makeBlockie from "ethereum-blockies-base64";
import PropTypes from "prop-types";

class GeneratedAdd extends Component {

  state = {

  }
  
  render(){
    return(
      <div className="generatedAdd" style={ generatedAddStyle }>
        <img src={makeBlockie(this.props.address)} width="32px" height="32px" alt="blockie" style={ blockieStyle } />
      </div>
    );
  }
}

const generatedAddStyle = {
  background: "#8A77A8",
  color: "#fff",
  margin: "0.4rem"
}

const blockieStyle = {
  marginLeft:"1em",
  marginTop:"1.15em"
}

//PropTypes
GeneratedAdd.propTypes = {
  address: PropTypes.string.isRequired
}

export default GeneratedAdd;