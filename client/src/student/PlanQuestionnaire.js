import React from 'react';
import Loading from './Loading'
import {config} from './config';

import style from './LandingPage.module.css'

const authOptions = 
{
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
    }
}

class GraphItem extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
        }
    }

    render(){
        return(
            <>
            <select></select>
            </>
        )
    }
}

export default GraphItem;