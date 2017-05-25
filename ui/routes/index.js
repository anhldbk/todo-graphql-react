import React from "react";
import { Route, IndexRoute } from "react-router";

import HomePage from "./HomePage";
import Layout from "./Layout";
import AboutPage from "./AboutPage";

export default (
  <Route path="/" component={Layout}>
    <IndexRoute component={HomePage} />
    <Route path="/about(/:person)" component={AboutPage} />
  </Route>
);
