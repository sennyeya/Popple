import React from 'react';
import UserContext from '../contexts/UserContext';
import style from './UserCircle.module.css';
import {api} from '../config'

export default class UserCircle extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showModal:false
        }

        this.modal = React.createRef();
        this.pictureRef = React.createRef();

        this.onProfileClick = this.onProfileClick.bind(this);
        this.onModalBlur = this.onModalBlur.bind(this)
    }

    componentDidUpdate(){
        if(this.state.showModal){
            this.modal.current.focus();
        }
    }

    render(){
        let buttonGroup;
        if(this.context.user.isAdmin && window.location.href.includes("admin")){
            buttonGroup = <button id="usermodal-button-redirect" onClick={()=>{
                window.open("/student", "_self");
                }}>
                Go to Student
            </button>
        }else if(!window.location.href.includes("student")){
            if(this.context.user.isAdmin){
                buttonGroup = <>
                    <button id="usermodal-button-redirect" onClick={()=>{
                        window.open("/student", "_self");
                        }}>
                        Go to Student
                    </button>
                    <button id="usermodal-button-redirect" onClick={()=>{
                        window.open("/admin", "_self");
                    }}>
                        Go to Admin
                    </button>
                </>
            }else{
                buttonGroup = <button id="usermodal-button-redirect" onClick={()=>{
                    window.open("/student", "_self");
                    }}>
                    Go to Student
                </button>
            }
        }else if(window.location.href.includes("student")){
            if(this.context.user.isAdmin){
                buttonGroup = <button id="usermodal-button-redirect" onClick={()=>{
                        window.open("/admin", "_self");
                    }}>
                        Go to Admin
                    </button>
            }
        }
        return (
            <>
                <a onClick={this.onProfileClick} className={style.profilePhoto} href="#" ref={this.pictureRef}>
                    <img src={this.context.user.photo} alt="User"></img>
                </a>
                {this.state.showModal?(
                    <div className={style.profileModal} onBlur={this.onModalBlur} ref={this.modal} tabIndex={0}>
                        <div className={style.profileModalContainer}>
                            <span>Hi, {this.context.user.name}!</span>
                            <br/>
                            {buttonGroup}
                            <button id="usermodal-button-logout" onClick={()=>{
                                    window.open(api+"/auth/logout", "_self");
                            }}>
                                Logout
                            </button>
                        </div>
                    </div>
                ):<></>}
            </>
        )
    }

    onModalBlur(e){
        if(this.pictureRef.current===e.relatedTarget || (e.relatedTarget && e.relatedTarget.id && e.relatedTarget.id.indexOf('usermodal-button')!==-1)){
            return;
        }
        this.setState({showModal:false})
    }

    onProfileClick(){
        this.setState({showModal:!this.state.showModal})
    }
}

UserCircle.contextType = UserContext;