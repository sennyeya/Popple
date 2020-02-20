import React from 'react';
import {config} from './config';
import './App.css';
import Loading from './Loading'

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
        fetch(config.api+"/users/test")
            .then(response=>{
                if(!response.ok){
                    throw new Error('Something went wrong');
                }
                return response.json();
            })
            .then(data=>{
                this.setState({name:data.name, sId:data.id, isLoading:false})
            })
            .catch(err=>{
                console.log(err);
                return this.setState({error:true})
            })
    }

    render(){
        return(<>
            <div className="containerBox">
                <div className="header">
                    <h1 className="headerText">Hi, {this.state.name}</h1>
                </div>
                <div id="canvasContainer">
                    {this.state.isLoading?<Loading/>:<p>Welcome to Popple</p>}
                </div>
            </div>
        </>)
    }
}

export default User;