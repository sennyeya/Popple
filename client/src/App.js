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
import PlanItem from './admin/PlanItem';
import ClassItem from './admin/ClassItem'
import {api} from './config'
import API from './shared/API'
import HomePage from './HomePage'
import LoginPage from './LoginPage'

import UserContext,{ useUserOutlet } from './contexts/UserContext';
import { LoadingIndicator } from './shared/Loading';
import ContentContainer from './shared/ContentContainer'
import Footer from './shared/Footer';
import ErrorBoundary from './ErrorBoundary'
import Header from './shared/Header';
import { Helmet } from 'react-helmet'
import StudentContainer from './student/StudentContainer';

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
		}).catch(()=>{
			setUser(null)
			setLoading(false)
		})
	}, [setUser])

    return (
		<ErrorBoundary>
			<Helmet>
				<title>Home | Popple</title>
			</Helmet>
			<Router>
				<>
				<Header/>
				<ContentContainer>
				{
					loading?
					<LoadingIndicator/>:
					<Switch>
						<Route path="/" exact>
							<HomePage/>
						</Route>
						<Route path="/tos" exact>
							<TOS/>
						</Route>
						<Route path="/login" exact>
						{
							user?
							<Redirect to="/"/>:
							<LoginPage/>
						}
						</Route>
						{
							!user?
							<Redirect to="/login"/>:
							<>
								<Route path="/student">
									<StudentContainer/>
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
							</>
						}
					</Switch>
				}
				</ContentContainer>
				<Footer/>
				</>
			</Router>
		</ErrorBoundary>
    );
}