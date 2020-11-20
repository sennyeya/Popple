import React from 'react';
import UserContext from '../contexts/UserContext'
import style from './Graph.module.css'
import {GraphView} from 'react-digraph';
import {LoadingIndicator} from '../shared/Loading';

const GraphConfig =  {
    NodeTypes: {
        completed: { // required to show empty nodes
            typeText: "Completed",
            shapeId: "#completed", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="completed" key="0">
                    <circle cx="100" cy="100" r="45" fill={"gray"}></circle>
                </symbol>
            )
        },
        inProgress: { // required to show empty nodes
            typeText: "In Progress",
            shapeId: "#inProgress", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="inProgress" key="0">
                <circle cx="100" cy="100" r="45" fill={"#5490cc"}></circle>
                </symbol>
            )
        },
        toDo:{
            typeText: "To Do",
            shapeId: "#toDo", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="toDo" key="0">
                <circle cx="100" cy="100" r="45" fill={"white"}></circle>
                </symbol>
            )
        }
    },
    NodeSubtypes: {},
    EdgeTypes: {
        emptyEdge: {  // required to show empty edges
        shapeId: "#emptyEdge",
        shape: (
            <></>
        )
        }
    }
}

const NODE_KEY = "id"       // Allows D3 to correctly update DOM

class GraphItem extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data: props.tree,
            levels:{},
            isLoading:true
        }

        this.tree = React.createRef();

        this.onClassClick = this.onClassClick.bind(this)
        this.onPaneClose = this.onPaneClose.bind(this)
    }

    componentDidMount(){
        let {API} = this.props;
        API.get("/student/plan/tree").then((json) => {
            this.setState({data:json.tree, isLoading:false})
        })
    }

    onClassClick(id){
        this.props.setSelected(id)
        this.props.openClassModal()
    }

    onPaneClose(){
        this.setState({isPaneOpen:false})
    }

    render(){
        const NodeTypes = GraphConfig.NodeTypes;
        const NodeSubtypes = GraphConfig.NodeSubtypes;
        const EdgeTypes = GraphConfig.EdgeTypes;
        if(this.state.isLoading){
            return <LoadingIndicator/>
        }
        return (
            <div className={style.graphContainer}>
                <GraphView
                    ref={el => (this.GraphView = el)}
                    nodeKey={NODE_KEY}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    nodes={this.state.data.nodes}
                    edges={this.state.data.edges}
                    onSelectNode={(node)=>{if(node) this.onClassClick(node.id)}}
                    layoutEngineType={'VerticalTree'}
                    readOnly
                    showGraphControls={false}
                    />
            </div>
            )
    }
}

GraphItem.contextType = UserContext;

export default GraphItem;