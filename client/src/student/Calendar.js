import React from 'react';
import {config} from './config';
import Loading from './Loading';
import CalendarGrid from './CalendarGrid';
import style from './LandingPage.module.css'

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
            <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Calendars</h1>
                </div>
                <div id={style.canvasContainer}>
                    {this.state.isLoading?<Loading/>:<CalendarGrid calendars={this.state.calendars}/>}
                </div>
            </div>
        </>)
    }

    componentDidMount(){
        fetch(config.api+"/users/all", {
            method:'Get',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Access-Control-Allow-Credentials": true
            }
        }).then(e=>{
            if(!e.ok){
                this.props.verify();
                throw new Error();
            }
            return e.json()
        })
        .then(e=>{
            console.log(e)
            //this.setState({isLoading:false, calendars: e})
        })
    }
}

export default Calendar