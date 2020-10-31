import React from 'react'
import Header from '../shared/Header';
import {Link} from 'react-router-dom'

export default function MenuBar(){
    return (
        <>
            <Header/>
            <nav>
                <ul>
                    <li>
                        <Link to="/admin">Home</Link>
                    </li>
                    <li>
                        <Link to="/admin/plan">Plan</Link>
                    </li>
                    <li>
                        <Link to="/admin/class">Classes</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}