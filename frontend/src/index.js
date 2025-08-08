import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // <-- IMPORT BrowserRouter here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Router should wrap AuthProvider */}
    <Router> {/* <-- WRAP AuthProvider with Router */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);