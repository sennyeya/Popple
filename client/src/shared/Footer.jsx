import React from 'react'
import { Link } from 'react-router-dom'
import style from './Footer.module.css'
export default function Footer(){
    return (
        <div className={style.footerContainer}>
            <footer style={{padding:"10px 20px"}}>
                <Link to="/tos">Terms of Service</Link>
            </footer>
        </div>
    )
}