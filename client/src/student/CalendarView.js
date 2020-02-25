import React from 'react';
import {config, authOptionsGet} from './config';
import Loading from './Loading';
import style from './LandingPage.module.css';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

class CalendarView extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            isError:false,
            calendars: []
        }
    }

    render(){
        if(this.state.isError){
            return(
                <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Calendars</h1>
                </div>
                <div id={style.canvasContainer}>
                    <p>Whooops, something went wrong!</p>
                </div>
            </div>
            )
        }
        return(<>
            <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Calendars</h1>
                </div>
                <div id={style.canvasContainer}>
                    {this.state.isLoading?<Loading/>:(
                        <Calendar
                        localizer={localizer}
                        events={this.state.calendars}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                      />
                    )}
                </div>
            </div>
        </>)
    }

    toCalendarList(arr){
        let retVal = [];
        for(let elem of arr){
            retVal.push({title:elem.summary, start: elem.start.dateTime, end: elem.end.dateTime})
        }
        return retVal
    }

    componentDidMount(){
        fetch(config.api+"/calendar/get", authOptionsGet).then(e=>{
            if(!e.ok){
                this.props.verify();
                throw new Error();
            }
            return e.json()
        })
        .then(e=>{
            console.log(e)
            this.setState({isLoading:false, calendars: this.toCalendarList(e.items)})
        }).catch((err)=>{
            this.setState({isError:true})
        })
    }
}

export default CalendarView