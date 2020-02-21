import React from 'react';
import {config} from './config';

class LoginPage extends React.Component{
    render(){
        return (
            <button onClick={this._handleSignInClick} value="Login To Google">Login To Google</button>
        )
    }

    _handleSignInClick = () => {
        // Authenticate using via passport api in the backend
        // Open Twitter login page
        // Upon successful login, a cookie session will be stored in the client
        window.open(config.api+"/auth/google", "_self");
    };
}

export default LoginPage