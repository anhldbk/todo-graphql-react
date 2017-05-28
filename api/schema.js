import { makeExecutableSchema } from "graphql-tools";
import { PubSub } from "graphql-subscriptions";
import db from "./db";
import _ from "lodash";
import EventEmitter from "events";

const pubsub = new PubSub();
const emitter = new EventEmitter();
const rootSchema = [
  `
  type Post {
    id: Int!
    title: String!
    content: String!
  }

  type Query {
    # List all posts
    posts: [Post]
  }

  type Mutation {
    addPost(title: String!, content: String!): Post
  }

  type Subscription {
    # Subscription fires on every comment added
    postAdded: Post
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`
];

const rootResolvers = {
  Query: {
    posts(root, args, context) {
      return db.get();
    }
  },
  Mutation: {
    addPost(root, { title, content }, context) {
      if (title == "xxx") {
        throw new Error(`Couldn't create the post with title = ${title}`);
      }
      var post = db.add(title, content);
      pubsub.publish("postAdded", post);
      return post;
    }
  },
  Subscription: {
    // TODO: Parameter?
    postAdded(post) {
      // the subscription payload is the comment.
      return post;
    }
  }
};

const schema = [...rootSchema];
const resolvers = _.merge(rootResolvers);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});

module.exports = {
  schema: executableSchema,
  pubsub
};
