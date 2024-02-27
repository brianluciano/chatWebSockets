import React from 'react';
import { render } from 'react-dom';
import Chat from './chat.js';

import "./style/style.css";

const App = () => {
    return<> 
    <Chat /> 
    </>
};

render(
  <App/>,
  document.getElementById('app')
);
