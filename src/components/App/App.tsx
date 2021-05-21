import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput } from 'chi-ui';

import * as styles from "./App.scss";
import { Explorer } from '../Explorer/Explorer';
import { BCItemView } from '../BCItemView/BCItemView';
import logo from "../../static/img/zenotta-logo.svg";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

import { LangSelector } from "../LangSelector/LangSelector";


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
          <Route exact path="/:hash">
            <BCItemView />
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
