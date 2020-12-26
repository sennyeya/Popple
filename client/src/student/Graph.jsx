import React from 'react';
import style from './Graph.module.css'
import {GraphView} from 'react-digraph';
import {LoadingIndicator} from '../shared/Loading';

const GraphConfig =  {
    NodeTypes: {
        validNode: { // required to show empty nodes
            typeText: "Can Add",
            shapeId: "#validNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="validNode" key="0">
                    <circle cx="100" cy="100" r="45" stroke={"green"} fill={"white"}></circle>
                </symbol>
            )
        },
        toDo:{
            typeText: "Planned",
            shapeId: "#toDo", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="toDo" key="0">
                    <circle cx="100" cy="100" r="45" stroke={"#1E5288"} fill={"white"}></circle>
                </symbol>
            )
        },
        missingNode:{
            typeText: "Can't Add",
            shapeId: "#missingNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="missingNode" key="0">
                    <circle cx="100" cy="100" r="45" stroke={"#8B0015"} fill={"white"}></circle>
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

function GraphItem({API, graphNodes, setSelected, openClassModal}){
    const [data, setData] = React.useState([])
    const [isLoading, setLoading] = React.useState(true)
    const tree = React.useRef();

    React.useEffect(()=>{
        API.get("/student/plan/tree").then(({tree}) => {
            setData(tree);
            setLoading(false);
        })
    }, [API])

    const onClassClick = (id) => {
        setSelected(id)
        openClassModal()
    }

    const nodes = React.useMemo(()=>{
        if(!graphNodes||!graphNodes.length||!data.nodes){
            return [];
        }
        for(let node of graphNodes){
            let mappedNode = data.nodes.filter(e=>e.id===node.classId)[0]
            if(node.isValid){
                mappedNode.type="validNode"
            }else if(node.isMissing){
                mappedNode.type = "missingNode"
            }else{
                mappedNode.type = "toDo"
            }
        }
        return data.nodes;
    }, [graphNodes, data.nodes])

    const NodeTypes = GraphConfig.NodeTypes;
    const NodeSubtypes = GraphConfig.NodeSubtypes;
    const EdgeTypes = GraphConfig.EdgeTypes;
    if(isLoading){
        return <LoadingIndicator/>
    }
    return (
        <div className={style.graphContainer}>
            <GraphView
                ref={tree}
                nodeKey={NODE_KEY}
                nodeTypes={NodeTypes}
                nodeSubtypes={NodeSubtypes}
                edgeTypes={EdgeTypes}
                nodes={nodes}
                edges={data.edges}
                onSelectNode={(node)=>{if(node) onClassClick(node.id)}}
                layoutEngineType={'VerticalTree'}
                readOnly
                showGraphControls={false}
                />
        </div>
    )
}

export default GraphItem;