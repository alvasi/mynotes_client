// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Deadlines from './Deadlines';
import Notes from './Notes';
import Calendar from './Calendar';
import './App.css'; // Make sure to have an App.css for global styles

function App() {
  return (
    <Router basename="/app">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </Router>
  );
}

export default App;
