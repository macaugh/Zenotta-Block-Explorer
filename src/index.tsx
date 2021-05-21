import ReactDOM from 'react-dom';
import React from 'react';

import storeInstance from "./store/Store";

import './i18n';
import App from './components/App/App';

export const StoreContext = React.createContext(storeInstance);


storeInstance.fetchLatestBlock();

ReactDOM.render(
  <StoreContext.Provider value={storeInstance}>
    <App />
  </StoreContext.Provider>,
  document.querySelector('#container'));

if (module && module.hot) {
  module.hot.accept();

  module.hot.addStatusHandler(status => {
    if (status === 'prepare') console.clear();
  });
}
