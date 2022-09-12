import * as React from 'react';
import { useObserver } from 'mobx-react';

import * as styles from "./App.scss";
import { Footer } from '../Footer/Footer';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { Nav } from '../Nav/Nav';
import { MainRoutes, routes } from 'routes';

export default function App() {

  return useObserver(() => (
    <Router>
      <div className={styles.container}>
        <Nav />
        <div className={styles.content}>
          <Switch>
            {routes.map((route: MainRoutes) => {
              return (
                <Route exact path={route.path} key={route.path}>
                  <route.Component />
                </Route>)
            })}
            <Route path="*">
              <div>
                <h1>Not found</h1>
              </div>
            </Route>
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  ));
}
