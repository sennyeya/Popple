import React from 'react'
import {Droppable, Draggable, DragDropContext} from 'react-beautiful-dnd'
import {LoadingIndicator} from '../shared/Loading';
import {InfoModal} from './ClassModal';
import {Collapse} from 'react-collapse';
import {BiCaretDown, BiCaretRight, BiError} from 'react-icons/bi';
import {BsGearFill, BsList, BsListNested} from 'react-icons/bs';
import style from './ClassBuckets.module.css';
import {Form} from 'react-bootstrap';

const PRIMARY_BUCKET = "req-group:";
const grid = 8;

export default function ClassBuckets({API, setSelected, openClassModal}){
    const [loading, setLoading]  = React.useState(true)
    const [nodes, setNodes] = React.useState([])
    const [buckets, setBuckets] = React.useState([]);
    const [missingClasses, setMissingClasses] = React.useState([])
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [modalMessage, setModalMessage] = React.useState("");
    const [areAllOpen, setAllOpen] = React.useState(true);
    
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
        setNodes(array)

        API.post(`/student/bucket/move`, {
                    id:filteredArr[sourceIndex].id,
                    from:source,
                    to:destination
                })
    };

    const removeDependents = (dependents)=>{
        for(let element of dependents){
            let mainBucket = element.originalBucket
            move(
                element.bucket, 
                element.originalBucket, 
                nodes.filter(e=>e.bucket===element.bucket).indexOf(element), 
                dependents.filter(e=>e.bucket===mainBucket).length
            )
        }
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

    const getClassesWithMissingDependencies = (nodes, futureNodes) =>{
        let retVal = [];
        for(let elem of nodes){
            if(!elem.children.every(e=>futureNodes.some(f=>f.id===e))){
                retVal.push(elem)
            }
        }
        return retVal
    }

    const onDragEnd = ({ source, destination }) => {
        // dropped outside the list
        if (!destination) {
            return;
        }

        let currentNode = nodes.filter(e=>e.bucket===source.droppableId)[source.index];
        var futureBuckets = buckets.filter(e=>!isPrimary(e));
        var dependents = getDependents(currentNode, nodes.filter(e=>futureBuckets.some(f=>f.id===e.bucket)));

        if(dependents.length>0 && 
            source.droppableId !== destination.droppableId && 
            !isPrimary(buckets.filter(e=>e.id===source.droppableId)[0])){
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

    const isPrimary = (bucket) => {
        return bucket.label.indexOf(PRIMARY_BUCKET)>-1
    }

    const onClassClick = React.useCallback((id)=>{
        setSelected(id)
        openClassModal()
    }, [setSelected, openClassModal])

    React.useEffect(()=>{
        if(loading){
            API.get("/student/bucket/items").then(json=>{
                setNodes(json)
                API.get("/student/bucket/buckets").then(json=>{
                        setBuckets(json.map((e,index)=>{
                            return {id:e.id, label:e.label, index}
                        }))
                        setLoading(false)
                })
            })
        }
    }, [API,loading])

    React.useEffect(()=>{
        if(!buckets||!buckets.length){
            return;
        }
        var futureBuckets = buckets.filter(e=>!isPrimary(e));
        var primaryBucketItems = nodes.filter(e=>
            buckets.filter(f=>isPrimary(f))
                    .some(f=>f.id===e.bucket)
        )
        setMissingClasses(getClassesWithMissingDependencies(primaryBucketItems, nodes.filter(e=>futureBuckets.some(f=>f.id===e.bucket))));
    }, [nodes, buckets])

    const bucketItems = React.useMemo(()=>{
        return buckets.map(bucket=>{
            return {
                items: nodes.filter(node=>node.bucket===bucket.id).map(e=>{
                    return {
                        ...e, 
                        children:e.children.map(c=>nodes.filter(f=>f.id===c)[0])
                    }}
                ),
                bucket: bucket
            }
        })
    }, [buckets, nodes])

    const primaryBucket = React.useMemo(()=>{
        if(bucketItems.length){
            let bucketsAndItems = bucketItems.filter(e=>e.bucket.label.indexOf(PRIMARY_BUCKET)>-1);
            return <BucketSearchColumn bucketItems={bucketsAndItems}
                        missing={missingClasses}
                        populatedBuckets={nodes.filter(e=>buckets.filter(f=>f.id!==e.bucket&&!isPrimary(f)))} 
                        onClassClick={onClassClick}
                    />
        }
    }, [bucketItems, missingClasses, onClassClick, nodes, buckets]);

    const otherBuckets = React.useMemo(()=>{
        return bucketItems.filter(e=>e.bucket.label.indexOf(PRIMARY_BUCKET)===-1).map(({bucket, items})=>
            <>
                <BucketItem bucket={bucket} 
                            key={`bucket-item-${bucket.id}`}
                            items={items}
                            missing={missingClasses}
                            onClassClick={onClassClick}
                            collapseOpen={areAllOpen}
                />
                <hr/>
            </>
        )
    }, [bucketItems, missingClasses, areAllOpen, onClassClick])

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
                            <hr/>
                            {primaryBucket}
                        </div>
                        <div style={{
                            flex:"1", 
                            display:"flex", 
                            justifyContent: "start", 
                            flexWrap:"wrap", 
                            alignItems: "center",
                            padding:"5px"
                        }}>
                            <h3 style={{width:"100%", paddingLeft:"10px"}}>
                                Your Plan
                                <div style={{float:"right", margin:"auto 0"}}>
                                    <a title={areAllOpen?"Close All":"Open All"}>
                                        {
                                            areAllOpen?
                                            <BsList style={{width:"20px", height:"20px", margin:"2px"}} onClick={()=>setAllOpen(!areAllOpen)}/>:
                                            <BsListNested style={{width:"20px", height:"20px", margin:"2px"}} onClick={()=>setAllOpen(!areAllOpen)} title="Open All"/>
                                        }
                                    </a>
                                    <BsGearFill style={{width:"20px", height:"20px", margin:"2px"}}/>
                                </div>
                            </h3>
                            <hr/>
                            {otherBuckets}
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

function BucketSearchColumn({bucketItems, missing, onClassClick, populatedBuckets}){
    const [search, setSearch] = React.useState("")

    const bucketComponents = React.useMemo(()=>
        bucketItems.map(({bucket, items})=>
        {
            let filtered = items.filter(e=>!search || e.label.toLowerCase().indexOf(search.toLowerCase())>-1);
            if(!filtered.length && search){
                return <></>
            }
            return (
                <>
                    <BucketItem bucket={{...bucket, label:bucket.label.substring(bucket.label.indexOf(PRIMARY_BUCKET)+PRIMARY_BUCKET.length +1)}} 
                        items={filtered}
                        missing={missing}
                        bucketMessage={search?"No classes match that search.":"No classes left to plan!"}
                        populatedBuckets={populatedBuckets}
                        onClassClick={onClassClick}/>
                        <hr/>
                </>
            )
        }
        )
    , [bucketItems, missing, onClassClick, populatedBuckets, search])

    return (
        <>
            <div style={{padding:"5px", width:"90%", margin:"0 auto"}}>
                <Form.Control
                    type="text"
                    placeholder="Search"
                    name="search"
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                />
            </div>
            <hr/>
            {bucketComponents}
        </>
    )
}

function BucketItem({bucket,items, missing, onClassClick, populatedBuckets, collapseOpen, bucketMessage}){
    const [isCollapseOpen, setCollapseOpen] = React.useState(true);

    React.useEffect(()=>{
        setCollapseOpen(collapseOpen)
    }, [collapseOpen])

    React.useEffect(()=>{
        setCollapseOpen(true)
    }, [items])

    const getStyle = (isDraggingOver) => ({
        textAlign:'left',
        padding: `${grid} 0`,
        margin:`${grid} 0`,
        flex: 1,
        display:"block",
        flexBasis: "100%"
    });
    return (
        <Droppable droppableId={bucket.id} key={bucket.id}>
            {(provided, snapshot)=>
                <div
                    ref={provided.innerRef}
                    style={getStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                >
                    <h5 style={{'marginBlockStart':'.3em', 'marginInlineStart':'.3em', marginBlockEnd:".3em", marginInlineEnd:".3em"}}>{
                        isCollapseOpen?
                        <BiCaretDown onClick={(e)=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 1%"}}/>:
                        <BiCaretRight onClick={()=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 1%"}}/>
                    }{bucket.label}</h5>
                    <Collapse isOpened={isCollapseOpen||snapshot.isDraggingOver}>
                        <div style={{marginLeft:"25px", maxHeight:"80vh", overflowY:"auto", paddingRight:"3px"}}>
                        {
                            items.length||snapshot.isDraggingOver?
                            <ClassList items={items} missing={missing} onClassClick={onClassClick} populatedBuckets={populatedBuckets}/>:
                            <p>{bucketMessage||"Add some classes to this semester!"}</p>
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

    const isValid = React.useMemo(()=>{
        return populatedBuckets?item.children.every(e=>e&&populatedBuckets.some(f=>f&&f.id===e.id)):false
    }, [populatedBuckets, item])

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
                        isValid
                    )}
                    onClick={()=>onClassClick(item.id)}
                    title={isMissing?"This class is missing requirements.":(isValid?"This class can be added to your plan.":null)}
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