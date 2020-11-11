import React from 'react'
import style from './ContentContainer.module.css';
import Footer from './Footer';
import Header from './Header';

export default function Container(props){
    return (
        <div className={style.container}>
            <Header/>
            <Content>
                {props.children}
            </Content>
            <Footer/>
        </div>
    )
}

function Content(props){
    return (
        <div className={style.content}>
           {props.children} 
        </div>
    )
}