import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import style from '../Navbar.module.css'
import LandingPage from './LandingPage';
import Header from '../shared/Header';
import {UserContext} from '../contexts/userContext';
import {config, authOptionsGet} from './config';
import ErrorPage from './ErrorPage';
import Loading from '../shared/Loading'

export default class StudentDashboard extends React.Component{

    constructor(props){
      super(props)
      this.state={
        user:{},
        isAuthenticated:false,
        isError:false,
        isLoading:true
      }
    }

    componentDidMount(){
      // Check if the user is logged in.
      fetch(config.api+"/auth/login/status", authOptionsGet).then(res=>{
        if(!res.ok){
            throw new Error();
        }
        return res.json();
      }).then(()=>{
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

    componentDidCatch(error, errorInfo){
      console.log({error:error, errorMessage:errorInfo})
      this.setState({isError:true, errorMessage:errorInfo})
    }

    render(){
        const value = {
          user:this.state.user,
          updateUser:this.logout
        }
        return(
            <UserContext.Provider value={value}>
              <Header/>
              <nav>
                <ul>
                  <li>
                    <Link to="/student">Home</Link>
                  </li>
                  {this.state.isAuthenticated?(
                  <>
                    <li>
                      <Link to="/student/plan">Plan</Link>
                    </li>
                    <li>
                      <Link to="/student/classes">Classes</Link>
                    </li>
                  </>
                  ):<></>}
                </ul>
              </nav>
              {this.state.isLoading?
                <Loading></Loading>:
                (this.state.isError?
                  (<><ErrorPage message={this.state.errorMessage}/></>)
                  :<LandingPage children={this.props.children}></LandingPage>)}
          </UserContext.Provider>)
    }
}