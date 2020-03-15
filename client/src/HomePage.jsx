import React from 'react'
import {Link} from 'react-router-dom'
import style from './Navbar.module.css';
import headerStyle from './Main.module.css'
import Main from './Main'
export default function HomePage(props){
    return (
        <>
        <header>
            <h1>Test</h1>
        </header>
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/tos">Terms of Service</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
            </ul>
        </nav>
        {props.children?props.children: (
            <>
                <Main></Main>
            </>
        )}
        </>
    )
}