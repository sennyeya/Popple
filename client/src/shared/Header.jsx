import React from 'react';
import style from './Header.module.css';
import UserContext from '../contexts/UserContext';
import UserCircle from './UserCircle';
export default class Header extends React.Component{
    render(){
        return (
            <div className={style.header}>
                <div className={style.banner}>
                    <h3 className={style.logo} onClick={()=>window.location="/"}>Popple</h3>
                    {this.context.user && Object.keys(this.context.user).length?(<UserCircle/>):(<></>)}
                </div>
            </div>
        )
        }
}

Header.contextType = UserContext