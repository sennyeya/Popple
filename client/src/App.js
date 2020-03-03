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
import AdminDashboard from './admin/Index';
import StudentDashboard from './student/Index'
import PlanItem from './admin/PlanItem';
import ClassItem from './admin/ClassItem'
import 'bootstrap/dist/css/bootstrap.min.css';

function App(){
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
            <Route path="/" exact render={()=><StudentDashboard/>}>
            </Route>
            <Route path="/tos" exact render={()=><TOS/>}>
            </Route>
            <Route path="/admin" exact render={()=><AdminDashboard/>}>
            </Route>
            <Route path="/admin/plan" exact render={()=><AdminDashboard children={[<PlanItem></PlanItem>]}/>}></Route>
            <Route path="/admin/class" exact render={()=><AdminDashboard children={[<ClassItem></ClassItem>]}/>}></Route>
            <Route path="/logout" exact render={()=>window.open(config.api+"/auth/logout")}>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
