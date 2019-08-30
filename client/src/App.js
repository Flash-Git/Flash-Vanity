import React from "react";

import Home from "./components/pages/Home";

import AccountState from "./context/account/AccountState";

import "./App.css";

const App = () => (
  <div className="App">
    <AccountState>
      <Home />
    </AccountState>
  </div>
);

export default App;
