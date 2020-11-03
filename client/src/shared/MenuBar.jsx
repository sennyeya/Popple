import React, {useContext} from 'react'
import {Link} from 'react-router-dom'
import UserContext from '../contexts/UserContext';
import './MenuBar.module.css'
import {withRouter} from 'react-router-dom'

function MenuBar(props){

    const {user} = useContext(UserContext)
    let route = ''
    if(props.location.pathname!=="/"){
        route = props.location.pathname.split('/')[1]
    }
    return (
        <>
            <nav style={props.style}>
                <ul>
                    {
                        route==="student"?
                        <StudentMenuBar/>:
                        (
                            route === "admin"?
                            <AdminMenuBar/>:
                            <>
                                <li>
                                    <Link to="/">Home</Link>
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
                            </>
                        )
                    } 
                </ul>
            </nav>
        </>
    )
}

export default withRouter(MenuBar)

function StudentMenuBar(){
    const {user} = useContext(UserContext)
    return (
        <>
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
                <></>
            }
        </>
    )
}

function AdminMenuBar(){
    return (
        <>
            <li>
                <Link to="/admin">Home</Link>
            </li>
            <li>
                <Link to="/admin/plan">Plan</Link>
            </li>
            <li>
                <Link to="/admin/class">Classes</Link>
            </li>
        </>
    )
}