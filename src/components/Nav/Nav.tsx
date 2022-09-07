import React from 'react'
import styles from './Nav.scss';
import logo from "../../static/img/zenotta_logo_white.svg";
import { NavLink, useLocation } from 'react-router-dom';
import { Navbar, Nav as BTNav, Stack } from 'react-bootstrap';
import { routes, MainRoutes } from 'routes';
import Search from 'components/Search/Search';
import { Console } from 'console';
import { emitWarning } from 'process';

const handleScreenWidth = () => {
  if (window.innerWidth >= 992) {
    return false;
  } else {
    return true;
  }
}

export const Nav = () => {
  let location = useLocation();

  let [searchEnabled] = React.useState(location.pathname !== '/' ? true : false);
  let [mobileMenuOpen, setMobileMenu] = React.useState<boolean>(handleScreenWidth());

  React.useEffect(() => {
    function handleResize() {
      setMobileMenu(handleScreenWidth());
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  const generateNavLinks = () => {
    let result: JSX.Element[] = [];
    routes.map((route: MainRoutes) => {
      if (!route.hidden) {
        result.push(
          <BTNav.Link key={route.path} as={NavLink} to={route.path} eventKey={eventKeyCount++} exact >
            {route.name}
          </BTNav.Link>
        );
      }
    })
    return result;
  }

  let eventKeyCount = 0; // Counter for Nav.Link eventKey
  return (
    <div className={styles.topNav} id="topNav">
      <Navbar collapseOnSelect className={`${styles.nav}`} variant="dark" expand="lg">
        <Navbar.Brand as={NavLink} to={'/'} className={styles.brand} >
          <img src={logo} alt="Zenotta_Logo" />
        </Navbar.Brand>
        <Navbar.Toggle id="navbar-toggle" aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <BTNav activeKey={location.pathname} className={styles.navContainer}>
            <div className={`${styles.searchBar}`}>
              {location.pathname !== '/' ?
                <Search nav={searchEnabled} />
                : null}
            </div>
            {!mobileMenuOpen &&
              <div className={`${styles.navItems} ${searchEnabled ? styles.navSearch : ''}`}>
                {generateNavLinks()}
              </div>}
            {mobileMenuOpen &&
              generateNavLinks()}
          </BTNav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};