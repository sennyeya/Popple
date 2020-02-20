import React from 'react';
import User from './User';
import Graph from './Graph';
import Plan from './Plan';
import {config} from './config';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Calendar from "./Calendar"

class LandingPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sId:props.id
        }
    }

    render(){
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
                            <User/>
                            <Calendar/>
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
                                    <Plan sId={this.state.sId}/>
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div>
                                    <Graph sId={this.state.sId}/>
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

export default LandingPage;