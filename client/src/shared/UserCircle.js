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

        this.onProfileClick = this.onProfileClick.bind(this)
    }

    componentDidUpdate(){
        if(this.state.showModal){
            this.modal.current.focus();
        }
    }

    render(){
        return (
            <>
                <a onClick={this.onProfileClick} className={style.profilePhoto} href="#">
                    <img src="https://cdn.cnn.com/cnnnext/dam/assets/170818124544-star-ferry-tsim-sha-tsui-promenade.jpg" alt="User"></img>
                </a>
                {this.state.showModal?(
                    <div className={style.profileModal} onBlur={()=>setTimeout(()=>this.setState({showModal:false}), 100)} ref={this.modal} tabIndex={0}>
                        <div className={style.profileModalContainer}>
                            <p>Hi, {this.context.user.name}!</p>
                            {
                                this.context.user.isAdmin?
                                (
                                    window.location.href.includes("admin")?
                                        (
                                            <button onClick={()=>{
                                                window.open("/student", "_self");
                                                }}>
                                                Go to Student
                                            </button>
                                        ):
                                        (
                                            <button onClick={()=>{
                                                window.open("/admin", "_self");
                                            }}>
                                                Go to Admin
                                            </button>
                                        )
                                ):
                                <></>
                            }
                            <button onClick={()=>{
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

    onProfileClick(){
        this.setState({showModal:!this.state.showModal})
    }
}

UserCircle.contextType = UserContext;