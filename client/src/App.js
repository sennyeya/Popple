import React, {useEffect, useState, useContext} from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link, Redirect
} from "react-router-dom";
import LandingPage from './student/LandingPage';
import TOS from './TOS';
import AdminDashboard from './admin/Index';
import StudentDashboard from './student/Index'
import PlanItem from './admin/PlanItem';
import ClassItem from './admin/ClassItem'
import {api} from './config'
import API from './shared/API'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import CalendarGrid from './student/CalendarView';
import Plan from './student/Plan';
import GraphItem from './student/Graph';
import UserContext,{ useUserOutlet } from './contexts/UserContext';
import { LoadingIndicator } from './shared/Loading';

export default function App(){

	/** Loading state, true if ip is registered and user profile has been received. */
	const [loading, setLoading] = useState(true);

	/** Logged in user from context. */
	const {user} = useContext(UserContext)
	
	let setUser = useUserOutlet();

    React.useEffect(()=>{
		API.get("/users/current").then(json=>{
			setUser(json);
			setLoading(false)
		}).catch(()=>setUser(null))
	}, [])

    return (
      <Router>
        <>
		{loading?<LoadingIndicator/>:<>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/" exact>
				<HomePage/>
			</Route>
            <Route path="/student" exact>
				<StudentDashboard/>
			</Route>
            <Route path="/student/calendar" exact>
				<StudentDashboard children={[<CalendarGrid/>]}/>
			</Route>
            <Route path="/student/plan" exact>
				<StudentDashboard children={[<GraphItem/>]}/>
			</Route>
            <Route path="/student/classes" exact>
				<StudentDashboard children={[<Plan/>]}/>
			</Route>
			<Route path="/login" exact>
			{
				user?
				<Redirect to="/"/>:
				<HomePage children={[<LoginPage/>]}></HomePage>
			}
			</Route>
            <Route path="/tos" exact>
				<HomePage children={[<TOS/>]}></HomePage>
			</Route>
            <Route path="/admin" exact>
				<AdminDashboard/>
			</Route>
            <Route path="/admin/plan" exact>
				<AdminDashboard children={[<PlanItem/>]}/>
			</Route>
            <Route path="/admin/class" exact>
				<AdminDashboard children={[<ClassItem/>]}/>
			</Route>
            <Route path="/logout" exact render={()=>window.open(api+"/auth/logout", " self")}/>
          </Switch>
		</>}
        </>
      </Router>
    );
  }
