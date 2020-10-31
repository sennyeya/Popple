import React, {useState, useContext} from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
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
import MenuBar from './shared/MenuBar';
import ContentContainer from './shared/ContentContainer'
import Footer from './shared/Footer';
import ErrorBoundary from './ErrorBoundary'

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
	}, [setUser])

    return (
		<ErrorBoundary>
			<Router>
				<>
				<MenuBar/>
				{loading?<LoadingIndicator/>:<>
				{/* A <Switch> looks through its children <Route>s and
					renders the first one that matches the current URL. */}
				<ContentContainer>
					<Switch>
						<Route path="/" exact>
							<HomePage/>
						</Route>
						<Route path="/student" exact>
							<StudentDashboard/>
						</Route>
						<Route path="/student/calendar" exact>
							<CalendarGrid/>
						</Route>
						<Route path="/student/plan" exact>
							<GraphItem/>
						</Route>
						<Route path="/student/classes" exact>
							<Plan/>
						</Route>
						<Route path="/login" exact>
						{
							user?
							<Redirect to="/"/>:
							<LoginPage/>
						}
						</Route>
						<Route path="/tos" exact>
							<TOS/>
						</Route>
						<Route path="/admin" exact>
							<AdminDashboard/>
						</Route>
						<Route path="/admin/plan" exact>
							<PlanItem/>
						</Route>
						<Route path="/admin/class" exact>
							<ClassItem/>
						</Route>
						<Route path="/logout" exact render={()=>window.open(api+"/auth/logout", " self")}/>
					</Switch>
				</ContentContainer>
				<Footer/>
				</>}
				</>
			</Router>
		</ErrorBoundary>
    );
}