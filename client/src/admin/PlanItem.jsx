import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent} from '@material-ui/core';
import API from '../shared/API';

function PlanItem(){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    return (
        <div style={{margin:"10px"}}>
            <p>Edit an existing class or add a new one.</p>
            <AsyncSelect 
                url={()=>{
                    return API.get('/admin/plans')
                }} 
                label="Plans"
                loading={loading}
                onClick={(e,val)=>{
                    setSelected(val)
                }}
            />
            <button hidden={!selected?!selected:null} onClick={()=>setShowEdit(true)}>Edit</button>
            <button onClick={()=>setShowAdd(true)}>Add A New Plan</button>
            <AddPlanModal open={showAdd} setOpen={setShowAdd} setMenuLoading={setLoading}/>
            <EditPlanModal open={showEdit} setOpen={setShowEdit} item={selected} setMenuLoading={setLoading}/>
        </div>
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
        setLoading(true)
        API.post("/admin/plan/update", {
            name:name,
            requirements: selected
        }).then(()=>{
            setLoading(false);
            setMenuLoading(true);
            setOpen(false)
        })
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Add Plan"}</DialogTitle>
            <DialogContent>
            {loading?<LoadingIndicator/>:
            <form>
                <TextField label={"Name of Plan"} required onChange={(e)=>{
                    setName(e.target.value)
                }}/>
                <AsyncSelect url={()=>{
                                return API.get('/admin/classes')
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
            <button onClick={handleClose}>
                Cancel
            </button>
            <button onClick={submitForm} className="primary">
                Save
            </button>
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
        API.get('/admin/plan/item', {id:item.value}).then(res=>setSelected(res))
    }, [item])

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = () =>{
        setLoading(true)
        API.post("/admin/plan/update", {
            id: item.value,
            name:name,
            requirements: selected
        }).then(()=>{
            setLoading(false);
            setMenuLoading(true);
            setOpen(false)
        })
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Edit Plan"}</DialogTitle>
            <DialogContent>
            <form>
                <TextField label={"Name of Plan"} required onChange={(e)=>{
                    setName(e.target.value)
                }} defaultValue={item?item.label:""}/>
                <AsyncSelect url={()=>{
                                return API.get('/admin/classes')
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
            <button onClick={handleClose}>
                Cancel
            </button>
            <button onClick={submitForm} className="primary">
                Save
            </button>
            </DialogActions>
        </Dialog>
    </>)
}

export default PlanItem