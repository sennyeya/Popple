import React from 'react';
import style from './LandingPage.module.css'

class PlanItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: props.data.class.name,
            credits: props.data.class.credit,
            nodeId: props.data._id,
            key: props.keyVal,
            className: props.className
        }

        this.onSelect = this.onSelect.bind(this);
    }

    render(){
        return (
            <li key={this.state.key} className={this.state.className}>
                <span className={style.classTitle}>{this.state.name}</span>
                <span className={style.credits}>{this.state.credits}</span>
                <input type="button" className={style.addOrRemove} onClick={this.onSelect} value={this.state.className==="selected"?"Remove Class":"Keep Class"}></input>
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