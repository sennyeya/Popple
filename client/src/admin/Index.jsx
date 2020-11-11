import React, {useContext} from 'react';
import Unauthorized from './Unauthorized';
import UserContext from '../contexts/UserContext';
import Template from '../shared/Template';
import PlanItem from './PlanItem';
import ClassItem from './ClassItem'

export default function AdminDashboard(){

    /** Logged in user from context. */
    const {user} = useContext(UserContext)

    if(!user || !user.isAdmin){
        return <Unauthorized/>
    }
    return (
        <>
            <Template size={[.5, .5]} height={"auto"}>
                <PlanItem/>
                <ClassItem/>
            </Template>
        </>
    )
}