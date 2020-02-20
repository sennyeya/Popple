import React from 'react';
import config from './config';
import './App.css';
import Loading from './Loading';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class CalendarGrid extends React.Component{
    render(){
        return(<iframe title={this.props.elem.name} src={this.props.elem.src}></iframe>)
    }
}

export default CalendarGrid