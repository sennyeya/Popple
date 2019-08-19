import React from 'react';
import { thisTypeAnnotation } from '@babel/types';

class PlanItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: props.data.name,
            credits: props.data.credits,
            nodeId: props.data.nodeId,
            key: props.keyVal,
            className: props.className
        }

        this.onSelect = this.onSelect.bind(this);
    }

    render(){
        return (
            <li key={this.state.key} className={this.state.className}>
                <span className="classTitle">{this.state.name}</span>
                <span className="credits">{this.state.credits}</span>
                <input type="button" className="addOrRemove" onClick={this.onSelect} value={this.state.className==="selected"?"Remove Class":"Keep Class"}></input>
            </li>
        )
    }

    componentWillReceiveProps(props){
        this.setState({className:props.className})
    }

    onSelect = (e) =>{
        this.props.handleSelect(this.state.nodeId, e.target);
    }
}

export default PlanItem;