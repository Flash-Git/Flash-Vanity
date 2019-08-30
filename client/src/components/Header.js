import React from "react";

const Header = () => (
  <header id="section-header" className="section" style={headerStyle}>
    <h2>Flash-Vanity </h2>
  </header>
);

const headerStyle = {
  display: "flex",
  flexDirection: "row",
  background: "#333",
  color: "#fff",
  textAlign: "center",
  justifyContent: "center",
  padding: "0.2rem"
};

export default Header;
