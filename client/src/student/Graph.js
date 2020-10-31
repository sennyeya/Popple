import React from 'react';
import {LoadingIndicator} from '../shared/Loading'
import PlanQuestionnaire from './PlanQuestionnaire';
import UserContext from '../contexts/UserContext'
import {Droppable, Draggable, DragDropContext} from 'react-beautiful-dnd'
import Modal from 'react-modal';
import API from '../shared/API';
import style from "./Graph.module.css"

Modal.setAppElement('#root')

class GraphItem extends React.Component{
    
    constructor(props){
        super(props)
        this.state = {
            treeData : {},
            isLoading:true,
            noResults: false,
            bucketData: {},
            buckets:[]
        }
    }

    componentDidMount(){
        const sId = {sId:this.context.user.id}
        API.post("/data/plan", sId).then((json) => {
                if(!json.tree ||!json.tree.nodes.length){
                    throw new Error("No tree data received.");
                }
                this.setState({treeData:json.tree})
                API.post("/data/bucketItems", sId).then(json=>{
                    this.setState({bucketData:json})
                    API.post("/data/buckets", sId).then(json=>{
                        this.setState({buckets:json, isLoading:false})
                    })
                  })
          })
    }

    render(){
        if(this.state.isLoading){
            return <LoadingIndicator/>
        }
        else if(!Object.keys(this.state.treeData).length){
            return <PlanQuestionnaire/>;
        }else{
            return <ClassSelect data={this.state.bucketData} tree={this.state.treeData} buckets={this.state.buckets}/>;
        }
    }
}

GraphItem.contextType = UserContext;

export default GraphItem;

class ClassSelect extends React.Component{
    constructor(props){
        super(props);
        this.state={
            nodes:this.props.data.map((e,id)=>{
                return {id:e.id, label:e.label, bucket:e.bucket, children:e.children}
            }),
            buckets: this.props.buckets.map((e,index)=>{
                return {id:e.id, label:e.label, index}
            }),
            data: props.tree,
            levels:{},
            modalIsOpen:false,
            modalMessage:"",
            missingClasses:[],
            isLoading:true
        }

        for(let node of this.state.data.nodes){
            if(!this.state.levels[node.level]){
                this.state.levels[node.level] = [node]
            }else{
                this.state.levels[node.level].push(node);
            }
        }

        this.tree = React.createRef();
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
        
        API.post(`/data/bucket`, {
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
        const canvas = this.tree.current;
        let arr = [];
        let locations = {};
        const radius = 20;
        Object.keys(this.state.levels).sort().forEach((e)=>{
            if(!canvas){
                this.setState({isLoading:false})
                return;
            }
            let count = 1;
            for(let node of this.state.levels[e]){
                // Get the center for each level
                var centerX = (canvas.width.baseVal.value/(this.state.levels[e].length+1))*(count);

                // Get center for each levels y
                var centerY = (canvas.height.baseVal.value / 6)*node.level;

                locations[node.id] = {x:centerX, y:centerY}

                // Create the nodes.
                arr.push(
                    <g transform={`translate(${centerX},${centerY})`} key={`${centerX},${centerY}`}>
                        <circle
                            r={radius}
                            fill={node.color?node.color:"white"}
                            stroke={"green"}
                            onClick={(e)=>{
                            }}
                            onMouseOver={()=>{
                                
                            }}
                        />
                        <text textAnchor="middle" fontSize={13} style={{userSelect:"none"}} color={"white"}>
                            {node.label}
                        </text>
                    </g>
                );
                count++;
            }
        })

        for(let edge of this.state.data.edges){
            if(!locations[edge.to]||!locations[edge.from]){
                continue;
            }
            let x1=locations[edge.from].x
            let x2=locations[edge.to].x
            let y1=locations[edge.from].y 
            let y2=locations[edge.to].y

            // Using slopes, find the amount of line that intersects with the circle
            let m = (y2-y1)/(x2-x1);
            let theta = Math.atan(m);
            let intersectX = radius*Math.cos(theta);
            let intersectY = radius*Math.sin(theta);

            // And remove.
            if(x2<x1&&y2<y1){
                x1 = x1-intersectX;
                x2 = x2+intersectX;
                y1 = y1+intersectY;
                y2 = y2-intersectY
            }else if(x2>=x1&&y2<y1){
                x1 = x1-intersectX;
                x2 = x2+intersectX;
                y1 = y1+intersectY;
                y2 = y2-intersectY
            }else if(x2<x1&&y2>=y1){
                x1 = x1-intersectX;
                x2 = x2+intersectX;
                y1 = y1-intersectY;
                y2 = y2+intersectY
            }else{
                x1 = x1+intersectX;
                x2 = x2-intersectX;
                y1 = y1+intersectY;
                y2 = y2-intersectY
            }

            // Create 'arrow'
            arr.push(<line x1={x1} x2={x2} y1={y1} y2={y2} stroke={"black"} key={`${x1},${x2},${y1},${y2}`}/>)
        }
        return (
            <>
`               <div style={{display:"flex", width:"90vw", height:"80vh", margin:"0 auto", justifyContent:"space-between"}}>
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
                                    {
                                        <BucketItem bucket={this.state.buckets[0]} 
                                                    items={this.state.nodes.filter(node=>node.bucket===this.state.buckets[0].id)}
                                                    missing={this.state.missingClasses} 
                                        />
                                    }
                                </div>
                                <div style={{
                                    flex:"2", 
                                    display:"inline-flex", 
                                    justifyContent: "center", 
                                    flexWrap:"wrap", 
                                    alignItems: "center",

                                }}>
                                    {this.state.buckets.filter(e=>e.label!=="Primary").map((bucket, index)=>
                                        <BucketItem bucket={bucket} 
                                                    key={`bucket-item-${bucket.id}`}
                                                    items={this.state.nodes.filter(node=>node.bucket===bucket.id)}
                                                    missing={this.state.missingClasses}
                                        />
                                    )}
                                </div>
                            
                        </div>
                    </DragDropContext>
                    {
                        this.state.isLoading?
                        <LoadingIndicator style={{width:"40vw", height:'80vh'}}/>:
                        <svg ref={this.tree} width={"40vw"} height={"80vh"} style={{flex:1}} className={style.graph}>
                            {arr}
                        </svg>
                    }
                </div>
                <InfoModal 
                    isOpen={this.state.modalIsOpen} 
                    closeModal={()=>this.setState({modalIsOpen:false})}
                    message={this.state.modalMessage}
                />
            </>
            )
    }
}

ClassSelect.contextType = UserContext;

const grid = 8;

function BucketItem({bucket,items, isDropDisabled, missing}){
    const getStyle = (isDraggingOver,isMissing) => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
        padding: grid,
        margin:grid,
        flex: 1,
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
                    <ClassList items={items} missing={missing}/>
                    {provided.placeholder}
                </div>
            }
        </Droppable>
    )
}

const ClassList = React.memo(function ClassList({items, missing}){
    return items.map((item,index)=>
        <ClassItem item={item} index={index} key={item.id} missing={missing}/>
    )
})

function ClassItem({item, index, missing}){
    missing = missing.some(e=>e.id===item.id)
    const getStyle= (isDragging, draggableStyle, isMissing) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: grid,
        margin: `0 0 ${grid}px 0`,
    
        // change background colour if dragging
        background: isDragging ? 'lightgreen' : (isMissing?'red':'grey'),
    
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