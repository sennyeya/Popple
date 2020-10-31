import React, {useContext} from 'react'
import Header from './Header';
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
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/tos">Terms of Service</Link>
                    </li>
                    {
                        user?
                        <>{
                            user.isAdmin?
                            <>
                                <li>
                                    <Link to="/admin">Admin</Link>
                                </li>
                            </>:
                            <></>
                        }{<li>
                            <Link to="/student">Student</Link>
                        </li>}</>:
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    }   
                </ul>
            </nav>
        </>
    )
}