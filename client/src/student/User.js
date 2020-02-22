import React from 'react';
import {config} from './config';
import Loading from './Loading'
import style from './LandingPage.module.css'

const options = 
{
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
    }
}

class User extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            name : props.name,
            error:false,
            sId:0
        }
    }

    render(){
        return(<>
            <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Hi, {this.state.name}</h1>
                </div>
                <div id={style.canvasContainer}>
                    <p>Welcome to Popple</p>
                </div>
            </div>
        </>)
    }
}

export default User;