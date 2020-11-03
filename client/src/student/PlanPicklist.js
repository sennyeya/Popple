import React from 'react';
import Select from 'react-select';
import {LoadingIndicator} from '../shared/Loading';
import Button from 'react-bootstrap/Button';
import API from '../shared/API';

class PlanPicklist extends React.Component{
    constructor(props){
        super(props);

        // Pass in student id.
        this.state = {
            isLoading:true,
            plans: [],
            selectedOptions: []
        }

        this._onPickListSelect = this._onPickListSelect.bind(this)
        this._onPlanAdd = this._onPlanAdd.bind(this)
    }

    componentDidMount(){
        API.get("/data/plans").then(json=>{
            var plans = json.plans || [];
            this.setState({plans:plans, isLoading:false});
        });
    }

    render(){
        return(
            <>
                {this.state.isLoading?<LoadingIndicator/>:(
                    <>
                        <Select onChange={this._onPickListSelect} options={this.state.plans} isMulti={true}/>
                        <Button variant="primary" onClick={this._onPlanAdd}/>
                    </>
                )}
            </>
        )
    }

    _onPickListSelect(selectedOptions){
        this.setState({selectedOptions:selectedOptions});
    }

    _onPlanAdd(){
        if(!this.state.plans || !this.state.plans.length){
            return;
        }
        API.post("/users/addPlan", this.state.selectedOptions)
    }
}

export default PlanPicklist;