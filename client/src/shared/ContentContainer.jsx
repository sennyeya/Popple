import React from 'react'
import style from './ContentContainer.module.css'

export default function Container(props){
    return (
        <div className={style.container}>
            {props.children}
        </div>
    )
}