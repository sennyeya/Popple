import React from 'react';
import config from './config';
import './App.css'

class User extends React.Component{
    text = "";

    constructor(props){
        super(props);
        this.state = {
            name : "",
            isLoading: false,
            error:false
        }

        this.boxify = this.boxify.bind(this);
    }

    componentDidMount(){
        fetch("http://localhost:5000/users/test")
            .then(response=>{
                if(!response.ok){
                    throw new Error('Something went wrong');
                }
                return response.json();
            })
            .then(data=>{
                this.setState({name:data.name, isLoading:false})
            })
            .catch(err=>{
                console.log(err);
                return this.setState({error:true})
            })
    }

    render(){
        const {isLoading, error, name} = this.state
        if(isLoading){
            return this.boxify("Loading...");
        }
        if(error){
            return this.boxify("Something went wrong");
        }
        return (
            this.boxify(name)
        );
    }

    boxify = function(value){
        return (
        <React.Fragment>
            <div className= "containerBox">
                <div className="header">
                    <h1 className="headerText">Hi, {value}!</h1>
                </div>
                <p>Welcome to Popple.</p>
            </div>
        </React.Fragment>);
    }
}

export default User;