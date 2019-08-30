import React from "react";

import Header from "./components/Header";
import Listing from "./components/Listing";
import Form from "./components/Form";

import "./App.css";

const App = () => (
  <div className="App">
    <Header />
    <Form />
    <Listing />
  </div>
);

export default App;
