import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent, FormControl } from '@material-ui/core';
import API from '../shared/API';

function ClassItem(){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    return (
        <div style={{margin:"10px"}}>
            <p>Edit an existing class or add a new one.</p>
            <AsyncSelect 
                url={()=>{
                    return API.get('/admin/classPicklist')
                }} 
                label="Classes"
                onClick={(e,val)=>{
                    setSelected(val)
                }}
            />
            <button hidden={!selected?!selected:null} onClick={()=>setShowEdit(true)}>Edit</button>
            <button onClick={()=>setShowAdd(true)}>Add A New Class</button>
            <AddClassModal open={showAdd} setOpen={setShowAdd}/>
            <EditClassModal open={showEdit} setOpen={setShowEdit} item={selected}/>
        </div>
    )
}

function AddClassModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {open, setOpen} = props;
    const [loading, setLoading] = React.useState(false);

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = async () =>{
        setLoading(true)
        await API.post("/admin/saveClassItem", {
            name:name, 
            credits:credits, 
            requirements: selected
        })
        setOpen(false);
        setLoading(false);
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Add Class"}</DialogTitle>
            <DialogContent>
            {loading?<LoadingIndicator/>:
            <form>
                <TextField label={"Name of Class"} required onChange={(e)=>{
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
                <FormControl>
                <TextField label={"# of Credits"} required type={"number"} onChange={(e)=>{
                    setCredits(e.target.value)
                }}/>
                </FormControl>
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

function EditClassModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {open, setOpen, item} = props;
    const [loading, setLoading] = React.useState(false)

    useEffect(()=>{
        setName(item?item.label:"")
        setCredits(item?item.credits:0)
    }, [item])

    useEffect(()=>{
        let active = true;
        if(!item){
            return undefined
        }
        API.get('/admin/getRequirements', {id:item.value}).then(json=>{
            if(active){
                setSelected(json)
            }
        })
        return ()=>active=false;
    }, [item])

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = () =>{
        setLoading(true)
        API.post("/admin/saveClassItem", {
            id: item.value,
            name:name, 
            credits:credits, 
            requirements: selected
        }).then(()=>{
            setLoading(false);
            setOpen(false)
        })
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Edit Class"}</DialogTitle>
            <DialogContent>
                <form>
                    <TextField label={"Name of Class"} required onChange={(e)=>{
                        setName(e.target.value)
                    }} defaultValue={item?item.label:""}/>
                    <AsyncSelect url={()=>{
                                    return API.get('/admin/classPicklist')
                                }} 
                                multi
                                label="Requirements"
                                filter={(val)=>{
                                    return val.value!==item.value
                                }}
                                value={selected}
                                onClick={(e,val)=>{
                                    setSelected(val)
                                }}/>
                    <FormControl>
                    <TextField label={"# of Credits"} required type={"number"} onChange={(e)=>{
                        setCredits(e.target.value)
                    }} defaultValue={item?item.credits:''}/>
                    </FormControl>
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

export default ClassItem