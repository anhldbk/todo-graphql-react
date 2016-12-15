import React from 'react';
import {Link} from 'react-router';
import NavbarLink from '../components/NavbarLink';

const Layout = ({children, params, location}) => {
  return (
	  <div className="container">
	    <nav className="navbar navbar-default">
	      <div className="container-fluid">
	        <div className="navbar-header">
	          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
	            <span className="sr-only">Toggle navigation</span>
	            <span className="icon-bar"></span>
	            <span className="icon-bar"></span>
	            <span className="icon-bar"></span>
	          </button>
	          <Link className="navbar-brand" to="/">Todo</Link>
	        </div>
	        <div className="navbar-collapse collapse">
	          <ul className="nav navbar-nav">
	            <NavbarLink title="About" href="/about" active={params.type === 'about'}/>
	          </ul>
	        </div>
	      </div>
	    </nav>
		{children}
	  </div>
  )
};

Layout.propTypes = {
  location: React.PropTypes.shape({pathname: React.PropTypes.string.isRequired}).isRequired,
  params: React.PropTypes.shape({type: React.PropTypes.string}).isRequired,
  children: React.PropTypes.element
};

export default Layout;
