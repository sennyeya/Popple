import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent, FormControl, InputLabel } from '@material-ui/core';
import API from '../shared/API';
import Modal from '../shared/Modal'

function ClassItem(){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    return (
        <div style={{margin:"10px"}}>
            <p>Edit an existing class or add a new one.</p>
            <AsyncSelect 
                url={'/admin/classes'}
                label="Classes"
                setSelected={setSelected}
            />
            <button hidden={!selected?!selected:null} onClick={()=>setShowEdit(true)}>Edit</button>
            <button onClick={()=>setShowAdd(true)}>Add A New Class</button>
            {showAdd?<AddClassModal setOpen={setShowAdd}/>:<></>}
            {showEdit?<EditClassModal setOpen={setShowEdit} item={selected}/>:<></>}
        </div>
    )
}

function AddClassModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {setOpen} = props;
    const [loading, setLoading] = React.useState(false);

    const handleClose = ()=>{
        setOpen(false)
    }

    const submitForm = async () =>{
        setLoading(true)
        await API.post("/admin/class/update", {
            name:name, 
            credits:credits, 
            requirements: selected
        })
        setOpen(false);
        setLoading(false);
    }

    return (
    <>
        <Modal 
                isOpen 
                onClose={handleClose} 
                title="Add Class"
                buttons={<>
                    <button onClick={handleClose}>
                        Cancel
                    </button>
                    <button onClick={submitForm} className="primary">
                        Save
                    </button>
                </>}>
            {loading?<LoadingIndicator/>:
            <>
                <TextField label={"Name of Class"} required onChange={(e)=>{
                    setName(e.target.value)
                }}/>
                <AsyncSelect
                    url={'/admin/classes'}
                    isMulti
                    label="Required Classes"
                    value={selected}
                    setSelected={setSelected}/>
                <TextField label={"# of Credits"} required type={"number"} onChange={(e)=>{
                    setCredits(e.target.value)
                }}/>
            </>}
        </Modal>
    </>)
}

function EditClassModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {setOpen, item} = props;
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
        API.get('/admin/class/requirements', {id:item.value}).then(json=>{
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
        API.post("/admin/class/update", {
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
            <Modal 
                isOpen 
                onClose={handleClose} 
                title="Edit Class"
                buttons={<>
                    <button onClick={handleClose}>
                        Cancel
                    </button>
                    <button onClick={submitForm} className="primary">
                        Save
                    </button>
                </>}>
                {
                    loading?
                    <LoadingIndicator/>:
                    <>
                        <TextField label={"Name of Class"} required onChange={(e)=>{
                            setName(e.target.value)
                        }} defaultValue={item?item.label:""}/>
                        <AsyncSelect url={'/admin/potentialRequirements'} 
                                    isMulti
                                    label="Requirements"
                                    filter={(val)=>{
                                        return val.value!==item.value
                                    }}
                                    value={selected}
                                    setSelected={setSelected}/>
                        <TextField label={"# of Credits"} required type={"number"} onChange={(e)=>{
                            setCredits(e.target.value)
                        }} defaultValue={item?item.credits:''}/>
                    </>
                }
            </Modal>
    </>)
}

export default ClassItem