import React from 'react';
import style from '../Main.module.css'

class LandingPage extends React.Component{
    render(){
        return(
            <>
            {this.props.children?this.props.children:(
                <div className={style.container}>
                    <p style={{textAlign:"center"}}>Welcome to the student side of Popple.</p>
                </div>
            )}
            </>
        )
    }
}

export default LandingPage;