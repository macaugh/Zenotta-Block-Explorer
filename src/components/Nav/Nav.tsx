import React from "react";
import styles from "./Nav.scss";
import logo from "../../static/img/zenotta_logo_white.svg";
import { NavLink, useLocation } from "react-router-dom";
import { Navbar, Nav as BTNav, NavDropdown } from "react-bootstrap";
import { routes, MainRoutes } from "routes";
import Search from "components/Search/Search";
import { NETWORKS } from "networks";
import { StoreContext } from '../../index';

const handleScreenWidth = () => {
  if (window.innerWidth >= 992) {
    return false;
  } else {
    return true;
  }
};

export const Nav = () => {
  const store = React.useContext(StoreContext);
  let location = useLocation();
  let [currentNetwork, setCurrentNetwork] = React.useState(
    localStorage.getItem('NETWORK') ||  
    NETWORKS[0].name
  );

  let [searchEnabled] = React.useState(
    location.pathname !== "/" ? true : false
  );
  let [mobileMenuOpen, setMobileMenu] = React.useState<boolean>(
    handleScreenWidth()
  );

  React.useEffect(() => {
    function handleResize() {
      setMobileMenu(handleScreenWidth());
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  const generateNavLinks = () => {
    let result: JSX.Element[] = [];
    routes.map((route: MainRoutes) => {
      if (!route.hidden) {
        result.push(
          <BTNav.Link
            key={route.path}
            as={NavLink}
            to={route.path}
            eventKey={eventKeyCount++}
            exact
          >
            {route.name}
          </BTNav.Link>
        );
      }
    });

    result.push(generateNetworkSelectDropdown());
    return result;
  };

  const handleNetworkSelect = (network: string) => {
    setCurrentNetwork(network);
    localStorage.setItem('NETWORK', network);
    store.setNetwork(network);

    if (location.pathname === "/") {
      window.location.reload();
    }
  }

  const generateNetworkSelectDropdown = () => {
    return (
      <Navbar.Collapse>
        <BTNav>
          <NavDropdown title={currentNetwork} menuVariant="dark">
            {NETWORKS.map((network) => {
              if (network.name !== currentNetwork) {
                return (
                  <NavDropdown.Item key={network.name} onClick={() => handleNetworkSelect(network.name)}>
                    {network.name}
                  </NavDropdown.Item>
                );
              }
            })}
            {/* <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">
              Separated link
            </NavDropdown.Item> */}
          </NavDropdown>
        </BTNav>
      </Navbar.Collapse>
    );
  };

  let eventKeyCount = 0; // Counter for Nav.Link eventKey
  return (
    <div className={styles.topNav} id="topNav">
      <Navbar
        collapseOnSelect
        className={`${styles.nav}`}
        variant="dark"
        expand="lg"
      >
        <Navbar.Brand as={NavLink} to={"/"} className={styles.brand}>
          <img src={logo} alt="Zenotta_Logo" />
        </Navbar.Brand>
        <Navbar.Toggle id="navbar-toggle" aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <BTNav activeKey={location.pathname} className={styles.navContainer}>
            {!mobileMenuOpen && (
              <div
                className={`${styles.navItems} ${
                  searchEnabled ? styles.navSearch : ""
                }`}
              >
                {generateNavLinks()}
              </div>
            )}
            <div className={`${styles.searchBar}`}>
              {location.pathname !== "/" ? (
                <Search nav={searchEnabled} />
              ) : null}
            </div>
            {mobileMenuOpen && generateNavLinks()}
          </BTNav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};
