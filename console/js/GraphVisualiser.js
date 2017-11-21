class GraphVisualizer extends Visualiser
{
    constructor(isTree,events) {
        super();
        this.graphNode = {};
        this.breakPoints = [];
        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];
        events.forEach(i=>this.addEventToPositionList(i));
        let layout = new cola.Layout();

        layout.nodes(this.nodePositions).links(this.links);
        layout.avoidOverlaps();
        layout.size([1000,1000]);

        // Force directed edges to point downwards, with level spacing
        // of at least 30, and then start the layout.

        if(isTree)
        {
            layout.flowLayout("y", 30)

        }

        layout.symmetricDiffLinkLengths(17).start(0,0,0);


    }
    addEventToPositionList(e)
    {
        //If event generated a node we want to add it to node positions and add its parent line
        if(e.type === "generating")
        {
            const nodeIndex = this.nodePositions.length;
            this.nodePositions.push({id:e.id});
            this.positionIndecies[e.id] = nodeIndex;
            if(e.pId !== null)
            {
                this.links.push({target:nodeIndex, source:this.positionIndecies[e.pId], value:1});
            }
        }
        else if (e.type === "updating")
        {
            const nodeIndex = this.positionIndecies[e.id];
            console.log("Node index is bollocks" + nodeIndex + " pId pos"+this.positionIndecies[e.pId]);
            this.links.push({target:nodeIndex, source:this.positionIndecies[e.pId], value:1});
        }
    }
    addNode(id,data,pId,g,f,h)
    {

        if(pId)
        {
            this.graphNode[pId].children.push(id);
        }
        else
        {
            this.root = id;
        }
        const depth = pId ? (this.graphNode[pId].depth+1) : 0;

        const nodePosition = this.nodePositions[this.positionIndecies[id]];


        const node = {
            pId:pId,
            childIndex:pId? this.graphNode[pId].children.length:0,
            state:states.inFrontier,
            data:data,
            g:g,
            f:f,
            h:h,
            depth:depth,
            children:[],
            svgElem: new Elem(this.svg,'circle').attr('cx',nodePosition.x).attr('cy',nodePosition.y).attr('fill','white').attr('r',10),
            svgIncomingEdges:[],
            svgOutgoingEdges:[]
        };

        this.graphNode[id] = node;
        console.log(node.h + " + " + node.g);
        if (node.g === 0)
        {
            this.setNodeState(id,states.start);
        }
        else if(node.h === 0)
        {
            this.setNodeState(id,states.goal);
        }





        // HAVE NODE OBSERVE MOUSE OVER AND MOUSE DOWN EVENTS

        node.svgElem.observeEvent('mouseover')
            //.filter(e => this.graphNode[id].svgElem.attr("fill") !== 'white'&&this.graphNode[id].attr("fill") !== '#fff220')
            .subscribe(e => {
                this.generateFloatBox(e.clientX,e.clientY,id);
                this.drawLine(0,id)
            });

        node.svgElem.observeEvent('mousedown')
            .filter(e => e.shiftKey)
            .subscribe(data => {
                this.generateBreakPoint(id);
                if(node.svgElem.attr("fill") !== "white")
                {
                    //this.alterEventList([node.id,0]);
                }

            });


        if(pId) {
            parent = this.graphNode[pId];
            this.addLine(node,parent)

        }

    }
    addLine(node,parent)
    {
        const fill = new Elem(this.svg,'line',false).attr('x1',parent.svgElem.attr('cx')).attr('y1',parent.svgElem.attr('cy')).attr('x2',node.svgElem.attr('cx')).attr('y2',node.svgElem.attr('cy')).attr('style','stroke:rgb(255,255,255);stroke-width:1');
        const stroke = new Elem(this.svg,'line',false).attr('x1',parent.svgElem.attr('cx')).attr('y1',parent.svgElem.attr('cy')).attr('x2',node.svgElem.attr('cx')).attr('y2',node.svgElem.attr('cy')).attr('style','stroke:rgb(0,0,0);stroke-width:2');
        const line = {fill:fill,stroke:stroke};
        //Add line to parent
        node.svgIncomingEdges.push(line);
        parent.svgOutgoingEdges.push(line);
    }
    drawLine(index,id)
    {
        if(this.lineVisual[index] !== null)
        {
            this.deleteLine(index);
        }
        this.lineVisual[index] = new Elem(this.svg,'polyline');

        const pointList = (id)=> id ? String(this.nodePositions[this.positionIndecies[id]].x + ","+this.nodePositions[this.positionIndecies[id]].y+" ")+pointList(this.graphNode[id].pId) : '' ;

        this.lineVisual[index].attr('points',pointList(id))
            .attr('stroke',index === 0 ? "red" : "#ffb000")
            .attr('fill','none')
            .attr('stroke-width',2)
    }
    setNodeValues(id,data,g,f,pId)
    {
        this.graphNode[id].f = f;
        this.graphNode[id].g = g;
        this.graphNode[id].h = f - g;
        this.graphNode[id].data = data;
        //set parent if different
        if(pId !== this.graphNode[id].pId)
        {
            console.log("UPDATED");
            this.graphNode[id].pId = pId;
            this.addLine(this.graphNode[id],this.graphNode[pId]);
        }
    }
    setNodeState(id,state)
    {
        console.log(state);
        if(this.graphNode[id].state !== states.start && this.graphNode[id].state !== states.goal)
        {
            this.graphNode[id].state = state;
            this.setElemState(this.graphNode[id].svgElem,state)
        }



    }
    getNodeData(id)
    {
        return{
            id:id,
            data:this.graphNode[id].data,
            h:this.graphNode[id].h,
            g:this.graphNode[id].g,
            f:this.graphNode[id].f,
            pId:this.graphNode[id].pId
        }
    }

    generateBreakPoint(id) {
        if (this.breakPoints.indexOf(id) === -1) {
            this.breakPoints.push(id);
            console.log("BreakPoints: ", this.breakPoints);
            const breakPoint = new Elem(this.svg, 'circle')
                .attr("r", this.graphNode[id].svgElem.attr('r')*0.5)
                .attr("cx", this.graphNode[id].svgElem.attr('cx'))
                .attr("cy", this.graphNode[id].svgElem.attr('cy'))
                .attr("stroke", "black")
                .attr("fill", "red");
            this.breakPointVisual.push(breakPoint);

            breakPoint.observeEvent('mousedown')
                .filter(e => e.shiftKey)
                .subscribe(_ => {
                    this.breakPoints.splice(this.breakPoints.indexOf(id), 1);
                    breakPoint.elem.remove()
                });
        }
    }
    isBreakPoint(id)
    {
        return this.breakPoints.indexOf(id) !== -1;
    }
    removeBreakPoint(id)
    {
        const index = this.breakPoints.indexOf(id);
        this.removeBreakPointAtIndex(index);
    }
    clearTree()
    {

        Object.keys(this.graphNode).forEach(e=>{this.graphNode[e].svgOutgoingEdges.forEach(e=>{e.fill.removeElement(); e.stroke.removeElement()});this.graphNode[e].svgElem.removeElement()});
        this.deleteLine(0);
        this.deleteLine(1);
        this.graphNode = {};

        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];
    }


    generateFloatBox(mouseX,mouseY,id) {
        //Done in a similar way to the grid varient, just using the Nodes parent instead of the parent XYs
        if(this.floatBox !== null)
        {
            this.deleteFloatBox();
            this.floatBox = null;
        }

        const svg = document.getElementById("svg");


        const parent = this.graphNode[this.graphNode[id].pId];
        console.log(parent);
        console.log(this.graphNode[id]);
        const xDir = this.graphNode[id].pId !== null ? Math.sign(this.graphNode[id].svgElem.attr('cx') - parent.svgElem.attr('cx')):0;
        const yDir = this.graphNode[id].pId !== null ? Math.sign(this.graphNode[id].svgElem.attr('cy') - parent.svgElem.attr('cy')):-1;
        console.log(xDir+","+yDir);
        const xOffset = 100*xDir;
        const yOffset = yDir*100; //Just to move it away from mouse

        const newX = mouseX + xOffset;//These offsets correspond to the svg
        const newY = mouseY + yOffset;
        const textFont = 20;
        this.floatBox = new Elem(svg,'g');

        const sizes = [];
        const box = new Elem(this.floatBox.elem,'rect')
            .attr('x',-50)
            .attr('y',-50)
            .attr('width',"30ex")
            .attr('height',120)
            .attr("fill","white")
            .attr("stroke-width",3)
            .attr("stroke",this.graphNode[id].svgElem.attr("fill"));

        const idText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-30)

            .attr('font-size',textFont)
            .attr('fill','black');

        idText.elem.append(document.createTextNode("Id: "+ String(id)));

        const dataText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-10)
            .attr('font-size',textFont)
            .attr('fill','black');
        console.log("STATE"+ this.graphNode[id].data);

        dataText.elem.append(document.createTextNode("data:"+ this.graphNode[id].data));

        const gText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const g = Number(this.graphNode[id].g);
        gText.elem.append(document.createTextNode("g:"+g));

        const hText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',30)
            .attr('font-size',textFont)
            .attr('fill','black');
        const h = Number(this.graphNode[id].h.toPrecision(5));
        hText.elem.append(document.createTextNode("h:"+h));

        const fText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',50)
            .attr('font-size',textFont)
            .attr('fill','black');
        const f = Number(this.graphNode[id].f);
        fText.elem.append(document.createTextNode(" f:"+f));

        this.floatBox.attr('transform','translate('+newX+','+newY+')');

        const mout = this.graphNode[id].svgElem.observeEvent('mouseout')
            .subscribe(e=>{this.deleteFloatBox(); this.deleteLine(0)});

        const move = Observable.fromEvent(this.svg,'mousemove')
            .map(({clientX,clientY}) =>(
                ({
                    clientX:clientX - svg.getBoundingClientRect().left,
                    clientY:clientY - svg.getBoundingClientRect().top-10
                })
            ))
            .subscribe(e=>(this.floatBox !== null)? this.floatBox.attr('transform','translate('+(e.clientX+xOffset)+','+(e.clientY+yOffset)+')') : move.unsub);




    }
}