import React from 'react';
import config from './config';
import './App.css';
import Loading from './Loading';
import CalendarGrid from './CalendarGrid'

class Calendar extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            calendars: []
        }
    }

    render(){
        return(<>
            <div className="containerBox">
                <div className="header">
                    <h1 className="headerText">Calendars</h1>
                </div>
                <div id="canvasContainer">
                    {this.state.isLoading?<Loading/>:<CalendarGrid calendars={this.state.calendars}/>}
                </div>
            </div>
        </>)
    }

    componentDidMount(){
        fetch(config.api+"/users/calendar", {
            method:'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sId: this.state.sId})
        }).then(e=>e.json())
        .then(e=>this.setState({isLoading:false, calendars: e}))
    }
}

export default Calendar