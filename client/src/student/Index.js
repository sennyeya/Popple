import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import style from '../Navbar.module.css'
import LandingPage from './LandingPage';
import Header from '../shared/Header'

export default class StudentDashboard extends React.Component{
    render(){
        return(
            <>
            <Header/>
            <nav>
            <ul>
              <li>
                <Link to="/student">Home</Link>
              </li>
            </ul>
          </nav>
            <LandingPage></LandingPage>
          </>)
    }
}