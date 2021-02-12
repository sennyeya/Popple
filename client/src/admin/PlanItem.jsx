import React, { useEffect } from 'react';
import {LoadingIndicator} from '../shared/Loading'
import AsyncSelect from '../shared/AsyncSelect'
import { Dialog, TextField, DialogActions, DialogTitle, DialogContent} from '@material-ui/core';
import API from '../shared/API';
import Modal from '../shared/Modal';
import {useMessageOutlet} from '../contexts/MessagingContext'

function PlanItem(){
    const [selected, setSelected] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [showEdit, setShowEdit] = React.useState(false);
    return (
        <div style={{margin:"10px"}}>
            <p>Edit an existing class or add a new one.</p>
            <AsyncSelect 
                url={'/admin/plans'} 
                label="Plans"
                setSelected={setSelected}
            />
            <button hidden={!selected?!selected:null} onClick={()=>setShowEdit(true)}>Edit</button>
            <button onClick={()=>setShowAdd(true)}>Add A New Plan</button>
            {showAdd?<AddPlanModal setOpen={setShowAdd}/>:<></>}
            {showEdit?<EditPlanModal setOpen={setShowEdit} item={selected}/>:<></>}
        </div>
    )
}

function AddPlanModal(props){
    const [name, setName] = React.useState("");
    const [selected, setSelected] = React.useState([]);
    const {setOpen} = props;
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
            setOpen(false)
        })
    }

    return (
    <>
        <Modal 
            isOpen 
            onClose={handleClose} 
            title="Add Plan" 
            handleClose={handleClose} 
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
                    <TextField label={"Name of Plan"} required onChange={(e)=>{
                        setName(e.target.value)
                    }}/>
                    <AsyncSelect url={'/admin/classes'}
                                isMulti
                                label="Required Classes"
                                value={selected}
                                setSelected={setSelected}/>
                </>
            }
        </Modal>
    </>)
}

function EditPlanModal(props){
    const [name, setName] = React.useState("");
    const [credits, setCredits] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const {setOpen, item} = props;
    const [loading, setLoading] = React.useState(false);
    let setMessage = useMessageOutlet();

    useEffect(()=>{
        if(!item){
            return undefined
        }
        setName(item?item.label:"")
        setCredits(item?item.credits:0)
        API.get('/admin/plan/item', {id:item.value}).then(res=>setSelected(res.nodes))
    }, [item])

    useEffect(()=>{
        console.log(selected)
    }, [selected])

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
            setOpen(false)
        }).catch((e)=>setMessage({text:JSON.stringify(e), severity:"error"}))
    }

    return (<>
        <Modal title={"Edit Plan"}
                isOpen
                handleClose={handleClose}
                buttons={
                    <>
                        <button onClick={handleClose}>
                            Cancel
                        </button>
                        <button onClick={submitForm} className="primary">
                            Save
                        </button>
                    </>
                }>
            {
                loading?
                <LoadingIndicator/>:
                <>
                    <TextField label={"Name of Plan"} required onChange={(e)=>{
                        setName(e.target.value)
                    }} defaultValue={item?item.label:""}/>
                    <AsyncSelect url={'/admin/classes'} 
                                isMulti
                                label="Required Classes"
                                value={selected}
                                setSelected={setSelected}/>
                </>
            }
        </Modal>
    </>)
}

export default PlanItem