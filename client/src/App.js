import React from "react";

import Header from "./components/Header";
import Home from "./components/pages/Home";

import AccountState from "./context/account/AccountState";

import "./App.css";

const App = () => (
  <div className="App">
    <AccountState>
      <Header />
      <Home />
    </AccountState>
  </div>
);

export default App;
