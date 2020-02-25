import React from 'react';
import {config, authOptionsGet} from '../student/config';
import Select from 'react-select'
import Button from 'react-bootstrap/Button'
import Loading from './Loading'

class PlanItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading:true,
            plans: [],
            err:false
        }
    }

    componentDidMount(){
        fetch(config.api+ "/admin/planPicklist", authOptionsGet).then((res)=>{
            if(!res.ok){
                this.props.setErrorState(res.statusText);
            }
            return res.json()
        }).then((json)=>{
            this.setState({plans:json.plans||[], isLoading:false})
        })
    }

    render(){
        if(this.state.isLoading){
            return (
                <>
                    <Loading></Loading>
                </>
            )
        }
        return (
            <>
            <p>Here you can edit an existing plan or add a new one.</p>
            <Select options={this.state.plans}></Select>
            
            </>
        )
    }
}

export default PlanItem