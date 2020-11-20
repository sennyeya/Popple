import React, {useEffect} from 'react';
import API from '../shared/API';
import { Helmet } from 'react-helmet'
import StudentDashboard from './Index'
import { 
    Dialog,
    DialogActions, 
    DialogTitle, 
    DialogContent, 
    DialogContentText 
} from '@material-ui/core';
import Select from '../shared/Select'
import { LoadingIndicator } from '../shared/Loading';

export default function StudentContainer(){
    const [isPlanSurveyDone, setPlanSurveyDone] = React.useState(true)
    const [isClassSurveyDone, setClassSurveyDone] = React.useState(true);
    const [flagged, setFlagged] = React.useState(false);

    React.useEffect(()=>{
        if(!isPlanSurveyDone||!isClassSurveyDone){
            setFlagged(true)
        }else if(flagged && (isPlanSurveyDone&&isClassSurveyDone)){
            window.dispatchEvent(new Event('class-survey-done'))
            window.dispatchEvent(new Event('plan-survey-done'))
            setFlagged(false)
        }
    }, [isPlanSurveyDone, isClassSurveyDone, flagged])

    const checkPlanSurvey = () =>{
        return new Promise((res)=>{
            window.addEventListener('plan-survey-done', res, {once:true})
        })
    }

    const checkClassSurvey = () =>{
        return new Promise((res)=>{
            window.addEventListener('class-survey-done', res, {once:true})
        })
    }

    const StudentAPI = {};

    StudentAPI.get = async (route, data) =>{
        let json = await API.get(route, data)
        if(json.error){
            if(json.error==="NO_VALID_PLAN_SURVEY") {
                setPlanSurveyDone(false);
                await checkPlanSurvey();
                return await StudentAPI.get(route, data);
            /*}
            else if(json.error==="NO_VALID_CLASS_SURVEY") {
                setClassSurveyDone(false)
                await checkClassSurvey();
                return await StudentAPI.get(route, data);
                */
            }else{
                throw new Error(json.error)
            }
        }else{
            return json
        }
    }

    StudentAPI.post = async (route, data) =>{
        let json = await API.post(route, data)
        if(json.error){
            if(json.error==="NO_VALID_PLAN_SURVEY") {
                setPlanSurveyDone(false);
                await checkPlanSurvey();
                return  await StudentAPI.post(route, data);
            }
            else if(json.error==="NO_VALID_CLASS_SURVEY") {
                setClassSurveyDone(false)
                await checkClassSurvey();
                return await StudentAPI.post(route, data);
            }else{
                throw new Error(json.error)
            }
        }else{
            return json
        }
    }

    return (<>
        <Helmet>
            <title>Student | Popple</title>
        </Helmet>
        <StudentDashboard API={StudentAPI}/>
        {
            isClassSurveyDone?<></>:<ClassSurvey setSurveyComplete={setClassSurveyDone}/>
        }
        {
            isPlanSurveyDone?<></>:<PlanSurvey setSurveyComplete={setPlanSurveyDone}/>
        }
    </>)
}

function ClassSurvey({setSurveyComplete}){
    const [selected, setSelected] = React.useState([]);
    const [isLoading, setLoading] = React.useState(false);
    const [data, setData] = React.useState([])

    const submitForm = () =>{
        API.post("/student/class/survey", {
            classes: selected
        }).then(()=>{
            setLoading(false);
            setSurveyComplete(true);
        })
    }

    useEffect(()=>{
        API.get("/student/plan/classes").then(json=>{
            setData(json)
            setLoading(false)
        })
    }, [])

    return (
    <>
        <Dialog open={true}>
            <DialogTitle id="alert-dialog-title">{"Class Survey"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Select the classes you completed in the most recent semester.
            </DialogContentText>
            {
                isLoading?
                <LoadingIndicator/>:
                <form>
                    <Select
                        multi
                        data={data}
                        label="Classes"
                        value={selected}
                        onClick={(e,val)=>{
                            setSelected(val)
                        }}
                        />
                </form>
            }
            </DialogContent>
            <DialogActions>
            <button onClick={submitForm} className="primary">
                Save
            </button>
            </DialogActions>
        </Dialog>
    </>)
}

function PlanSurvey({setSurveyComplete}){
    const [selected, setSelected] = React.useState([]);
    const [isLoading, setLoading] = React.useState(false);
    const [data, setData] = React.useState([])

    const submitForm = () =>{
        API.post("/student/plan/survey", {
            plans: selected
        }).then(()=>{
            setLoading(false);
            setSurveyComplete(true);
        })
    }

    useEffect(()=>{
        API.get("/data/plans").then(json=>{
            setData(json)
            setLoading(false)
        })
    }, [])

    return (
    <>
        <Dialog open={true}>
            <DialogTitle id="alert-dialog-title">{"Plan Survey"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                You don't have a plan currently. Please choose one or more from the list below.
            </DialogContentText>
            {
                isLoading?
                <LoadingIndicator/>:
                <form>
                    <Select 
                        data={data}
                        multi
                        label="Plans"
                        value={selected}
                        onClick={(e,val)=>{
                            setSelected(val)
                        }}
                        />
                </form>
            }
            </DialogContent>
            <DialogActions>
            <button onClick={submitForm} className="primary">
                Save
            </button>
            </DialogActions>
        </Dialog>
    </>)
}