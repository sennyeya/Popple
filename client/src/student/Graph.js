import React from 'react';
import Loading from './Loading'
import {config, authOptionsPost} from './config';

import Graph from "react-graph-vis";
import style from './LandingPage.module.css'
import PlanQuestionnaire from './PlanQuestionnaire'

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
            treeData : {},
            isLoading:true,
            sId:this.props.sId,
            noResults: false
        }
    }

    componentDidMount(){
        fetch(config.api+"/data/plan", authOptionsPost(JSON.stringify({sId: this.state.sId})))
        .then((response) =>{
            if(!response.ok){
                throw new Error();
            }
            return response.json();
          })
          .then((myJson) => {
              console.log(myJson)
                if(!myJson.tree ||!myJson.tree.nodes.length){
                    this.setState({isLoading:false})
                }else{
                    console.log(myJson.tree)
                    this.setState({treeData:myJson.tree, isLoading:false})
                }
          })
    }

    render(){
        if(!Object.keys(this.state.treeData).length){
            return(
                <>
                <div className={style.containerBox}>
                    <div className={style.header}>
                        <h1 className={style.headerText}>Current Plan</h1>
                    </div>
                    <div id={style.canvasContainer}>
                        {this.state.isLoading?<Loading/>:<PlanQuestionnaire/>}
                    </div>
                </div>
                </>
            )
        }else{
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
}

export default GraphItem;