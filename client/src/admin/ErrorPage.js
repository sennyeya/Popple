import React from 'react';
import {config, authOptionsGet} from '../student/config';
import Loading from './Loading'
import Select from 'react-select'


class ClassItem extends React.Component{
    render(){
        return (
            <>
            <p>{this.props.err}</p>
            <p>Please reload the page.</p>
            </>
        )
    }
}

export default ClassItem