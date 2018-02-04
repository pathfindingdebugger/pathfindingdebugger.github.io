class CustomVisualiser
{
    constructor(data,map)
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
        this.opacityToggle = true;

        document.getElementById("Lines").checked = this.lineToggle;

        this.map = map;

        this.positionIndecies = {};
        this.nodePositions = [];
        this.links = [];

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
        svgElements.push({ "key":"RoadNode", "object":{ "type":"circle", "attributes":[[{"key":"tag","value":"circle"},{"key":"cx","value":"0"},{"key":"cy","value":"0"},{"key":"r","value":"200"}]],"variableNames": []}});
        svgElements.push({ "key":"AnyaNode", "object":{ "attributes": [[{"key":"r","value":"0.3"},{"key":"cx","value":"0"},{"key":"cy","value":"0"},{"key":"tag","value":"circle"}],[{"key":"x","value":"lx"},{"key":"width","value":"ll"},{"key":"y","value":"lh"},{"key":"tag","value":"rect"},{"key":"stroke-width","value":"0.1"},{"key":"height","value":"0.3"}],[{"key":"d","value":"M 0 0 L lex lh"},{"key":"tag","value":"path"},{"key":"stroke-width","value":"0.3"}],[{"key":"d","value":"M 0 0 L lx lh"},{"key":"tag","value":"path"},{"key":"stroke-width","value":"0.3"}]], "variableNames": ["lx","ll","lh","lex"]}});
        svgElements.push({ "key":"PolyAnyaNode", "object":{ "attributes": [[{"key":"r","value":"0.3"},{"key":"cx","value":"0"},{"key":"cy","value":"0"},{"key":"tag","value":"circle"}],[{"key":"tag","value":"path"},{"key":"fill-opacity","value":"0.3"},{"key":"d","value":"M 0 0 L p1x p1y L p2x p2y Z"}]], "variableNames": ["p1x","p1y","p2x","p2y"]}});

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
        //Generate floatboxController
        this.floatBoxControl = new FloatBoxControl(data);
    }
    //Takes an event and adds it to positionList returns false if unconstrained
    addEventToPositionList(e)
    {
        //this.max = {x:0,y:0};
        //If event generated a node we want to add it to node positions and add its parent line
        const nodeIndex = this.nodePositions.length;
        let returnValue;
        if(e.type === "start")
        {
            this.showStart(e);
            this.showGoal(e.end);
            this.endNode = e.id;
        }
        if(e.type === "generating")
        {

            if(e.x !== undefined && e.y !== undefined)
            {
                //this.max = max(this.max)({x:x,y:y});
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
        if(this.endNode !== e.id && this.nodes[e.id] !== undefined )
        {
            this.setNodeValues(e);
            return;
        }
        let parentRecordCount;
        if(e.pId !== "null" && e.pId !== null && this.nodes[e.pId] !== undefined)
        {
            parentRecordCount = this.nodes[e.pId].records.length-1;
            this.getLastRecord(e.pId).children.push(e.id);
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
            newElement = this.svgObj[e.svgType](e.variables);
            if((this.map !== undefined && this.map !==null) && (e.svgType == "GridSpace" || e.svgType == "Node" || e.svgType == "RoadNode") && this.map.hasKey(e.id))
            {
                this.map.reveal(e.id,10);
                this.map.removeNode(e.id);
            }
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

            records:[{
                    eventId:e.id,
                    pId: e.pId,
                    pRecord:parentRecordCount,
                    childIndex: e.pId !== null && e.pId !== "null" && this.nodes[e.pId] !== undefined ? this.getLastRecord(e.pId).children.indexOf(e.id):0,

                    state:states.inFrontier,
                    eventData:e,
                    children:[]
            }],

            svg:newElement.attr('id',e.id),
            incomingEdges:[],
            outgoingEdges:[],


        };

        this.nodes[e.id].svg.observeEvent('mouseover')
        //.filter(e => this.graphNode[id].svgElem.attr("fill") !== 'white'&&this.graphNode[id].attr("fill") !== '#fff220')
        .subscribe(a => {
            let currentRecord = this.nodes[e.id].records.length-1;
            if(this.opacityToggle)
            {
                this.svg.setAttribute('stroke-opacity',0.3);
                this.svg.setAttribute('fill-opacity',0.3);
            }

            this.nodes[e.id].svg.observeEvent('mousedown')
                .subscribe(f=>{
                    //Step the current record
                    currentRecord = (currentRecord + 1)%this.nodes[e.id].records.length;

                    //Make new box
                    this.generateFloatBox(f.clientX,f.clientY,e.id,currentRecord);

                    //Update lines and node state
                    this.drawLine(0,e.id,currentRecord);
                });

            this.generateFloatBox(a.clientX,a.clientY,e.id,currentRecord);
            this.drawLine(0,e.id);

            this.nodes[e.id].outgoingEdges.forEach(e=>this.activateEdge(e,2));
            this.nodes[e.id].svg.observeEvent('mouseout')
                .subscribe(ev =>{
                    this.svg.setAttribute('stroke-opacity',1);
                    this.svg.setAttribute('fill-opacity',1);
                    this.nodes[e.id].outgoingEdges.forEach(l=>this.activateEdge(l,-1));
                    this.deleteLine(0);
                    this.unhighlightNode(e.id);
                    this.renderLine(1);
                });
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
            centerCamera(this.svg,this.nodes[e.id].svg.getCenterPosition(),this.scale)
        }
    }
    addLine(node,parent,weightValue = null)
    {

        const nodePosition = vector3(node.svg.getCenterPosition());
        const parentPosition = vector3(parent.svg.getCenterPosition());
        if(equal(nodePosition)(parentPosition))
            return;
        let fill, triangle, textX, textY;
        if(node !== parent) {

            const lineVector = sub(nodePosition)(parentPosition);
            const toScreenVector = {x:0,y:0,z:1};
            const perp = normalise(cross(lineVector)(toScreenVector));
            const normLineVector = normalise(lineVector);
            const offset = multiply(perp)(this.nodeSize/2);
            const turnPoint = add(multiply(add(nodePosition)(parentPosition))(0.5))(offset);

            const p1 = add(nodePosition)(multiply(normLineVector)(this.nodeSize));
            const base = add(nodePosition)(multiply(normLineVector)(this.nodeSize+1));
            const p2 = add(base)(multiply(perp)(this.scale*0.4));
            const p3 = add(base)(multiply(perp)(-this.scale*0.4));

            triangle = new Elem(this.svg,'path',elemType.line).attr("d","M"+p1.x+" "+p1.y+" L"+p2.x+" "+p2.y+" L"+p3.x + " " + p3.y+" Z").attr('fill','#011627').attr('stroke-width',this.scale*this.strokeScale*2);
            fill = new Elem(this.svg, 'line', elemType.line).attr('x1', parentPosition.x).attr('y1', parentPosition.y).attr('x2', base.x).attr('y2', base.y).attr('stroke-width',this.scale*this.strokeScale*2).addClass('line');

            textX = turnPoint.x;
            textY = turnPoint.y;
        }
        else
        {
            triangle = new Elem(this.svg,'circle');
            fill   = new Elem(this.svg,'path',elemType.line).attr("d","M"+node.svg.attr('cx')+','+node.svg.attr('cy')+" A"+this.nodeSize+" "+this.nodeSize+" 0 1 1 "+(Number(node.svg.attr('cx'))-1+','+node.svg.attr('cy'))).attr('fill',"none").attr('stroke','#011627').attr('stroke-width',1);

            textX = node.svg.attr('cx')-5;
            textY = Number(node.svg.attr('cy'))+30;
        }
        const weight = new Elem(this.svg,'text',elemType.line).attr('x',textX).attr('y',textY).attr('font-size',this.nodeSize/2).attr('fill','black').attr('stroke-width',0);

        const weightText = weightValue === null ? this.getLastRecord(node.id).eventData.g - this.getLastRecord(parent.id).eventData.g : weightValue;

        weight.elem.append(document.createTextNode(weightText));

        const line = {triangle:triangle,weight:weight,fill:fill,pId:parent.id,cId:node.id};
        //Add line to parent
        node.incomingEdges.push(line);
        parent.outgoingEdges.push(line);

        if(!this.lineToggle)
            this.hideEdge(line)
    }
    drawLine(index,childId,recordNumber = this.nodes[childId].records.length-1)
    {
        if(this.lineVisual[index] !== null)
        {
            this.deleteLine(index);
        }
        //Get each node on path
        const pointList = (id,recNum,list)=> {
            if(id !== null && id !== "null" && id !== undefined)
            {
                return pointList(this.getRecord(id,recNum).pId,this.getRecord(id,recNum).pRecord, list.concat([{id:id,pR:this.getRecord(id,recNum).pRecord}]))
            }else{
              return list;
            }
        };

        //const pointList = (id,list)=> id !== null && id !== undefined ? pointList(this.getLastRecord(id).pId, list.concat([id])) : list;

        //Change their stroke color
        this.lineVisual[index] = pointList(childId,recordNumber,[]);

        this.renderLine(index);

    }
    renderLine(lineIndex,render=true)
    {
        if(this.lineVisual[lineIndex] !== null)
        {
            this.lineVisual[lineIndex].forEach(({id,pR},i)=>{
                if(this.nodes[id] != undefined)
                {
                    if(render)
                    {
                        this.nodes[id].svg.addClass("path"+Math.min(lineIndex,3));
                        this.nodes[id].svg.attr('stroke-width',this.scale*this.strokeScale*2);
                    }
                    else
                    {
                        this.unhighlightNode(id);
                    }
                    if(this.getRecord(id,pR) != null && this.getRecord(id,pR).pId !== null && this.getRecord(id,pR).pId !== undefined)
                    {
                        const parent = this.getRecord(id,pR).pId;
                        if(parent !== undefined && this.nodes[parent] !== undefined){
                            const line = this.nodes[parent].outgoingEdges.filter(l=>l.cId === id)[0];
                            //console.log("Line info:",this.nodes[parent].outgoingEdges.filter(l=>l.cId === id),this.nodes[parent].outgoingEdges);
                            this.activateEdge(line,Math.min(render?lineIndex:-1,3));
                        }

                    }
                }
            });
        }

    }
    deleteLine(index)
    {
        this.renderLine(index,false)
    }
    unhighlightNode(id,recordNumber = -1){
            const record = recordNumber !== -1 ? this.getRecord(id,recordNumber) : this.getLastRecord(id);
            [0,1,2,3].map(i=>"path"+i).forEach(i=> this.nodes[id].svg.removeClass(i));

            this.nodes[id].svg.attr('stroke-width',this.scale*this.strokeScale);
            /*if(record.pId !== null && record.pId !== "null")
            {
                const parent = this.getLastRecord(id).pId;
                this.activateEdge(this.nodes[parent].outgoingEdges[record.childIndex],-1)
            }*/
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
        this.nodes[id].svg.elem.classList.remove(this.nodes[id].state);
        this.nodes[id].state = state;
        this.nodes[id].svg.elem.classList.add(this.nodes[id].state);
    }
    setNodeValues(event)
    {
        const records = this.nodes[event.id].records;
        const currentRecord = records[records.length-1];
        const newRecord =
        {
            eventData:{},
            children:currentRecord.children
        };
        Object.keys(currentRecord).forEach(k=>newRecord.eventData[k] = currentRecord[k]);
        Object.keys(event).forEach(k=>newRecord.eventData[k] = event[k]);

        //set parent if different
        if(event.pId !== currentRecord.pId)
        {

            newRecord.pId = event.pId;
            newRecord.pRecord = this.nodes[event.pId].records.length-1;
            newRecord.children.push(event.id);
            newRecord.childIndex = this.getLastRecord(event.pId).children.indexOf(event.id);
            this.addLine(this.nodes[event.id],this.nodes[event.pId]);

        }
        else
        {
            newRecord.pId = currentRecord.pId;
            newRecord.pRecord = currentRecord.pRecord;
            newRecord.childIndex = currentRecord.childIndex;

            //Check if there are any differences
            if(currentRecord.state == newRecord.state &&
               Object.keys(currentRecord.eventData).reduce((a,key)=>a && currentRecord.eventData[key] === newRecord.eventData[key]))
               return;
        }

        this.nodes[event.id].records.push(newRecord);
    }
    getNodeData(id,r)
    {
        const currentRecord = r !== undefined ? this.getRecord(id,r) : this.getLastRecord(id);
        const returnObject = {};
        Object.keys(currentRecord.eventData).forEach(key => returnObject[key] = currentRecord.eventData[key]);
        returnObject['id'] = id;
        returnObject['pId'] = currentRecord.pId;
        returnObject['pRecord'] = currentRecord.pRecord;
        if(returnObject['h'] === undefined) returnObject['h'] = currentRecord.eventData.f - currentRecord.eventData.g;
        return returnObject;
    }
    getNodePosition(id)
    {
        return this.nodes[id].svg.getTransform();
    }
    getParentData(id)
    {

        const currentNode = this.getNodeData(id);
        return currentNode.pId != null && currentNode.pId != "null" ? this.getNodeData(currentNode.pId) : null;
    }
    activateEdge(e,index)
    {
        if(e !== undefined)
        {
            if(index === -1) //If negative one remove all active classes
            {
                [0,1,2,3].map(i=>"line"+i).forEach( i =>Object.values(e).filter(s=>s instanceof Elem).forEach(s=>s.removeClass(i)));
                Object.values(e).filter(s=>s instanceof Elem).forEach(s=>s.removeClass("lineActive"));
                if(this.lineToggle === "On Mouse Over")
                {
                    this.hideEdge(e);
                }
            }
            else
            {
                Object.values(e).filter(s=>s instanceof Elem).forEach(s=>s.addClass("line"+index).addClass("lineActive"));
                if(this.lineToggle === "On Mouse Over")
                {
                    this.showEdge(e);
                }

            }

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

    generateFloatBox(mouseX,mouseY,id,recordNumber = -1) {

        const record = recordNumber !== -1 ? this.getRecord(id,recordNumber) : this.getLastRecord(id);
        const svg =document.getElementById("svg");
        //Calculate position based on parent position
        const parent = this.nodes[record.pId];

        const xDir = record.pId !== null  && record.pId !== "null" ? Math.sign(Number(this.nodes[id].svg.attr('cx')) -Number(parent.svg.attr('cx'))):0;
        const yDir = xDir === 0? 1 : record.pId !== null ? Math.sign(Number(this.nodes[id].svg.attr('cy')) -Number(parent.svg.attr('cy'))):-1;

        const xOffset = 100*xDir;
        const yOffset = yDir*100; //Just to move it away from mouse

        const newX = mouseX + xOffset;//These offsets correspond to the svg
        const newY = mouseY + yOffset;
        //Hand position and node data to fbController to generate the box, get the returned box
        const fb = this.floatBoxControl.generateFloatBox(newX,newY,this.nodes[id],recordNumber);

        const mout = this.nodes[id].svg.observeEvent('mouseout')
            .subscribe(e=>{this.floatBoxControl.deleteFloatBox()});

        const move = Observable.fromEvent(this.svg,'mousemove')
            .map(({clientX,clientY}) =>(
                ({
                    clientX:clientX - svg.getBoundingClientRect().left,
                    clientY:clientY - svg.getBoundingClientRect().top-10
                })
            ))
            .subscribe(e=>(fb !== null)? fb.attr('transform','translate('+(e.clientX+xOffset)+','+(e.clientY+yOffset)+')') : move.unsub);

    }
    deleteFloatBox()
    {
        this.floatBoxControl.deleteFloatBox()
    }
    toggleLines(type)
    {
        if (type === "On")
        {
            //Show all edges
            this.lineToggle = true;
            this.showLines();
        }
        if(type === "Off" || type === "On Mouse Over")
        {
            //Hide all edges
            this.hideLines();
            this.lineToggle = false;
            if(type === "On Mouse Over")
            {
                //Set this.line toggle to show lines
                this.lineToggle = "On Mouse Over"
            }
        }

    }
    showLines(){Object.keys(this.nodes).forEach(k=>this.nodes[k].outgoingEdges.forEach(edge=>this.showEdge(edge)))};
    hideLines(){Object.keys(this.nodes).forEach(k=>this.nodes[k].outgoingEdges.forEach(edge=>this.hideEdge(edge)))};


    toggleOpacity()
    {
        this.opacityToggle = !this.opacityToggle;
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

        this.floatBoxControl.deleteSideBar();


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
    removeBreakPointAtIndex(index)
    {
        this.breakPoints.splice(index,1);
        this.breakPointVisual[index].removeElement();
        this.breakPointVisual.splice(index,1);
    }

    showMessage(message,time)
    {
        const svgWindow = document.getElementById("svg");

        const svgDimensions = {hieght:svgWindow.getBoundingClientRect().height, width:svgWindow.getBoundingClientRect().width};
        //make text box for clearing
        this.textArea = new Elem(svgWindow,'g')
            .attr('id',"textArea");
        this.textArea.translate(0,svgDimensions.hieght*0.9);

        //Draw textbox
        const rect = new Elem(this.textArea.elem,'rect')

            .attr('width','100%')
            .attr('height','20%')
            .attr('fill','white')
            .attr('fill-opacity','0.7')
            .attr('stroke','black');

        //Write text
        const text = new Elem(this.textArea.elem,'text')
            .attr('x',0)
            .attr('y',25)
            .attr('font-size',20)
            .attr('fill','black');

        text.elem.append(document.createTextNode(message));

        setTimeout(()=>{
                this.textArea.removeElement();
            }
            ,time);
    }

    fitCamera() {
        this.svg.setAttribute('transform','');
        const svgBB = document.getElementById("svg").getBoundingClientRect();
        const viewPortBB = this.svg.getBoundingClientRect();
        const scaleFactor = Math.min(svgBB.height /viewPortBB.height, svgBB.width /viewPortBB.width);
        const position = {x:viewPortBB.top,y:viewPortBB.left};
        //new Elem(this.svg,'circle').attr('cx',position.x).attr('cy',position.y).attr('r',10).attr('stroke',"black");
        //new Elem(this.svg,'path').attr('d','M '+viewPortBB.left+" "+viewPortBB.top+" L"+ viewPortBB.right+" "+viewPortBB.top).attr('stroke','black');

        centerMap(this.svg,scaleFactor)
    }

    getPathData(path){ return path.map(id => ({id:id, g:this.nodes[id].g}))};

    comparePath(pathData)
    {
        if(this.path !== undefined)
            this.clearComparePath();
        this.path = pathData;
        pathData.reduce((v,node)=>{
            //Compare values
            if(this.nodes[node.id] !== undefined)
            {
                if( this.nodes[node.id].g !== node.g)
                {
                    console.log(node.id,"FAIL");
                    //Colour node
                    this.nodes[node.id].svg.addClass("badPath");
                    //Message log

                    //return status
                    return false;
                }
                else {
                    console.log(node.id,"PASS");

                    //Colour node
                    this.nodes[node.id].svg.addClass("goodPath");
                    //return status
                    return true
                }
            }
            return true;



        })
    }
    clearComparePath()
    {
        this.path.forEach(n => this.nodes[n.id] !== undefined? this.nodes[n.id].svg.removeClass("goodPath").removeClass("badPath"):null);
    }

    getLastRecord(id)
    {
        const records = this.nodes[id].records;
        return records[records.length-1];
    }
    getRecord(id,i)
    {
        const records = this.nodes[id].records;
        return records[i];
    }

    getInternalId(x,y)
    {
        return this.max.x*y + x;
    }
}