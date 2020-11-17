import React, {useContext} from 'react';
import UserContext from './contexts/UserContext';
import style from './HomePage.module.css'

export default function HomePage(props){
    /** Logged in user from context. */
    const {user} = useContext(UserContext)

    return (
        <div>
            <h4 style={{textAlign:"center"}}>Customizing your four year plan made easy.</h4>
            <br/>
            {!user?<div style={{width:"100%", textAlign:"center"}}><a className={style.loginButton} href="/login">Login</a></div>:<></>}
        </div>
    )
}