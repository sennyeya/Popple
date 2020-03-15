import React from 'react';
import {config} from './config';
import GoogleButton from 'react-google-button';
import style from './Main.module.css'
export default function LoginPage(){
    const _handleSignInClick = () => {
        // Authenticate using via passport api in the backend
        // Open Twitter login page
        // Upon successful login, a cookie session will be stored in the client
        window.open(config.api+"/auth/google", "_self");
    };

    return (
        <div className={style.container}>
            <GoogleButton onClick={_handleSignInClick} style={{justifyContent:"center"}}/>
        </div>
    )
}