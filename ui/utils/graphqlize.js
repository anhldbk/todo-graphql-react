import { graphql } from "react-apollo";
import gql from "graphql-tag";
import _ from "lodash";

const _gqlMap = {};
/**
 * Get the name of the first operation in `query` or `mutation` graphql strings
 * @param  {String} queryString GraphQL query string
 * @return {String}             Operation name
 */
function getOperationName(queryString) {
  if (!_.isString(queryString)) {
    throw new Error("Invalid param");
  }
  let begin = -1, end = -1, i = 0, len = queryString.length;

  for (; i < len; i++) {
    if (begin == -1) {
      if (queryString[i] == "{") {
        begin = i + 1;
      }
    } else {
      if (queryString[i] == "(" || queryString[i] == "{") {
        end = i - 1;
        break;
      }
    }
  }

  if (begin == -1 || end == -1) {
    return undefined;
  }

  return queryString.substr(begin, end - begin + 1).trim();
}

function getHash(string) {
  if (!_.isString(string)) {
    throw new Error("Invalid param. Must be a string.");
  }
  return string.split("").reduce(function(a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * Get parsed GraphQL queries efficiently by caching parsed ones.
 * @param  {String} gqlString  A GraphQL string
 * @return {Object}  A parsed GraphQL query
 */
function getQuery(gqlString) {
  const hash = getHash(gqlString);
  if (!_.has(_gqlMap, hash)) {
    _.set(_gqlMap, hash, gql`${gqlString}`);
  }
  return _.get(_gqlMap, hash);
}

function getSubscribe(subscribeFn) {
  return (queryString, mapFn) => {
    if (!_.isString(queryString) || !_.isFunction(mapFn)) {
      throw new Error("Invalid params");
    }
    const opName = getOperationName(queryString);
    if (_.isNil(opName)) {
      throw new Error("Invalid query string");
    }

    return subscribeFn({
      document: getQuery(queryString),

      updateQuery: (previousResult, { subscriptionData }) => {
        const { data } = subscriptionData;
        return mapFn(previousResult, _.get(data, opName));
      }
    });
  };
}

/**
 * High-order function for GraphQL queries
 * @param  {String} query A query string
 * @param  {String} propName [Optional] Name of the property in `props`
 *   (of enhanced components) where we store the query's result. By default,
 *   `propName` is equal to the operation's name extracted from the query string.
 * @return {Function} The associated high-order function
 */
export function withQuery(queryString, propName = undefined) {
  if (!_.isString(queryString)) {
    throw new Error("Invalid params");
  }

  const opName = getOperationName(queryString);
  if (_.isNil(opName)) {
    throw new Error("Invalid query string");
  }

  return graphql(getQuery(queryString), {
    props: ({ data }) => {
      const { loading, subscribeToMore } = data;
      const subscribe = getSubscribe(subscribeToMore);

      return {
        loading,
        [propName || opName]: {
          data: data[opName],
          subscribe
        }
      };
    }
  });
}

/**
 * High-order function for GraphQL mutation queries
 * @param  {String} mutationString GraphQL mutation query string.
 *   The associated GraphQL operation's name will be extracted
 *   from the string and mapped into `props` as a function
 * @param  {Object} options  Options for optimistically/normally updates.
 * @return {Function} The associated high-order function
 */
export function withMutation(mutationString, options = undefined) {
  const emptyOptions = {
    update: {}
  };
  const { update: { map, queryString } } = _.merge(options || {}, emptyOptions);

  if (_.isNil(map || queryString) && (map != queryString)) {
    throw new Error(
      "To update after mutations, you must set both fields `map` & `queryString` in `options.update`"
    );
  }

  const opMutation = getOperationName(mutationString);
  if (_.isNil(opMutation)) {
    throw new Error("Invalid mutation query string");
  }

  const update = (proxy, { data }) => {
    if (_.isNil(map && queryString)) {
      return; // do nothing to update
    }
    const query = getQuery(queryString);
    const opQuery = getOperationName(queryString);
    if (_.isNil(opQuery)) {
      throw new Error("Invalid query string");
    }

    const current = proxy.readQuery({ query });
    const next = map(_.get(current, opQuery), _.get(data, opMutation));

    if (_.isNil(next)) {
      return; // nothing to update
    }
    _.set(current, opQuery, next);
    proxy.writeQuery({ query, data: current });
  };

  const invalid = (response, type) => {
    if (_.isNil(response && type) && (response != type)) {
      console.warn(
        "To use optimistic responses, you must set both fields `response` & `type``"
      );
      return true;
    }
    return  !(_.isObject(response) && _.isString(type)) ;
  };

  return graphql(getQuery(mutationString), {
    props: ({ ownProps, mutate }) => ({
      [opMutation]: (variables, { response, type } = {}) =>
        mutate({
          variables,
          optimisticResponse: invalid(response, type)
            ? undefined
            : {
                __typename: "Mutation",
                [opMutation]: {
                  __typename: type,
                  ...response,
                }
              },
          update
        })
    })
  });
}
