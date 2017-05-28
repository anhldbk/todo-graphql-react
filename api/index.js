import hapi from "hapi";
import {graphqlHapi, graphiqlHapi} from "graphql-server-hapi";
import {GraphQLSchema} from "graphql";
import {schema} from "./schema";
import wsServer from "./ws-server";
const Good = require("good");
const API_PORT = process.env.API_PORT | 8080;
const WS_PORT = process.env.WS_PORT || 8081;

const server = new hapi.Server();
server.connection({host: "localhost", port: API_PORT});

server.register({
  register: graphqlHapi,
  options: {
    path: "/graphql",
    graphqlOptions: () => ({pretty: true, schema}),
    route: {
      cors: true
    }
  }
});

server.register({
  register: graphiqlHapi,
  options: {
    path: "/graphiql",
    graphiqlOptions: {
      endpointURL: "/graphql"
    }
  }
});

server.register({
  register: Good,
  options: {
    reporters: {
      console: [
        {
          module: "good-squeeze",
          name: "Squeeze",
          args: [
            {
              response: "*",
              log: "*"
            }
          ]
        }, {
          module: "good-console"
        },
        "stdout"
      ]
    }
  }
}, err => {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start(err => {
    if (err) {
      throw err;
    }
    server.log("info", "Server running at: " + server.info.uri);
  });
});

wsServer.start(WS_PORT);
