import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

class PostList extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    var posts = this.props.posts.map( (post, key) => (
      <div key={key} className="list-group-item">
        <h4 className="list-group-item-heading">{post.title}</h4>
        <p className="list-group-item-text">{post.content}</p>
      </div>
    ));
    return (
      <div>
        <h2>Available posts</h2>
        <div className="list-group">
          {posts}
        </div>
      </div>
    );
  }
}

PostList.propTypes = {
  posts: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      title: React.PropTypes.string.isRequired,
      content: React.PropTypes.string.isRequired
    })
  ).isRequired
};

export default PostList;
