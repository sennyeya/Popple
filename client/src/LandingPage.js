import React from 'react';
import User from './User';
import Graph from './Graph';
import Plan from './Plan';

class LandingPage extends React.Component{
    constructor(props){
        super(props);

        this.state = {

        }
    }

    render(){
        return(
            <>
                <div>
                    <User/>
                </div>
                <div>
                    <Plan sId={1}/>
                </div>
                <div>
                    <Graph/>
                </div>
            </>
        )
    }
}

export default LandingPage;