import React from 'react';
import TemplateItem from './TemplateItem';
import style from './Template.module.css'

export default function Template({size, height, children}){
    return (
        <div className={style.templateGrid} style={{height:height}}>
            {
                size.length===1?
                <TemplateItem width={1}>{children}</TemplateItem>:
                (
                size.map((e, i)=>{
                    return <TemplateItem width={e*10}>{children[i]}</TemplateItem>
                }))
            }
        </div>
    )
}