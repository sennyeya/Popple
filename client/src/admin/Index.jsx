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
import Header from '../shared/Header';
import {UserContext} from '../contexts/userContext';
import Loading from '../shared/Loading'


export default class AdminDashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isAuthenticated: false,
            err:"",
            isLoading:true
        }

        this.setErrorState = this.setErrorState.bind(this)
    }

    componentDidMount(){
        fetch(config.api+"/admin/isAdmin", authOptionsGet).then(res=>{
            if(!res.ok){
                throw new Error();
            }
            return res.json();
          }).then(json=>{
              this.setState({isAuthenticated:true})
              // Get logged in user data.
              fetch(config.api+"/users/current", authOptionsGet).then(res=>{
                if(!res.ok){
                    throw new Error();
                }
                return res.json();
              }).then(json=>{
                  this.setState({
                    user:{
                      sId: json.id, 
                      name: json.name,
                      isAdmin:json.isAdmin
                    },
                    isLoading:false
                  })
              })
          }).catch(err=>{
              this.setState({
                user:{},
                isError:true,
                errorMessage:err,
                isLoading:false
              })
          })
    }

    render(){
        if(!this.state.isAuthenticated){
            return <Unauthorized/>
        }
        if(this.state.isLoading){
            return <Loading></Loading>
        }
        const value = {
            user: this.state.user
        }
        return(
            <UserContext.Provider value={value}>
                <Header/>
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
            </UserContext.Provider>)
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