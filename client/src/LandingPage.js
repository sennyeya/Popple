import React from 'react';
import User from './User';
import Graph from './Graph';
import Plan from './Plan';
import {config} from './config';

class LandingPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sId:props.id
        }
    }

    render(){
        return(
            <>
                <div>
                    <User/>
                </div>
                <div>
                    <Plan sId={this.state.sId}/>
                </div>
                <div>
                    <Graph sId={this.state.sId}/>
                </div>
            </>
        )
    }
}

export default LandingPage;