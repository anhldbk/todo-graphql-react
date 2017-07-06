import { SubscriptionServer } from "subscriptions-transport-ws";
import { SubscriptionManager } from "graphql-subscriptions";
import { execute, subscribe } from "graphql";
import { schema, pubsub } from "./schema";

const subscriptionManager = new SubscriptionManager({
    schema,
    pubsub
});

export default {
    activate: function(hapiServer) {
        SubscriptionServer.create({
            schema,
            execute,
            subscribe
        }, {
            server: hapiServer.listener,
            path: "/graphql"
        });
        // new SubscriptionServer(
        //   {
        //     subscriptionManager,

        //     // the obSubscribe function is called for every new subscription
        //     // and we use it to set the GraphQL context for this subscription
        //     onSubscribe: (msg, params) => {
        //       return Object.assign({}, params, {
        //         context: {
        //           key: "value"
        //         }
        //       });
        //     }
        //   },
        //   hapiServer.listener
        // );
    }
};