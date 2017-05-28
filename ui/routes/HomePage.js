import React from "react";
import { graphql, compose } from "react-apollo";
import update from "react-addons-update";
import NotificationSystem from "react-notification-system";
import { autobind } from "core-decorators";
import PostList from "../components/PostList";
import { withQuery, withMutation } from "../utils/graphqlize";

const SUBSCRIPTION_QUERY = `subscription {
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
      const { subscribe } = this.props.posts;
      this.subscription = subscribe(SUBSCRIPTION_QUERY, (prev, data) => {
        this._notifyInfo("A new post is found.");
        // If you want to update with subscribed data, do it here
        // It will lead to duplicated data. Because:
        // - `addPost` is defined `update` (see `withAddPost`) to update `posts` based on returned results.
        // - This subscription event will be fired whenever a new post's addded
        //   If you add posts in 2 separated tabs, to keep the 2 post lists in sync,
        //   it's better to deal with subscriptions
        //
        // Solution? Remove `addPost.update`!

        const next = update(prev, {
          posts: {
            $unshift: [data]
          }
        });
        return next;
      });
    }
  }

  @autobind submitForm(event) {
    event.preventDefault();
    const { addPost } = this.props;
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
    const optimistic = {
      response: { title: `[Posting] ${title}`, content, id: -1 },
      type: "Post"
    };
    addPost({ title, content }, optimistic)
      .then(success => {
        this.inputTitle.value = "";
        this.inputContent.value = "";
        this._notifySuccess("Post is created");
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
    const { loading, posts: { data } } = this.props;
    console.log("> Homepage is being rendered with loading =", loading);

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
        <PostList posts={data} />
      </div>
    );
  }
}

const MUTATION_ADD_POST = `
  mutation addPost($title: String!, $content: String!) {
    addPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const QUERY_POSTS = `
  query {
    posts {
      # TODO: define a fragment here
      id
      title
      content
    }
  }
`;

const withPosts = withQuery(QUERY_POSTS);

const withAddPost = withMutation(
  MUTATION_ADD_POST,
  {
    // update: {
    //   map: (current, data) => {
    //     current.push(data);
    //     return current;
    //   },
    //   queryString: QUERY_POSTS
    // }
  }
);

export default compose(withPosts, withAddPost)(HomePage);
