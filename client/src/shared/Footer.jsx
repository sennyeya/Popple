import React from 'react'
import { Link } from 'react-router-dom'
export default function Main(){
    return (
    <footer style={{maxHeight:"5vh", textAlign:"center", background:"gray", width:"100vw"}}>
        <Link to="/tos">Terms of Service</Link>
    </footer>)
}