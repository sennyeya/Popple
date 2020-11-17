import React from 'react'
import {Droppable, Draggable, DragDropContext} from 'react-beautiful-dnd'
import {LoadingIndicator} from '../shared/Loading';
import {InfoModal} from './ClassModal';
import {Collapse} from 'react-collapse';
import {BiCaretDown, BiCaretRight, BiError} from 'react-icons/bi';
import style from './ClassBuckets.module.css'

const PRIMARY_BUCKET = "";
const grid = 8;

export default function ClassBuckets({API, setSelected, openClassModal}){
    const [loading, setLoading]  = React.useState(true)
    const [nodes, setNodes] = React.useState([])
    const [buckets, setBuckets] = React.useState([]);
    const [missingClasses, setMissingClasses] = React.useState([])
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [modalMessage, setModalMessage] = React.useState("");
    
    const reorder = (bucket, source, destination)=>{
        var array = [...nodes];
        var filteredArr = array.filter(e=>e.bucket===bucket)
        var startIndex = array.indexOf(filteredArr[source])
        var endIndex = array.indexOf(filteredArr[destination])
        const [removed] = array.splice(startIndex, 1);
        array.splice(endIndex, 0, removed);
        setNodes(array)
    };
    
    const move = (source, destination, sourceIndex, destinationIndex)=>{
        let array = [...nodes]
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
        let dependents = [...missingClasses];
        dependents = dependents.filter(e=>e.id!==filteredArr[sourceIndex].id);

        setMissingClasses(dependents)
        setNodes(array)

        API.post(`/student/bucket/move`, {
                    id:filteredArr[sourceIndex].id,
                    bucket:destination
                })
    };

    const removeDependents = (dependents)=>{
        for(let element of dependents){
            let mainBucket = buckets[0].id
            move(
                element.bucket, 
                mainBucket, 
                nodes.filter(e=>e.bucket===element.bucket).indexOf(element), 
                dependents.filter(e=>e.bucket===mainBucket).length
            )
        }
    }

    const getModalMissingMessage = (currentNode, filteredArr) => {
        var missingClasses = nodes.filter(node=>(currentNode.children.filter(e=>!filteredArr.some(f=>f.id===e))).some(child=>node.id===child))
        setMissingClasses(missingClasses)
        return `Class ${currentNode.label} is missing the following prerequisite(s): \n\t${missingClasses.map(e=>e.label).join(", ")}. 
                    Those prerequisites have been highlighted in red in your Required Courses. For more information on prerequisites, look at the Degree Path diagram.`
    }

    const getDependents = (node, arr) =>{
        let oldArr = [...arr]
        let depIds = [node.id.trim()]
        let retVal = []
        while(arr.length){
            let curr = arr.pop();
            if(depIds.some(e=>e===curr.id.trim())){
                continue;
            }
            if(curr.children.some(e=>depIds.indexOf(e.trim())>-1)){
                retVal.push(curr)
                depIds.push(curr.id);
                arr = [...oldArr];
            }
        }
        return retVal;
    }

    const getModalRequirementMessage = (currentNode, dependents) => {
        return `Class ${currentNode.label} has the following dependendents in other semesters: \n\t${dependents.map(e=>e.label).join(", ")}. Those classes have been removed from your plan.`
    }

    const onDragEnd = ({ source, destination }) => {
        let currentNode = nodes.filter(e=>e.bucket===source.droppableId)[source.index];
        var bucket = buckets.filter(e=>e.id===destination.droppableId)[0];
        var futureBuckets = buckets.filter(e=>e.index>bucket.index&&e.index!==0)
        var previousBuckets = buckets.filter(e=>e.index<bucket.index&&e.index!==0)
        var filteredArr = nodes.filter(e=>previousBuckets.some(f=>f.id===e.bucket))
        var dependents = getDependents(currentNode, nodes.filter(e=>futureBuckets.some(f=>f.id===e.bucket)))

        // dropped outside the list
        if (!destination) {
            return;
        }else if(bucket.index!==0 && !isDropEnabled(currentNode, filteredArr)){
            setModalMessage(getModalMissingMessage(currentNode, filteredArr))
            return setModalOpen(true)
        }else if(dependents.length>0 && source.droppableId !== destination.droppableId && source.droppableId!==buckets.filter(e=>e.label===PRIMARY_BUCKET).id){
            setModalMessage(getModalRequirementMessage(currentNode, dependents))
            setModalOpen(true)
            removeDependents(dependents);
        }

        if (source.droppableId === destination.droppableId) {
            reorder(
                source.droppableId,
                source.index,
                destination.index
            );
        } else {
            move(
                source.droppableId,
                destination.droppableId,
                source.index,
                destination.index
            );
        }
    };

    const isDropEnabled = (currentNode, filteredArr)=>{
        return currentNode.children.length?currentNode.children.every(e=>filteredArr.some(f=>f.id===e)):true;
    }

    const onClassClick = (id)=>{
        setSelected(id)
        openClassModal()
    }

    React.useEffect(()=>{
        if(loading){
            API.post("/student/bucket/items").then(json=>{
                setNodes(json.map(e=>{
                    return {id:e.id, label:e.label, bucket:e.bucket, children:e.children}
                }))
                API.post("/student/bucket/buckets").then(json=>{
                        setBuckets(json.map((e,index)=>{
                            return {id:e.id, label:e.label, index}
                        }))
                        setLoading(false)
                })
            })
        }
    }, [API,loading])

    if(loading){
        return <LoadingIndicator/>
    }

    return (
        <>
            <DragDropContext 
                onDragEnd={onDragEnd}
            >
                <div style={{
                        flex:"1", 
                        display:"flex", 
                        justifyContent: "start", 
                        flexWrap:"nowrap", 
                        alignContent: "flex-start"
                    }}>
                        <div style={{
                            flex:"1",
                            padding:"5px"
                        }}>
                            <h3 style={{width:"100%", paddingLeft:"10px"}}>Required Courses</h3>
                            {console.log(nodes.filter(node=>node.bucket===buckets[0].id).map(e=>{
                                            return {
                                                ...e, 
                                                children:e.children.forEach(c=>nodes.filter(f=>f.id===c)[0]?console.log(nodes.filter(f=>f.id===c)[0]):console.log(c))
                                            }}))}
                            <BucketItem bucket={buckets[0]} 
                                        items={nodes.filter(node=>node.bucket===buckets[0].id).map(e=>{
                                            return {
                                                ...e, 
                                                children:e.children.map(c=>nodes.filter(f=>f.id===c)[0])
                                            }})}
                                        missing={missingClasses}
                                        populatedBuckets={nodes.filter(e=>buckets.filter(f=>f.id===e.bucket)[0].index>0)} 
                                        onClassClick={onClassClick}
                                        isPrimary
                            />
                        </div>
                        <div style={{
                            flex:"1", 
                            display:"flex", 
                            justifyContent: "start", 
                            flexWrap:"wrap", 
                            alignItems: "center",
                            padding:"5px"
                        }}>
                            <h3 style={{width:"100%", paddingLeft:"10px"}}>Your Plan</h3>
                            {buckets.filter(e=>e.label!==PRIMARY_BUCKET).map((bucket)=>
                                <BucketItem bucket={bucket} 
                                            key={`bucket-item-${bucket.id}`}
                                            items={nodes.filter(node=>node.bucket===bucket.id).map(e=>{
                                                return {
                                                    ...e, 
                                                    children:e.children.map(c=>nodes.filter(f=>f.id===c)[0])
                                                }})}
                                            missing={missingClasses}
                                            onClassClick={onClassClick}
                                />
                            )}
                        </div>
                    
                </div>
            </DragDropContext>
            <InfoModal 
                    title={"Alert"}
                    isOpen={isModalOpen} 
                    closeModal={()=>setModalOpen(false)}
                    message={modalMessage}
                />
        </>
    )
}

