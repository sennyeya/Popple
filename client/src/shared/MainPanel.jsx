import React from 'react'
import './MainPanel.css'

export default function MainPanel(props){
    return (
        <div className="main-panel">
            {props.children}
        </div>
    )
}