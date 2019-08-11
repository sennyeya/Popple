import React from 'react';
import Loading from './Loading';
import PlanItem from './PlanItem';
import {config} from './config';

class Plan extends React.Component{
    constructor(props){
        super(props);

        // Pass in student id.
        this.state = {
            options: []
        }
    }

    componentDidMount(){
        fetch(config.api+"/data/generate/"+"12", {method:'POST'}).then(data=>data.json()).then(json=>{
            var arr = json['plan']?json['plan']:[];
            this.setState({options:arr});
        })
    }

    render(){
        return(
            <>
            <div className="containerBox">
                <div className="header">
                    <h1 className="headerText">Plan</h1>
                </div>
                <div id="canvasContainer">
                    {this.state.isLoading?<Loading/>:(this.state.options?<ul>{this.state.options.map((e, index)=><PlanItem data={e} key={index}/>)}</ul>:<p>No plans found. Please change your credit count.</p>)}
                </div>
            </div>
            </>
        )
    }
}

export default Plan;