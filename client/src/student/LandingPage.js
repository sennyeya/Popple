import React from 'react';
import User from './User';
import Graph from './Graph';
import Plan from './Plan';
import LoginPage from './LoginPage'
import {config} from './config';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Calendar from "./Calendar";
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
            isAuthenticated: false
        }
    }

    verifyAuthenticated(){
        fetch(config.api+"/auth/login/success", options).then(e=>{
            if(!e.ok){
                throw new Error()
            }
            return e.json()
        }).then(e=>{
            this.setState({sId:e.id, isAuthenticated:true})
        }).catch(e=>{
            this.setState({isAuthenticated: false})
        })
    }

    componentDidMount(){
        fetch(config.api+"/auth/login/success", options).then(res=>{
            if(!res.ok){
                throw new Error();
            }
            return res.json();
        }).then(json=>{
            this.setState({isAuthenticated:true})
        }).catch(err=>{
            this.setState({isAuthenticated:false})
        })
    }

    render(){
        if(!this.state.isAuthenticated){
            return(
                <>
                    <LoginPage/>
                </>
            )
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
                                <User verify={this.verifyAuthenticated}/>
                                <Calendar verify={this.verifyAuthenticated}/>
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