import React from 'react';
import {config} from '../student/config';
import Loading from '../shared/Loading';

class Update extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {}
    }

    componentDidMount(){
        fetch(config.api+"/data/plan/CSC", 
        {
            method:'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sId: this.state.sId})
        })
        .then((response) =>{
            return response.json();
          })
          .then((myJson) => {
            this.setState({treeData:myJson['tree'], isLoading:false})
          });
    }

    render(){
        return(
            <>
            <div className="containerBox">
                <div className="header">
                    <h1 className="headerText">Information</h1>
                </div>
                <div id="canvasContainer">
                    {this.state.isLoading?<Loading/>:<div></div>}
                </div>
            </div>
            </>
        )
    }
}

export default Update;