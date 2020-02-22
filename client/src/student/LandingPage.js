import React from 'react';
import User from './User';
import Graph from './Graph';
import Plan from './Plan';
import LoginPage from './LoginPage'
import {config} from './config';
import Loading from './Loading';
import ErrorPage from './ErrorPage'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import CalendarView from "./CalendarView";
import landingPage from './LandingPage.module.css'

const options = 
{
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
    }
}

class LandingPage extends React.Component{
    constructor(props){
        super(props);

        this.verifyAuthenticated = this.verifyAuthenticated.bind(this)

        this.state = {
            sId:props.id,
            isAuthenticated: false,
            isLoading: true,
            isError: false,
            name: ""
        }
    }

    verifyAuthenticated(){
        fetch(config.api+"/auth/login/status", options).then(e=>{
            if(!e.ok){
                throw new Error()
            }
            return e.json()
        }).then(e=>{
            this.setState({sId:e.id, isAuthenticated:true, isLoading: true})
        }).catch(e=>{
            this.setState({isAuthenticated: false, isLoading:true})
        })
    }

    componentDidMount(){
        // Check if the user is logged in.
        fetch(config.api+"/auth/login/status", options).then(res=>{
            if(!res.ok){
                throw new Error();
            }
            return res.json();
        }).then(json=>{
            this.setState({isAuthenticated:true, isLoading:true})
        }).catch(err=>{
            this.setState({isAuthenticated:false, isLoading:true})
        })

        // Get logged in user data.
        fetch(config.api+"/users/current", options).then(res=>{
            if(!res.ok){
                throw new Error();
            }
            return res.json();
        }).then(json=>{
            this.setState({sId: json.id, name: json.name, isLoading:false})
        }).catch(err=>{
            this.setState({isError:true, isLoading:false})
        })
    }

    render(){
        if(!this.state.isAuthenticated){
            return(
                <>
                    <LoginPage/>
                </>
            )
        }else if(this.state.isLoading){
            return(<>
            <Loading/>
            </>)
        }else if(this.state.isError){
            return(<>
            <ErrorPage/>
            </>)
        }else{
            return(
                <>
                    <Tabs>
                        <TabList>
                            <Tab>Calendar</Tab>
                            <Tab>Plan</Tab>
                            <Tab>Classes</Tab>
                        </TabList>
                        <TabPanel>
                            <div>
                                <User verify={this.verifyAuthenticated} name={this.state.name}/>
                                <CalendarView verify={this.verifyAuthenticated}/>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <Tabs>
                                <TabList>
                                    <Tab>Semester Plan</Tab>
                                    <Tab>Graph</Tab>
                                </TabList>
                                <TabPanel>
                                    <div>
                                        <Plan verify={this.verifyAuthenticated} sId={this.state.sId}/>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div>
                                        <Graph verify={this.verifyAuthenticated} sId={this.state.sId}/>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </TabPanel>
                        <TabPanel>
                            <iframe src="https://d2l.arizona.edu/d2l/home" width="80%" height="80%"></iframe>
                        </TabPanel>
                    </Tabs>
                </>
            )
        }
    }
}

export default LandingPage;