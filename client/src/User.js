import React from 'react';
import config from './config';

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
            return <p>Loading...</p>;
        }
        if(error){
            return <p>Something went wrong</p>;
        }
        return (
        <React.Fragment>
            <h1>{name}</h1>
            <input type="text" onChange={this.onTextChange}></input>
            <button onClick={this.onClickText}></button>
        </React.Fragment>
        );
    }

    onTextChange = function(event){
        console.log(event.target.value)
        this.text = event.target.value;
    }

    onClickText= function(){
        fetch("http://localhost:5000/users/add/"+this.text, 
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
}

export default User;