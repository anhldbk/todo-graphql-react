import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { subscriptionManager } from './subscriptions';
import hapi from 'hapi';
const { apolloHapi, graphiqlHapi } = require('apollo-server');
import {GraphQLSchema} from 'graphql';
import schema from './schema'
const API_PORT = process.env.API_PORT | 8080
const WS_PORT = process.env.WS_PORT || 8081;
const server = new hapi.Server();

server.connection({
  host: 'localhost',
  port: API_PORT
});

server.register({
  register: apolloHapi,
  options: {
    path: '/graphql',
    apolloOptions: () => ({
      pretty: true,
      schema
    }),
  },
});

server.register({
  register: graphiqlHapi,
  options: {
    path: '/graphiql',
    graphiqlOptions: {
      endpointURL: '/graphql',
    },
  },
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});


// WebSocket server for subscriptions
const websocketServer = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});

websocketServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
  `Websocket Server is now running on http://localhost:${WS_PORT}`
));

// eslint-disable-next-line
new SubscriptionServer(
  {
    subscriptionManager,

    // the obSubscribe function is called for every new subscription
    // and we use it to set the GraphQL context for this subscription
    onSubscribe: (msg, params) => {
      return Object.assign({}, params, {
        context: {
          key: 'value'
        },
      });
    },
  },
  websocketServer
);
