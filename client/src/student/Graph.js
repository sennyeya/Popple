import React from 'react';
import Loading, {LoadingIndicator} from '../shared/Loading'
import PlanQuestionnaire from './PlanQuestionnaire';
import UserContext from '../contexts/UserContext'
import {Droppable, Draggable, DragDropContext} from 'react-beautiful-dnd'
import Modal from 'react-modal';
import './Graph.css'
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { CircularProgressbarWithChildren , buildStyles  } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
    GraphView
} from 'react-digraph';

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
                <circle cx="100" cy="100" r="45" fill={"lightblue"}></circle>
                </symbol>
            )
        },
        toDo:{
            typeText: "To Do",
            shapeId: "#toDo", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 200 200" id="toDo" key="0">
                <circle cx="100" cy="100" r="45"></circle>
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

Modal.setAppElement('#root')

class GraphItem extends React.Component{
    constructor(props){
        super(props);
        this.state={
            nodes:[],
            buckets: [],
            data: props.tree,
            levels:{},
            modalIsOpen:false,
            modalMessage:"",
            missingClasses:[],
            isLoading:true,
            selected:null,
            isPaneOpen: false
        }

        this.tree = React.createRef();

        this.onClassClick = this.onClassClick.bind(this)
        this.onPaneClose = this.onPaneClose.bind(this)
    }

    componentDidMount(){
        let {API} = this.props;
        API.post("/student/plan/tree").then((json) => {
            this.setState({data:json.tree})
            API.post("/student/bucket/items").then(json=>{
                this.setState({nodes:json.map(e=>{
                    return {id:e.id, label:e.label, bucket:e.bucket, children:e.children}
                })})
                API.post("/student/bucket/buckets").then(json=>{
                        this.setState({buckets:json.map((e,index)=>{
                            return {id:e.id, label:e.label, index}
                        }), isLoading:false})
                })
            })
        })
    }

    reorder(bucket, source, destination){
        var array = [...this.state.nodes];
        var filteredArr = array.filter(e=>e.bucket===bucket)
        var startIndex = array.indexOf(filteredArr[source])
        var endIndex = array.indexOf(filteredArr[destination])
        const [removed] = array.splice(startIndex, 1);
        array.splice(endIndex, 0, removed);
        this.setState({nodes:array})
    };
    
    move(source, destination, sourceIndex, destinationIndex){
        let array = [...this.state.nodes]
        var filteredArr = array.filter(e=>e.bucket===source)
        var filteredArrDest = array.filter(e=>e.bucket===destination)
        if(filteredArrDest.length){
            var startIndex = array.indexOf(filteredArr[sourceIndex])
            var endIndex = destinationIndex>(filteredArrDest.length-1)?array.length:array.indexOf(filteredArrDest[destinationIndex])
            const [removed] = array.splice(startIndex, 1);
            if(endIndex>startIndex){
                array.splice(endIndex-1, 0, removed);
            }else{
                array.splice(endIndex, 0, removed);
            }
        }
        filteredArr[sourceIndex].bucket = destination;
        let missingClasses = [...this.state.missingClasses];
        missingClasses = missingClasses.filter(e=>e.id!==filteredArr[sourceIndex].id);

        this.setState({nodes:array, missingClasses})
        
        this.props.API.post(`/student/bucket/move`, {
                    id:filteredArr[sourceIndex].id,
                    sId: this.context.user.id, 
                    bucket:destination
                })
    };

    isRequirementRemoved(source, destination){
        let currentlyDragging = this.state.nodes.filter(e=>e.id===this.state.currentlyDragging)[0]
        var bucket = this.state.buckets.filter(e=>e.id===source.droppableId)[0];
        if(bucket.label==="Primary"){
            return false;
        }
        var otherBuckets = this.state.buckets.filter(e=>e.index>bucket.index&&e.index!==0)
        var filteredArr = this.state.nodes.filter(e=>otherBuckets.some(f=>f.id===e.bucket))
        var missingClasses = filteredArr.filter(node=>
            node.children.some(f=>currentlyDragging.id===f)
        ).map(e=>e.label)
        return missingClasses.length>0
    }

    removeDependents(source, destination){
        let nodes = [...this.state.nodes]
        let currentlyDragging = nodes.filter(e=>e.id===this.state.currentlyDragging)[0]
        var bucket = this.state.buckets.filter(e=>e.id===source.droppableId)[0];
        if(bucket.label==="Primary"){
            return false;
        }
        var otherBuckets = this.state.buckets.filter(e=>e.index>bucket.index&&e.index!==0)
        var filteredArr = nodes.filter(e=>otherBuckets.some(f=>f.id===e.bucket))
        var missingClasses = filteredArr.filter(node=>
            node.children.some(f=>currentlyDragging.id===f)
        )
        var array = []
        while(missingClasses.length){
            let removed = missingClasses.splice(0,1)[0];
            array = array.concat(filteredArr.filter(node=>
                node.children.some(f=>removed.id===f)
            ))
            array.push(removed)
        }
        array = [...new Set(array)]
        // Need to add all possible dependents
        array = [...new Set(array)]
        for(let element of array){
            this.move(
                element.bucket, 
                this.state.buckets.filter(e=>e.label==="Primary")[0].id, 
                nodes.filter(e=>e.bucket===element.bucket).indexOf(element), 
                nodes.length
            )
        }
        this.setState({nodes})
    }

    getModalMissingMessage(destination){
        let currentlyDragging = this.state.nodes.filter(e=>e.id===this.state.currentlyDragging)[0]
        var bucket = this.state.buckets.filter(e=>e.id===destination.droppableId)[0];
        var previousBuckets = this.state.buckets.filter(e=>e.index<bucket.index&&e.index!==0)
        var filteredArr = this.state.nodes.filter(e=>previousBuckets.some(f=>f.id===e.bucket))
        var missingClasses = this.state.nodes.filter(node=>(currentlyDragging.children.filter(e=>!filteredArr.some(f=>f.id===e))).some(child=>node.id===child))
        this.setState({missingClasses})
        return `Class ${currentlyDragging.label} is missing the following requirement(s) in previous semesters: \n\t${missingClasses.map(e=>e.label).join(", ")}`
    }

    getModalRequirementMessage(destination){
        let currentlyDragging = this.state.nodes.filter(e=>e.id===this.state.currentlyDragging)[0]
        var bucket = this.state.buckets.filter(e=>e.id===destination.droppableId)[0];
        var previousBuckets = this.state.buckets.filter(e=>e.index>bucket.index&&e.index!==0)
        var filteredArr = this.state.nodes.filter(e=>previousBuckets.some(f=>f.id===e.bucket))
        var missingClasses = filteredArr.filter(e=>e.children.includes(currentlyDragging.id)).map(e=>e.label)
        return `Class ${currentlyDragging.label} has the following dependendents in other semesters: \n\t${missingClasses.join(", ")}`
    }

    onClassClick(id){
        this.setState({selected:id, isPaneOpen:true})
    }

    onPaneClose(){
        this.setState({isPaneOpen:false})
    }

    onDragEnd = ({ source, destination }) => {
        // dropped outside the list
        if (!destination) {
            return;
        }else if(!this.isDropEnabled(destination)){
            this.setState({modalIsOpen:true, modalMessage:this.getModalMissingMessage(destination)})
            return;
        }else if(this.isRequirementRemoved(source, destination) && source.droppableId !== destination.droppableId){
            this.setState({
                modalIsOpen:true, 
                modalMessage:this.getModalRequirementMessage(destination)
            });
            this.move(
                source.droppableId,
                destination.droppableId,
                source.index,
                destination.index
            );
            return this.removeDependents(source, destination);
        }

        if (source.droppableId === destination.droppableId) {
            this.reorder(
                source.droppableId,
                source.index,
                destination.index
            );
        } else {
            this.move(
                source.droppableId,
                destination.droppableId,
                source.index,
                destination.index
            );
        }
    };

    isDropEnabled(destination){
        let currentlyDragging = this.state.nodes.filter(e=>e.id===this.state.currentlyDragging)[0]
        var bucket = this.state.buckets.filter(e=>e.id===destination.droppableId)[0]
        if(bucket.index===0){
            return true;
        }
        var previousBuckets = this.state.buckets.filter(e=>e.index<bucket.index&&e.index!==0)
        var filteredArr = this.state.nodes.filter(e=>previousBuckets.some(f=>f.id===e.bucket))
        return currentlyDragging.children.length?currentlyDragging.children.every(e=>filteredArr.some(f=>f.id===e)):true;
    }

    render(){
        const NodeTypes = GraphConfig.NodeTypes;
        const NodeSubtypes = GraphConfig.NodeSubtypes;
        const EdgeTypes = GraphConfig.EdgeTypes;
        if(this.state.isLoading){
            return <LoadingIndicator/>
        }
        return (
            <div className="graph-container">
                <div style={{display:"flex", margin:"0 auto", justifyContent:"space-between", height:"100%"}}>
                    <DragDropContext 
                        onDragEnd={this.onDragEnd} 
                        onDragStart={(e)=>this.setState({currentlyDragging:e.draggableId})}
                        onDragUpdate={(e)=>e.destination?this.setState({destination:e.destination.id}):null}
                    >
                        <div style={{
                                flex:"1", 
                                display:"inline-flex", 
                                justifyContent: "space-between", 
                                flexWrap:"wrap", 
                                alignContent: "flex-start"
                            }}>
                                <div style={{
                                    flex:"1"
                                }}>
                                    <h2 style={{width:"100%", paddingLeft:"10px"}}>Available</h2>
                                    <BucketItem bucket={this.state.buckets[0]} 
                                                items={this.state.nodes.filter(node=>node.bucket===this.state.buckets[0].id)}
                                                missing={this.state.missingClasses} 
                                                onClassClick={this.onClassClick}
                                                isPrimary
                                    />
                                </div>
                                <div style={{
                                    flex:"2", 
                                    display:"inline-flex", 
                                    justifyContent: "center", 
                                    flexWrap:"wrap", 
                                    alignItems: "center",

                                }}>
                                    <h2 style={{width:"100%", paddingLeft:"10px"}}>Semester Plan</h2>
                                    {this.state.buckets.filter(e=>e.label!=="Primary").map((bucket)=>
                                        <BucketItem bucket={bucket} 
                                                    key={`bucket-item-${bucket.id}`}
                                                    items={this.state.nodes.filter(node=>node.bucket===bucket.id)}
                                                    missing={this.state.missingClasses}
                                                    onClassClick={this.onClassClick}
                                        />
                                    )}
                                </div>
                            
                        </div>
                    </DragDropContext>
                    <div style={{width:"40vw", height:"100%", flex:"1"}}>
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
                            />
                    </div>
                </div>
                <InfoModal 
                    isOpen={this.state.modalIsOpen} 
                    closeModal={()=>this.setState({modalIsOpen:false})}
                    message={this.state.modalMessage}
                />
                <SlidingPaneAsync 
                    id={this.state.selected} 
                    isOpen={this.state.isPaneOpen} 
                    API={this.props.API}
                    closePane={this.onPaneClose}/>
            </div>
            )
    }
}

GraphItem.contextType = UserContext;

export default GraphItem;

function SlidingPaneAsync({id, closePane, isOpen, API}){
    const [paneDetails, setPaneDetails] = React.useState("");
    const [isLoading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("")

    React.useEffect(()=>{
        if(!id||!API){
            return
        }
        setLoading(true)
        setError("")
        setPaneDetails("")
        API.get("/student/bucket/itemInfo", {id}).then(json=>{
            setPaneDetails(json)
            setLoading(false)
        }).catch(e=>{
            setError(e.statusText);
            setLoading(false)
        });
    }, [id, API]);

    if(!id){
        return <></>
    }
    return (
        <SlidingPane
            className="some-custom-class"
            overlayClassName="some-custom-overlay-class"
            isOpen={isOpen}
            width={"20vw"}
            title={paneDetails.name || "Class Details"}
            onRequestClose={closePane}
        >
            {
                isLoading?
                <LoadingIndicator/>:
                (
                    error?
                    <p>Error: {error}</p>:
                    <div style={{display:"flex", flexDirection:"row", flexWrap:"wrap", justifyContent:"left"}}>
                        <div style={{marginBottom:"10px", display:"flex",flex:"row", flexWrap:"wrap", justifyContent:"space-evenly", alignItems:"center", width:"100%"}}>
                            <div style={{textAlign:"center"}}>
                                <div style={{width:100, height:100}}>
                                    <CircularProgressbarWithChildren  
                                        value={paneDetails.planProgress} 
                                        text={`${paneDetails.planProgress}%`} 
                                        circleRatio={0.75}  /* Make the circle only 0.75 of the full diameter */
                                        styles={buildStyles({
                                            rotation: 1 / 2 + 1 / 8,
                                            strokeLinecap: "butt",
                                            trailColor: "#eee"
                                        })}
                                    />
                                </div>
                                <p style={{width:"100%"}}>Major Progress</p>
                            </div>
                            <div style={{textAlign:"center"}}>
                                <div style={{width:100, height:100}}>
                                    <CircularProgressbarWithChildren  
                                        value={paneDetails.graduationProgress} 
                                        text={`${paneDetails.graduationProgress}%`} 
                                        circleRatio={0.75}  /* Make the circle only 0.75 of the full diameter */
                                        styles={buildStyles({
                                            rotation: 1 / 2 + 1 / 8,
                                            strokeLinecap: "butt",
                                            trailColor: "#eee"
                                        })}
                                    />
                                </div>
                                <p style={{width:"100%"}}>Degree Progress</p>
                            </div>
                        </div>
                        
                        <DisplayText header="Description">{paneDetails.description}</DisplayText>
                        
                    </div>
                )
            }
        </SlidingPane>
    )
}

function DisplayText({children, header}){
    return (
    <div style={{padding:"5px", width:"100%"}}>
        <p>{header}: </p>
        {children}
    </div>
    )
}

const grid = 8;

function BucketItem({bucket,items, isDropDisabled, missing, onClassClick, isPrimary}){
    const getStyle = (isDraggingOver,isMissing) => ({
        background: isPrimary? "#ddd":(isDraggingOver ? '#969696' : '#eee'),
        padding: grid,
        margin:grid,
        flex: 1,
        borderRadius:"3px",
        flexBasis: "50%"
    });
    return (
        <Droppable droppableId={bucket.id} key={bucket.id} isDropDisabled={isDropDisabled}>
            {(provided, snapshot)=>
                <div
                    ref={provided.innerRef}
                    style={getStyle(snapshot.isDraggingOver && !isDropDisabled)}
                    {...provided.droppableProps}
                >
                    <h3>{bucket.label}</h3>
                    <ClassList items={items} missing={missing} onClassClick={onClassClick}/>
                    {provided.placeholder}
                </div>
            }
        </Droppable>
    )
}

const ClassList = React.memo(function ClassList({items, missing, onClassClick}){
    return items.map((item,index)=>
        <ClassItem item={item} index={index} key={item.id} missing={missing} onClassClick={onClassClick}/>
    )
})

function ClassItem({item, index, missing, onClassClick}){
    missing = missing.some(e=>e.id===item.id)
    const getStyle= (isDragging, draggableStyle, isMissing) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: grid,
        margin: `0 0 ${grid}px 0`,
        borderRadius:"3px",
        // change background colour if dragging
        background: isDragging ? '#82d6e0' : (isMissing?'#f5b898':'#bbb'),
    
        // styles we need to apply on draggables
        ...draggableStyle
    });
    return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style,
                        missing
                    )}
                    onClick={()=>onClassClick(item.id)}
                >
                    <p>
                        {item.label}
                    </p>
                </div>
            )}
        </Draggable>
    )
}

function InfoModal({isOpen, closeModal, message}){
    const customStyles = {
        content : {
          top                   : '50%',
          left                  : '50%',
          right                 : 'auto',
          bottom                : 'auto',
          marginRight           : '-50%',
          transform             : 'translate(-50%, -50%)'
        }
      };
    return (
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Message"
        >
 
            <h2>Alert</h2>
            <div>{message}</div>
            <button onClick={closeModal}>Close</button>
        </Modal>
    )
}