function BucketItem({bucket,items, isDropDisabled, missing, onClassClick, populatedBuckets, collapseOpen}){
    const [isCollapseOpen, setCollapseOpen] = React.useState(true);

    React.useEffect(()=>{
        setCollapseOpen(collapseOpen)
    }, [collapseOpen])

    React.useEffect(()=>{
        setCollapseOpen(true)
    }, [items])

    const getStyle = (isDraggingOver) => ({
        borderTop:"1px solid #003366",
        textAlign:'left',
        padding: `${grid} 0`,
        margin:`${grid} 0`,
        flex: 1,
        display:"block",
        flexBasis: "100%"
    });
    return (
        <Droppable droppableId={bucket.id} key={bucket.id} isDropDisabled={isDropDisabled}>
            {(provided, snapshot)=>
                <div
                    ref={provided.innerRef}
                    style={getStyle(snapshot.isDraggingOver && !isDropDisabled)}
                    {...provided.droppableProps}
                >
                    {console.log(items)}
                    <h5 style={{'marginBlockStart':'.3em', 'marginInlineStart':'.3em', marginBlockEnd:".3em", marginInlineEnd:".3em"}}>{
                        isCollapseOpen?
                        <BiCaretDown onClick={(e)=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 1%"}}/>:
                        <BiCaretRight onClick={()=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 1%"}}/>
                    }{bucket.label}</h5>
                    <Collapse isOpened={isCollapseOpen||snapshot.isDraggingOver}>
                        <div style={{marginLeft:"25px"}}>
                        {
                            items.length||snapshot.isDraggingOver?
                            <ClassList items={items} missing={missing} onClassClick={onClassClick} populatedBuckets={populatedBuckets}/>:
                            <p>{bucket.label===PRIMARY_BUCKET?"No classes left to plan!":"Add some classes to this semester!"}</p>
                        }
                        </div>
                    </Collapse>
                    {provided.placeholder}
                </div>
            }
        </Droppable>
    )
}

const ClassList = React.memo(function ClassList({items, missing, onClassClick, populatedBuckets}){
    return items.map((item,index)=>
        <ClassItem item={item} index={index} key={item.id} isMissing={missing.some(e=>e.id===item.id)} onClassClick={onClassClick} populatedBuckets={populatedBuckets}/>
    )
})

function ClassItem({item, index, isMissing, onClassClick, populatedBuckets}){
    const getStyle= (isDragging, draggableStyle, missing, isValid) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        margin: `0 0 ${grid}px 0`,
        borderRadius:"3px",
        background:"white",
        textAlign:"left",
        padding:"10px",
        // change background colour if dragging
        border: `1px solid ${isDragging ? '#82d6e0' : (missing?'darkred':(isValid?'green':'#bbb'))}`,
        color:missing?'darkred':(isValid?'green':'black'),
        // styles we need to apply on draggables
        ...draggableStyle
    });

    return (
        <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isMissing}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style,
                        isMissing,
                        populatedBuckets?item.children.every(e=>e&&populatedBuckets.some(f=>f&&f.id===e.id)):false
                    )}
                    onClick={()=>onClassClick(item.id)}
                >
                    <span>
                        {item.label}
                    </span>
                    {isMissing?<BiError style={{float:"right"}}/>:<></>}
                    <br/>
                    {item.children.length?<span>Requires {item.children.map(e=>e.label).join(",")}</span>:""}
                </div>
            )}
        </Draggable>
    )
}