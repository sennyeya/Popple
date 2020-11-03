import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent, DialogContentText } from '@material-ui/core';
import API from '../shared/API';

function PlanItem(props){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    return (
        <>
        <p>Here you can edit an existing class or add a new one.</p>
        <AsyncSelect url={()=>{
            return API.get('/admin/planPicklist')
        }} 
        label="Plan"
        loading={loading}
        onClick={(e,val)=>{
            setSelected(val)
        }}/>
        <ButtonGroup>
            <Button variant="contained" disabled={!selected} onClick={()=>setShowEdit(true)}>Edit</Button>
            <Button variant="outlined" onClick={()=>setShowAdd(true)}>Add A New Plan</Button>
        </ButtonGroup>
        <AddPlanModal open={showAdd} setOpen={setShowAdd} setMenuLoading={setLoading}/>
        <EditPlanModal open={showEdit} setOpen={setShowEdit} item={selected} setMenuLoading={setLoading}/>
        </>
    )
}

function AddPlanModal(props){
    const [name, setName] = React.useState("");
    const [selected, setSelected] = React.useState([]);
    const {open, setOpen, setMenuLoading} = props;
    const [loading, setLoading] = React.useState(false);

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = () =>{
        API.post("/admin/savePlanItem", {
            name:name,
            requirements: selected
        }).then(()=>{
            setLoading(false);
            setMenuLoading(true);
        })
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Add Plan"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                This is used to add a plan.
            </DialogContentText>
            {loading?<LoadingIndicator/>:
            <form>
                <TextField label={"Name of Plan"} required onChange={(e)=>{
                    setName(e.target.value)
                }}/>
                <AsyncSelect url={()=>{
                                return API.get('/admin/classPicklist')
                            }}
                            multi
                            label="Required Classes"
                            value={selected}
                            onClick={(e,val)=>{
                                setSelected(val)
                            }}/>
            </form>}
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button onClick={submitForm} color="primary" autoFocus>
                Save
            </Button>
            </DialogActions>
        </Dialog>
    </>)
}

function EditPlanModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {open, setOpen, item, setMenuLoading} = props;
    const [loading, setLoading] = React.useState(false)

    useEffect(()=>{
        setName(item?item.label:"")
        setCredits(item?item.credits:0)
    }, [item])

    useEffect(()=>{
        if(!item){
            return undefined
        }
        API.get('/admin/getClasses', {id:item.value}).then(res=>setSelected(res))
    }, [item])

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = () =>{
        API.post("/admin/savePlanItem", {
            id: item.value,
            name:name,
            requirements: selected
        }).then(()=>{
            setLoading(false);
            setMenuLoading(true);
        })
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Edit Class"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                This allows you to edit a class.
            </DialogContentText>
            <form>
                <TextField label={"Name of Class"} required onChange={(e)=>{
                    setName(e.target.value)
                }} defaultValue={item?item.label:""}/>
                <AsyncSelect url={()=>{
                                return API.get('/admin/classPicklist')
                            }} 
                            multi
                            label="Required Classes"
                            value={selected}
                            onClick={(e,val)=>{
                                setSelected(val)
                            }}/>
            </form>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
            <Button type="submit" onClick={submitForm} color="primary" autoFocus>
                Save
            </Button>
            </DialogActions>
        </Dialog>
    </>)
}

export default PlanItem