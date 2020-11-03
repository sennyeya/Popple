import React from 'react';
import {LoadingIndicator} from '../shared/Loading';
import PlanItem from './PlanItem';
import PlanPicklist from './PlanPicklist';
import style from './Plan.module.css';
import mainStyle from '../Main.module.css'
import UserContext from '../contexts/UserContext'
import API from '../shared/API';

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
        API.post("/student/plan/generate").then(json=>{
            var arr = json.plan || [];
            this.setState({options:arr, isLoading:false, selected:arr.map(e=>e._id)});
        });
    }

    render(){
        if(this.state.isLoading){
            return <LoadingIndicator/>
        }
        let removedCount = this.state.options.length-this.state.selected.length
        return(
            <div className={mainStyle.container}>
                {
                    this.state.options.length?
                    (
                        <div className={style.planSelect}>
                            <h2>This is your plan for the current semester. Please look through the given options and remove classes if they are not a good fit for you.</h2>
                                <p>Replacing {removedCount} {removedCount===1?"class":"classes"}.</p>
                            <ul className={style.classes}>{this.state.options.map((e, index)=> {
                                return <PlanItem data={e} keyVal={index} key={index} handleSelect = {this.onSelect} className={this.state.selected.some(l=>l===e._id)?"selected":"unselected"}/>})
                                }
                            </ul>
                            <input type="button" onClick={this.onClassReload} id="regenerate" value="Regenerate My Plan" className={style.planButton}></input>
                        </div>
                    ):
                    (
                        <>
                            <p>No plans found. Please add a new plan.</p>
                            <PlanPicklist/>
                        </>
                    )
                }
            </div>
        )
    }

    handleChange= (selectedOption)=>{
        this.setState({selectedOption})
    }

    onSelect = (id) =>{
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
        API.post("/student/plan/regenerate", {sId: this.context.user.id, vals:this.state.selected}).then(json=>{
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