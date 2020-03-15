import React from 'react';
import {config, authOptionsGet} from './config';
import Unauthorized from './Unauthorized';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import PlanItem from './PlanItem';
import style from '../Navbar.module.css'
import ClassItem from './ClassItem';
import ErrorPage from './ErrorPage';
import Header from '../shared/Header'


export default class AdminDashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isAuthenticated: false,
            err:""
        }

        this.setErrorState = this.setErrorState.bind(this)
    }

    componentDidMount(){
        fetch(config.api+"/admin/isAdmin", authOptionsGet).then((res)=>{
            if(!res.ok){
                this.setErrorState(res.statusText)
            }
            res.json()
        }).then((json)=>{
            this.setState({isAuthenticated:true})
        }).catch(()=>{
            this.setState({isAuthenticated:false})
        })
    }

    render(){
        if(!this.state.isAuthenticated){
            return <Unauthorized/>
        }
        return(
            <>
            <Header isAdmin/>
            <nav>
                <ul>
                    <li>
                    <Link to="/admin">Home</Link>
                    </li>
                    <li>
                    <Link to="/admin/plan">Plan</Link>
                    </li>
                    <li>
                    <Link to="/admin/class">Classes</Link>
                    </li>
                </ul>
            </nav>
            {this.state.err?<><ErrorPage></ErrorPage></>:
                (this.props.children? React.Children.toArray(this.props.children).map(e=>{
                    return React.cloneElement(e, {setErrorState: this.setErrorState})
                }): <><DefaultDashboard></DefaultDashboard></>)}
            </>)
    }

    setErrorState(err){
        this.setState({err:err})
    }
}

class DefaultDashboard extends React.Component{
    render(){
        return (<div>
            <p>Welcome to the admin side of Popple.</p>
        </div>)
    }
}