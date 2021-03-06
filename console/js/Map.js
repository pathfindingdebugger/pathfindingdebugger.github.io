class Map
{
    constructor(mapType,mapData,scale)
    {
        this.tileSize = scale;
        this.svg  = document.getElementById("viewport");
        if(mapType === "map")
        {
            this.type = "Grid";
            this.mapWidth = mapData.mWidth;
            this.mapHeight = mapData.mHeight;
            this.map = this.drawGrid(mapData);
        }
        else if(mapType === "Graph")
        {
            this.map = this.drawGraph(mapData);
        }
        else if(mapType === "ply")
        {
            this.map = this.drawMesh(mapData)
        }
    }

    drawGrid(mapString)
    {
        const mapData = maParser(mapString);
        this.mapWidth = parseInt(mapData.width);
        this.mapHeight = parseInt(mapData.height);
        mapString = mapData.mapData;
        console.log(mapData);
        this.background = new Elem(this.svg,'rect').attr('x',0).attr('y',0).attr('width',this.tileSize*this.mapWidth).attr('height',this.tileSize*this.mapHeight).attr('fill','black');

        const size = parseInt(this.mapWidth) * parseInt(this.mapHeight);

        this.nodes = {};
        //mapString = mapString.replace('\n','');
        for (let i = 0; i < this.mapHeight; i++) {
            for (let j = 0; j < this.mapWidth; j++) {
                const stringIndex = i * this.mapWidth + j;
                if (mapString[stringIndex] === "@")
                    continue;
                this.nodes[i*this.mapWidth+j] = new Elem(this.svg, 'rect')
                    .attr('x', this.tileSize * j+(this.tileSize/2)).attr('y', this.tileSize * i+(this.tileSize/2))
                    .attr('width', this.tileSize).attr('height', this.tileSize)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('stroke-width','0.1')
            }
        }
        centerCamera(this.svg,{x:0,y:0},1)
    }
    drawGraph(mapData)
    {
        this.nodes = [];
        const graphData = parseGraph(mapData.co,mapData.gr);

        graphData.vertex.forEach(v=>{
            this.nodes.push(new Elem(this.svg,'circle')
                                .attr('cx',v.x)
                                .attr('cy',v.y)
                                .attr('r',this.tileSize*200)
                                .attr('fill','black')
            );
        });
        const a  = this.nodes.length;
        graphData.edges.forEach(e=>{
            if(graphData.vertex[e.v1] == null || graphData.vertex[e.v2] == null)
                console.log(e);
           this.nodes.push(new Elem(this.svg,'path').attr('stroke-width',40).attr('d','M'+graphData.vertex[e.v1].x+" "+graphData.vertex[e.v1].y+" L"+graphData.vertex[e.v2].x+" "+graphData.vertex[e.v2].y)
               .attr('stroke',"black"));

        });
        console.log("WHAT?",this.nodes.length - a);

        centerCamera(this.svg,graphData.vertex[0],1);
    }
    drawMesh(data)
    {
        this.map = new Elem(this.svg,'g');
        this.nodes = [];
        const mapData = parsePLY(data);
        mapData.faces.map(face=>face.vertex_indices.reduce((pathString,v,i)=> pathString+(i === 0? "M":"L") + mapData.vertex[v].x + " " + mapData.vertex[v].y+" ","")+"Z")
            .forEach((path,i)=>this.nodes.push(new Elem(this.map.elem,'path').attr('d',path).attr('fill',mapData.faces[i].traversable !== undefined && mapData.faces[i].traversable === 0? "black":"white").attr("stroke","black").attr('stroke-width',this.tileSize*0.1)));

        //this.map.translate(this.tileSize/2,this.tileSize/2);
        console.log(mapData);
        centerCamera(this.svg,mapData.vertex[0],1)
    }
    setGoal(id)
    {
        console.log("SHOULD FIRE");
        this.nodes[id].attr('fill','orange');
    }

    reset()
    {
        if(this.type === "Grid")
        {
            this.background.removeElement();
            if(this.bgObject !== null)
                this.bgObject = null;
            if (this.nodes !== null) {
                for (let i = 0; i < this.mapHeight; i++) {
                    for (let j = 0; j < this.mapWidth; j++) {
                        if(this.nodes[i * this.mapWidth + j] !== undefined )
                            this.nodes[i * this.mapWidth + j].removeElement();
                    }
                }
            }
        }
        if(this.type === "Polygon")
        {
            this.nodes.forEach(e=>e.removeElement())
        }

    }
}