import React from 'react';
import config from './config';
import './App.css';
import Loading from './Loading';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import CalendarItem from './CalendarItem'

class CalendarGrid extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            calendars: props.calendars
        }
    }

    render(){
        return(<>
            <Tabs>
                <TabList>
                    {this.props.calendars.map(e=>{
                        return <Tab>{e.name}</Tab>
                    })}
                </TabList>
                {this.props.calendars.map(e=>{
                    return <CalendarItem elem={e}/>
                })}
            </Tabs>
        </>)
    }
}

export default CalendarGrid