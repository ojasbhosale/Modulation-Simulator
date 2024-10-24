import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Home.css';  // Import home page styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
