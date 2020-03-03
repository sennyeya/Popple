import React from 'react';
import {config, authOptionsGet} from './config';
import Unauthorized from './Unauthorized'

export default class Index extends React.Component{
    constructor(props){
        super(props);
        this.state = {
        }
    }

    componentDidMount(){
    }

    render(){
        return(<div><p>You are not allowed to enter this area.</p></div>)
    }
}