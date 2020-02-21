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
            name : "",
            isLoading: true,
            error:false,
            sId:0
        }
    }

    componentDidMount(){
        fetch(config.api+"/users/test", options)
            .then(response=>{
                if(!response.ok){
                    this.props.verify()
                }
                return response.json();
            })
            .then(data=>{
                this.setState({name:data.name, sId:data.id, isLoading:false})
            })
    }

    render(){
        return(<>
            <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Hi, {this.state.name}</h1>
                </div>
                <div id={style.canvasContainer}>
                    {this.state.isLoading?<Loading/>:<p>Welcome to Popple</p>}
                </div>
            </div>
        </>)
    }
}

export default User;