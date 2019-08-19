import React from 'react';
import Loading from './Loading';
import PlanItem from './PlanItem';
import {config} from './config';

class Plan extends React.Component{
    constructor(props){
        super(props);

        // Pass in student id.
        this.state = {
            options: [],
            selected: [],
            isLoading:true
        }

        this.onSelect = this.onSelect.bind(this);
        this.onClassReload = this.onClassReload.bind(this);
    }

    componentDidMount(){
        fetch(config.api+"/data/generate/"+"12", {method:'POST'}).then(data=>data.json()).then(json=>{
            var arr = json['plan']?json['plan']:[];
            this.setState({options:arr, isLoading:false});
        })
    }

    render(){
        var content;
        if(this.state.isLoading){
            content = <Loading/>
        }else{
            content = this.state.options?(
            <div>
                <ul>{this.state.options.map((e, index)=> {
                    return <PlanItem data={e} keyVal={index} key={index} handleSelect = {this.onSelect} className={this.state.selected.some(l=>l===e.nodeId)?"selected":"unselected"}/>})
                    }
                </ul>
                <input type="button" onClick={this.onClassReload} value="Regenerate My Plan"></input>
            </div>):<p>No plans found. Please change your credit count.</p>
        }
        return(
            <>
            <div className="containerBox">
                <div className="header">
                    <h1 className="headerText">Plan</h1>
                </div>
                <div id="canvasContainer">
                    {content}
                </div>
            </div>
            </>
        )
    }

    onSelect = (id, element) =>{
        var {selected} = this.state;
        if(selected.includes(id)){
            selected = selected.filter(e=>e!==id);
        }else{
            selected.push(id);
        }
        this.setState({selected:selected})
    }

    onClassReload = ()=>{
        this.setState({isLoading:true})
        fetch(config.api+"/data/generate/"+"12", {method:'POST'}).then(data=>data.json()).then(json=>{
            var arr = json['plan']?json['plan']:[];
            this.setState({
                options:arr, 
                selected:[], 
                isLoading:false
            });
        })
    }
}

export default Plan;