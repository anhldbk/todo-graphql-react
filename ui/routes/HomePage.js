import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import update from "react-addons-update";
import NotificationSystem from "react-notification-system";
import { autobind } from "core-decorators";
import PostList from "../components/PostList";

const SUBSCRIPTION_QUERY = gql`subscription {
    postAdded{
      id
      title
      content
    }
  }
`;

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: false,
      canSubmit: true
    };

    // keep track of subscription handle to not subscribe twice.
    // we don't need to unsubscribe on unmount, because the subscription
    // gets stopped when the query stops.
    this.subscription = null;

    this._notificationSystem = null;
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(nextProps) {
    // we don't resubscribe on changed props, because it never happens in our app
    // see more at: https://github.com/apollostack/GitHunt-React/blob/master/ui/routes/CommentsPage.js#L48
    if (!this.subscription && !nextProps.loading) {
      this.subscription = this.props.subscribeToMore({
        document: SUBSCRIPTION_QUERY,
        updateQuery: (previousResult, { subscriptionData }) => {
          const newPost = subscriptionData.data.postAdded;
          const newResult = update(previousResult, {
            posts: {
              $unshift: [newPost]
            }
          });
          this._notifyInfo("A new post is found.");
          return newResult;
        }
      });
    }
  }

  @autobind submitForm(event) {
    event.preventDefault();
    const { submit } = this.props;
    const title = this.inputTitle.value;
    const content = this.inputContent.value;

    if (!this.state.canSubmit) {
      this._notifyError("Can NOT submit");
    }
    const submittable = () => {
      this.setState({
        canSubmit: true
      });
    };

    this.setState({ canSubmit: false });
    submit({ title, content })
      .then(res => {
        this.setState({ canSubmit: true });

        if (res.errors) {
          this._notifyError("Failed to post");
          // return this.setState({ errors: res.errors });
        } else {
          this.inputTitle.value = "";
          this.inputContent.value = "";
          this._notifySuccess("Post is created");
        }
        submittable();
      })
      .catch(err => {
        this._notifyError(err.message);
        submittable();
      });
  }

  @autobind _addNotification(message, level = "success") {
    this._notificationSystem.addNotification({
      message,
      level
    });
  }

  @autobind _notifySuccess(message) {
    this._addNotification(message, "success");
  }

  @autobind _notifyError(message) {
    this._addNotification(message, "error");
  }

  @autobind _notifyInfo(message) {
    this._addNotification(message, "info");
  }

  render() {
    const { loading, posts } = this.props;

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <div>
          <h2>New Post</h2>
          <form onSubmit={this.submitForm}>
            <div className="form-group">
              <label htmlFor="inputTitle">Title</label>
              <input
                type="text"
                className="form-control"
                id="inputTitle"
                ref={input => (this.inputTitle = input)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="inputContent">Content</label>
              <textarea
                className="form-control"
                rows="4"
                id="inputContent"
                ref={input => (this.inputContent = input)}
              />
            </div>
            <button type="submit" className="btn btn-default">Submit</button>
          </form>
        </div>
        <NotificationSystem ref="notificationSystem" />
        <PostList posts={posts} />
      </div>
    );
  }
}

const SUBMIT_POST_MUTATION = gql`
  mutation addPost($title: String!, $content: String!) {
    addPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const POST_QUERY = gql`
  query {
    posts {
      # TODO: define a fragment here
      id
      title
      content
    }
  }
`;
console.log("Hek");
const withMutations = graphql(SUBMIT_POST_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    submit: ({ title, content }) =>
      mutate({
        variables: { title, content },
        optimisticResponse: {
          __typename: "Mutation",
          addPost: {
            __typename: "Post",
            id: -1,
            title: title + "xxxxxxxxxxxx",
            content
          }
        },
        update: (proxy, { data }) => {
          console.log("-------------> Data", data);
          const query = POST_QUERY;
          const acc = proxy.readQuery({ query });
          acc.posts.push(data.addPost);
          proxy.writeQuery({ query, data: acc });
        }
      })
  })
});

const withData = graphql(POST_QUERY, {
  props: ({ data }) => {
    const { loading, posts, subscribeToMore } = data;
    return {
      loading,
      posts,
      subscribeToMore
    };
  }
});

export default withData(withMutations(HomePage));
