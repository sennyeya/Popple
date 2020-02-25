import React from 'react';
import ReactDOM from 'react-dom'
import Loading from './Loading'
import Select from 'react-select';
import Async from 'react-select/async'
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Modal from 'react-bootstrap/Modal'
import { authOptionsPost, config, authOptionsGet } from './config';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl'

class ClassItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isLoading:true,
            classes: [],
            showEdit: false,
            showAdd: false,
            modalLoading:true,
            inputValue: null,
            selected: null,
            defaultOptions: []
        }

        this._onEditClick = this._onEditClick.bind(this);
        this._onHideEdit = this._onHideEdit.bind(this);
        this._onSaveEdit = this._onSaveEdit.bind(this)
        this._onAddClick = this._onAddClick.bind(this);
        this._onHideAdd = this._onHideAdd.bind(this);
        this._onSaveAdd = this._onSaveAdd.bind(this);
        this._onChange = this._onChange.bind(this)

        this._getRequirements = this._getRequirements.bind(this)
    }

    componentDidMount(){
        fetch(config.api+ "/admin/classPicklist", authOptionsGet).then((res)=>{
            if(!res.ok){
                this.props.setErrorState(res.statusText)
            }
            return res.json()
        }).then((json)=>{
            this.setState({classes:json.classes||[], isLoading:false})
        })
    }

    render(){
        if(this.state.isLoading){
            return (
                <>
                    <Loading></Loading>
                </>
            )
        }
        return (
            <>
            <p>Here you can edit an existing class or add a new one.</p>
            <Select options={this.state.classes} onChange={this._onChange}></Select>
            <ButtonToolbar>
                <Button variant="primary" onClick={this._onEditClick}>Edit</Button>
                <Button variant="light" onClick={this._onAddClick}>Add A New Class</Button>
            </ButtonToolbar>
            <Modal show={this.state.showEdit} onHide={this._onHideEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.modalLoading?<Loading></Loading>:(
                        <>
                        <InputGroup>
                            <FormControl
                            placeholder="Class Name"
                            value={this.state.item.name}
                            />
                        </InputGroup>
                        <Async 
                            isMulti
                            loadOptions={this._getRequirements} 
                            onInputChange={this.onInputChange}
                            defaultOptions={this.state.defaultOptions}
                            defaultValue={this.state.defaultOptions?this.state.defaultOptions.filter(e=>this.state.item.requirements.includes(e.value)):[]}
                        ></Async>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this._onHideEdit}>Close</Button>
                    <Button variant="secondary" onClick={this._onSaveEdit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.showAdd} onHide={this._onHideAdd}>
                <Modal.Header closeButton>
                    <Modal.Title>Add</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.modalLoading?<Loading></Loading>:<p>Test</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this._onHideAdd}>Close</Button>
                    <Button variant="secondary" onClick={this._onSaveAdd}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            </>
        )
    }

    loadDefaultOptions = inputValue => {
        return new Promise((res, rej)=>{
            this._getRequirements(inputValue).then(defaultOptions =>{
                res(this.setState({ defaultOptions }))
            })
        });
      };

    onInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
          this.setState({ inputValue });
        }
        if (action === "menu-close") {
          this.loadDefaultOptions(this.state.item);
        }
      };

    _getRequirements(val){
        return new Promise((resolve, reject)=>{
            if(!val){
                resolve()
            }
            fetch(config.api+"/admin/getRequirements?id="+(val?val._id:this.state.item._id), authOptionsGet).then(res=>{
                if(!res.ok){
                    this.props.setErrorState(res.statusText)
                }
                resolve(res.json())
            })
        })
    }

    _onChange(selected){
        this.setState({selected:selected})
    }

    _onSaveEdit(){
        this.setState({showAdd:false})
    }

    _onHideEdit(){
        this.setState({showEdit:false})
    }

    _onEditClick(){
        if(!this.state.selected){
            return;
        }
        fetch(config.api+ "/admin/getClassItem?id="+this.state.selected.value, authOptionsGet).then((res)=>{
            if(!res.ok){
                this.props.setErrorState(res.statusText)
            }
            return res.json()
        }).then((json)=>{
            this.loadDefaultOptions(json.item).then(()=>{
                this.setState({item:json.item||null, showEdit:true, modalLoading:false})
            });
        })
    }

    _onSaveAdd(){
        fetch(config.api+ "/admin/getClassItem?id="+this.state.selected.value, authOptionsPost).then((res)=>{
            if(!res.ok){
                this.props.setErrorState(res.statusText)
            }
            return res.json()
        }).then((json)=>{
            this.loadDefaultOptions(json.item).then(()=>{
                this.setState({item:json.item||null, modalLoading:false, showAdd:true})
            });
        })
    }

    _onHideAdd(){
        this.setState({showAdd:false})
    }

    _onAddClick(){
        this.setState({showAdd:true})
    }
}

export default ClassItem