import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

class AboutPage extends React.Component {
  constructor(props) {
    super();
    this.person = props.params.person;
  }

  render() {
    var person = this.person || "me?";
    return <h1>About {person}</h1>;
  }
}

export default AboutPage;
