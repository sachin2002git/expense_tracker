import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <-- REMOVE BrowserRouter import here
import Header from './components/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import PrivateRoute from './utils/PrivateRoute';
import './App.css';

function App() {
  return (
    // <Router> tag removed from here
    <> {/* Use a React Fragment since Router is no longer the root element */}
      <Header />
      <main className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/budgets" element={<PrivateRoute><Budgets /></PrivateRoute>} />

          {/* Redirect root to dashboard if logged in, otherwise to login */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </main>
    </> // Closing Fragment tag
    // </Router> tag removed from here
  );
}

export default App;
