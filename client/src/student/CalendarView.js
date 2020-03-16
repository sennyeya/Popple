import React from 'react';
import {config, authOptionsGet, authOptionsPost} from './config';
import Loading from '../shared/Loading';
import style from './LandingPage.module.css';
import mainStyle from '../Main.module.css'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs'
import AsyncSelect from '../shared/AsyncSelect';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

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
        fetch(config.api+"/calendar/get", authOptionsPost(
            JSON.stringify({id:this.props.elem.id}))
        ).then(e=>{
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
            calendars: null,
            added:false,
            selected:null,
            loading:true
        }

        this._onExternalCalendarClick = this._onExternalCalendarClick.bind(this);
        this._onInternalCalendarAdd = this._onInternalCalendarAdd.bind(this)
    }

    componentDidMount(){
        fetch(config.api+"/calendar/getList", authOptionsGet).then(e=>{
            if(!e.ok){
                throw new Error(e.statusText);
            }
            return e.json();
        }).then(json=>{
            this.setState({calendars:json, loading:!(json&&this.state.selected)})
        })
        fetch(config.api+"/calendar/getList", authOptionsGet).then(e=>{
            if(!e.ok){
                throw new Error(e.statusText);
            }
            return e.json();
        }).then(json=>{
            this.setState({selected:json.slice(1), loading:!(json.slice(1)&&this.state.calendars)})
        })
    }

    render(){
        if(this.state.loading){
            return <div className={mainStyle.container}><Loading></Loading></div>
        }
        if(!this.state.calendars.length){
            return(
                <div className={mainStyle.container}><p>No calendars to show.</p></div>
            )
        }
        return(
        <div className={mainStyle.container}>
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
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Grid container justify="center" spacing={2}>
                        
                        <p>This drop down list allows you to add a calendar shared by another student at the University of Arizona to your list of calendars,
                            with the expectation that this will allow you to add it to your Google calendar list as well.
                        </p>
                        <AsyncSelect url={()=>{
                                return fetch(config.api+'/calendar/getLocalOptions', authOptionsGet)
                            }} 
                            label="Add a Calendar"
                            multi
                            onClick={(e,val)=>{
                                this.setState({selected:val})
                            }}/>
                        <Button onClick={this._onInternalCalendarAdd}>
                            Add
                        </Button>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container justify="center" spacing={2}>
                        <p>
                            This drop down list allows you to add a calendar to a list maintained by Popple that will allow other users to access and read this
                            calendar.
                        </p>
                        <AsyncSelect url={()=>{
                                return fetch(config.api+'/calendar/getOptions', authOptionsGet)
                            }} 
                            value={this.state.selected}
                            label="Add a Calendar"
                            multi
                            onClick={(e,val)=>{
                                this.setState({selected:val})
                            }}/>
                        <Button onClick={this._onExternalCalendarClick}>
                            Add
                        </Button>
                    </Grid>
                    </Grid>
                </Grid>
                </TabPanel>
            </Tabs>
        </div>)
    }

    _onExternalCalendarClick(){
        this.setState({loading:true})
        fetch(config.api+"/calendar/shareCalendar", authOptionsPost(JSON.stringify({id:this.state.selected.map(e=>e.value)}))).then(e=>{
            if(!e.ok){
                throw new Error();
            }
            return e.json()
        }).then(json=>{
            this.setState({loading:false})
        })
    }

    _onInternalCalendarAdd(){
        this.setState({loading:true})
        fetch(config.api+"/calendar/addCalendar", authOptionsPost(JSON.stringify({id:this.state.selected.map(e=>e.value)}))).then(e=>{
            if(!e.ok){
                throw new Error();
            }
            return e.json()
        }).then(json=>{
            this.setState({loading:false})
        })
    }
}