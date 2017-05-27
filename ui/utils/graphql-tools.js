import { graphql } from "react-apollo";
import gql from "graphql-tag";
import _ from "lodash";

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
      document: gql(queryString),

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
  if (!_.isString(queryString) || !_.isFunction(mapFn)) {
    throw new Error("Invalid params");
  }

  const opName = getOperationName(queryString);
  if (_.isNil(opName)) {
    throw new Error("Invalid query string");
  }

  return graphql(gql(query), {
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
 * @param  {Function} mapFn A mapping function of `(data) => props`.
 *   Results will be mapped to `props` of enhanced components
 * @param  {String} mapType  GraphQL type of the result returned by the mapping function.
 * @param  {[type]} [optimisticResponse=undefined] [description]
 * @return {[type]}                                [description]
 */
 export function withMutation(
   mutationString,
   mapType,
   mapFn,
   optimisticResponse = undefined
 ) {
   if (
     !_.isString(mutationString) ||
     !_.isString(mapType) ||
     !_.isFunction(mapFn)
   ) {
     throw new Error("Invalid params");
   }

   const opName = getOperationName(mutationString);
   if (_.isNil(mutationString)) {
     throw new Error("Invalid query string");
   }
   if (!_.isObject(optimisticResponse)) {
     throw new Error("Invalid optimistic response. Must be an object");
   }

   return graphql(gql(mutationString), {
     props: ({ ownProps, mutate }) => {
       let result = {
         [opName]: object =>
           mutate({
             variables: { ...object },
             update: (proxy, { data }) => {
               const query = POST_QUERY;
               console.log(proxy);
               const acc = proxy.readQuery({ query });
               console.log(acc);
               acc.posts.push(data.addPost);
               proxy.writeQuery({ query, data: acc });
             }
           })
       };

       if (!optimisticResponse) {
         result = {
           ...result,
           optimisticResponse: {
             __typename: "Mutation",
             [opName]: {
               __typename: mapType,
               ...optimisticResponse
             }
           }
         };
       }
       return result;
     }
   });
 }
