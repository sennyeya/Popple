import React, {useContext} from 'react';
import Unauthorized from './Unauthorized';
import MenuBar from './MenuBar';
import UserContext from '../contexts/UserContext';
import MainPanel from '../shared/MainPanel'

export default function AdminDashboard(props){

    /** Logged in user from context. */
    const {user} = useContext(UserContext)

    if(!user || !user.isAdmin){
        return <Unauthorized/>
    }
    return(
        <>
            <MenuBar/>
            <MainPanel>
                {props.children?<>{props.children}</>:<DefaultDashboard/>}
            </MainPanel>
        </>
    )
}

class DefaultDashboard extends React.Component{
    render(){
        return (<div>
            <p>Welcome to the admin side of Popple.</p>
        </div>)
    }
}