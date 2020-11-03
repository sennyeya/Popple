import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent, DialogContentText, FormControl } from '@material-ui/core';
import API from '../shared/API';

function ClassItem(props){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    return (
        <>
        <p>Here you can edit an existing class or add a new one.</p>
        <AsyncSelect url={()=>{
            return API.get('/admin/classPicklist')
        }} 
        label="Class to Add"
        onClick={(e,val)=>{
            setSelected(val)
        }}/>
        <ButtonGroup>
            <Button variant="contained" disabled={!selected} onClick={()=>setShowEdit(true)}>Edit</Button>
            <Button variant="outlined" onClick={()=>setShowAdd(true)}>Add A New Class</Button>
        </ButtonGroup>
        <AddClassModal open={showAdd} setOpen={setShowAdd}/>
        <EditClassModal open={showEdit} setOpen={setShowEdit} item={selected}/>
        </>
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

    const submitForm = () =>{
        (async ()=>{
            await API.post("/admin/saveClassItem", {
                name:name, 
                credits:credits, 
                requirements: selected
            })
            setLoading(false);
        })();
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle id="alert-dialog-title">{"Add Class"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                This is used to add a class.
            </DialogContentText>
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
        API.post("/admin/saveClassItem", {
            id: item.value,
            name:name, 
            credits:credits, 
            requirements: selected
        }).then(()=>{
            setLoading(false);
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

export default ClassItem