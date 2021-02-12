import React from 'react'
import {Droppable, Draggable, DragDropContext} from 'react-beautiful-dnd'
import {LoadingIndicator} from '../shared/Loading';
import {InfoModal} from './ClassModal';
import {Collapse} from 'react-collapse';
import {BiCaretDown, BiCaretRight, BiError} from 'react-icons/bi';
import {BsGearFill,  BsCheck, BsArrowsCollapse, BsArrowsExpand} from 'react-icons/bs';
import style from './ClassBuckets.module.css';
import {Form} from 'react-bootstrap';
import Tooltip from '@material-ui/core/Tooltip';
import Highlight from 'react-highlighter';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

const PRIMARY_BUCKET = "req-group:";
const grid = 8;
const scrollStyle = {maxHeight:"70vh", overflowY:"auto"}

export default function ClassBuckets({API, setSelected, openClassModal, setGraphNodes}){
    const [loading, setLoading]  = React.useState(true)
    const [nodes, setNodes] = React.useState([])
    const [buckets, setBuckets] = React.useState([]);
    const [missingClasses, setMissingClasses] = React.useState([])
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [modalMessage, setModalMessage] = React.useState("");
    const [arePlanAllOpen, setPlanAllOpen] = React.useState(true);
    const [areRequiredCoursesAllOpen, setRequiredCoursesAllOpen] = React.useState(true);
    
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
        let depIds = [node.classId]
        let retVal = []
        while(arr.length){
            let curr = arr.pop();
            if(depIds.some(e=>e===curr.classId)){
                continue;
            }
            if(curr.children.some(e=>depIds.indexOf(e)>-1)){
                retVal.push(curr)
                depIds.push(curr.classId);
                arr = [...oldArr];
            }
        }
        return retVal;
    }

    const getModalRequirementMessage = (currentNode, dependents) => {
        return (<div>
            <p>Class {currentNode.label} has the following dependendencies in later semesters: </p>
            <ul>
                {dependents.map(e=>{
                    return <li>{e.label}</li>
                })}
            </ul> 
            <p>Those classes have been removed from your plan.</p>
        </div>
        )
    }

    const getClassesWithMissingDependencies = (nodes, futureNodes) =>{
        let retVal = [];
        for(let elem of nodes){
            if(!elem.children.every(e=>futureNodes.some(f=>f.classId===e))){
                retVal.push(elem)
            }
        }
        return retVal
    }

    const isDropEnabled = (currentNode, filteredArr)=>{
        return currentNode.children.length?currentNode.children.every(e=>filteredArr.some(f=>f.classId===e)):true;
    }

    const getModalMissingMessage = (currentNode, filteredArr) => {
        let missing = missingClasses.filter(e=>currentNode.children.some(f=>f.classId===e.classId));
        return (<div>
            <p>Class {currentNode.label} is missing the following prerequisite(s):</p>
            <ul>
                {missing.map(e=>{
                    return <li>{e.label}</li>
                })}
            </ul>
        </div>
        )
    }

    const onDragEnd = ({ source, destination }) => {
        // dropped outside the list
        if (!destination) {
            return;
        }

        let currentNode = nodes.filter(e=>e.bucket===source.droppableId)[source.index];
        let currentBucket = buckets.filter(e=>e.id===destination.droppableId)[0]
        var futureBuckets = buckets.filter(e=>!isPrimary(e)&&e.index>currentBucket.index);
        var previousBuckets = buckets.filter(e=>e.index<currentBucket.index&&!isPrimary(e))
        var filteredArr = nodes.filter(e=>previousBuckets.some(f=>f.id===e.bucket))
        var dependents = getDependents(currentNode, nodes.filter(e=>futureBuckets.some(f=>f.id===e.bucket)));

        if(dependents.length>0 && 
            source.droppableId !== destination.droppableId && 
            !isPrimary(buckets.filter(e=>e.id===source.droppableId)[0])){
            setModalMessage(getModalRequirementMessage(currentNode, dependents))
            setModalOpen(true)
            removeDependents(dependents);
        }
        if(isPrimary(currentBucket)&&currentBucket.id!==currentNode.originalBucket){
            setModalMessage("This class belongs to another requirement group. Moving it there now.")
            setModalOpen(true);
            destination.droppableId = currentNode.originalBucket
        }
        if(!isPrimary(currentBucket) && !isDropEnabled(currentNode, filteredArr)){
            setModalMessage(getModalMissingMessage(currentNode, filteredArr))
            setModalOpen(true);
            destination.droppableId = currentNode.originalBucket
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
        return bucket?bucket.label.indexOf(PRIMARY_BUCKET)>-1:false
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

    React.useEffect(()=>{
        if(!nodes||!nodes.length||!buckets){
            return;
        }
        let nodesArr = [...nodes];
        for(let node of nodesArr){
            if(missingClasses.some(e=>e.classId===node.classId)){
                node.isMissing = true;
                node.isValid = false;
            }else if(isPrimary(buckets.filter(e=>e.id===node.bucket)[0])){
                node.isMissing = false;
                node.isValid = true;
            }else{
                node.isMissing = false;
                node.isValid = false;
            }
        }
        setGraphNodes(nodesArr)
    }, [nodes, missingClasses, buckets])

    const bucketItems = React.useMemo(()=>{
        return buckets.map(bucket=>{
            return {
                items: nodes.filter(node=>node.bucket===bucket.id).map(e=>{
                    return {
                        ...e, 
                        children:e.children.map(c=>nodes.filter(f=>f.classId===c)[0])
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
                        collapseOpen={areRequiredCoursesAllOpen}
                    />
        }
    }, [bucketItems, missingClasses, onClassClick, nodes, buckets, areRequiredCoursesAllOpen]);

    const otherBuckets = React.useMemo(()=>{
        return (<div style={{...scrollStyle, width:"100%"}}>
            {bucketItems.filter(e=>e.bucket.label.indexOf(PRIMARY_BUCKET)===-1).map(({bucket, items})=>
                <>
                    <BucketItem bucket={bucket} 
                                key={`bucket-item-${bucket.id}`}
                                items={items}
                                missing={missingClasses}
                                onClassClick={onClassClick}
                                collapseOpen={arePlanAllOpen}
                    />
                    <hr/>
                </>
            )}
        </div>)
    }, [bucketItems, missingClasses, arePlanAllOpen, onClassClick])

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
                            <h3 style={{width:"100%"}}>
                                <Tooltip arrow placement="bottom" title={areRequiredCoursesAllOpen?"Close All":"Open All"}>
                                    <span style={{cursor:"pointer", display:"inline", padding:"0 5px"}}>
                                        {
                                            areRequiredCoursesAllOpen?
                                            <BsArrowsCollapse style={{width:"20px", height:"20px"}} onClick={()=>setRequiredCoursesAllOpen(!areRequiredCoursesAllOpen)}/>:
                                            <BsArrowsExpand style={{width:"20px", height:"20px"}} onClick={()=>setRequiredCoursesAllOpen(!areRequiredCoursesAllOpen)}/>
                                        }
                                    </span>
                                </Tooltip>
                                Required Courses</h3>
                            <hr/>
                            {primaryBucket}
                        </div>
                        <div style={{
                            flex:"1", 
                            display:"flex", 
                            justifyContent: "start", 
                            flexWrap:"wrap", 
                            alignContent:'flex-start',
                            padding:"5px",
                            width:"100%"
                        }}>
                            <h3 style={{width:"100%"}}>
                                <Tooltip arrow placement="bottom" title={arePlanAllOpen?"Close All":"Open All"}>
                                    <span style={{cursor:"pointer", display:"inline", padding:"0 5px"}}>
                                        {
                                            arePlanAllOpen?
                                            <BsArrowsCollapse style={{width:"20px", height:"20px", margin:"2px"}} onClick={()=>setPlanAllOpen(!arePlanAllOpen)}/>:
                                            <BsArrowsExpand style={{width:"20px", height:"20px", margin:"2px"}} onClick={()=>setPlanAllOpen(!arePlanAllOpen)}/>
                                        }
                                    </span>
                                </Tooltip>
                                Your Plan
                                <div style={{float:"right", margin:"auto 0"}}>
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
                    closeModal={()=>setModalOpen(false)}>
                {modalMessage}
            </InfoModal>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      height:'40px'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 5,
    }
  }));

function BucketSearchColumn({bucketItems, missing, onClassClick, populatedBuckets, collapseOpen}){
    const [search, setSearch] = React.useState("");

    const classes = useStyles();

    let filtered = React.useMemo(()=>
        bucketItems.map(({bucket, items})=>{
            return {
                bucket, 
                items: items.filter(
                                    e=>!search || 
                                    e.label.toLowerCase().indexOf(search.toLowerCase())>-1 || 
                                    bucket.label.toLowerCase().indexOf(search.toLowerCase())>-1
                                )
            }   
        }
    ), [search, bucketItems])

    const bucketComponents = React.useMemo(()=>{
        return filtered.map(({bucket, items})=>
        {
            if(!items.length && search){
                return <></>
            }
            return (
                <>
                    <BucketItem bucket={{...bucket, label:bucket.label.substring(bucket.label.indexOf(PRIMARY_BUCKET)+PRIMARY_BUCKET.length)}} 
                        items={items}
                        missing={missing}
                        bucketMessage={search?"No classes match that search.":"No classes left to plan!"}
                        populatedBuckets={populatedBuckets}
                        searchText={search}
                        collapseOpen={collapseOpen}
                        onClassClick={onClassClick}/>
                        <hr/>
                </>
            )
        }
    )}, [filtered, missing, onClassClick, populatedBuckets, search, collapseOpen]);

    return (
        <>
            <div style={{padding:"5px", width:"90%", margin:"0 auto"}}>
                <Paper component="form" className={classes.root}>
                    <InputBase
                        className={classes.input}
                        onChange={e=>setSearch(e.target.value)}
                        placeholder="Filter Classes"
                        inputProps={{ 'aria-label': 'filter classes' }}
                    />
                    <IconButton className={classes.iconButton} aria-label="filter">
                        <SearchIcon />
                    </IconButton>
                </Paper>
            </div>
            <hr/>
            <div style={scrollStyle}>
                {bucketComponents}
            </div>
        </>
    )
}

function BucketItem({bucket,items, missing, onClassClick, populatedBuckets, collapseOpen, bucketMessage, searchText}){
    const [isCollapseOpen, setCollapseOpen] = React.useState(true);

    const isCompletable = React.useMemo(()=>{
        return missing&&bucketMessage?items.some(e=>!missing.some(f=>e.classId===f.classId)):true
    }, [missing, items, bucketMessage])

    React.useEffect(()=>{
        if(items.length===0||!isCompletable){
            setCollapseOpen(false)
        }else{
            setCollapseOpen(collapseOpen)
        }
    }, [collapseOpen, items, isCompletable])

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
                    <div style={{display:"inline-flex", justifyContent:"flex-start", width:"100%"}}>        
                        {
                            isCollapseOpen?
                            <BiCaretDown onClick={()=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 2px", width:"20px"}}/>:
                            <BiCaretRight onClick={()=>setCollapseOpen(!isCollapseOpen)} style={{margin:"auto 0", padding:"0px 2px", width:"20px"}}/>
                        }  
                        <h5 style={{display:"flex", width:"100%",justifyContent:((!items.length&&bucketMessage)||!isCompletable)?"space-between":"flex-start"}}>
                            <Highlight search={searchText||""}  matchStyle={{padding:"0 0.1em", height: "1.15em", lineHeight: 1.15}}>
                                {bucket.label}
                            </Highlight>
                            {items.length&&!bucketMessage?<>({items.reduce((total, e)=>total+(+e.credits || 0), 0)})</>:<></>}
                            {
                                !items.length&&bucketMessage?
                                <Tooltip id={`tooltip-bucket-${bucket.id}`} arrow placement="top" title={"All classes for this group have been completed."}>
                                    <div style={{margin:"auto 0"}}>
                                        <BsCheck style={{color:"green"}}/>
                                    </div>
                                </Tooltip>:
                                <>
                                {
                                    isCompletable?
                                    <></>:
                                    <Tooltip id={`tooltip-bucket-${bucket.id}`} arrow placement="top" title={"No classes from this group can be taken currently."}>
                                        <div style={{margin:"auto 0"}}>
                                            <BiError style={{ color:"darkred"}}/>
                                        </div>
                                    </Tooltip>
                                }
                                </>
                            }
                        </h5>
                    </div>
                    <Collapse isOpened={isCollapseOpen||snapshot.isDraggingOver} initialStyle={{height: '0px', overflow: 'hidden'}}>
                        <div style={{marginLeft:"25px", paddingRight:"3px"}}>
                        {
                            items.length||snapshot.isDraggingOver?
                            <>
                                <ClassList items={items} missing={missing} onClassClick={onClassClick} populatedBuckets={populatedBuckets} searchText={searchText}/>
                            </>:
                            <p>{bucketMessage||"Add some classes to this semester!"}</p>
                        }
                        {provided.placeholder}
                        </div>
                    </Collapse>
                </div>
            }
        </Droppable>
    )
}

const ClassList = React.memo(function ClassList({items, missing, onClassClick, populatedBuckets, searchText}){
    return items.map((item,index)=>
        <ClassItem item={item} index={index} key={item.id} isMissing={missing.some(e=>e.id===item.id)} missing={missing} onClassClick={onClassClick} populatedBuckets={populatedBuckets} searchText={searchText}/>
    )
})

function ClassItem({item, index, isMissing, onClassClick, populatedBuckets, searchText, missing}){
    const getStyle= (isDragging, draggableStyle, missing, isValid) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        margin: `0 0 ${grid}px 0`,
        borderRadius:"3px",
        background:"white",
        textAlign:"left",
        padding:"10px",
        // change background colour if dragging
        border: `1px solid ${missing?'#8B0015':(isValid?'green':'#1E5288')}`,
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
                <Tooltip id={`tooltip-${item.id}`} arrow placement="top" title={
                    isMissing?
                    "This class is missing requirements. Click for more information.":(
                        isValid?
                        "This class can be added to your plan. Click for more information.":
                        "Click for more information."
                    )
                }>
                    
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
                        onClick={()=>onClassClick(item.classId)}
                    >
                        <Highlight search={searchText||""} className={style.className} matchStyle={{padding:"0 0.1em", height: "1.15em", lineHeight: 1.15}}>
                            {item.label}
                        </Highlight>
                        {isMissing?<BiError style={{float:"right"}}/>:<></>}
                        <br/>
                        {item.children.length&&isMissing?<span className={style.classRequirements}>Requires {item.children.map(e=>e.label).join(", ")}</span>:""}
                    </div>
                </Tooltip>
            )}
        </Draggable>
    )
}