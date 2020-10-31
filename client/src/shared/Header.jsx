import React from 'react';
import style from './Header.module.css';
import UserContext from '../contexts/UserContext';
import UserCircle from './UserCircle'
export default class Header extends React.Component{
    render(){
        return (
            <>
            <div className={style.header}>
                <h1>Popple</h1>
                {this.context.user && Object.keys(this.context.user).length?(<UserCircle/>):(<></>)}
            </div>
            </>
        )
        }
}

Header.contextType = UserContext