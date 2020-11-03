import React from 'react'
import { Link } from 'react-router-dom'
import './MenuBar.module.css'
export default function Main(){
    return (
        <nav style={{maxHeight:"6vh", textAlign:"center", height:"6vh", position:"relative", minHeight:"50px"}}>
            <footer style={{padding:"20px"}}>
                <Link to="/tos">Terms of Service</Link>
            </footer>
        </nav>
    )
}