class Map
{
    constructor(mapType,mapData,scale,quickLoad)
    {
        this.tileSize = scale;
        this.svg  = document.getElementById("viewport");
        if(mapType === "map")
        {
            this.type = "Grid";
            this.mapWidth = mapData.mWidth;
            this.mapHeight = mapData.mHeight;
            this.map = this.drawGrid(mapData,quickLoad);
        }
        else if(mapType === "Graph")
        {
            this.map = this.drawGraph(mapData,quickLoad);
        }
        else if(mapType === "ply")
        {
            this.map = this.drawMesh(mapData,quickLoad);
        }
    }

    drawGrid(mapString,quickLoad)
    {
        this.type = "Grid";
        const mapData = maParser(mapString);
        this.mapWidth = parseInt(mapData.width);
        this.mapHeight = parseInt(mapData.height);
        mapString = mapData.mapData;
        this.background = new Elem(this.svg,'rect',elemType.background).attr('x',0).attr('y',0).attr('width',this.tileSize*this.mapWidth).attr('height',this.tileSize*this.mapHeight).attr('fill','black');
        const size = parseInt(this.mapWidth) * parseInt(this.mapHeight);

        this.nodes = {};
        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {
                const stringIndex = i * this.mapWidth + j;
                if (mapString[stringIndex] === "@")
                    continue;
                this.nodes[stringIndex] = ()=> new Elem(this.svg, 'rect',elemType.background)
                    .attr('x', this.tileSize * j+(this.tileSize/2)).attr('y', this.tileSize * i+(this.tileSize/2))
                    .attr('width', this.tileSize).attr('height', this.tileSize)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width','0.1');

                if(quickLoad)
                    this.nodes[stringIndex] = this.nodes[stringIndex]();

            }
        }
        centerCamera(this.svg,{x:0,y:0},1)
    }
    drawGraph(mapData,quickLoad)
    {
        this.type = "Graph";
        this.nodes = {};
        this.lines = {};

        const graphData = parseGraph(mapData.co,mapData.gr);
        graphData.vertex.forEach(v=>{
            this.nodes[v.id] = () => (new Elem(this.svg,'circle')
                    .attr('cx',v.x)
                    .attr('cy',v.y)
                    .attr('r',this.tileSize*200)
                    .attr('stroke','black')
                    .attr('stroke-width',10)
                    .attr('fill','white')
            );
            if(quickLoad)
                this.nodes[v.id] = this.nodes[v.id]();
        });
        graphData.edges.forEach(e=>{
            if(graphData.vertex[e.v1] == null || graphData.vertex[e.v2] == null)
                console.log(e);
            let line = () => new Elem(this.svg,'path',elemType.background).attr('stroke-width',40).attr('d','M'+graphData.vertex[e.v1].x+" "+graphData.vertex[e.v1].y+" L"+graphData.vertex[e.v2].x+" "+graphData.vertex[e.v2].y)
                .attr('stroke',"black");
            if(quickLoad)
            {
                line = line();
            }


            if(this.lines[e.v1] === undefined)
                this.lines[e.v1] = {};
            if(this.lines[e.v2] === undefined)
                this.lines[e.v2] = {};

            this.lines[e.v1][e.v2] = line;
            this.lines[e.v2][e.v1] = line;


        });
        console.log("WHAT?",this.nodes);

    }
    drawMesh(data)
    {
        this.map = new Elem(this.svg,'g',elemType.background);
        this.nodes = [];
        const mapData = parsePLY(data);
        mapData.faces.map(face=>face.vertex_indices.reduce((pathString,v,i)=> pathString+(i === 0? "M":"L") + mapData.vertex[v].x + " " + mapData.vertex[v].y+" ","")+"Z")
            .forEach((path,i)=>this.nodes.push(new Elem(this.map.elem,'path').attr('d',path).attr('fill',mapData.faces[i].traversable !== undefined && mapData.faces[i].traversable === 0? "black":"white").attr("stroke","black").attr('stroke-width',this.tileSize*0.1)));

        //this.map.translate(this.tileSize/2,this.tileSize/2);
        console.log(mapData);
        centerCamera(this.svg,mapData.vertex[0],1);
    }
    setGoal(id)
    {
        console.log("SHOULD FIRE");
        this.nodes[id].attr('fill','orange');
    }
    hasKey(id)
    {
        if(this.type === "Grid")
        {
            return this.nodes[id] !== undefined;
        }
        if(this.type === "Graph")
        {
            return Object.keys(this.nodes).indexOf(id) !== -1;
        }
    }
    reveal(id,size=4, last=null)
    {
        if(size === 0)
            return;
        if(this.type === "Grid")
        {
            const x = id%this.mapWidth;
            const y = Math.floor(id/this.mapWidth);
            for(let i = y-(size/2); i < y+(size/2) && 0 <= i < this.mapHeight; i++)
            {
                for(let j = x-(size/2); j < x+(size/2) && 0 <= j < this.mapWidth; j++)
                {
                    const newId = i*this.mapWidth+j;
                    if(typeof(this.nodes[newId]) === "function")
                    {
                        this.nodes[newId] = this.nodes[newId]();
                    }
                }
            }
        }
        if(this.type === "Graph")
        {
            if(typeof (this.nodes[id]) === "function")
                this.nodes[id] = this.nodes[id]();

            if(last !== null && typeof (this.lines[id][last]) === "function")
            {
                const newLine = this.lines[id][last]();
                this.lines[id][last] = newLine;
                this.lines[last][id] = newLine;
            }
            Object.keys(this.lines[id])
                .forEach(key =>{
                    this.reveal(key, size-1,id)
                });
        }
    }
    removeNode(id)
    {
        if(this.type === "Grid")
        {
            this.nodes[id].removeElement();
        }
        if(this.type === "Graph")
        {
            this.nodes[id].removeElement();
            Object.keys(this.lines[id]).filter(k=>this.nodes[k] === null).forEach(e=>this.lines[id][e].removeElement());
            this.nodes[id] = null;
        }
    }
    reset()
    {
        if(this.type === "Grid")
        {
            this.bgObject.removeElement();
            if(this.bgObject !== null)
            {

                this.bgObject = null;
            }
            if (this.nodes !== null) {
                for (let i = 0; i < this.mapHeight; i++) {
                    for (let j = 0; j < this.mapWidth; j++) {
                        if(this.nodes[i * this.mapWidth + j] !== undefined && typeof (this.nodes[i*this.mapWidth + j]) !== "function")
                            this.nodes[i * this.mapWidth + j].removeElement();
                    }
                }
            }
        }
        if(this.type === "Graphs")
        {
            Object.keys(this.nodes).forEach(e=>typeof(e) !== "function" ? console.log(e)/*.removeElement()*/:null);
            Object.keys(this.lines).forEach(edgeObj=>Object.values(edgeObj).forEach(e=>typeof(e) === "function" ? null : e.removeElement()));
        }
        if(this.type === "Polygon")
        {
            this.nodes.forEach(e=>e.removeElement());

        }

    }
}