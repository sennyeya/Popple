import React from 'react';
import {config, authOptionsGet} from '../config'

export const authenticateStudent = ()=>{
    fetch(config.api+"/auth/login/status", authOptionsGet).then(e=>{
        if(!e.ok){
            throw new Error()
        }
        return e.json()
    }).then(e=>{
        this.setState({sId:e.id, isAuthenticated:true, isLoading: true})
    })
}

export const UserContext = React.createContext({
    user:{},
    updateUser:()=>{}
});