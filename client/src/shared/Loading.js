import React from 'react';
import style from './Loading.module.css'

class Loading extends React.Component{

    render(){
        return(
            <div className={style.container}>
                <div className={style.ldsDualRing}></div>
            </div>
        )
    }

}

export default Loading;