import React, {useContext} from 'react'
import Header from '../shared/Header';
import {Link} from 'react-router-dom'
import UserContext from '../contexts/UserContext';

export default function MenuBar(){

    const {user} = useContext(UserContext)

    return (
        <>
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
        </>
    )
}