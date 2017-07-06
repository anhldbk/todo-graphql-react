import React from "react";
import { render } from "react-dom";
import { Router, browserHistory } from "react-router";
import ApolloClient, { createNetworkInterface } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { Client } from "subscriptions-transport-ws";
import "isomorphic-fetch";
import * as ReactGA from "react-ga";
import {
  SubscriptionClient,
  addGraphQLSubscriptions
} from "subscriptions-transport-ws";
import { SUBSCRIPTION_ENDPOINT, API_ENDPOINT, API_HOST } from "../config";
import routes from "./routes";
import "./style/index.css";

// Create WebSocket client
const wsClient = new SubscriptionClient(SUBSCRIPTION_ENDPOINT, {
  reconnect: true,
  connectionParams: {
    // Pass any arguments you want for initialization
  }
});

const networkInterface = createNetworkInterface({
  uri: API_HOST,
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
const client = new ApolloClient({
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
