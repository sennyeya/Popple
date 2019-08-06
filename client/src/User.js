import React from 'react';
import config from './config';
import style from './User.css'

class User extends React.Component{
    text = "";

    constructor(props){
        super(props);
        this.state = {
            name : "",
            isLoading: false,
            error:false
        }

        this.onClickText = this.onClickText.bind(this);
        this.onTextChange = this.onTextChange.bind(this);

        this.boxify = this.boxify.bind(this);
    }

    componentDidMount(){
        fetch("http://localhost:5000/users/add/asdf", 
        {
            method:'POST'
        })
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
        this.boxify(<>
            <div className="rows">
                <div className="columns">
                    <p>{name}</p>
                </div>
                <div className="columns">
                    <input type="text" onChange={this.onTextChange}></input>
                    <button onClick={this.onClickText}></button>
                </div>
            </div>
        </>
        )
        );
    }

    boxify = function(value){
        return (
        <React.Fragment>
            <div className= "userBox">
                <h1 className="greeting">Hi!</h1>
                <h2>{value}</h2>
            </div>
        </React.Fragment>);
    }

    onTextChange = function(event){
        console.log(event.target.value)
        this.text = event.target.value;
    }

    onClickText= function(){
        fetch("http://localhost:5000/data/load/")
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
}

export default User;