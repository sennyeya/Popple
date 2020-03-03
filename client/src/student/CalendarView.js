import React from 'react';
import {config, authOptionsGet, authOptionsPost} from './config';
import Loading from './Loading';
import style from './LandingPage.module.css';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs'
import AsyncSelect from '../shared/AsyncSelect';
import Button from 'react-bootstrap/Button'

const localizer = momentLocalizer(moment);

class CalendarItem extends React.Component{
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
                    <p>Whooops, something went wrong!</p>
            )
        }
        return(<>
            {this.state.isLoading?<Loading/>:(
                <Calendar
                localizer={localizer}
                events={this.state.calendars}
                startAccessor="start"
                endAccessor="end"
                onDoubleClickEvent={(event, e)=>{
                    window.open(event.url)
                }}
                style={{ height: 500 }}
                />
            )}
        </>)
    }

    toCalendarList(arr){
        let retVal = [];
        for(let elem of arr){
            retVal.push({title:elem.summary, start: elem.start.dateTime||elem.start, end: elem.end.dateTime||elem.end, url:elem.htmlLink})
        }
        return retVal
    }

    componentDidMount(){
        fetch(config.api+"/calendar/get", authOptionsPost(JSON.stringify({id:this.props.elem.id}))).then(e=>{
            if(!e.ok){
                this.props.verify();
                throw new Error();
            }
            return e.json()
        })
        .then(e=>{
            this.setState({isLoading:false, calendars: this.toCalendarList(e)})
        }).catch((err)=>{
            this.setState({isError:true})
        })
    }
}

export default class CalendarGrid extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            calendars: [],
            added:false,
            selected:[]
        }
    }

    componentDidMount(){
        fetch(config.api+"/calendar/getList", authOptionsGet).then(e=>{
            if(!e.ok){

            }
            return e.json();
        }).then(json=>{
            console.log(json)
            this.setState({calendars:json})
        })
    }

    render(){
        if(!this.state.calendars.length){
            return(
                <div><p>No calendars to show.</p></div>
            )
        }
        return(<>
        <div className={style.containerBox}>
            <div className={style.header}>
                <h1 className={style.headerText}>Calendars</h1>
            </div>
            <div id={style.canvasContainer}>
            <Tabs>
                <TabList>
                    {this.state.calendars.map(e=>{
                        return <Tab>{e.summary}</Tab>
                    })}
                    <Tab style={{float:"right"}}>+</Tab>
                </TabList>
                {this.state.calendars.map(e=>{
                    return <TabPanel><CalendarItem elem={e}/></TabPanel>
                })}
                <TabPanel>
                <AsyncSelect url={()=>{
                        return fetch(config.api+'/calendar/getLocalOptions', authOptionsGet)
                    }} 
                    label="Plan"
                    multi
                    onClick={(e,val)=>{
                        this.setState({selected:val})
                    }}/>
                <Button>
                    
                </Button>
                </TabPanel>
            </Tabs>
            </div>
        </div>
        </>)
    }
}