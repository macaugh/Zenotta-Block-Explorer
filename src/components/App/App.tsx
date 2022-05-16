import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput, Notification} from 'chi-ui';
import {StoreContext} from '../../index';

import * as styles from "./App.scss";
import { Explorer } from '../Explorer/Explorer';
import { BCItemView } from '../BCItemView/BCItemView';
import { Footer } from '../Footer/Footer';
import { Dropdown } from '../Dropdown/Dropdown';
import { CsvExport } from '../CsvExport/CsvExport';
import logo from "../../static/img/zenotta-logo.svg";

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

// import { LangSelector } from "../LangSelector/LangSelector";


export default function App() {
  const [searchOptions, _setSearchOptions] = React.useState<any[]>([
    "Transaction Hash",
    "Block Hash",
    "Block Number",
  ]);
  const [currentSearchOption, setCurrentSearchOption] = React.useState<string>("Transaction");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [searchError, setSearchError] = React.useState<string>("");
  const store = React.useContext(StoreContext);

  const submitSearchValue = async () => {
    if (currentSearchOption != "Block Number") {
      const validity = await store.searchHashIsValid(searchValue, currentSearchOption);

      if (validity.isValid) {
        window.location.href = `/${searchValue}`;
      } else {
        setSearchError(validity.error);
      }
      
    } else {
      handleBlockNumSearch(searchValue);
    }
  }

  const handleSearchOptionSelect = (item: string) => {
    setSearchValue('');
    setSearchError('');
    setCurrentSearchOption(item);
  }

  const handleSearchInput = (value: string) => {
    setSearchError('');
    setSearchValue(value);
  }

  const handleBlockNumSearch = async (blockNum: string) => {
    const validity = await store.blockNumIsValid(parseInt(blockNum));

    if (validity.isValid) {
      store.fetchBlockHashByNum(parseInt(searchValue)).then((hash: string) => {
        if (hash) {
          window.location.href = `/${hash}`;
        }
      });
    } else {
      setSearchError(validity.error);
    }
  }

  return useObserver(() => (
    <Router>
      <div className={styles.container}>
        {/* <div className={styles.langSelect}>
          <LangSelector />
        </div> */}

        <nav className={styles.nav}>
          <div className={styles.innerContainer}>
            <a href="/"><img src={logo} className={styles.logo} alt="Zenotta logo" /></a>
          </div>
        </nav>

        <div className={styles.searchContainer}>
          <div className={styles.innerContainer}>
            <Dropdown 
              onItemClick={(item: any) => handleSearchOptionSelect(item)}
              listItems={searchOptions} />

            <TextInput
              type="search"
              label="Search here..."
              iconType="text"
              className={styles.search}
              shouldSubmitOnEnter={true}
              onChange={(e: any) => handleSearchInput(e.target.value)}
              onSubmit={() => submitSearchValue()} />

            {searchError.length > 0 && 
            <Notification 
              type="error" 
              variant="outlined"
              closable
              className={styles.notification}>
              {searchError}
            </Notification>}
          </div>
        </div>

        <div className={styles.content}>  
          <div className={styles.innerContainer}>  
            <Switch>
            <Route exact path="/csv-export">
                <div className={styles.childContainer}>
                  <CsvExport />
                </div>
              </Route>
              <Route exact path="/:hash">
                <div className={styles.childContainer}>
                  <BCItemView />
                </div>
              </Route>
              <Route exact path="/">
                <div className={styles.childContainer}>
                  <Explorer />
                </div>
              </Route>
              <Route path="*">ERROR 404</Route>
            </Switch>
          </div>

          <Footer />
        </div>
      </div>
    </Router>
  ));
}
