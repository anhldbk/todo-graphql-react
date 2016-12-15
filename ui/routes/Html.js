/* eslint-disable react/no-danger */

import React, { PropTypes } from 'react';

// TODO: production setup?
const basePort = process.env.PORT || 3000;
const scriptUrl = `http://localhost:${basePort + 20}/bundle.js`;

const Html = ({ content, state }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossOrigin="anonymous" />
      <title>Todo app</title>
    </head>
    <body>
      <div id="content" dangerouslySetInnerHTML={{ __html: content }} />
      <div id="footer">
        <ul>
          <li>This is a demo of using Hapi with Apollo GraphQL</li>
        </ul>
      </div>
      <script
        dangerouslySetInnerHTML={{ __html: `window.__APOLLO_STATE__=${JSON.stringify(state)};` }}
        charSet="UTF-8"
      />
      <script src={scriptUrl} charSet="UTF-8" />
    </body>
  </html>
);

Html.propTypes = {
  content: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Html;
