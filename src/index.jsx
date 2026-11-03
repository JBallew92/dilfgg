import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import Home from './pages/Home';
import Standings from './pages/Standings';
import History from './pages/History';
import Submit from './pages/Submit';
import FormSubmission from './FormSubmission';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/Standings" element={<Standings />} />
          <Route path="/History" element={<History />} />
          <Route path="/Submit" element={<Submit />} />
          <Route path="/FormSubmission" element={<FormSubmission />} />
          {/* Old links to the player cards page */}
          <Route path="/Stats" element={<Navigate to="/Standings" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
