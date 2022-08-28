import React from "react";
import ReactDOM from "react-dom/client";

import './styles/cssReset.css';
import './styles/cssDefaults.css';
import App from './App';

function RootElement() {
  const element = document.createElement('div');
  element.id = 'root';
  return element;
}

document.body.appendChild(RootElement());

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
