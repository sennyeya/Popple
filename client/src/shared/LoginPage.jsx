import React from 'react';
import {api} from '../config';
import GoogleButton from 'react-google-button';

class LoginPage extends React.Component{
    render(){
        return (
            <div style={{top:"50%", left:"50%", transform:"translate(50%, 50%)"}}>
                <GoogleButton onClick={this._handleSignInClick}/>
            </div>
        )
    }

    _handleSignInClick = () => {
        // Authenticate using via passport api in the backend
        // Open Twitter login page
        // Upon successful login, a cookie session will be stored in the client
        window.open(api+"/auth/google", "_self");
    };
}

export default LoginPage