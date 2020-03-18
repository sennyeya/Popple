import * as d3 from 'd3';

const radius = 20;

export function getBucket(data){
    var node = document.createElement('div');

    var svg = d3.select(node).append("svg");

    var nodes = data.map((e,i)=>{
        return {radius:radius, id:i, label:e.label}
    })
    
    const ticked = function(){

        let g = svg.selectAll("circle").data(nodes).enter()
                    .append("g")
                    .attr("class", "draggable")
                    .style("user-select", "none")
            
            g.append("circle")
                .attr("r", function(d){return d.radius})

            g.append("text")
                .text(function(d){return d.label})
                .attr("y", 20)
    }

    var sim = d3.forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(1))
                .force('center', d3.forceCenter())
                .force('collision', d3.forceCollide().radius((d)=>{
                    return d.radius;
                }))
                .on("tick", ticked)

    svg.append("rect")
            .attr("fill", "grey")
            .attr("width", "20vw")
            .attr("height", "8vh")

    let deltaX = 0;
    let deltaY = 0;
    var dragHandler = d3.drag()
                        .on("start", function () {
                            var current = d3.select(this);
                            deltaX = current.attr("x") - d3.event.x;
                            deltaY = current.attr("y") - d3.event.y;
                        })
                        .on("drag", function(){
                            if(collision(this, svg)){
                                return;
                            }
                            d3.select(this)
                                .attr("x", d3.event.x+deltaX)
                                .attr("y", d3.event.y+deltaY)
                                .attr("transform", `translate(${d3.event.x+deltaX},${d3.event.y+deltaY})`)
                        })
                        .on("end", function(){

                        })

    dragHandler(svg.selectAll(".draggable"));

    sim.tick(1)

    return node;
}

const collision = function(node, svg){
    let r1 = node.getBoundingClientRect();
    return svg.selectAll("g").nodes().some(e=>{
        let r2 = e.getBoundingClientRect();
        return !(r2.left > r1.right || 
            r2.right < r1.left || 
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    })
}