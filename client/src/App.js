import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import LandingPage from './student/LandingPage';
import TOS from './TOS';
import style from './App.module.css';
import {config} from './config'

export default class App extends React.Component{
  render() {
    return (
      <Router>
        <div>
          <nav>
            <ul className={style.navBarList}>
              <li className={style.navBarListItem}>
                <Link to="/">Home</Link>
              </li>
              <li className={style.navBarListItem}>
                <Link to="/tos">Terms of Service</Link>
              </li>
              <li className={style.navBarListItemActive}>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/" exact render={()=><LandingPage/>}>
            </Route>
            <Route path="/tos" exact render={()=><TOS/>}>
            </Route>
            <Route path="/logout" exact render={()=>window.open(config.api+"/auth/logout")}>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
