import React from "react";
import { render } from "react-dom";
import { Router, browserHistory } from "react-router";
import { createNetworkInterface } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { Client } from "subscriptions-transport-ws";
import "isomorphic-fetch";
import * as ReactGA from "react-ga";

import { SUBSCRIPTION_ENDPOINT } from '../config'
import routes from "./routes";
import "./style/index.css";
import createApolloClient from "./helpers/create-apollo-client";
import addGraphQLSubscriptions from "./helpers/subscriptions";


const wsClient = new Client(SUBSCRIPTION_ENDPOINT);
const networkInterface = createNetworkInterface({
  uri: "/graphql",
  opts: {
    credentials: "same-origin"
  },
  transportBatching: true
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

// Initialize Analytics
// ReactGA.initialize('UA-74643563-4');

function logPageView() {
  // ReactGA.set({page: window.location.pathname});
  // ReactGA.pageview(window.location.pathname);
}

const client = createApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  initialState: window.__APOLLO_STATE__, // eslint-disable-line no-underscore-dangle
  ssrForceFetchDelay: 100
});

render(
  <ApolloProvider client={client}>
    <Router history={browserHistory} onUpdate={logPageView}>
      {routes}
    </Router>
  </ApolloProvider>,
  document.getElementById("content")
);
