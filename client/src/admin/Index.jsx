import React, {useContext} from 'react';
import Unauthorized from './Unauthorized';
import UserContext from '../contexts/UserContext';

export default function AdminDashboard(props){

    /** Logged in user from context. */
    const {user} = useContext(UserContext)

    if(!user || !user.isAdmin){
        return <Unauthorized/>
    }
    return (<div>
        <p>Welcome to the admin side of Popple.</p>
    </div>)
}