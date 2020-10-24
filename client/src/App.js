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
import {config} from './config'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import CalendarGrid from './student/CalendarView';
import Plan from './student/Plan';
import GraphItem from './student/Graph';

export default function App(){
    return (
      <Router>
        <div>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/" exact render={()=><HomePage/>}></Route>
            <Route path="/student" exact render={()=><StudentDashboard/>}/>
            <Route path="/student/calendar" exact render={()=><StudentDashboard children={[<CalendarGrid/>]}/>}/>
            <Route path="/student/plan" exact render={()=><StudentDashboard children={[<GraphItem/>]}/>}/>
            <Route path="/student/classes" exact render={()=><StudentDashboard children={[<Plan/>]}/>}/>
            <Route path="/login" exact render={()=><HomePage children={[<LoginPage/>]}></HomePage>}/>
            <Route path="/tos" exact render={()=><HomePage children={[<TOS/>]}></HomePage>}/>
            <Route path="/admin" exact render={()=><AdminDashboard/>}/>
            <Route path="/admin/plan" exact render={()=><AdminDashboard children={[<PlanItem></PlanItem>]}/>}></Route>
            <Route path="/admin/class" exact render={()=><AdminDashboard children={[<ClassItem></ClassItem>]}/>}></Route>
            <Route path="/logout" exact render={()=>window.open(config.api+"/auth/logout", " self")}/>
          </Switch>
        </div>
      </Router>
    );
  }
