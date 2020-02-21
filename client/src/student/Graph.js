import React from 'react';
import Loading from './Loading'
import {config} from './config';

import Graph from "react-graph-vis";
import style from './LandingPage.module.css'

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

const authOptions = 
{
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
    }
}

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
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({sId: this.state.sId})
        })
        .then((response) =>{
            if(!response.ok){
                throw new Error();
            }
            return response.json();
          })
          .then((myJson) => {
            this.setState({treeData:myJson.tree, isLoading:false})
          })
    }

    render(){
        return(
            <>
            <div className={style.containerBox}>
                <div className={style.header}>
                    <h1 className={style.headerText}>Current Plan</h1>
                </div>
                <div id={style.canvasContainer}>
                    {this.state.isLoading?<Loading/>:<Graph graph={this.state.treeData} options={options} style={{ height: "600px" }}/>}
                </div>
            </div>
            </>
        )
    }
}

export default GraphItem;