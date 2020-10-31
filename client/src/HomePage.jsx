import React from 'react'
import style from './Navbar.module.css';
import headerStyle from './Main.module.css'
import Main from './Main';
import MenuBar from './shared/MenuBar';
export default function HomePage(props){
    return (
        <>
        <MenuBar/>
        {props.children?props.children: (
            <>
                <Main></Main>
            </>
        )}
        </>
    )
}