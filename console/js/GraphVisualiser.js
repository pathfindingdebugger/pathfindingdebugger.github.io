class GraphVisualizer extends Visualiser
{
    constructor(isTree,mapData,events) {
        super();
        this.graphNode = {};
        this.breakPoints = [];
        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];
        this.nodeSize = 10;

        if(mapData === undefined)
        {
            d = new Date();
            const start = d.getTime();
            this.selfDrawn = true;
            events.forEach(i=>this.addEventToPositionList(i));
            console.log(this.nodePositions.length, this.links.length);
            let layout = new cola.Layout();

            layout.nodes(this.nodePositions).links(this.links);
            layout.defaultNodeSize(this.nodeSize);
            layout.avoidOverlaps();
            layout.size([1000,1000]);

            // Force directed edges to point downwards, with level spacing
            // of at least 30, and then start the layout.

            if(isTree)
            {
                layout.flowLayout("y", 30)

            }

            layout.symmetricDiffLinkLengths(17);
            layout.start(0,0,0);

            const end = new Date();


            console.log(end.getTime()-start);

        }
        else
        {
            this.selfDrawn = false;
            this.drawMap(mapData)
        }


    }
    drawMap(mapData) {
        mapData.vertex.forEach(e => {
            this.positionIndecies[e.id] = this.nodePositions.length;
            this.nodePositions.push(e);
            this.addNode(e.id,e.data,null,0,0,0)
        });

        for (let j = 0; j < mapData.size;j++){

            for (let i = 0; i < mapData.size; i++) {
                if(mapData.edges[j][i] !== null)
                {
                    this.addLine( this.graphNode[mapData.vertex[j].id],this.graphNode[mapData.vertex[i].id],mapData.edges[j][i]);
                }

            }
        }
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




        // HAVE NODE OBSERVE MOUSE OVER AND MOUSE DOWN EVENTS

        node.svgElem.observeEvent('mouseover')
            //.filter(e => this.graphNode[id].svgElem.attr("fill") !== 'white'&&this.graphNode[id].attr("fill") !== '#fff220')
            .subscribe(e => {
                this.generateFloatBox(e.clientX,e.clientY,id);
                this.drawLine(0,id);
                node.svgOutgoingEdges.forEach(e=>{
                    e.weight.attr('fill','red');
                    e.triangle.attr('fill','#ff009b');
                    e.fill.attr('stroke','#ff009b');
                });
                node.svgElem.observeEvent('mouseout')
                    .subscribe(e=>
                        node.svgOutgoingEdges.forEach(e=>{
                            e.weight.attr('fill','white');
                            e.triangle.attr('fill','white');
                            e.fill.attr('stroke','white')
                        }));
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
        else
        {
            console.log(node.svgElem.attr('x'));
            //Center camera on node
            const nodeVector = {x:nodePosition.x,y:nodePosition.y,z:0};
            const bounds = {x:document.getElementById("svg").getBoundingClientRect().width,y:document.getElementById("svg").getBoundingClientRect().height};
            console.log(bounds);
            const view = add(multiply(nodeVector)(-1))(multiply(bounds)(0.5));


            this.svg.setAttribute('transform','translate('+view.x +','+ view.y+')');

        }



    }
    addLine(node,parent,weightValue = null)
    {
        const nodePosition = {x:Number(node.svgElem.attr('cx')), y:Number(node.svgElem.attr('cy')), z:0};
        const parentPosition = {x:Number(parent.svgElem.attr('cx')), y:Number(parent.svgElem.attr('cy')), z:0};
        let fill, stroke, triangle, textX, textY;
        if(node !== parent) {

            const lineVector = sub(nodePosition)(parentPosition);
            const toScreenVector = {x:0,y:0,z:1};
            const perp = normalise(cross(lineVector)(toScreenVector));
            const normLineVector = normalise(lineVector);
            const offset = multiply(perp)(10);
            const turnPoint = add(multiply(add(nodePosition)(parentPosition))(0.5))(offset);

            const p1 = add(nodePosition)(multiply(normLineVector)(this.nodeSize));
            const base = add(nodePosition)(multiply(normLineVector)(this.nodeSize+5));
            const p2 = add(base)(multiply(perp)(2));
            const p3 = add(base)(multiply(perp)(-2));
            triangle = new Elem(this.svg,'path',true).attr("d","M"+p1.x+" "+p1.y+" L"+p2.x+" "+p2.y+" L"+p3.x + " " + p3.y+" Z").attr('fill','white');


            fill = new Elem(this.svg, 'line', false).attr('x1', parent.svgElem.attr('cx')).attr('y1', parent.svgElem.attr('cy')).attr('x2', base.x).attr('y2', base.y).attr('stroke','rgb(255,255,255)').attr('stroke-width',1);
            stroke = new Elem(this.svg, 'line', false).attr('x1', parent.svgElem.attr('cx')).attr('y1', parent.svgElem.attr('cy')).attr('x2', node.svgElem.attr('cx')).attr('y2', node.svgElem.attr('cy')).attr('stroke','rgb(0,0,0)').attr('stroke-width',2);


            textX = turnPoint.x;
            textY = turnPoint.y;
        }
        else
        {
            triangle = new Elem(this.svg,'circle');
            fill   = new Elem(this.svg,'path',false).attr("d","M"+node.svgElem.attr('cx')+','+node.svgElem.attr('cy')+" A"+this.nodeSize+" "+this.nodeSize+" 0 1 1 "+(Number(node.svgElem.attr('cx'))-1+','+node.svgElem.attr('cy'))).attr('fill',"none").attr('stroke','rgb(255,255,255)').attr('stroke-width',1);
            stroke = new Elem(this.svg,'path',false).attr("d","M"+node.svgElem.attr('cx')+','+node.svgElem.attr('cy')+" A"+this.nodeSize+" "+this.nodeSize+" 0 1 1 "+(Number(node.svgElem.attr('cx'))-1+','+node.svgElem.attr('cy'))).attr('fill',"none").attr('stroke','rgb(0,0,0)').attr('stroke-width',2);

            textX = node.svgElem.attr('cx')-5;
            textY = Number(node.svgElem.attr('cy'))+30;
        }
        const weight = new Elem(this.svg,'text').attr('x',textX).attr('y',textY).attr('font-size',10).attr('fill','white');

        const weightText = weightValue === null ? node.g - parent.g : weightValue;

        weight.elem.append(document.createTextNode(weightText));

        const line = {triangle:triangle,weight:weight,fill:fill,stroke:stroke};
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
            this.graphNode[id].pId = pId;
            this.addLine(this.graphNode[id],this.graphNode[pId]);
        }
    }
    setNodeState(id,state)
    {
        if(this.graphNode[id].state !== states.start && this.graphNode[id].state !== states.goal)
        {
            if(state == states.goal)
            {
                console.log("Cake");
            }
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

        Object.keys(this.graphNode).forEach(e=>
        {
            this.graphNode[e].svgOutgoingEdges.forEach(e=>{
                e.fill.removeElement();
                e.triangle.removeElement();
                e.weight.removeElement();
                e.stroke.removeElement()
            });
            this.graphNode[e].svgElem.removeElement()
        });

        this.deleteLine(0);
        this.deleteLine(1);
        this.graphNode = {};

        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];
    }


    generateFloatBox(mouseX,mouseY,id) {
        //Done in a similar way to the grid variant, just using the Nodes parent instead of the parent XYs
        if(this.floatBox !== null)
        {
            this.deleteFloatBox();
            this.floatBox = null;
        }

        const svg = document.getElementById("svg");


        const parent = this.graphNode[this.graphNode[id].pId];


        const xDir = this.graphNode[id].pId !== null ? Math.sign(this.graphNode[id].svgElem.attr('cx') - parent.svgElem.attr('cx')):0;
        const yDir = this.graphNode[id].pId !== null ? Math.sign(this.graphNode[id].svgElem.attr('cy') - parent.svgElem.attr('cy')):-1;

        const xOffset = 100*xDir;
        const yOffset = yDir*100; //Just to move it away from mouse

        const newX = mouseX + xOffset;//These offsets correspond to the svg
        const newY = mouseY + yOffset;
        const textFont = 20;
        this.floatBox = new Elem(svg,'g');

        const elements = [];
        const box = new Elem(this.floatBox.elem,'rect')
            .attr('x',-50)
            .attr('y',-50)
            .attr('width',"30ex")
            .attr('height',120)
            .attr("fill","white")
            .attr("stroke-width",3)
            .attr("stroke",this.graphNode[id].svgElem.attr("fill"))
            .attr('fill-opacity',0.5);

        const idText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-30)

            .attr('font-size',textFont)
            .attr('fill','white');

        idText.elem.append(document.createTextNode("Id: "+ String(id)));
        elements.push(idText);

        const dataText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-10)
            .attr('font-size',textFont)
            .attr('fill','black');

        dataText.elem.append(document.createTextNode("data:"+ this.graphNode[id].data));
        elements.push(dataText);

        const gText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const g = Number(this.graphNode[id].g);
        gText.elem.append(document.createTextNode("g:"+g));
        elements.push(gText);
        const hText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',30)
            .attr('font-size',textFont)
            .attr('fill','black');
        const h = Number(this.graphNode[id].h.toPrecision(5));
        hText.elem.append(document.createTextNode("h:"+h));
        elements.push(hText);
        const fText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',50)
            .attr('font-size',textFont)
            .attr('fill','black');
        const f = Number(this.graphNode[id].f);
        fText.elem.append(document.createTextNode(" f:"+f));
        elements.push(fText);

        const maxSize = elements.map(e=>e.elem.getBoundingClientRect().right - e.elem.getBoundingClientRect().left).reduce((i,j)=> i > j ? i : j);
        box.attr('width',maxSize);

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