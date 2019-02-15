import React, { Component } from "react";
import PropTypes from "prop-types";
import uuid from "uuid/v4"; 

import GeneratedAdd from "./GeneratedAdd";

class Listing extends Component {

  state = {
    generatedAdds: [
      {
        id: uuid(),
        add: "0xf1a54014d7a4E3C5179579B050a0a0a036A158b0"
      },
      {
        id: uuid(),
        add: "0xf1a54014d7a4E3C5179579B050a0a0a036A158b0"
      }
    ]
  }

  render(){
    return(
      <div id="section-listing" className="section" style={ listingStyle }>
        { this.state.generatedAdds.map(address =>
          <GeneratedAdd key= { address.id } address={ address.add } />
        ) }
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
}

//PropTypes
Listing.propTypes = {
  connected: PropTypes.bool.isRequired
}

export default Listing;