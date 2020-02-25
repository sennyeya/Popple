import React from 'react';
import Select from 'react-select';
import Loading from './Loading';
import {config, authOptionsPost, authOptionsGet} from './config';
import Button from 'react-bootstrap/Button';

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
        fetch(config.api+"/data/plans",authOptionsGet).then(data=>data.json()).then(json=>{
            var plans = json.plans || [];
            this.setState({plans:plans, isLoading:false});
        });
    }

    render(){
        return(
            <>
                {this.state.isLoading?<Loading/>:(
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
        fetch(config.api+"/users/addPlan", authOptionsPost(JSON.stringify(this.state.selectedOptions)))
    }
}

export default PlanPicklist;