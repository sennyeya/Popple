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

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact render={()=><StudentDashboard/>}>
          </Route>
          <Route path="/tos" exact render={()=><TOS/>}>
          </Route>
          <Route path="/admin" exact render={()=><AdminDashboard/>}>
          </Route>
          <Route path="/admin/plan" exact render={()=><AdminDashboard children={[<PlanItem></PlanItem>]}/>}></Route>
          <Route path="/admin/class" exact render={()=><AdminDashboard children={[<ClassItem></ClassItem>]}/>}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
