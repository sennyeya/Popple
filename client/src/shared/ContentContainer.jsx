import React from 'react'
import style from './ContentContainer.module.css';
//import Footer from './Footer';
import Header from './Header';

/**
 * The container to hold the actual content for the dashboard.
 * @param {Object} children 
 */
export default function Container({children}){
    return (
        <div className={style.container}>
            <Header/>
            <Content>
                {children}
            </Content>
            {/*<Footer/>*/}
        </div>
    )
}

/**
 * The container to hold just the content specific props, 
 *  think the actual dashboard.
 * @param {*} props 
 */
function Content(props){
    return (
        <div className={style.content}>
           {props.children} 
        </div>
    )
}