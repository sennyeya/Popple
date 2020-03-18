import React from 'react';
import Loading from '../shared/Loading'
import {config, authOptionsPost} from './config';
import style from './LandingPage.module.css';
import mainStyle from '../Main.module.css'
import PlanQuestionnaire from './PlanQuestionnaire';
import {UserContext} from '../contexts/userContext'
import {getBucket} from './BucketItem'
import rd3 from 'react-d3-library';
import * as d3 from 'd3'
const RD3Component = rd3.Component;

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
            const values = [
                {label:"Test", className:"CSC11", bucket:1},
                {label:"Test2", className:"CSC11", bucket:1},
                {label:"Test3", className:"CSC11", bucket:1},
                {label:"Test", className:"CSC11", bucket:2},
                {label:"Test2", className:"CSC11", bucket:2},
                {label:"Test3", className:"CSC11", bucket:2},
                {label:"Test", className:"CSC11", bucket:3}
            ]
            return(
                <div className={mainStyle.container}>
                    {this.state.isLoading?<Loading/>:(
                        <>
                        <ClassSelect data={values} tree={this.state.treeData}/>
                        </>
                    )}
                </div>
            )
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
                return {radius:20, id:id, label:e.label, bucket:e.bucket, index:id}
            }),
            buckets: this.props.data.reduce((unique, item)=>unique.some(e=>e.bucket===item.bucket)?unique:[...unique, item], []).map(e=>{
                return {height: 200, width: 400, id:e.bucket}
            }),
            data: props.tree,
            levels:{}
        }

        this.state.buckets.map(e=>{
            this.state.nodes.filter(f=>f.bucket===e.id).map((f,i)=>{
                f.ranking = i;
            })
        })

        this.dragHandler = null;

        this.svg = React.createRef();
        this.tree = React.createRef();
    }

    componentDidMount(){
        const svg = d3.select(this.svg.current)

        // Test against svg bounding client rect for out of bounds stuff.

        // Get the distance from each corner of each corner of the other box and return the smallest as the distance.
        const getDistance = function(elem1, elem2){
            let arr = [];
            arr[0] = Math.pow((elem1.x1-elem2.x2)*(elem1.x1-elem2.x2)+(elem1.y1-elem2.y2)*(elem1.y1-elem2.y2), 1/2); // elem1 x1 -> elem2 x2, elem1 y1 -> elem2 y2
            arr[3] = Math.pow((elem1.x1-elem2.x2)*(elem1.x1-elem2.x2)+(elem1.y2-elem2.y2)*(elem1.y2-elem2.y2), 1/2);
            arr[4] = Math.pow((elem1.x1-elem2.x2)*(elem1.x1-elem2.x2)+(elem1.y1-elem2.y1)*(elem1.y1-elem2.y1), 1/2);

            arr[1] = Math.pow((elem1.x1-elem2.x1)*(elem1.x1-elem2.x1)+(elem1.y1-elem2.y2)*(elem1.y1-elem2.y2), 1/2);
            arr[5] = Math.pow((elem1.x1-elem2.x1)*(elem1.x1-elem2.x1)+(elem1.y2-elem2.y2)*(elem1.y2-elem2.y2), 1/2);
            arr[6] = Math.pow((elem1.x1-elem2.x1)*(elem1.x1-elem2.x1)+(elem1.y1-elem2.y1)*(elem1.y1-elem2.y1), 1/2);

            arr[2] = Math.pow((elem1.x2-elem2.x2)*(elem1.x2-elem2.x2)+(elem1.y1-elem2.y2)*(elem1.y1-elem2.y2), 1/2);
            arr[7] = Math.pow((elem1.x2-elem2.x2)*(elem1.x2-elem2.x2)+(elem1.y2-elem2.y2)*(elem1.y2-elem2.y2), 1/2);
            arr[8] = Math.pow((elem1.x2-elem2.x2)*(elem1.x2-elem2.x2)+(elem1.y1-elem2.y1)*(elem1.y1-elem2.y1), 1/2);
            return Math.min(...arr)
        }

        // Return the closest node's bounding rectangle.
        const getClosestBoundingRect = function(elem){
            return getBoundingRect(getClosestNode(elem))
        }

        const getId = function(elem){
            return +(elem.attr("id").substring(elem.attr("id").indexOf("bucketItem")+10).trim())
        }

        /** Get the closest node to the current node.
         *   @param elem d3 selected node.
         * @returns {Element} d3 node
         */
        const getClosestNode = function(elem){
            let nodes = svg.selectAll(".bucketItem:not(.dragging)").nodes();
            let min = 0;
            let i =0;
            let minVal = Number.MAX_VALUE;
            for(let node of nodes){
                // Get the distance between both bounding rectangles.
                let distance = getDistance(getBoundingRect(node), getBoundingRect(elem.node()));

                // Simple min val.
                if(distance<minVal){
                    min = i;
                    minVal = distance;
                }
                i++;
            }
            return nodes[min]
        }

        /** Return the bounding rectangle for an element, extracted from its client bounding rect.
         *   @param elem d3 selected node.
         * @returns {Object} x1- left side
         *                   x2- right side
         *                   y1- top
         *                   y2 - bottom
         */
        const getBoundingRect = function(elem){
            return {x1:elem.getBoundingClientRect().x-20, x2:elem.getBoundingClientRect().x+20, y1:elem.getBoundingClientRect().y-20, y2:elem.getBoundingClientRect().y+20}
        }

        /** 
         * Return the outside bucket position, its svg translate position.
         *   @param elem d3 selected node.
         * @returns {Object} x-x position of bucket
         *                   y-y position of bucket
         */
        var getBucketPos = function(elem){
            let transform = svg.select("#bucket"+elem.bucket).attr("transform");
            let x = +(transform.substring(transform.indexOf("(")+1, transform.indexOf(",")).trim())
            let y = +(transform.substring(transform.indexOf(",")+1, transform.indexOf(")")).trim());
            return {x:x, y:y}
        }

        /**
         * Checks if the element has collided with another box.
         * @param {Selection} elem 
         * @returns {Boolean}
         */
        const hasCollided = function(elem){
            let curr = getBoundingRect(elem.node())
            let other = getClosestBoundingRect(elem)
            let c1 = (curr.x1<=other.x2&&curr.y2<=other.y1&&curr.x2>=other.x2); // Top Right
            let c2 = (curr.x2>=other.x1&&curr.y2<=other.y1&&curr.x1<=other.x1); // Top Left
            let c3 = (curr.x2>=other.x1&&curr.y1<=other.y2&&curr.x1<=other.x1); // Bottom Left
            let c4 = (curr.x1<=other.x2 && curr.y1<=other.y2&&curr.x2>=other.x2); // Bottom Right
            return c1 || c2 || c3 || c4;
        }

        /**
         * Shifts the closest element based on the rankings of the elements.
         * Graphical move right or move left.
         * @param {Selection} elem 
         */
        var shift = function(elem){
            let closest = d3.select(getClosestNode(elem))
            let closestData = this.state.nodes.filter(e=>e.id===getId(closest))[0]
            let elemData = this.state.nodes.filter(e=>e.id===getId(elem))[0]
            let currBucketItems = this.state.nodes.filter(e=>e.bucket===getCurrentBucket(elem))

            // Check against ranking, switch right if elemData < closestData.
            if(closestData.ranking>elemData.ranking){
                elemData.ranking = closestData.ranking+.5;
            }else{ // switch left if elemData > closestData.
                elemData.ranking = closestData.ranking-.5;
            }
            originalBox = getBoundingRect(closest.node());

            console.log({elemData, closestData})

            // Normalize the rankings.
            let i =0;
            for(let datum of currBucketItems.sort((a,b)=>a.ranking-b.ranking)){
                datum.ranking = i;
                i++;
            }

            svg.selectAll(".bucketItem:not(.dragging)")
                .attr("transform", d=>{
                    return (`translate(
                        ${getBucketPos(d).x+(this.state.buckets.filter(
                            e=>e.id===d.bucket)[0].width/5
                            )*((d.ranking)%5) + this.state.buckets.filter(e=>e.id===d.bucket)[0].width/10}
                        , 
                        ${getBucketPos(d).y+(this.state.buckets.filter(
                            e=>e.id===d.bucket)[0].height/5
                            )*(Math.floor(d.ranking/5))})`
                    )})
        }

        // For access to this.state
        shift = shift.bind(this)

        /**
         * Keep reference to original box for removal shift effect.
         * @type {Object}
         */
        var originalBox = {};

        /**
         * Has the element exited its original box area.
         * @type {Boolean}
         */
        var isExited = false;

        /**
         * Reference to id for use with checking different elements as they are dragged. Single element drag.
         * @type {String}
         */
        var elemId = "";

        /**
         * Check if the elem has left its original area
         * @param {Object} originalBox global variable, reference to old location.
         * @param {Selection} elem 
         * @returns {Boolean}
         */
        const hasExited = function(elem){
            let curr = getBoundingRect(elem.node())
            let other = originalBox

            // Has the element moved back inside of its original bounding box.
            let c1 = (curr.x1<=other.x2&&curr.y2<=other.y1&&curr.x2>=other.x2); // Top Right
            let c2 = (curr.x2>=other.x1&&curr.y2<=other.y1&&curr.x1<=other.x1); // Top Left
            let c3 = (curr.x2>=other.x1&&curr.y1<=other.y2&&curr.x1<=other.x1); // Bottom Left
            let c4 = (curr.x1<=other.x2 && curr.y1<=other.y2&&curr.x2>=other.x2); // Bottom Right
            //console.log({c1, c2, c3, c4})
            let isReentered = c1||c2||c3||c4
            if(isReentered){
                isExited = false;
            }
            if(isExited&&getId(elem)===elemId){
                return false;
            }
            
            // Has the element moved outside of its original bounding box.
            c1 = (curr.x1<other.x1&&curr.x2<other.x1); // Right
            c2 = (curr.x2>other.x2&&curr.x1>other.x2); // Left
            c3 = (curr.y1>other.y2&&curr.y2>other.y2); // Bottom
            c4 = (curr.y1<other.y1&&curr.y2<other.y1); // Top

            isExited = c1||c2||c3||c4
            return isExited;
        }

        /**
         * This is the graphical reverse shift that appears when the element is removed from its original position. Think vacuum.
         * @param {Selection} elem The dragging element
         * @param {Number} bucket The bucket that the element is in.
         */
        var unshift = function(elem, bucket){
            let elemData = this.state.nodes.filter(e=>e.id===getId(elem))[0]
            let nodes = this.state.nodes.filter(e=>e.bucket===bucket)

            // Shift all elements ahead of this element.
            for(let datum of nodes){
                if(datum.id===elemData.id){
                    continue;
                }
                if(datum.ranking>elemData.ranking){
                    datum.ranking--;
                }
            }

            svg.selectAll(".bucketItem:not(.dragging)")
                .attr("transform", d=>{
                    return (`translate(
                        ${getBucketPos(d).x+(this.state.buckets.filter(
                            e=>e.id===d.bucket)[0].width/5
                            )*((d.ranking)%5) + this.state.buckets.filter(e=>e.id===d.bucket)[0].width/10}
                        , 
                        ${getBucketPos(d).y+(this.state.buckets.filter(
                            e=>e.id===d.bucket)[0].height/5
                            )*(Math.floor(d.ranking/5))})`
                    )})

            // Send elem to back.
            elemData.ranking = (nodes.length)? (nodes.length-1):0;
        }

        /**
         * Returns the id of the elements current bucket.
         * @param {Selection} elem 
         * @returns {Number} id of bucket or -1 if none
         */
        var getCurrentBucket = function(elem){
            for(let bucket of this.state.buckets){
                if(isInBucket(elem, bucket)){
                    return bucket.id;
                }
            }
            return -1;
        }

        /**
         * Is the element in the passed in bucket.
         * @param {Selection} elem 
         * @param {Number} bucket 
         * @returns {boolean}
         */
        var isInBucket = function(elem, bucket){
            let transform = svg.select("#bucket"+bucket.id).attr("transform");
            let x = +(transform.substring(transform.indexOf("(")+1, transform.indexOf(",")).trim())
            let y = +(transform.substring(transform.indexOf(",")+1, transform.indexOf(")")).trim());
            transform = elem.attr("transform");
            let elemX = +(transform.substring(transform.indexOf("(")+1, transform.indexOf(",")).trim())
            let elemY = +(transform.substring(transform.indexOf(",")+1, transform.indexOf(")")).trim());
            let curr = {x1:elemX, x2:elemX+40, y1:elemY, y2:elemY+40};
            let other = {x1:x, x2:x+bucket.width, y1:y, y2:y+bucket.height}
            let c1 = (curr.x2<=other.x2&&curr.x1>=other.x1&&curr.y2<=other.y2&&curr.y1>=other.y1);
            return c1
        }

        getCurrentBucket = getCurrentBucket.bind(this)

        unshift = unshift.bind(this);

        /**
         * The drag change in X.
         * @type {Number}
         */
        var deltaX = 0;

        /**
         * The drag change in Y.
         * @type {Number}
         */
        var deltaY = 0;

        let state = this.state;

        /**
         * Store the previous bucket id
         * @type {Number}
         */
        var prevBucket;

        this.dragHandler = d3.drag()

        // Set defaults when the drag starts.
        .on("start", function () {
            var current = d3.select(this);
            isExited = false;
            prevBucket = state.nodes.filter(e=>getId(d3.select(this))===e.id)[0].bucket;
            originalBox = getBoundingRect(current.node());
            elemId = getId(current)
            
            let transform = current.attr("transform");
            current.classed("dragging", true)
            let x = +(transform.substring(transform.indexOf("(")+1,transform.indexOf(",")).trim())
            let y = +(transform.substring(transform.indexOf(",")+1,transform.indexOf(")")).trim())
            deltaX = x - d3.event.x;
            deltaY = y - d3.event.y;
        })

        // Called each time the element is moved while being clicked.
        .on("drag", function(){
            let item = d3.select(this);
            let itemData = state.nodes.filter(e=>e.id===getId(item))[0]

            // Check if the element has changed buckets.
            let currBucket = getCurrentBucket(item);
            if(currBucket!==prevBucket && currBucket>=0){
                // Turn off all other buckets.
                for(let i in svg.selectAll(".bucket").nodes()){
                    item.classed("bucket"+(+i+1), false)
                }
                // Set current bucket.
                item.classed("bucket"+currBucket, true)

                // Set to end of new bucket.
                let bucketNodes = svg.selectAll(".bucketItem.bucket"+currBucket).nodes()
                itemData.ranking = bucketNodes.length? (bucketNodes.length-1): 0;

                itemData.bucket = currBucket;
                // Reset old bucket.
                let nodes = state.nodes.filter(e=>e.bucket===prevBucket)

                // Normalize rankings.
                let i =0;
                for(let node of nodes){
                    node.ranking = i;
                    i++
                }

                svg.selectAll(".bucketItem.bucket"+currBucket)
                    .attr("transform", d=>{
                        return (`translate(
                            ${getBucketPos(d).x+(state.buckets.filter(
                                e=>e.id===d.bucket)[0].width/5
                                )*((d.ranking)%5) + state.buckets.filter(e=>e.id===d.bucket)[0].width/10}
                            , 
                            ${getBucketPos(d).y+(state.buckets.filter(
                                e=>e.id===d.bucket)[0].height/5
                                )*(Math.floor(d.ranking/5))})`
                        )})

                prevBucket = currBucket
            }
            // Check if the element has exited its original box. This must be in else if with collision detection to prevent no op.
            if(hasExited(item)){
                // If so, move all elements to fill its vacuum.
                unshift(item, currBucket);
            }
            // Check if the box has collided with another box.
            else if(hasCollided(item)){
                // If so, move the box to make room for this elem.
                shift(item)
            }

            // Keep dragging!
            item
                .attr("x", d3.event.x+deltaX)
                .attr("y", d3.event.y+deltaY)
                .attr("transform", `translate(${d3.event.x+deltaX},${d3.event.y+deltaY})`)
        })

        // Called when the user drops the element.
        .on("end", function(){
            let item = d3.select(this)
            let itemData = state.nodes.filter(e=>e.id===getId(item))[0]

            // Stop dragging and set its bucket to its last seen bucket.
            item.classed("dragging", false);
            itemData.bucket = prevBucket;
            let currBucket = getCurrentBucket(item)
            if(currBucket===-1){
                // If it is currently in non-bucket space, get it back in bucket space.
                // Get its last known bucket and set it to the last element in that bucket.
                let nodes = state.nodes.filter(e=>e.bucket===prevBucket)
                itemData.ranking = nodes.length? (nodes.length-1): 0;

                // Normalize rankings.
                let i =0;
                for(let node of nodes.sort((a,b)=>a.ranking-b.ranking)){
                    node.ranking = i;
                    i++;
                }
            }

            svg.selectAll(".bucketItem")
                    .attr("transform", d=>{
                        return (`translate(
                            ${getBucketPos(d).x+(state.buckets.filter(
                                e=>e.id===d.bucket)[0].width/5
                                )*((d.ranking)%5) + state.buckets.filter(e=>e.id===d.bucket)[0].width/10}
                            , 
                            ${getBucketPos(d).y+(state.buckets.filter(
                                e=>e.id===d.bucket)[0].height/5
                                )*(Math.floor(d.ranking/5))})`
                        )})
        })

        for(let node of this.state.data.nodes){
            if(!this.state.levels[node.level]){
                this.state.levels[node.level] = [node]
            }else{
                this.state.levels[node.level].push(node);
            }
        }
        this.setState({help:false})
    }

    componentDidUpdate(){
        let svg = d3.select(this.svg.current)
        this.dragHandler(svg.selectAll(".draggable"));
    }

    render(){
        const canvas = this.tree.current;
        let arr = [];
        let locations = {};
        const radius = 20;
        Object.keys(this.state.levels).sort().map((e)=>{
            
            let count = 1;
            for(let node of this.state.levels[e]){
                // Get the center for each level
                var centerX = (canvas.width.baseVal.value/(this.state.levels[e].length+1))*(count);

                // Get center for each levels y
                var centerY = (canvas.height.baseVal.value / 6)*node.level;

                locations[node.id] = {x:centerX, y:centerY}

                // Create the nodes.
                arr.push(
                    <g transform={`translate(${centerX},${centerY})`}>
                        <circle
                            r={radius}
                            fill={node.color?node.color:"green"}
                            stroke={"green"}
                            onClick={(e)=>{
                                this.setState({test:false})
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
            arr.push(<line x1={x1} x2={x2} y1={y1} y2={y2} stroke={"black"}></line>)
        }
        return (
            <>
            <svg width={"40vw"} height={"80vh"} ref={this.svg}>
                {this.svg.current&&this.state.buckets.map(e=>{
                    console.log("bucket loaded")
                    return(
                        <g data={e} className="bucket" id={"bucket"+e.id} transform={`translate(${e.id===1?(0):(this.svg.current.width.baseVal.value/2)}, ${(e.id===1||e.id===2)?(50):((this.svg.current.height.baseVal.value/6)*(e.id-2)+100)})`}>
                            <rect width={e.width} height={e.height} fill={"grey"}></rect>
                        </g>
                    )})}
                {this.svg.current&&this.state.nodes.map(d=>{
                    return (<g data={d} className={"draggable bucketItem bucketItem"+d.ranking + " bucket"+d.bucket} onDrag={this.dragHandler} id={"bucketItem"+d.id} transform={(
                                `translate(
                                    ${this.getBucketPos(d).x+(this.state.buckets.filter(
                                        e=>e.id===d.bucket)[0].width/5
                                        )*((d.ranking)%5) + this.state.buckets.filter(e=>e.id===d.bucket)[0].width/10}
                                    , 
                                    ${this.getBucketPos(d).y+(this.state.buckets.filter(
                                        e=>e.id===d.bucket)[0].height/5
                                        )*(Math.floor(d.ranking/5))})`)}>
                                <rect width={2*d.radius} height={2*d.radius} fill={"yellow"} stroke={"green"}>
                                    
                                </rect>
                                <text style={{userSelect:"none"}} y={20}>
                                    {d.label}
                                </text>
                            </g>)
                })}
            </svg>
            <svg ref={this.tree} width={"40vw"} height={"80vh"}>
                {arr}
            </svg>
            </>
            )
    }

    /** 
     * Return the outside bucket position, its svg translate position.
     *   @param elem d3 selected node.
     * @returns {Object} x-x position of bucket
     *                   y-y position of bucket
     */
    getBucketPos(elem){
        let svg = d3.select(this.svg.current)
        console.log(svg)
        console.log(svg.selectAll(".bucket"))
        console.log(elem)
        let transform = svg.select("#bucket"+elem.bucket).attr("transform");
        let x = +(transform.substring(transform.indexOf("(")+1, transform.indexOf(",")).trim())
        let y = +(transform.substring(transform.indexOf(",")+1, transform.indexOf(")")).trim());
        return {x:x, y:y}
    }
}

class InfoModal extends React.Component{
    constructor(props){
        super(props)
        this.state={
            scrollPosition: 0,
        }

        this.listenToScroll = this.listenToScroll.bind(this)
    }

    componentDidMount(){
        window.addEventListener('scroll', this.listenToScroll)
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.listenToScroll)
    }

    listenToScroll = () => {
        const winScroll =
          document.body.scrollTop || document.documentElement.scrollTop
      
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight
      
        const scrolled = winScroll / height;

        console.log(scrolled)
      
        this.setState({
          scrollPosition: scrolled,
        })
    }

    render(){
        return (
            <div></div>
        )
    }
}