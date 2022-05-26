import * as React from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import * as styles from "./App.scss";
import { Explorer } from '../Explorer/Explorer';
import { Overview } from '../Overview/Overview';
import { BCItemView } from '../BCItemView/BCItemView';
import { Footer } from '../Footer/Footer';
import { Dropdown } from '../Dropdown/Dropdown';
import { CsvExport } from '../CsvExport/CsvExport';
import logo from "../../static/img/zenotta-logo.svg";
import Search from '../Search/Search';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Nav from '../Nav/Nav';

// import { LangSelector } from "../LangSelector/LangSelector";


export default function App() {

  return useObserver(() => (
    <Router>
      <div className={styles.container}>
        <Nav />
        <div className={styles.content}>
          {/* <div className={styles.testObj}></div>  */}
          <Switch>
            <Route exact path="/transactions">
              <Explorer />
            </Route>
            <Route exact path="/blocks">
              <Explorer />
            </Route>
            <Route exact path="/csv-export">
              <CsvExport />
            </Route>
            <Route exact path="/:hash">  {/* TODO: Seperate to lower branches (/block/:hash) and (/tx/:hash)  */}
              <BCItemView />
            </Route>
            <Route exact path="/">
              <Search />
              <Overview />
            </Route>
            <Route path="*">ERROR 404</Route>
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  ));
}
