import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput } from 'chi-ui';

import * as styles from "./App.scss";
import { Explorer } from '../Explorer/Explorer';
import logo from "../../static/img/zenotta-logo.svg";
import LangSelector from "../LangSelector/LangSelector";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

export default function App() {

  return useObserver(() => (
    <Router>
      <div className={styles.container}>
        <div className={styles.langSelect}>
          <LangSelector />
        </div>

        <img src={logo} className={styles.logo} alt="Zenotta logo" />

        <div className={styles.searchContainer}>
          <TextInput
            type="search"
            label="Search here..."
            iconType="text"
            overridingClass={styles.search} />
        </div>

        <Switch>
          <Route exact path="/block/:num">
            <div>hello</div>
          </Route>
          <Route exact path="/">
            <Explorer />
          </Route>
          <Route path="*">ERROR 404</Route>
        </Switch>
      </div>
    </Router>
  ));
}
