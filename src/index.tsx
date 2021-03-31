import ReactDOM from 'react-dom';
import React from 'react';

import './i18n';
import App from './components/App/App';

ReactDOM.render(<App />, document.querySelector('#container'));

if (module && module.hot) {
  module.hot.accept();

  module.hot.addStatusHandler(status => {
    if (status === 'prepare') console.clear();
  });
}
