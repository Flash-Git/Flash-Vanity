import React, { Fragment } from "react";

import Listing from "../Listing";
import PreForm from "../PreForm";

const Home = () => (
  <Fragment>
    <div className="container">
      <PreForm />
      <Listing />
    </div>
  </Fragment>
);

export default Home;
