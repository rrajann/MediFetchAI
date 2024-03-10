import "./App.css";
import Search from "./pages/search/Search";
import {Login} from "./pages/login/Login";
import SubmitFiles from "./pages/submitFiles/SubmitFiles";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoggedIn from "./pages/loggedIn/LoggedIn";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/submit" element={<SubmitFiles />} />
          <Route path="/loggedin" element={<LoggedIn/>}/>
        </Routes>
    </Router>
  );
}

export default App;
