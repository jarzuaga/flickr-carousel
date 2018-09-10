import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'emotion';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

injectGlobal`
  html, body {
    margin: 0;
    box-sizing: border-box;
    font-size: 16px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
