import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import style from '../Navbar.module.css'
import LandingPage from './LandingPage';

export default class StudentDashboard extends React.Component{
    render(){
        return(
            <>
            <nav>
            <ul className={style.navBarList}>
              <li className={style.navBarListItem}>
                <Link to="/student">Home</Link>
              </li>
              <li className={style.navBarListItem}>
                <Link to="/tos">Terms of Service</Link>
              </li>
              <li className={style.navBarListItemActive}>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
          </nav>
            <LandingPage></LandingPage>
          </>)
    }
}