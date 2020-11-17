import React, {useState, useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import TOS from './main/TOS';
import AdminDashboard from './admin/Index';
import {api} from './config'
import API from './shared/API'
import HomePage from './main/HomePage'
import LoginPage from './main/LoginPage'
import UserContext,{ useUserOutlet } from './contexts/UserContext';
import { LoadingIndicator } from './shared/Loading';
import ContentContainer from './shared/ContentContainer'
import ErrorBoundary from './main/ErrorBoundary'
import { Helmet } from 'react-helmet'
import StudentContainer from './student/StudentContainer';
import SignUp from './main/SignUp';

export default function App(){

	/** Loading state, true if ip is registered and user profile has been received. */
	const [loading, setLoading] = useState(true);

	/** Logged in user from context. */
	const {user} = useContext(UserContext)
	
	let setUser = useUserOutlet();

    React.useEffect(()=>{
		if(!user){
			API.get("/users/current").then(json=>{
				if(!user){
					setUser(json);
					setLoading(false)
				}
			}).catch(()=>{
				setUser(null)
				setLoading(false)
			})
		}
		
	}, [setUser, user])

    return (
		<ErrorBoundary>
			<Helmet>
				<title>Home | Popple</title>
			</Helmet>
			<Router>
				<ContentContainer>
					{
						loading?
						<LoadingIndicator/>:
						<Switch>
							<Route path="/" exact>
								<HomePage/>
							</Route>
							<Route path="/signUp" exact>
							{
								user?
								<Redirect to="/"/>:
								<SignUp/>
							}
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
									<Route path="/admin">
										<AdminDashboard/>
									</Route>
									<Route path="/logout" exact render={()=>{
										setUser(null);
										window.open(api+"/auth/logout", " self")
									}}/>
								</>
							}
						</Switch>
					}
				</ContentContainer>
			</Router>
		</ErrorBoundary>
    );
}