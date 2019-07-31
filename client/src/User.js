import React from 'react';
import config from '/config.js';

class User extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name : "",
            isLoading: false
        }
    }

    componentDidMount(){
        fetch("localhost:5000/users/")
            .then(response=>response.json())
            .then(data=>this.setState({name:data.name, isLoading:false}))
    }

    render(){
        if(this.isLoading){
            return <p>Loading...</p>;
        }
        return (
        <React.Fragment>
            <h1>{this.state.name}</h1>
        </React.Fragment>
        );
    }
}

export default User;