import React, { useContext } from 'react';
import {Link} from "react-router-dom";
import LandingPage from './LandingPage';
import Header from '../shared/Header';
import UserContext from '../contexts/UserContext';
import ErrorBoundary from '../ErrorBoundary'

export default function StudentDashboard(props){
	/** Logged in user from context. */
    const {user} = useContext(UserContext)

    return(
        <ErrorBoundary>
			<Header/>
			<nav>
			<ul>
				<li>
				<Link to="/student">Home</Link>
				</li>
				{
					user?(
						<>
						<li>
							<Link to="/student/plan">Plan</Link>
						</li>
						<li>
							<Link to="/student/classes">Classes</Link>
						</li>
						</>
					):
					<></>}
			</ul>
			</nav>
			{
				props.children?
				props.children:
				<LandingPage/>
			}
		</ErrorBoundary>
	)
}