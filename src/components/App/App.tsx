import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput, Notification } from 'chi-ui';
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
          <div className={styles.innerContainer}>
            <Switch>
              <Route exact path="/csv-export">
                  <CsvExport />
              </Route>
              <Route exact path="/:hash">
                  <BCItemView />
              </Route>
              <Route exact path="/">
                  {/* <Overview /> */}
                  <Search />
                  <Explorer />
              </Route>
              <Route path="*">ERROR 404</Route>
            </Switch>
          </div>

          {/* <Footer /> */}
        </div>
      </div>
    </Router>
  ));
}
