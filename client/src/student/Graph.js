import React from 'react';
import Loading from '../shared/Loading'
import {config, authOptionsPost} from './config';

import Graph from "react-graph-vis";
import style from './LandingPage.module.css';
import mainStyle from '../Main.module.css'
import PlanQuestionnaire from './PlanQuestionnaire';
import {UserContext} from '../contexts/userContext'

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
            noResults: false
        }
    }

    componentDidMount(){
        fetch(config.api+"/data/plan", authOptionsPost(JSON.stringify({sId: this.context.user.sId})))
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
                <div className={mainStyle.container}>
                    {this.state.isLoading?<Loading/>:<PlanQuestionnaire/>}
                </div>
            )
        }else{
            return(
                <div className={mainStyle.container}>
                    {this.state.isLoading?<Loading/>:<Graph graph={this.state.treeData} options={options} style={{ height: "600px" }}/>}
                </div>
            )
        }
    }
}

GraphItem.contextType = UserContext;

export default GraphItem;