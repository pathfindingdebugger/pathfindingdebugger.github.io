class CustomVisualiser
{
    constructor(data)
    {

        this.breakPoints = new Array(0);
        this.breakPointVisual = new Array(0);
        this.floatBox = null;
        this.lineVisual = [null,null];
        this.svg  = document.getElementById("viewport");
        this.startNode = null;
        this.endNode = null;
        this.endEvent = null;

        this.nodes = {};
        this.breakPoints = [];
        this.positioning = data.positioning;

        this.nodeSize = data.size !== undefined ? data.size : 1;
        this.scale = data.scale !== undefined ? data.scale : 1;

        this.strokeScale = this.scale/10;

        this.lineToggle = data.lines;
        document.getElementById("Lines").checked = this.lineToggle;

        if(data.Map != undefined)
        {
            this.map = new Map(data.Map,this.nodeSize);
        }

        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];

        this.selfDrawn = true;
        const allConstrained = data.eventList.reduce((a,i)=> this.addEventToPositionList(i) && a,true);


        if(!allConstrained)
        {
            let layout = new cola.Layout();


            layout.nodes(this.nodePositions).links(this.links);
            layout.defaultNodeSize(this.nodeSize*2);
            layout.avoidOverlaps();
            layout.size([1000,1000]);

            // Force directed edges to point downwards, with level spacing
            // of at least 30, and then start the layout.

            //if(data.positioning === "downward")
            //{
            layout.flowLayout("y", this.nodeSize*3+5);

            //}
            layout.symmetricDiffLinkLengths(this.nodeSize);
            layout.start();
        }


        //svgObj will be a dict with the key of a string and the value of a function (which will draw the object) IT WORKS!
        this.svgObj = {};
        const svgElements = data.svgObjects !== undefined ? data.svgObjects : [];
        // PRE SETS
        svgElements.push({ "key":"Square", "object":{ "type":"rect", "attributes": [[{"key":"tag","value":"rect"},{"key":"cx","value":" 5 "},{"key":"cy","value":" 5 "},{"key":"x","value":" 0 "},{"key":"y","value":" 0 "},{"key":"width","value":" 1 "},{"key":"height","value":" 10 "},{"key":"stroke","value":"black"}]], "variableNames": []}});
        svgElements.push({ "key":"GridSpace", "object":{ "type":"rect", "attributes": [[{"key":"tag","value":"rect"},{"key":"stroke-alignment","value":"inner"},{"key":"cx","value":" 0.6"},{"key":"cy","value":" 0.6"},{"key":"x","value":" 0.6 "},{"key":"y","value":" 0.6 "},{"key":"width","value":"0.8"},{"key":"height","value":"0.8"},{"key":"stroke-width","value":"0.1"}]], "variableNames": []}});
        svgElements.push({ "key":"Node", "object":{ "type":"circle", "attributes":[[{"key":"tag","value":"circle"},{"key":"cx","value":"0"},{"key":"cy","value":"0"},{"key":"r","value":"1"}]],"variableNames": []}});

        //Fill the svgObj to be functions that take
        svgElements.forEach(e=>
            this.svgObj[e.key] = (varArray) => {
                const group = e.object.attributes.length> 1 ? new Elem(this.svg,'g') : this.svg;
                const container = group !== this.svg ? group.elem : group;
                const elem = e.object.attributes.map(subObj => {
                    const obj = new Elem(container,subObj.reduce((o,i)=> o.key === "tag"? o : i).value);
                    subObj.filter(i=>i.key!=="tag").forEach( a=>
                        obj.attr(a.key,e.object.variableNames.map(v => ({str:v, pos:a.value.indexOf(v)}))//Change Attributes
                            .reduce((out,v,i) => v === -1? out : out.replace(v.str,varArray[i]),a.value))//Do replacements
                    );
                    return obj;
                });
                return  e.object.attributes.length > 1 ? group : elem[0];
            }
        );

        if(this.endEvent !== null){
            this.addNodeFromEvent(this.endEvent);
            this.setNodeState(this.endEvent.id,states.goal);
        }

    }
    //Takes an event and adds it to positionList returns false if unconstrained
    addEventToPositionList(e)
    {
        //If event generated a node we want to add it to node positions and add its parent line
        const nodeIndex = this.nodePositions.length;
        let returnValue;
        if(e.type === "start")
        {
            this.showStart(e);
            this.showGoal(e.end);
        }
        if(e.type === "generating")
        {

            if(e.x !== undefined && e.y !== undefined)
            {
                this.nodePositions.push({id:e.id,fixed:true,x:e.x,y:e.y});
                returnValue = true;

                if(e.id == this.endNode)
                {
                    this.endEvent = e;
                }
            }
            else
            {
                this.nodePositions.push({id:e.id});

                if(this.positionIndecies[e.pId] !== undefined)
                {
                    this.links.push({target:nodeIndex, source:this.positionIndecies[e.pId], value:1});
                }
                returnValue = false;
            }
            this.positionIndecies[e.id] = nodeIndex;
            return returnValue;
        }
        else if (e.type === "updating" )
        {
            const nodeIndex = this.positionIndecies[e.id];
            this.links.push({target:nodeIndex, source:this.positionIndecies[e.pId], value:1});
            return true;
        }
        return true;
    }

    addNodeFromEvent(e)
    {

        if(e.pId !== "null" && e.pId !== null && this.nodes[e.pId] !== undefined)
        {
            this.nodes[e.pId].children.push(e.id);
        }
        else
        {
            this.root = e.id;
        }
        //SVG Drawing
        let newElement;
        if(e.svg !== null && e.svg !== undefined)
        {
            var parser = new DOMParser();
            var doc = parser.parseFromString(e.svg, "image/svg+xml");
            newElement = new Elem(this.svg,doc.documentElement);

        }
        else if(e.svgType !== null)
        {
            if(e.variables == null)
                e.variables = [];
            //Draw an svg of that type with those perameters
            newElement = this.svgObj[e.svgType](e.variables);//.attr('stroke-width',this.scale*this.strokeScale);
        }
        else
        {
            console.log("NO SVG DATA GIVEN")
        }
        const point = this.nodePositions[this.positionIndecies[e.id]];
        newElement.translate(point.x,point.y);
        newElement.attr('initialStroke',newElement.attr('stroke'));

        //Node data
        this.nodes[e.id] = {
            id:e.id,
            pId: e.pId,
            childIndex: e.pId !== null && e.pId !== "null" && this.nodes[e.pId] !== undefined ? this.nodes[e.pId].children.indexOf(e.id):0,

            state:states.inFrontier,

            g: e.g,
            f: e.f,
            h: e.f - e.g,

            svg:newElement,
            children:[],
            incomingEdges:[],
            outgoingEdges:[]
        };

        this.nodes[e.id].svg.observeEvent('mouseover')
        //.filter(e => this.graphNode[id].svgElem.attr("fill") !== 'white'&&this.graphNode[id].attr("fill") !== '#fff220')
        .subscribe(a => {
            this.generateFloatBox(a.clientX,a.clientY,e.id);
            this.drawParentLines(e.id);
            this.drawLine(0,e.id);
            this.nodes[e.id].outgoingEdges.forEach(e=>this.setLineColor(e,'blue'));
            this.nodes[e.id].svg.observeEvent('mouseout')
                .subscribe(ev =>{this.nodes[e.id].outgoingEdges.forEach(l=>this.setLineColor(l,'black'));this.clearParentLines(e.id);this.deleteLine(e.id); this.renderLine(1)});
        });

        this.nodes[e.id].svg.observeEvent('mousedown')
            .filter(e => e.shiftKey)
            .subscribe(data => {
                this.generateBreakPoint(e.id);
            });


        if(e.pId && this.nodes[e.pId] !== undefined) {
            parent = this.nodes[e.pId];
            this.addLine(this.nodes[e.id],parent)

        }
        else
        {
            const scaleFactor = this.scale + 12;
            this.svg.setAttribute('transform','scale('+scaleFactor+')'); //Zoom so the graph isn't super small, is based off of scale
            //Center camera on node
            const nodeVector = vector3(this.nodes[e.id].svg.getCenterPosition());
            const bounds = {x:document.getElementById("svg").getBoundingClientRect().width,y:document.getElementById("svg").getBoundingClientRect().height};

            //const view = add(multiply(nodeVector)(-1))(multiply(bounds)(0.5));
            const view = sub(nodeVector)(multiply(multiply(bounds)(1/scaleFactor))(0.5)); //Need to take into account scale
            this.svg.setAttribute('transform',this.svg.getAttribute('transform')+'translate('+view.x +','+ view.y+') ');
        }
    }
    addLine(node,parent,weightValue = null)
    {
        //if(!node.svg.hasCentre() || !parent.svg.hasCentre())
        //    return;
        const nodePosition = vector3(node.svg.getCenterPosition());
        const parentPosition = vector3(parent.svg.getCenterPosition());

        console.log(nodePosition,node.svg);
        let fill, triangle, textX, textY;
        if(node !== parent) {

            const lineVector = sub(nodePosition)(parentPosition);
            const toScreenVector = {x:0,y:0,z:1};
            const perp = normalise(cross(lineVector)(toScreenVector));
            const normLineVector = normalise(lineVector);
            const offset = multiply(perp)(this.nodeSize/4);
            const turnPoint = add(multiply(add(nodePosition)(parentPosition))(0.5))(offset);

            const p1 = add(nodePosition)(multiply(normLineVector)(this.nodeSize));
            const base = add(nodePosition)(multiply(normLineVector)(this.nodeSize+1));
            const p2 = add(base)(multiply(perp)(this.scale*0.4));
            const p3 = add(base)(multiply(perp)(-this.scale*0.4));
            console.log(base);
            triangle = new Elem(this.svg,'path',true).attr("d","M"+p1.x+" "+p1.y+" L"+p2.x+" "+p2.y+" L"+p3.x + " " + p3.y+" Z").attr('fill','#011627');


            fill = new Elem(this.svg, 'line', false).attr('x1', parentPosition.x).attr('y1', parentPosition.y).attr('x2', base.x).attr('y2', base.y).attr('stroke','#011627').attr('stroke-width',this.scale*this.strokeScale*2);

            textX = turnPoint.x;
            textY = turnPoint.y;
        }
        else
        {
            triangle = new Elem(this.svg,'circle');
            fill   = new Elem(this.svg,'path',false).attr("d","M"+node.svg.attr('cx')+','+node.svg.attr('cy')+" A"+this.nodeSize+" "+this.nodeSize+" 0 1 1 "+(Number(node.svg.attr('cx'))-1+','+node.svg.attr('cy'))).attr('fill',"none").attr('stroke','#011627').attr('stroke-width',1);

            textX = node.svg.attr('cx')-5;
            textY = Number(node.svg.attr('cy'))+30;
        }
        const weight = new Elem(this.svg,'text').attr('x',textX).attr('y',textY).attr('font-size',this.nodeSize/4).attr('fill','black');

        const weightText = weightValue === null ? node.g - parent.g : weightValue;

        weight.elem.append(document.createTextNode(weightText));

        const line = {triangle:triangle,weight:weight,fill:fill,pId:parent.id,cId:node.id};
        //Add line to parent
        node.incomingEdges.push(line);
        parent.outgoingEdges.push(line);
        console.log(line);
        if(!this.lineToggle)
            this.hideEdge(line)
    }
    drawParentLines(id)
    {
        this.nodes[id].incomingEdges.forEach((e,i)=>{
            this.setLineColor(e,'green');
            this.drawLine(i+2,e.pId);
        })
    }
    clearParentLines(id)
    {
        this.nodes[id].incomingEdges.forEach((e,i)=>{
            this.setLineColor(e,'black');
            this.deleteLine(i+2);
        })
    }
    drawLine(index,childId)
    {
        if(this.lineVisual[index] !== null)
        {
            this.deleteLine(index);
        }
        //Get each node on path
        const pointList = (id,list)=> id !== null && id !== undefined ? pointList(this.nodes[id].pId, list.concat([id])) : list;
        //Change their stroke color
        this.lineVisual[index] = pointList(childId,[]);
        this.renderLine(index);

    }
    renderLine(index)
    {
        if(this.lineVisual[index] !== null)
            this.lineVisual[index].forEach((id,i)=>{
                this.nodes[id].svg.attr('stroke',index === 0? 'red': index === 1 ?'#FF9F1C': 'green');
                this.nodes[id].svg.attr('stroke-width',this.scale*this.strokeScale*2);

                if(this.nodes[id].pId !== null && this.nodes[id].pId !== undefined)
                {
                    const parent = this.nodes[id].pId;
                    this.setLineColor(this.nodes[parent].outgoingEdges[this.nodes[id].childIndex],index === 0? 'red': index === 1 ?'#FF9F1C': 'green')
                }
            });
    }
    deleteLine(index)
    {

        if(this.lineVisual[index] !== null && this.lineVisual[index] !== undefined)
            this.lineVisual[index].forEach((id,i)=>{
                this.nodes[id].svg.attr('stroke',this.nodes[id].svg.attr('initialStroke'));
                this.nodes[id].svg.attr('stroke-width',this.scale*this.strokeScale);

                if(this.nodes[id].pId !== null && this.nodes[id].pId !== "null")
                {
                    const parent = this.nodes[id].pId;
                    this.setLineColor(this.nodes[parent].outgoingEdges[this.nodes[id].childIndex],'black')
                }
            });



    }
    setNodeState(id,state)
    {
        if(this.startNode === id )
        {
            state = states.start
        }
        else if (this.endNode === id) {
            state = states.goal
        }
        this.nodes[id].state = state;
        switch (state) {
            case states.NotSearched:
                this.nodes[id].svg.attr("fill", "#ffffff");
                break;
            case states.Current:
                this.nodes[id].svg.attr("fill", "#ff0016");
                break;
            case states.CurrentFrontier:
                this.nodes[id].svg.attr("fill","#b021ff");
                break;
            case states.expanded:
                this.nodes[id].svg.attr("fill", "#00f6ff");
                break;
            case states.inFrontier:
                this.nodes[id].svg.attr("fill", "#0032ff");
                break;
            case states.start:
                this.nodes[id].svg.attr("fill", "#09ff00");
                break;
            case states.goal:
                this.nodes[id].svg.attr("fill", "#ff7700");
                break;
        }

    }
    setNodeValues(event)
    {
        this.nodes[event.id].f = event.f;
        this.nodes[event.id].g = event.g;
        this.nodes[event.id].h = event.f - event.g;

        //set parent if different
        if(event.pId !== this.nodes[event.id].pId)
        {
            this.nodes[event.id].pId = event.pId;
            this.nodes[event.pId].children.push(event.id);
            this.nodes[event.id].childIndex = this.nodes[event.pId].children.indexOf(event.id);
            this.addLine(this.nodes[event.id],this.nodes[event.pId]);
        }
    }
    getNodeData(e)
    {
        return{
            id:e.id,
            h:this.nodes[e.id].h,
            g:this.nodes[e.id].g,
            f:this.nodes[e.id].f,
            pId:this.nodes[e.id].pId
        }
    }
    getParentData(e)
    {
        const currentNode = this.getNodeData(e);
        return currentNode.pId !== null && currentNode.pId !== "null" ? this.getNodeData({id:currentNode.pId}) : null;
    }
    setLineColor(e,colour)
    {
        if(e !== undefined)
        {
            e.fill.attr('stroke',colour);
            e.weight.attr('fill',colour);
            e.triangle.attr('fill',colour);
        }

    }
    showEdge(edge)
    {
        edge.fill.attr('visibility',"visible");
        edge.weight.attr('visibility',"visible");
        edge.triangle.attr('visibility',"visible");
    }
    hideEdge(edge)
    {
        edge.fill.attr('visibility',"hidden");
        edge.weight.attr('visibility',"hidden");
        edge.triangle.attr('visibility',"hidden");
    }

    generateFloatBox(mouseX,mouseY,id) {
        //Done in a similar way to the grid variant, just using the Nodes parent instead of the parent XYs
        if(this.floatBox !== null)
        {
            this.deleteFloatBox();
            this.floatBox = null;
        }

        const svg = document.getElementById("svg");


        const parent = this.nodes[this.nodes[id].pId];

        const xDir = this.nodes[id].pId !== null ? Math.sign(Number(this.nodes[id].svg.attr('cx')) -Number(parent.svg.attr('cx'))):0;
        const yDir = xDir === 0? 1 : this.nodes[id].pId !== null ? Math.sign(Number(this.nodes[id].svg.attr('cy')) -Number(parent.svg.attr('cy'))):-1;

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
            .attr("stroke",this.nodes[id].svg.attr("fill"))
            .attr('fill-opacity',0.8);

        const idText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-30)

            .attr('font-size',textFont)
            .attr('fill','black');

        idText.elem.append(document.createTextNode("Id: "+ String(id)));
        elements.push(idText);

        const gText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',-10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const g = Number(this.nodes[id].g);
        gText.elem.append(document.createTextNode("g:"+g));
        elements.push(gText);
        const hText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',10)
            .attr('font-size',textFont)
            .attr('fill','black');
        const h = Number(this.nodes[id].h.toPrecision(5));
        hText.elem.append(document.createTextNode("h:"+h));
        elements.push(hText);
        const fText = new Elem(this.floatBox.elem,'text')
            .attr('x',-45)
            .attr('y',30)
            .attr('font-size',textFont)
            .attr('fill','black');
        const f = Number(this.nodes[id].f);
        fText.elem.append(document.createTextNode(" f:"+f));
        elements.push(fText);

        const maxSize = elements.map(e=>e.elem.getBoundingClientRect().right - e.elem.getBoundingClientRect().left).reduce((i,j)=> i > j ? i : j);
        box.attr('width',maxSize+5);
        this.floatBox.attr('transform','translate('+newX+','+newY+')');

        const mout = this.nodes[id].svg.observeEvent('mouseout')
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
    deleteFloatBox()
    {
        if(this.floatBox !== null)
        {
            this.floatBox.elem.remove();
            this.floatBox = null
        }
    }
    toggleLines()
    {

        if(this.lineToggle)
        {
            //toggle off
            Object.keys(this.nodes).forEach(k=>this.nodes[k].outgoingEdges.forEach(edge=>this.hideEdge(edge)));
            this.lineToggle = false;
        }
        else
        {
            //toggle on
            this.lineToggle = true;
            Object.keys(this.nodes).forEach(k=>this.nodes[k].outgoingEdges.forEach(edge=>this.showEdge(edge)));
        }
    }

    clearVisual()
    {

        Object.keys(this.nodes).forEach(e=>
        {
            this.nodes[e].outgoingEdges.forEach(e=>{
                e.fill.removeElement();
                e.triangle.removeElement();
                e.weight.removeElement()
            });
            this.nodes[e].svg.removeElement();

        });

        this.nodes = {};
        this.svg.setAttribute('transform','');
        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];

        if(this.map !== undefined)
        {
            this.map.reset();
        }
    }
    showStart(event)
    {
        this.startNode = event.start;
    }
    showGoal(id)
    {
       this.endNode = id;
    }


    generateBreakPoint(id) {
        if (this.breakPoints.indexOf(id) === -1) {
            this.breakPoints.push(id);
            const breakPoint = new Elem(this.svg, 'circle')
                .attr("r", this.nodeSize/5)
                .attr('stroke-width',this.strokeScale/2)
                .attr("cx", this.nodes[id].svg.getCenterPosition().x)
                .attr("cy", this.nodes[id].svg.getCenterPosition().y)
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

        console.log(this.breakPoints,this.breakPointVisual);
    }
    isBreakPoint(id)
    {
        return this.breakPoints.indexOf(id) !== -1;
    }
    removeBreakPoint(id)
    {
        console.log("hit?");
        const index = this.breakPoints.indexOf(id);
        console.log(index);
        this.removeBreakPointAtIndex(index);
    }
    removeBreakPointAtIndex(index)
    {
        this.breakPoints.splice(index,1);
        this.breakPointVisual[index].removeElement();
        this.breakPointVisual.splice(index,1);
    }
}
