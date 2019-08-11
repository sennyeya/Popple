import React from 'react';
import { removePropertiesDeep } from '@babel/types';

class PlanItem extends React.Component{
    constructor(props){
        super(props);
        console.log(props)

        this.state = {
            name: props.data.name,
            credits: props.data.credits,
            nodeId: props.data.nodeId,
            key: props.data.key
        }
    }

    render(){
        return (
            <li key={this.state.key}>
                <p>{this.state.name}</p>
                <p>{this.state.credits}</p>
                <input type="button"></input>
            </li>
        )
    }
}

export default PlanItem;