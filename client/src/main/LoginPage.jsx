import React from 'react';
import {api} from '../config';
import GoogleButton from 'react-google-button';
import LoginForm from './LoginForm'
import style from './Main.module.css';
export default function LoginPage(){
    const _handleSignInClick = () => {
        // Authenticate using via passport api in the backend
        // Open Twitter login page
        // Upon successful login, a cookie session will be stored in the client
        window.open(api+"/auth/google", "_self");
    };

    return (
        <>
            <div className={style.loginContainer}>
                <LoginForm/>
                {/*<GoogleButton onClick={_handleSignInClick} style={{justifyContent:"center"}}/>*/}
            </div>
            <div className={style.loginContainer} style={{borderTop:"1px solid gray"}}>
                <button onClick={()=>window.location="/signUp"} className="primary">Sign Up</button>
            </div>
        </>
    )
}