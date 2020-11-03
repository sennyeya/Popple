import React from 'react'
import style from './ContentContainer.module.css'

export default function Container(props){
    return (
        <div className={style.container}>
            <Content>
                {props.children}
            </Content>
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