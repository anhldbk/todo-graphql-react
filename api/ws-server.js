import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { SubscriptionManager } from "graphql-subscriptions";
import { schema, pubsub } from "./schema";

const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub
});

export default {
  // Start WebSocket server for GraphQL subscriptions
  start: function(port) {
    const websocketServer = createServer((request, response) => {
      response.writeHead(404);
      response.end();
    });

    websocketServer.listen(port, () =>
      console.log(`Websocket Server is now running on http://localhost:${port}`)
    );

    new SubscriptionServer(
      {
        subscriptionManager,

        // the obSubscribe function is called for every new subscription
        // and we use it to set the GraphQL context for this subscription
        onSubscribe: (msg, params) => {
          return Object.assign({}, params, {
            context: {
              key: "value"
            }
          });
        }
      },
      websocketServer
    );
  }
};
