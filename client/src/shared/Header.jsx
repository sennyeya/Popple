import React from 'react';
import style from '../Main.module.css'
export default function Header(){
    return (
        <>
        <header>
            <h1>Popple</h1>
            <div className={style.login}>
                <p>Login</p>
            </div>
        </header>
        </>
    )
}