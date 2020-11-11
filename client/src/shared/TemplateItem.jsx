import React from 'react';
import style from './Template.module.css'

export default function TemplateItem({children, width}){
    return (
        <div className={style.templateItem} style={{flex:width||1}}>
            {children}
        </div>
    )
}