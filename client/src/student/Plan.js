import React from 'react';
import Loading from '../shared/Loading';
import PlanItem from './PlanItem';
import PlanPicklist from './PlanPicklist'
import {config, authOptionsPost} from './config';
import style from './LandingPage.module.css';
import mainStyle from '../Main.module.css'
import {UserContext} from '../contexts/userContext'

class Plan extends React.Component{
    constructor(props){
        super(props);

        // Pass in student id.
        this.state = {
            options: [],
            selected: [],
            isLoading:true,
            plans: [],
            selectedOption: null
        }

        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount(){
        fetch(config.api+"/data/generate", authOptionsPost(JSON.stringify({sId: this.context.user.sId})))
        .then(data=>data.json()).then(json=>{
            var arr = json.plan || [];
            this.setState({options:arr, isLoading:false, selected:arr.map(e=>e._id)});
        });
    }

    render(){
        var content;
        if(this.state.isLoading){
            content = <Loading/>
        }else{
            content = this.state.options.length?(
            <div className={style.planSelect}>
                <ul className={style.classes}>{this.state.options.map((e, index)=> {
                    return <PlanItem data={e} keyVal={index} key={index} handleSelect = {this.onSelect} className={this.state.selected.some(l=>l===e._id)?"selected":"unselected"}/>})
                    }
                </ul>
                <input type="button" onClick={this.onClassReload} id="regenerate" value="Regenerate My Plan" className={style.planButton}></input>
            </div>):(
            <>
                <p>No plans found. Please add a new plan.</p>
                <PlanPicklist/>
            </>)
        }
        return(
            <div className={mainStyle.container}>
                {content}
            </div>
        )
    }

    handleChange= (selectedOption)=>{
        this.setState({selectedOption})
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
        if(this.state.selected.length===this.state.options.length){
            alert("Please deselect classes to proceed.");
            return;
        }
        this.setState({isLoading:true})
        fetch(config.api+"/data/regenerate", authOptionsPost(JSON.stringify({sId: this.context.user.sId, vals:this.state.selected})))
        .then(data=>data.json()).then(json=>{
            if(json.error){
                alert("Could not remove classes, no suitable alternatives found.");
                this.setState({
                    isLoading:false
                });
                return; 
            }
            var arr = json.plan||[];
            this.setState({
                options:arr, 
                selected:arr.map(e=>e._id), 
                isLoading:false
            });
        })
    }
}

Plan.contextType = UserContext;

export default Plan;