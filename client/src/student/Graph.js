import React from 'react';
import Loading from './Loading'
import {config} from './config';

import Graph from "react-graph-vis";

var options = {
    layout: {
        hierarchical: true
    },
    physics:{
        enabled:false
    },
    manipulation:{
        enabled:false
    },
    edges: {
        color: "#000000"
    }
};

class GraphItem extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            treeData : [],
            isLoading:true,
            sId:this.props.sId
        }
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
                    <h1 className="headerText">Current Plan</h1>
                </div>
                <div id="canvasContainer">
                    {this.state.isLoading?<Loading/>:<Graph graph={this.state.treeData} options={options} style={{ height: "600px" }}/>}
                </div>
            </div>
            </>
        )
    }
}

export default GraphItem;