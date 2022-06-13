import * as React from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import * as styles from "./App.scss";
import { Explorer } from '../Explorer/Explorer';
import { Overview } from '../Overview/Overview';
import { Footer } from '../Footer/Footer';
import { CsvExport } from '../CsvExport/CsvExport';
import Search from '../Search/Search';
import { BlockView } from '../BlockView/BlockView';
import { TxView } from '../TxView/TxView';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Nav from '../Nav/Nav';

export default function App() {
  const store = React.useContext(StoreContext);
  
  return useObserver(() => (
    <Router>
      <div className={styles.container}>
        <Nav />
        <div className={styles.content}>
          <Switch>
            <Route exact path="/txs">
              <Explorer />
            </Route>
            <Route exact path="/blocks">
              <Explorer />
            </Route>
            <Route exact path="/block/:hash">
              <BlockView />
            </Route>
            <Route exact path="/tx/:hash">
              <TxView />
            </Route>
            <Route exact path="/csv-export">
              <CsvExport />
            </Route>
            <Route exact path="/">
              <Search />
              <Overview />
            </Route>
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
